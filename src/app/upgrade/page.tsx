"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Upgrade() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId: process.env.STRIPE_PRO_PRICE_ID || "price_pro_monthly", // Price ID do plano pro
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

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Carregando...</div>
      </div>
    );
  }

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
      <div className="max-w-4xl mx-auto px-4 py-16">
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

        {/* Pricing Card */}
        <div className="max-w-md mx-auto">
          <div className="relative p-8 rounded-2xl bg-gradient-to-br from-zinc-900/80 to-zinc-800/80 backdrop-blur-xl border border-zinc-700 shadow-2xl">
            {/* Badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500 font-bold shadow-lg">
              🔥 Oferta Especial
            </div>

            <div className="text-center mb-8">
              <div className="text-sm text-gray-400 mb-2">Plano Pro Anual</div>
              <div className="mb-4">
                <span className="text-5xl font-black">R$ 79</span>
                <span className="text-lg text-gray-400">,90</span>
                <span className="text-lg text-gray-400">/mês</span>
              </div>
              <div className="text-sm text-green-400 font-semibold">
                💰 Economize R$ 229,80 por ano!
              </div>
            </div>

            {/* Features */}
            <div className="space-y-4 mb-8">
              {[
                "✅ Todos os algoritmos preditivos",
                "✅ Lista de Ouro exclusiva",
                "✅ Heatmap de Upsets em tempo real",
                "✅ Dados de 100+ torneios",
                "✅ Suporte prioritário 24/7",
                "✅ Acesso mobile e desktop",
                "✅ Atualizações ilimitadas",
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-3 text-sm">
                  <span className="text-green-400">
                    {feature.split(" ")[0]}
                  </span>
                  <span className="text-gray-300">
                    {feature.substring(feature.indexOf(" ") + 1)}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {loading ? "Processando..." : "🚀 Renovar Agora - R$ 79,90/mês"}
            </button>

            <p className="text-center text-xs text-gray-500 mt-4">
              Cancele quando quiser • Sem taxas ocultas
            </p>
          </div>
        </div>

        {/* Alternative Options */}
        <div className="text-center mt-12">
          <p className="text-gray-400 mb-4">Ou escolha outro plano:</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-6 py-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white transition-colors">
              Plano Mensal - R$ 89,90
            </button>
            <button className="px-6 py-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white transition-colors">
              Precisa de ajuda? Fale conosco
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
