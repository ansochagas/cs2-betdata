import { PrismaClient } from "@prisma/client";
import { getTelegramBot } from "./telegram-bot";

const prisma = new PrismaClient();

// Cache para evitar alertas duplicados (por 1 hora)
const sentAlerts = new Map<string, number>();
const ALERT_CACHE_DURATION = 60 * 60 * 1000; // 1 hora

function normalizeSubscriptionStatus(status: unknown): string {
  if (!status) return "";
  return String(status).trim().toLowerCase();
}

function isSubscriptionAccessAllowed(subscription: any): boolean {
  if (!subscription) return false;

  const status = normalizeSubscriptionStatus(subscription.status);
  const now = new Date();

  if (status === "active") {
    return subscription.currentPeriodEnd
      ? new Date(subscription.currentPeriodEnd) > now
      : false;
  }

  if (status === "trialing") {
    const trialEnd = subscription.trialEndsAt
      ? new Date(subscription.trialEndsAt)
      : subscription.currentPeriodEnd
        ? new Date(subscription.currentPeriodEnd)
        : null;
    return trialEnd ? trialEnd > now : false;
  }

  return false;
}

type CheckResult = {
  alertsSent: number;
  gamesStartingSoon: number;
  usersWithAlerts: number;
  goldTipsSent?: number;
  error?: boolean;
};

export class GameAlertsService {
  private isRunning = false;
  private intervalId: NodeJS.Timeout | null = null;

  /**
   * Inicia o serviço de alertas
   */
  async start() {
    if (this.isRunning) {
      console.log("[alerts] Serviço já está rodando");
      return;
    }

    console.log("[alerts] Iniciando serviço de alertas de jogos...");
    this.isRunning = true;

    // Executar imediatamente na inicialização
    await this.checkAndSendAlerts();

    // Depois executar a cada 2 minutos
    this.intervalId = setInterval(async () => {
      await this.checkAndSendAlerts();
    }, 2 * 60 * 1000); // 2 minutos

    console.log("[alerts] Serviço iniciado - verificando a cada 2 minutos");
  }

  /**
   * Para o serviço de alertas
   */
  async stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log("[alerts] Serviço parado");
  }

  /**
   * Verifica jogos e envia alertas
   */
  async checkAndSendAlerts(): Promise<CheckResult> {
    try {
      console.log("[alerts] Verificando jogos para alertas...");

      // Buscar jogos que começam em 10 minutos (± 2 minutos de tolerância)
      const now = new Date();
      const tenMinutesFromNow = new Date(now.getTime() + 10 * 60 * 1000);
      const eightMinutesFromNow = new Date(now.getTime() + 8 * 60 * 1000);

      // Buscar jogos futuros via PandaScore
      const gamesResponse = await fetch(
        `${
          process.env.NEXTAUTH_URL || "http://localhost:3000"
        }/api/pandascore/upcoming-matches?days=1`
      );

      if (!gamesResponse.ok) {
        console.error("[alerts] Erro ao buscar jogos:", gamesResponse.status);
        return {
          alertsSent: 0,
          gamesStartingSoon: 0,
          usersWithAlerts: 0,
          error: true,
        };
      }

      const gamesData = await gamesResponse.json();

      if (!gamesData.success || !gamesData.data) {
        console.log("[alerts] Nenhum jogo encontrado");
        return {
          alertsSent: 0,
          gamesStartingSoon: 0,
          usersWithAlerts: 0,
        };
      }

      const games = gamesData.data;
      console.log(`[alerts] Encontrados ${games.length} jogos futuros`);

      // Filtrar jogos que começam em 10 minutos
      const gamesStartingSoon = games.filter((game: any) => {
        const gameTime = new Date(game.scheduledAt);
        return gameTime >= eightMinutesFromNow && gameTime <= tenMinutesFromNow;
      });

      console.log(
        `[alerts] ${gamesStartingSoon.length} jogos começam em 10 minutos`
      );

      // Buscar usuários vinculados com alertas ativos
      const usersWithAlerts = await prisma.user.findMany({
        where: {
          telegramId: { not: null },
          telegramConfig: {
            alertsEnabled: true,
          },
        },
        include: {
          telegramConfig: true,
          subscription: true,
        },
      });

      console.log(
        `[alerts] ${usersWithAlerts.length} usuários com alertas ativos`
      );

      let totalAlertsSent = 0;

      // Enviar alertas para jogos prestes a começar (fluxo existente)
      for (const game of gamesStartingSoon) {
        const sentForGame = await this.sendGameAlert(
          game,
          usersWithAlerts
        );
        totalAlertsSent += sentForGame;
      }

      // Enviar alertas da Lista de Ouro (novos tips)
      const goldTipsSent = await this.sendGoldListAlerts(usersWithAlerts);

      return {
        alertsSent: totalAlertsSent,
        gamesStartingSoon: gamesStartingSoon.length,
        usersWithAlerts: usersWithAlerts.length,
        goldTipsSent,
      };
    } catch (error) {
      console.error("[alerts] Erro no serviço de alertas:", error);
      return {
        alertsSent: 0,
        gamesStartingSoon: 0,
        usersWithAlerts: 0,
        error: true,
      };
    }
  }

  /**
   * Envia alerta para um jogo específico
   */
  private async sendGameAlert(game: any, users: any[]): Promise<number> {
    const alertKey = `game-${game.id}-${Math.floor(
      Date.now() / (10 * 60 * 1000)
    )}`; // Agrupar por 10min

    // Verificar se alerta já foi enviado recentemente
    if (this.isAlertAlreadySent(alertKey)) {
      console.log(`[alerts] Alerta já enviado para jogo ${game.id}`);
      return 0;
    }

    // Filtrar usuários com assinatura ativa
    const activeUsers = users.filter((user) =>
      isSubscriptionAccessAllowed(user.subscription)
    );

    console.log(
      `[alerts] Enviando alerta para ${activeUsers.length} usuários - Jogo: ${game.homeTeam} vs ${game.awayTeam}`
    );

    // Criar mensagem de alerta
    const alertMessage = this.createGameAlertMessage(game);

    const telegramBot = getTelegramBot();

    // Enviar para cada usuário
    let sentCount = 0;
    for (const user of activeUsers) {
      try {
          const destinationChatId =
            user.telegramConfig?.chatId || user.telegramId;

          const success = await telegramBot.sendMessage(
            destinationChatId,
            alertMessage,
            { parse_mode: "Markdown" }
          );

        if (success) {
          sentCount++;
        }
      } catch (error) {
        console.error(
          `[alerts] Erro ao enviar alerta para ${user.telegramId}:`,
          error
        );
      }
    }

    // Marcar alerta como enviado
    this.markAlertAsSent(alertKey);

    console.log(
      `[alerts] Alerta enviado para ${sentCount}/${activeUsers.length} usuários`
    );
    return sentCount;
  }

  /**
   * Cria mensagem de alerta para jogo
   */
  private createGameAlertMessage(game: any): string {
    const gameTime = new Date(game.scheduledAt);
    const timeString = gameTime.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/Sao_Paulo",
    });

    const tournament = game.tournament || game.league?.name || "Torneio";

    return `⚠️ *JOGO COMECANDO EM 10 MINUTOS!*

🏆 *${tournament}*
🎮 *${game.homeTeam}* vs *${game.awayTeam}*
⏰ *Horario:* ${timeString} (BRT)
⭐ *Tier:* ${game.tier || "Profissional"}

📊 *Analise Rapida:*
• Mapas previstos: ${game.predictedMaps || "BO3"}
• Odds aproximadas: ${
      game.odds?.moneyline
        ? `${game.odds.moneyline.home?.toFixed(
            2
          )} | ${game.odds.moneyline.away?.toFixed(2)}`
        : "Em breve"
    }

🚀 *Prepare-se para apostar!* O jogo esta prestes a comecar.

💡 *Dica:* Monitore as odds nos ultimos minutos antes do inicio.`;
  }

  /**
   * Verifica se alerta já foi enviado
   */
  private isAlertAlreadySent(alertKey: string): boolean {
    const lastSent = sentAlerts.get(alertKey);
    if (!lastSent) return false;

    return Date.now() - lastSent < ALERT_CACHE_DURATION;
  }

  /**
   * Marca alerta como enviado
   */
  private markAlertAsSent(alertKey: string) {
    sentAlerts.set(alertKey, Date.now());

    // Limpar cache antigo (manter apenas últimos 100 alertas)
    if (sentAlerts.size > 100) {
      const oldestKey = sentAlerts.keys().next().value;
      if (oldestKey) {
        sentAlerts.delete(oldestKey);
      }
    }
  }

  /**
   * Limpa o cache de alertas enviados
   */
  clearSentAlertsCache() {
    sentAlerts.clear();
    console.log("[alerts] Cache de alertas limpo");
  }

  /**
   * Status do serviço
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      alertsSent: sentAlerts.size,
      nextCheck: this.intervalId ? "2 minutos" : "Parado",
    };
  }
}

// Instância singleton
export const gameAlertsService = new GameAlertsService();
export default gameAlertsService;
