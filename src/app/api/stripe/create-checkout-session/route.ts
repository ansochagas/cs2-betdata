import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const pricePlanMap: Record<string, string> = {
  [process.env.STRIPE_PRICE_MONTHLY || ""]: "plan_monthly",
  [process.env.STRIPE_PRICE_QUARTERLY || ""]: "plan_quarterly",
  [process.env.STRIPE_PRICE_SEMESTRAL || ""]: "plan_semestral",
};

function getPlanFromPrice(priceId: string): string | null {
  return pricePlanMap[priceId] || null;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Usuário não autenticado" },
        { status: 401 }
      );
    }

    // Inicializar Stripe apenas quando necessário
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      // Usar versÃ£o suportada pelo Stripe
      apiVersion: "2022-11-15" as Stripe.LatestApiVersion,
    });

    const { priceId } = await request.json();

    if (!priceId) {
      return NextResponse.json(
        { error: "ID do preço não fornecido" },
        { status: 400 }
      );
    }

    const planId = getPlanFromPrice(priceId);
    if (!planId) {
      return NextResponse.json(
        { error: "Preço inválido ou não configurado" },
        { status: 400 }
      );
    }

    // Buscar ou criar customer no Stripe
    let customer;
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { subscription: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se já existe customer no Stripe
    if (user.subscription?.stripeCustomerId) {
      try {
        customer = await stripe.customers.retrieve(
          user.subscription.stripeCustomerId
        );
      } catch (error) {
        // Customer não existe mais, criar novo
      }
    }

    if (!customer) {
      customer = await stripe.customers.create({
        email: user.email,
        name: user.name || undefined,
        metadata: {
          userId: user.id,
        },
      });

      // Atualizar o customer ID no banco
      await prisma.subscription.upsert({
        where: { userId: user.id },
        update: { stripeCustomerId: customer.id, planId },
        create: {
          userId: user.id,
          stripeCustomerId: customer.id,
          status: "incomplete",
          planId,
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(),
        },
      });
    } else {
      // Garantir que o planId fique alinhado com o price selecionado
      await prisma.subscription.updateMany({
        where: { userId: user.id },
        data: { planId },
      });
    }

    // Criar sessão de checkout
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXTAUTH_URL}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/?canceled=true`,
      allow_promotion_codes: true,
      metadata: {
        userId: user.id,
      },
    });

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    });
  } catch (error: any) {
    console.error("Erro ao criar sessão de checkout:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
