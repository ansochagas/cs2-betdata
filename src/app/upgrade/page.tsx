"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const plans = [
  {
    id: "plan_monthly",
    name: "Plano Mensal",
    priceDisplay: "R$ 39,90/mês",
    description: "Acesso completo com cobrança mensal",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY,
    pixPriceId: process.env.NEXT_PUBLIC_STRIPE_PIX_PRICE_MONTHLY,
    savings: null,
    periodDays: 30,
  },
  {
    id: "plan_quarterly",
    name: "Plano Trimestral",
    priceDisplay: "R$ 79,90 / 3 meses",
    description: "Melhor custo trimestral",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_QUARTERLY,
    savings: "Economize vs. mensal",
    pixPriceId: process.env.NEXT_PUBLIC_STRIPE_PIX_PRICE_QUARTERLY,
    periodDays: 90,
  },
  {
    id: "plan_semestral",
    name: "Plano Semestral",
    priceDisplay: "R$ 139,90 / 6 meses",
    description: "Economia máxima no semestre",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_SEMESTRAL,
    savings: "Mais barato por mês",
    pixPriceId: process.env.NEXT_PUBLIC_STRIPE_PIX_PRICE_SEMESTRAL,
    periodDays: 180,
  },
];

export default function Upgrade() {
  const router = useRouter();
  const { status } = useSession();
  const [loading, setLoading] = useState(false);
  const [loadingPix, setLoadingPix] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(plans[0]?.id || "");

  const handleUpgrade = async () => {
    // Garantir que o usuário esteja autenticado antes de criar o checkout
    if (status === "unauthenticated") {
      alert("É preciso estar logado para contratar um plano.");
      router.push("/login?callbackUrl=/upgrade");
      return;
    }

    if (status === "loading") return;

    setLoading(true);
    try {
      const plan = plans.find((p) => p.id === selectedPlan);
      if (!plan || !plan.priceId) {
        throw new Error("Plano ou preço não configurado. Verifique as variáveis NEXT_PUBLIC_STRIPE_PRICE_*.");
      }

      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId: plan.priceId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erro ${response.status}`);
      }

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      } else {
        throw new Error("URL de checkout não recebida");
      }
    } catch (error: any) {
      console.error("Erro ao criar checkout:", error);
      alert(`Erro ao processar pagamento: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradePix = async () => {
    if (status === "unauthenticated") {
      alert("É preciso estar logado para contratar um plano.");
      router.push("/login?callbackUrl=/upgrade");
      return;
    }

    if (status === "loading") return;

    setLoadingPix(true);
    try {
      const plan = plans.find((p) => p.id === selectedPlan);
      if (!plan || !plan.pixPriceId) {
        throw new Error("Plano PIX não configurado. Verifique as variáveis NEXT_PUBLIC_STRIPE_PIX_PRICE_*.");
      }

      const response = await fetch("/api/stripe/create-checkout-session-pix", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId: plan.pixPriceId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erro ${response.status}`);
      }

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      } else {
        throw new Error("URL de checkout PIX não recebida");
      }
    } catch (error: any) {
      console.error("Erro ao criar checkout PIX:", error);
      alert(`Erro ao processar pagamento PIX: ${error.message}`);
    } finally {
      setLoadingPix(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-white">
            CSGO - DATABET
          </Link>
          <Link href="/dashboard" className="text-zinc-400 hover:text-white">
            ← Voltar ao Dashboard
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 mb-6">
            <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            <span className="text-red-400 font-medium">
              Seu período de teste expirou
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black mb-6">
            Não Pare Agora!
            <br />
            <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
              Continue Dominando
            </span>
          </h1>

          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
            Seu acesso aos dados exclusivos, previsões precisas e ferramentas
            profissionais está esperando por você. Renove agora e mantenha sua
            vantagem competitiva.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative p-6 rounded-2xl bg-gradient-to-br from-zinc-900/80 to-zinc-800/80 backdrop-blur-xl border ${
                selectedPlan === plan.id
                  ? "border-orange-500 shadow-lg shadow-orange-500/20"
                  : "border-zinc-700"
              }`}
            >
              <div className="text-sm text-gray-400 mb-2">{plan.name}</div>
              <div className="mb-4">
                <span className="text-3xl font-black">{plan.priceDisplay}</span>
              </div>
              <div className="text-sm text-gray-300 mb-4">
                {plan.description}
              </div>
              {plan.savings && (
                <div className="text-xs text-green-400 mb-4">
                  {plan.savings}
                </div>
              )}
              <button
                onClick={() => setSelectedPlan(plan.id)}
                className={`w-full px-4 py-3 rounded-lg font-semibold transition-all ${
                  selectedPlan === plan.id
                    ? "bg-orange-600 text-white"
                    : "bg-zinc-800 text-white hover:bg-zinc-700"
                }`}
              >
                {selectedPlan === plan.id ? "Selecionado" : "Selecionar"}
              </button>
            </div>
          ))}
        </div>

        <div className="max-w-md mx-auto mt-10">
          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            {loading ? "Processando..." : "Confirmar pagamento"}
          </button>
          <p className="text-center text-xs text-gray-500 mt-4">
            Cartão (recorrente) • Cancele quando quiser
          </p>

          <div className="mt-4">
            <button
              onClick={handleUpgradePix}
              disabled={loadingPix}
              className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border border-zinc-700"
            >
              {loadingPix ? "Gerando PIX..." : "Pagar com Pix (pré-pago)"}
            </button>
            <p className="text-center text-xs text-gray-500 mt-2">
              Pix pré-pago: acesso por {plans.find((p) => p.id === selectedPlan)?.periodDays ?? "X"} dias
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
