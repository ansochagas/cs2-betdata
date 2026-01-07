import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;
const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2022-11-15" as Stripe.LatestApiVersion,
});
const pricePlanMap: Record<string, string> = {
  [process.env.STRIPE_PRICE_MONTHLY || ""]: "plan_monthly",
  [process.env.STRIPE_PRICE_QUARTERLY || ""]: "plan_quarterly",
  [process.env.STRIPE_PRICE_SEMESTRAL || ""]: "plan_semestral",
};

function getPlanFromSubscription(subscription: Stripe.Subscription): string | null {
  const priceId =
    subscription.items?.data?.[0]?.price?.id ||
    (subscription as any).plan?.id;
  if (!priceId) return null;
  return pricePlanMap[priceId] || null;
}

function getPlanDurationDays(planId: string | null): number {
  switch (planId) {
    case "plan_monthly":
      return 30;
    case "plan_quarterly":
      return 90;
    case "plan_semestral":
      return 180;
    default:
      return 0;
  }
}

async function ensureSubscriptionByCustomer(
  customerId: string,
  planId?: string | null,
  status?: string,
  periodStart?: Date,
  periodEnd?: Date,
  trialEndsAt?: Date | null
) {
  const existing = await prisma.subscription.findFirst({
    where: { stripeCustomerId: customerId },
  });
  if (existing) return existing;

  try {
    const customer = await stripeClient.customers.retrieve(customerId);
    const userId =
      (customer as any)?.metadata?.userId ||
      (customer as any)?.metadata?.userid ||
      null;

    if (!userId) {
      console.warn(
        `⚠️ Não foi possível associar customer ${customerId} a um userId (sem metadata)`
      );
      return null;
    }

    const start = periodStart || new Date();
    const durationDays =
      getPlanDurationDays(planId || null) || 30; // fallback seguro de 30 dias
    const end =
      periodEnd ||
      (() => {
        const d = new Date(start);
        d.setDate(d.getDate() + durationDays);
        return d;
      })();

    const sub = await prisma.subscription.upsert({
      where: { userId },
      update: {
        stripeCustomerId: customerId,
        planId: planId || undefined,
        status: status || "active",
        currentPeriodStart: start,
        currentPeriodEnd: end,
        trialEndsAt: trialEndsAt ?? null,
      },
      create: {
        userId,
        stripeCustomerId: customerId,
        planId: planId || "plan_monthly",
        status: status || "active",
        currentPeriodStart: start,
        currentPeriodEnd: end,
        trialEndsAt: trialEndsAt ?? null,
      },
    });

    console.log(
      `✅ Assinatura criada/atualizada via fallback para user ${userId} (customer ${customerId})`
    );
    return sub;
  } catch (err: any) {
    console.error(
      `Erro ao recuperar/associar customer ${customerId}: ${err.message}`
    );
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const sig = headersList.get("stripe-signature");

    if (!sig) {
      return NextResponse.json({ error: "No signature" }, { status: 400 });
    }

    // Inicializar Stripe apenas quando necessário
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      // Versão suportada
      apiVersion: "2022-11-15" as Stripe.LatestApiVersion,
    });

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    } catch (err: any) {
      console.error(`Webhook signature verification failed:`, err.message);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    console.log(`Processing webhook: ${event.type}`);

    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(
          event.data.object as Stripe.Checkout.Session
        );
        break;

      case "customer.subscription.created":
      case "customer.subscription.updated":
        await handleSubscriptionChange(
          event.data.object as Stripe.Subscription
        );
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription
        );
        break;

      case "invoice.payment_succeeded":
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case "invoice.payment_failed":
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  // Buscar usuário pelo customer ID
  const userSubscription =
    (await prisma.subscription.findFirst({
      where: { stripeCustomerId: customerId },
      include: { user: true },
    })) ||
    (await ensureSubscriptionByCustomer(customerId, getPlanFromSubscription(subscription), undefined, undefined, undefined, subscription.trial_end ? new Date(subscription.trial_end * 1000) : null));

  if (!userSubscription) {
    console.error(`No subscription found for customer ${customerId}`);
    return;
  }

  const status = subscription.status;
  const sub = subscription as any; // Type assertion para acessar propriedades não tipadas
  const planId = getPlanFromSubscription(subscription);
  const planDays = getPlanDurationDays(planId) || 30; // fallback seguro

  const currentPeriodStart = sub.current_period_start
    ? new Date(sub.current_period_start * 1000)
    : new Date();

  let currentPeriodEnd = sub.current_period_end
    ? new Date(sub.current_period_end * 1000)
    : new Date(currentPeriodStart);

  // Fallback: se vier sem current_period_end ou igual/menor que o start, estende conforme o plano
  if (
    (!sub.current_period_end || currentPeriodEnd <= currentPeriodStart) &&
    planDays > 0
  ) {
    const end = new Date(currentPeriodStart);
    end.setDate(end.getDate() + planDays);
    currentPeriodEnd = end;
  }

  // Atualizar status da assinatura
  await prisma.subscription.update({
    where: { id: userSubscription.id },
    data: {
      status: mapStripeStatus(status),
      currentPeriodStart,
      currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      trialEndsAt: subscription.trial_end
        ? new Date(subscription.trial_end * 1000)
        : null,
      ...(planId ? { planId } : {}),
    },
  });

  const userEmail =
    (userSubscription as any)?.user?.email || userSubscription.userId || customerId;
  console.log(`Updated subscription for customer ${customerId} (${userEmail}): ${status}`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  const userSubscription =
    (await prisma.subscription.findFirst({
      where: { stripeCustomerId: customerId },
    })) || (await ensureSubscriptionByCustomer(customerId));

  if (!userSubscription) {
    console.error(`No subscription found for customer ${customerId}`);
    return;
  }

  // Marcar como cancelada
  await prisma.subscription.update({
    where: { id: userSubscription.id },
    data: {
      status: "canceled",
      cancelAtPeriodEnd: true,
    },
  });

  console.log(`Canceled subscription for customer ${customerId}`);
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  const userSubscription =
    (await prisma.subscription.findFirst({
      where: { stripeCustomerId: customerId },
    })) || (await ensureSubscriptionByCustomer(customerId));

  if (!userSubscription) {
    console.error(`No subscription found for customer ${customerId}`);
    return;
  }

  // Pagamento bem-sucedido - garantir que assinatura está ativa
  await prisma.subscription.update({
    where: { id: userSubscription.id },
    data: {
      status: "active",
    },
  });

  console.log(`Payment succeeded for customer ${customerId}`);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  const userSubscription = await prisma.subscription.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!userSubscription) {
    console.error(`No subscription found for customer ${customerId}`);
    return;
  }

  // Pagamento falhou - marcar como past_due
  await prisma.subscription.update({
    where: { id: userSubscription.id },
    data: {
      status: "past_due",
    },
  });

  console.log(`Payment failed for customer ${customerId}`);
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  // Assinatura (cartão): mantém fluxo anterior
  if (session.mode === "subscription") {
    const customerId = session.customer as string;

    if (!session.subscription) {
      console.error(
        `No subscription found for customer ${customerId} in checkout completion`
      );
      return;
    }

    // Buscar assinatura real na Stripe para usar datas/status corretos
    const stripeSub = await stripeClient.subscriptions.retrieve(
      session.subscription as string
    );

    await handleSubscriptionChange(stripeSub);

    console.log(
      `Checkout completed for customer ${customerId} - subscription synced via Stripe data`
    );
    return;
  }

  // Pagamento avulso (Pix): aplicar período manualmente usando metadata
  if (session.mode === "payment") {
    const metadata = session.metadata || {};
    const userId = metadata.userId as string | undefined;
    const planId = (metadata.planId as string | undefined) || "plan_monthly";
    const periodDays = metadata.periodDays
      ? Number(metadata.periodDays)
      : getPlanDurationDays(planId);

    if (!userId || !periodDays) {
      console.error(
        "Pix checkout completed sem userId ou periodDays na metadata"
      );
      return;
    }

    const start = new Date();
    const end = new Date(start);
    end.setDate(end.getDate() + periodDays);

    await prisma.subscription.upsert({
      where: { userId },
      update: {
        status: "active",
        planId,
        currentPeriodStart: start,
        currentPeriodEnd: end,
        cancelAtPeriodEnd: false,
        trialEndsAt: null,
        ...(session.customer
          ? { stripeCustomerId: session.customer as string }
          : {}),
      },
      create: {
        userId,
        status: "active",
        planId,
        currentPeriodStart: start,
        currentPeriodEnd: end,
        cancelAtPeriodEnd: false,
        trialEndsAt: null,
        ...(session.customer
          ? { stripeCustomerId: session.customer as string }
          : {}),
      },
    });

    console.log(
      `Checkout PIX completed for user ${userId} - plan ${planId} ativo até ${end.toISOString()}`
    );
  }
}

function mapStripeStatus(stripeStatus: string): string {
  switch (stripeStatus) {
    case "active":
      return "active";
    case "canceled":
      return "canceled";
    case "incomplete":
      return "incomplete";
    case "incomplete_expired":
      return "incomplete_expired";
    case "past_due":
      return "past_due";
    case "trialing":
      return "trialing";
    case "unpaid":
      return "unpaid";
    default:
      return "incomplete";
  }
}
