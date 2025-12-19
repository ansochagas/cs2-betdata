import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const pixPriceMap: Record<
  string,
  { planId: string; periodDays: number }
> = {
  [process.env.STRIPE_PIX_PRICE_MONTHLY || ""]: {
    planId: "plan_monthly",
    periodDays: 30,
  },
  [process.env.STRIPE_PIX_PRICE_QUARTERLY || ""]: {
    planId: "plan_quarterly",
    periodDays: 90,
  },
  [process.env.STRIPE_PIX_PRICE_SEMESTRAL || ""]: {
    planId: "plan_semestral",
    periodDays: 180,
  },
};

function getPixPlan(priceId: string) {
  return pixPriceMap[priceId] || null;
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

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2022-11-15" as Stripe.LatestApiVersion,
    });

    const { priceId } = await request.json();

    if (!priceId) {
      return NextResponse.json(
        { error: "ID do preço não fornecido" },
        { status: 400 }
      );
    }

    const pixPlan = getPixPlan(priceId);
    if (!pixPlan) {
      return NextResponse.json(
        { error: "Preço PIX inválido ou não configurado" },
        { status: 400 }
      );
    }

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

    // Buscar ou criar customer (mesmo para Pix, para manter histórico)
    let customer;
    if (user.subscription?.stripeCustomerId) {
      try {
        customer = await stripe.customers.retrieve(
          user.subscription.stripeCustomerId
        );
      } catch (error) {
        // se não existir mais, criaremos abaixo
      }
    }

    if (!customer) {
      customer = await stripe.customers.create({
        email: user.email,
        name: user.name || undefined,
        metadata: { userId: user.id },
      });
    }

    // Garantir que temos um registro de subscription para atualizar após o pagamento
    await prisma.subscription.upsert({
      where: { userId: user.id },
      update: {
        stripeCustomerId: customer.id,
        planId: pixPlan.planId,
      },
      create: {
        userId: user.id,
        stripeCustomerId: customer.id,
        status: "incomplete",
        planId: pixPlan.planId,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(),
        trialEndsAt: null,
        cancelAtPeriodEnd: false,
      },
    });

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customer.id,
      mode: "payment",
      payment_method_types: ["pix"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXTAUTH_URL}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/upgrade?canceled=true`,
      metadata: {
        userId: user.id,
        planId: pixPlan.planId,
        periodDays: String(pixPlan.periodDays),
        paymentMode: "pix",
      },
    });

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    });
  } catch (error: any) {
    console.error("Erro ao criar sessão de checkout PIX:", error);
    return NextResponse.json(
        { error: "Erro interno do servidor" },
        { status: 500 }
    );
  }
}
