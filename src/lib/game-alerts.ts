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
   * Envia alertas de jogos da Lista de Ouro (tips de aposta)
   */
  private async sendGoldListAlerts(users: any[]): Promise<number> {
    try {
      const baseUrl =
        process.env.NEXTAUTH_URL ||
        process.env.INTERNAL_APP_URL ||
        "http://localhost:3000";

      const goldResponse = await fetch(`${baseUrl}/api/gold-list`, {
        cache: "no-store",
      });

      if (!goldResponse.ok) {
        console.warn("[alerts] Não foi possível buscar Lista de Ouro para tips");
        return 0;
      }

      const goldData = await goldResponse.json();
      const categories = goldData?.data?.categories;
      if (!categories) return 0;

      const now = new Date();
      const maxAhead = new Date(now.getTime() + 120 * 60 * 1000); // próximas 2h
      const minWindow = new Date(now.getTime() - 15 * 60 * 1000); // evitar jogo já muito iniciado

      const opportunities: Array<{
        category: "overKills" | "overRounds" | "moneyline";
        data: any;
      }> = [];

      for (const cat of ["overKills", "overRounds", "moneyline"] as const) {
        (categories[cat] || []).forEach((opp: any) =>
          opportunities.push({ category: cat, data: opp })
        );
      }

      const validOpps = opportunities.filter(({ data }) => {
        if (!data?.match?.scheduledAt) return false;
        const gameTime = new Date(data.match.scheduledAt);
        return gameTime >= minWindow && gameTime <= maxAhead;
      });

      if (validOpps.length === 0) return 0;

      const activeUsers = users.filter((user) =>
        isSubscriptionAccessAllowed(user.subscription)
      );
      if (activeUsers.length === 0) return 0;

      const telegramBot = getTelegramBot();
      let sent = 0;

      for (const opp of validOpps) {
        const alertKey = `gold-${opp.category}-${opp.data.match.id}-${new Date()
          .toISOString()
          .split("T")[0]}`;
        if (this.isAlertAlreadySent(alertKey)) {
          continue;
        }

        const message = this.createGoldTipMessage(opp.data, opp.category);
        if (!message) continue;

        for (const user of activeUsers) {
          try {
            const destinationChatId =
              user.telegramConfig?.chatId || user.telegramId;
            const success = await telegramBot.sendMessage(
              destinationChatId,
              message,
              { parse_mode: "Markdown" }
            );
            if (success) sent++;
          } catch (error) {
            console.error(
              `[alerts] Erro ao enviar tip da Lista de Ouro para ${user.telegramId}:`,
              error
            );
          }
        }

        this.markAlertAsSent(alertKey);
      }

      return sent;
    } catch (error) {
      console.error("[alerts] Erro ao enviar tips da Lista de Ouro:", error);
      return 0;
    }
  }

  /**
   * Cria mensagem para tip da Lista de Ouro
   */
  private createGoldTipMessage(
    opportunity: any,
    category: "overKills" | "overRounds" | "moneyline"
  ): string | null {
    const match = opportunity.match;
    if (!match) return null;

    const gameTime = match.scheduledAt ? new Date(match.scheduledAt) : null;
    const timeString = gameTime
      ? gameTime.toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "America/Sao_Paulo",
        })
      : "Em breve";

    const home = match.homeTeam || "Time A";
    const away = match.awayTeam || "Time B";
    const tournament = match.tournament || match.league?.name || "Torneio";

    if (category === "overKills") {
      const team1Kills =
        opportunity.analysis?.team1Stats?.stats?.avgKillsPerMap || 0;
      const team2Kills =
        opportunity.analysis?.team2Stats?.stats?.avgKillsPerMap || 0;
      const combined = team1Kills + team2Kills;
      const tip = combined >= 141 ? "OVER 141 KILLS" : "UNDER 141 KILLS";

      return `🚨 *JOGO DA LISTA DE OURO*
${home} vs ${away}
${tournament} — ${timeString} (BRT)

💡 *Tip:* ${tip}
📊 Média combinada: ${combined.toFixed(
        1
      )} kills/mapa

Aproveite o início do jogo para buscar a linha!`;
    }

    if (category === "overRounds") {
      const team1Rounds =
        opportunity.analysis?.team1Stats?.stats?.avgRoundsPerMap || 0;
      const team2Rounds =
        opportunity.analysis?.team2Stats?.stats?.avgRoundsPerMap || 0;
      const expectedRounds = team1Rounds + team2Rounds;

      return `🚨 *JOGO DA LISTA DE OURO*
${home} vs ${away}
${tournament} — ${timeString} (BRT)

💡 *Tip:* OVER ROUNDS
📊 Média estimada: ${expectedRounds.toFixed(
        1
      )} rounds/mapa

Jogo equilibrado e disputado — boa chance de linhas altas.`;
    }

    if (category === "moneyline") {
      const t1 = opportunity.analysis?.team1Stats?.stats;
      const t2 = opportunity.analysis?.team2Stats?.stats;
      if (!t1 || !t2) return null;

      const team1Score =
        (t1.winRate || 0) * 0.4 +
        (((t1.recentForm?.split("W").length || 1) - 1) / 5) * 0.3 +
        (t1.avgKillsPerMap / 100) * 0.3;
      const team2Score =
        (t2.winRate || 0) * 0.4 +
        (((t2.recentForm?.split("W").length || 1) - 1) / 5) * 0.3 +
        (t2.avgKillsPerMap / 100) * 0.3;

      const predictedWinner = team1Score >= team2Score ? home : away;
      const confidence = Math.min(
        Math.abs(team1Score - team2Score) * 0.8,
        0.95
      );

      return `🚨 *JOGO DA LISTA DE OURO*
${home} vs ${away}
${tournament} — ${timeString} (BRT)

💡 *Tip:* ${predictedWinner} para vencer
📈 Confiança: ${(confidence * 100).toFixed(
        0
      )}%

Acompanhe as odds antes do início para capturar valor.`;
    }

    return null;
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
