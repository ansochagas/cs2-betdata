import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;
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
      // VersÃ£o suportada
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
  const userSubscription = await prisma.subscription.findFirst({
    where: { stripeCustomerId: customerId },
    include: { user: true },
  });

  if (!userSubscription) {
    console.error(`No subscription found for customer ${customerId}`);
    return;
  }

  const status = subscription.status;
  const sub = subscription as any; // Type assertion para acessar propriedades não tipadas
  const currentPeriodStart = sub.current_period_start
    ? new Date(sub.current_period_start * 1000)
    : new Date();
  const currentPeriodEnd = sub.current_period_end
    ? new Date(sub.current_period_end * 1000)
    : new Date();
  const planId = getPlanFromSubscription(subscription);

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

  console.log(
    `Updated subscription for user ${userSubscription.user.email}: ${status}`
  );
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  const userSubscription = await prisma.subscription.findFirst({
    where: { stripeCustomerId: customerId },
  });

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

  const userSubscription = await prisma.subscription.findFirst({
    where: { stripeCustomerId: customerId },
  });

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
  const customerId = session.customer as string;

  const userSubscription = await prisma.subscription.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!userSubscription) {
    console.error(
      `No subscription found for customer ${customerId} in checkout completion`
    );
    return;
  }

  // Marcar como ativa após checkout bem-sucedido
  await prisma.subscription.update({
    where: { id: userSubscription.id },
    data: {
      status: "active",
    },
  });

  console.log(
    `Checkout completed for customer ${customerId} - subscription activated`
  );
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
