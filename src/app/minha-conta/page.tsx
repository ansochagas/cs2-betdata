"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import {
  Calendar,
  CreditCard,
  MessageCircle,
  HelpCircle,
  User,
  Bell,
  Settings,
} from "lucide-react";

export default function MinhaContaPage() {
  const { data: session } = useSession();
  const [subscription, setSubscription] = useState<any>(null);
  const [telegramLinked, setTelegramLinked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [unlinkingTelegram, setUnlinkingTelegram] = useState(false);

  useEffect(() => {
    fetchAccountData();
  }, []);

  const fetchAccountData = async () => {
    try {
      // Buscar dados da assinatura com validação robusta
      const subResponse = await fetch("/api/user/subscription");
      if (subResponse.ok) {
        const subData = await subResponse.json();
        if (subData.success) {
          setSubscription(subData.subscription);
        }
      }

      // Verificar se Telegram está vinculado
      const telegramResponse = await fetch("/api/telegram/status");
      if (telegramResponse.ok) {
        const telegramData = await telegramResponse.json();
        if (telegramData.success) {
          setTelegramLinked(telegramData.linked);
        }
      }
    } catch (error) {
      console.error("Erro ao buscar dados da conta:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDaysRemaining = () => {
    if (!subscription?.currentPeriodEnd) return 0;

    const endDate = new Date(subscription.currentPeriodEnd);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return Math.max(0, diffDays);
  };

  const getSubscriptionStatus = () => {
    if (!subscription) return { text: "Carregando...", color: "text-gray-400" };

    const status = subscription.status?.toLowerCase();

    switch (status) {
      case "active":
        return { text: "Ativo", color: "text-green-400" };
      case "trialing":
        return { text: "Trial", color: "text-blue-400" };
      case "canceled":
        return { text: "Cancelado", color: "text-red-400" };
      case "past_due":
        return { text: "Atrasado", color: "text-orange-400" };
      default:
        return { text: "Inativo", color: "text-gray-400" };
    }
  };

  const handleTelegramLink = async () => {
    try {
      const response = await fetch("/api/telegram/link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        const linkCode = data.data.linkCode as string;
        let copied = false;

        if (
          typeof navigator !== "undefined" &&
          navigator.clipboard &&
          typeof navigator.clipboard.writeText === "function"
        ) {
          try {
            await navigator.clipboard.writeText(linkCode);
            copied = true;
          } catch (error) {
            console.warn("Falha ao copiar código para clipboard:", error);
          }
        }

        if (copied) {
          alert(
            `Código copiado: ${linkCode}\n\nCOPIE ESTE CÓDIGO E COLE NA JANELA DO BOT @CsgoScoutBot NO TELEGRAM PARA CONCLUIR A VINCULAÇÃO.\n\nSe preferir, o código também está exibido aqui para você copiar manualmente.`
          );
        } else {
          // Exibir prompt que permite copiar manualmente
          const promptMsg =
            "COPIE ESTE CÓDIGO E COLE NA JANELA DO BOT @CsgoScoutBot NO TELEGRAM PARA CONCLUIR A VINCULAÇÃO.";
          const accepted = window.prompt(promptMsg, linkCode);

          if (!accepted) {
            alert(
              `Código gerado: ${linkCode}\n\nCopie e cole no bot @CsgoScoutBot no Telegram para vincular sua conta.`
            );
          }
        }

        // Recarregar dados
        fetchAccountData();
      } else {
        alert("Erro ao gerar código: " + data.error);
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao gerar código de vinculação");
    }
  };

  const handleTelegramUnlink = async () => {
    const confirmed = window.confirm(
      "Tem certeza que deseja desvincular seu Telegram?\n\nVocê vai parar de receber alertas até vincular novamente."
    );

    if (!confirmed) return;

    try {
      setUnlinkingTelegram(true);

      const response = await fetch("/api/telegram/unlink", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        alert("Telegram desvinculado com sucesso!");
        await fetchAccountData();
      } else {
        alert("Erro ao desvincular Telegram: " + (data.error || "Erro"));
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao desvincular Telegram");
    } finally {
      setUnlinkingTelegram(false);
    }
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const daysRemaining = calculateDaysRemaining();
  const statusInfo = getSubscriptionStatus();

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-2xl font-bold text-white">
                CS2 BETDATA
            </Link>
            <span className="text-zinc-400">•</span>
            <span className="text-zinc-400">Minha Conta</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-400">
              Olá, {session?.user?.name || "Usuário"}
            </span>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 text-sm bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Menu Lateral */}
          <div className="lg:col-span-1">
            <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-xl p-6 sticky top-8">
              <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                <User size={20} className="text-orange-400" />
                Minha Conta
              </h2>

              <div className="space-y-2">
                <Link
                  href="#plano"
                  className="w-full p-3 rounded-lg border border-zinc-700 hover:border-orange-500/50 hover:bg-orange-500/10 transition-all text-left flex items-center gap-3"
                >
                  <CreditCard size={16} className="text-orange-400" />
                  <span className="text-sm">Meu Plano</span>
                </Link>

                <Link
                  href="#telegram"
                  className="w-full p-3 rounded-lg border border-zinc-700 hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-all text-left flex items-center gap-3"
                >
                  <MessageCircle size={16} className="text-cyan-400" />
                  <span className="text-sm">Telegram Bot</span>
                </Link>

                <Link
                  href="#alertas"
                  className="w-full p-3 rounded-lg border border-zinc-700 hover:border-green-500/50 hover:bg-green-500/10 transition-all text-left flex items-center gap-3"
                >
                  <Bell size={16} className="text-green-400" />
                  <span className="text-sm">Configurações</span>
                </Link>

                <Link
                  href="#suporte"
                  className="w-full p-3 rounded-lg border border-zinc-700 hover:border-purple-500/50 hover:bg-purple-500/10 transition-all text-left flex items-center gap-3"
                >
                  <HelpCircle size={16} className="text-purple-400" />
                  <span className="text-sm">Suporte</span>
                </Link>
              </div>

              {/* Status do Plano - Resumo */}
              <div className="mt-8 pt-6 border-t border-zinc-800">
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Calendar size={14} />
                  Status do Plano
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Status:</span>
                    <span className={statusInfo.color}>{statusInfo.text}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Dias restantes:</span>
                    <span
                      className={
                        daysRemaining <= 7
                          ? "text-red-400 font-bold"
                          : "text-green-400"
                      }
                    >
                      {daysRemaining}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Conteúdo Principal */}
          <div className="lg:col-span-2 space-y-8">
            {/* Seção do Plano */}
            <div
              id="plano"
              className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-xl p-8"
            >
              <div className="flex items-center gap-4 mb-6">
                <CreditCard size={24} className="text-orange-400" />
                <h2 className="text-2xl font-bold">Meu Plano</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Status Atual */}
                <div className="bg-zinc-800/50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Status Atual</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Plano:</span>
                      <span className="text-white font-medium">
                        {subscription?.planId || "Nenhum"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Status:</span>
                      <span className={`font-medium ${statusInfo.color}`}>
                        {statusInfo.text}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Próxima cobrança:</span>
                      <span className="text-white">
                        {subscription?.currentPeriodEnd
                          ? new Date(
                              subscription.currentPeriodEnd
                            ).toLocaleDateString("pt-BR")
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Dias Restantes */}
                <div className="bg-zinc-800/50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Tempo Restante</h3>
                  <div className="text-center">
                    <div
                      className={`text-6xl font-bold mb-2 ${
                        daysRemaining <= 7 ? "text-red-400" : "text-green-400"
                      }`}
                    >
                      {daysRemaining}
                    </div>
                    <div className="text-zinc-400 mb-4">dias restantes</div>

                    {daysRemaining <= 7 && (
                      <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-4">
                        <p className="text-red-400 text-sm">
                          ⚠️ Seu plano expira em breve! Renove para continuar
                          aproveitando todos os recursos.
                        </p>
                      </div>
                    )}

                    <Link
                      href="/upgrade"
                      className="inline-block bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-3 px-6 rounded-lg transition-all"
                    >
                      Renovar Plano
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Seção Telegram */}
            <div
              id="telegram"
              className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-xl p-8"
            >
              <div className="flex items-center gap-4 mb-6">
                <MessageCircle size={24} className="text-cyan-400" />
                <h2 className="text-2xl font-bold">Telegram Bot</h2>
              </div>

              <div className="space-y-6">
                <div className="bg-zinc-800/50 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-1">
                        Status da Vinculação
                      </h3>
                      <p className="text-zinc-400 text-sm">
                        {telegramLinked
                          ? "Sua conta está vinculada ao Telegram Bot"
                          : "Vincule sua conta para receber alertas automáticos"}
                      </p>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full ${
                        telegramLinked ? "bg-green-400" : "bg-red-400"
                      }`}
                    ></div>
                  </div>

                  {telegramLinked ? (
                    <>
                      <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4">
                      <p className="text-green-400 text-sm">
                        ✅ Conta vinculada! Você receberá alertas automáticos
                        quando jogos começarem.
                      </p>
                    </div>

                    <div className="mt-3 space-y-2">
                      <button
                        onClick={handleTelegramUnlink}
                        disabled={unlinkingTelegram}
                        className="w-full bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-800/50 disabled:text-zinc-500 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2 border border-zinc-700 disabled:cursor-not-allowed"
                      >
                        {unlinkingTelegram
                          ? "Desvinculando..."
                          : "Desvincular Telegram"}
                      </button>
                      <p className="text-xs text-zinc-400">
                        Use isso caso vocÇ¦ tenha trocado de conta no Telegram ou
                        precise refazer o vÇðnculo.
                      </p>
                    </div>
                    </>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4">
                        <p className="text-blue-400 text-sm mb-3">
                          📱 Vincule seu Telegram para receber alertas
                          automáticos de jogos!
                        </p>
                        <ul className="text-xs text-zinc-300 space-y-1">
                          <li>• Alertas quando jogos começam em 10 minutos</li>
                          <li>• Notificações de mudanças de odds</li>
                          <li>• Análises automáticas por Telegram</li>
                        </ul>
                      </div>

                      <button
                        onClick={handleTelegramLink}
                        className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2"
                      >
                        <MessageCircle size={18} />
                        Vincular Telegram
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Seção Configurações */}
            <div
              id="alertas"
              className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-xl p-8"
            >
              <div className="flex items-center gap-4 mb-6">
                <Settings size={24} className="text-green-400" />
                <h2 className="text-2xl font-bold">Configurações</h2>
              </div>

              <div className="space-y-6">
                <div className="bg-zinc-800/50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Preferências de Alertas
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-white font-medium">
                          Alertas de Jogos
                        </span>
                        <p className="text-zinc-400 text-sm">
                          Notificações quando jogos começam
                        </p>
                      </div>
                      <div className="w-12 h-6 bg-green-500 rounded-full relative">
                        <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-white font-medium">
                          Mudanças de Odds
                        </span>
                        <p className="text-zinc-400 text-sm">
                          Alertas quando odds mudam significativamente
                        </p>
                      </div>
                      <div className="w-12 h-6 bg-zinc-600 rounded-full relative">
                        <div className="w-4 h-4 bg-white rounded-full absolute left-1 top-1"></div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-white font-medium">
                          Análises Automáticas
                        </span>
                        <p className="text-zinc-400 text-sm">
                          Relatórios automáticos de performance
                        </p>
                      </div>
                      <div className="w-12 h-6 bg-zinc-600 rounded-full relative">
                        <div className="w-4 h-4 bg-white rounded-full absolute left-1 top-1"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Seção Suporte */}
            <div
              id="suporte"
              className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-xl p-8"
            >
              <div className="flex items-center gap-4 mb-6">
                <HelpCircle size={24} className="text-purple-400" />
                <h2 className="text-2xl font-bold">Suporte</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-zinc-800/50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-3">Contato</h3>
                  <div className="space-y-3">
                    <a
                      href="mailto:suporte@csgoscout.com"
                      className="flex items-center gap-3 text-zinc-300 hover:text-white transition-colors"
                    >
                      <span className="text-lg">📧</span>
                      <span>suporte@csgoscout.com</span>
                    </a>
                    <a
                      href="https://wa.me/5511999999999"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-zinc-300 hover:text-white transition-colors"
                    >
                      <span className="text-lg">💬</span>
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>

                <div className="bg-zinc-800/50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-3">Recursos</h3>
                  <div className="space-y-3">
                    <Link
                      href="/faq"
                      className="flex items-center gap-3 text-zinc-300 hover:text-white transition-colors"
                    >
                      <span className="text-lg">❓</span>
                      <span>Perguntas Frequentes</span>
                    </Link>
                    <Link
                      href="/tutorial"
                      className="flex items-center gap-3 text-zinc-300 hover:text-white transition-colors"
                    >
                      <span className="text-lg">📚</span>
                      <span>Tutoriais</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
