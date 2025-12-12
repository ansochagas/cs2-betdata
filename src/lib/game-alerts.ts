import { PrismaClient } from "@prisma/client";
import telegramBot from "./telegram-bot";

const prisma = new PrismaClient();

// Cache para evitar alertas duplicados (por 1 hora)
const sentAlerts = new Map<string, number>();
const ALERT_CACHE_DURATION = 60 * 60 * 1000; // 1 hora

export class GameAlertsService {
  private isRunning = false;
  private intervalId: NodeJS.Timeout | null = null;

  /**
   * Inicia o serviço de alertas
   */
  async start() {
    if (this.isRunning) {
      console.log("⚠️ Serviço de alertas já está rodando");
      return;
    }

    console.log("🚀 Iniciando serviço de alertas de jogos...");
    this.isRunning = true;

    // Executar imediatamente na inicialização
    await this.checkAndSendAlerts();

    // Depois executar a cada 2 minutos
    this.intervalId = setInterval(async () => {
      await this.checkAndSendAlerts();
    }, 2 * 60 * 1000); // 2 minutos

    console.log(
      "✅ Serviço de alertas iniciado - verificando jogos a cada 2 minutos"
    );
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
    console.log("🛑 Serviço de alertas parado");
  }

  /**
   * Verifica jogos e envia alertas
   */
  private async checkAndSendAlerts() {
    try {
      console.log("🔍 Verificando jogos para alertas...");

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
        console.error("❌ Erro ao buscar jogos:", gamesResponse.status);
        return;
      }

      const gamesData = await gamesResponse.json();

      if (!gamesData.success || !gamesData.data) {
        console.log("⚠️ Nenhum jogo encontrado");
        return;
      }

      const games = gamesData.data;
      console.log(`📊 Encontrados ${games.length} jogos futuros`);

      // Filtrar jogos que começam em 10 minutos
      const gamesStartingSoon = games.filter((game: any) => {
        const gameTime = new Date(game.scheduledAt);
        return gameTime >= eightMinutesFromNow && gameTime <= tenMinutesFromNow;
      });

      console.log(`⏰ ${gamesStartingSoon.length} jogos começam em 10 minutos`);

      if (gamesStartingSoon.length === 0) {
        return;
      }

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

      console.log(`👥 ${usersWithAlerts.length} usuários com alertas ativos`);

      // Enviar alertas para cada jogo
      for (const game of gamesStartingSoon) {
        await this.sendGameAlert(game, usersWithAlerts);
      }
    } catch (error) {
      console.error("❌ Erro no serviço de alertas:", error);
    }
  }

  /**
   * Envia alerta para um jogo específico
   */
  private async sendGameAlert(game: any, users: any[]) {
    const alertKey = `game-${game.id}-${Math.floor(
      Date.now() / (10 * 60 * 1000)
    )}`; // Agrupar por 10min

    // Verificar se alerta já foi enviado recentemente
    if (this.isAlertAlreadySent(alertKey)) {
      console.log(`⏭️ Alerta já enviado para jogo ${game.id}`);
      return;
    }

    // Filtrar usuários com assinatura ativa
    const activeUsers = users.filter(
      (user) =>
        user.subscription?.status === "ACTIVE" ||
        user.subscription?.status === "TRIALING"
    );

    console.log(
      `📤 Enviando alerta para ${activeUsers.length} usuários - Jogo: ${game.homeTeam} vs ${game.awayTeam}`
    );

    // Criar mensagem de alerta
    const alertMessage = this.createGameAlertMessage(game);

    // Enviar para cada usuário
    let sentCount = 0;
    for (const user of activeUsers) {
      try {
        const success = await telegramBot.sendMessage(
          user.telegramId,
          alertMessage,
          { parse_mode: "Markdown" }
        );

        if (success) {
          sentCount++;
        }
      } catch (error) {
        console.error(
          `❌ Erro ao enviar alerta para ${user.telegramId}:`,
          error
        );
      }
    }

    // Marcar alerta como enviado
    this.markAlertAsSent(alertKey);

    console.log(
      `✅ Alerta enviado para ${sentCount}/${activeUsers.length} usuários`
    );
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

    return `⏰ *JOGO COMEÇANDO EM 10 MINUTOS!*

🏆 *${tournament}*
⚔️ *${game.homeTeam}* vs *${game.awayTeam}*
🕐 *Horário:* ${timeString} (BRT)
🎯 *Tier:* ${game.tier || "Profissional"}

📊 *Análise Rápida:*
• Mapas previstos: ${game.predictedMaps || "BO3"}
• Odds aproximadas: ${
      game.odds?.moneyline
        ? `${game.odds.moneyline.home?.toFixed(
            2
          )} | ${game.odds.moneyline.away?.toFixed(2)}`
        : "Em breve"
    }

🎮 *Prepare-se para apostar!* O jogo está prestes a começar.

💡 *Dica:* Monitore as odds nos últimos minutos antes do início.`;
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
