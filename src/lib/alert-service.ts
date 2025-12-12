import { PrismaClient } from "@prisma/client";
import { telegramBot } from "./telegram-bot";

const prisma = new PrismaClient();

export interface MatchAlert {
  homeTeam: string;
  awayTeam: string;
  startTime: Date;
  tournament?: string;
  minutesUntilStart: number;
}

export class AlertService {
  /**
   * Envia alerta de jogo começando em breve para todos os usuários vinculados
   */
  async sendMatchStartingAlert(match: MatchAlert): Promise<void> {
    try {
      console.log(
        `🔔 Enviando alerta: ${match.homeTeam} vs ${match.awayTeam} começa em ${match.minutesUntilStart} minutos`
      );

      // Buscar todos os usuários vinculados com alertas ativados
      const usersWithAlerts = await prisma.telegramConfig.findMany({
        where: {
          alertsEnabled: true,
          alertTypes: {
            has: "games",
          },
        },
        include: {
          user: {
            include: {
              subscription: true,
            },
          },
        },
      });

      console.log(`📨 Enviando para ${usersWithAlerts.length} usuários`);

      let successCount = 0;
      let errorCount = 0;

      for (const config of usersWithAlerts) {
        try {
          // Verificar se usuário tem assinatura ativa
          const hasActiveSubscription =
            config.user.subscription?.status === "ACTIVE";

          // Se não tem assinatura ativa, pula (por enquanto, vamos enviar para todos)
          // if (!hasActiveSubscription) continue;

          // Criar mensagem personalizada
          const message = this.createMatchStartingMessage(match);

          // Enviar mensagem
          const sent = await telegramBot.sendMessage(config.chatId, message, {
            parse_mode: "Markdown",
          });

          if (sent) {
            successCount++;
            console.log(
              `✅ Alerta enviado para ${config.user.name} (${config.chatId})`
            );
          } else {
            errorCount++;
            console.log(
              `❌ Falha ao enviar para ${config.user.name} (${config.chatId})`
            );
          }

          // Pequena pausa para não sobrecarregar a API
          await this.sleep(100);
        } catch (error) {
          errorCount++;
          console.error(
            `❌ Erro ao enviar alerta para ${config.user.name}:`,
            error
          );
        }
      }

      console.log(
        `📊 Alertas enviados: ${successCount} sucesso, ${errorCount} erros`
      );
    } catch (error) {
      console.error("❌ Erro no serviço de alertas:", error);
    }
  }

  /**
   * Cria mensagem formatada para alerta de jogo
   */
  private createMatchStartingMessage(match: MatchAlert): string {
    const startTime = match.startTime.toLocaleString("pt-BR", {
      timeZone: "America/Sao_Paulo",
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
    });

    const emoji = this.getMatchEmoji(match.homeTeam, match.awayTeam);

    return `🚨 *ALERTA DE JOGO* 🚨

${emoji} *${match.homeTeam}* vs *${match.awayTeam}*
⏰ Começa em *${match.minutesUntilStart} minutos* (${startTime})

${match.tournament ? `🏆 Torneio: *${match.tournament}*` : ""}

📊 *Análises completas disponíveis:*
• Estatísticas detalhadas dos times
• Comparação de performance
• Odds atuais e histórico
• Insights de apostas

🔗 Acesse: https://csgo-scout.com/analise

⚡ *Não perca esse jogo!* ⚡

*#CSGO #${match.homeTeam.replace(/\s+/g, "")} #${match.awayTeam.replace(
      /\s+/g,
      ""
    )}*`;
  }

  /**
   * Retorna emoji baseado nos times
   */
  private getMatchEmoji(homeTeam: string, awayTeam: string): string {
    // Times brasileiros
    const brazilianTeams = [
      "FURIA",
      "Fluxo",
      "MIBR",
      "RED Canids",
      "Imperial",
      "00 Nation",
      "Los Grandes",
    ];

    const hasBrazilian = brazilianTeams.some(
      (team) =>
        homeTeam.toLowerCase().includes(team.toLowerCase()) ||
        awayTeam.toLowerCase().includes(team.toLowerCase())
    );

    if (hasBrazilian) return "🇧🇷";

    // Times europeus/americanos
    const europeanTeams = [
      "Natus Vincere",
      "G2",
      "FaZe",
      "Vitality",
      "Astralis",
      "ENCE",
      "BIG",
    ];

    const hasEuropean = europeanTeams.some(
      (team) =>
        homeTeam.toLowerCase().includes(team.toLowerCase()) ||
        awayTeam.toLowerCase().includes(team.toLowerCase())
    );

    if (hasEuropean) return "🌍";

    // Default
    return "🎮";
  }

  /**
   * Verifica jogos que começam em breve e envia alertas
   */
  async checkAndSendAlerts(): Promise<void> {
    try {
      console.log("🔍 Verificando jogos para alertas...");

      // Buscar jogos dos próximos 15 minutos
      const now = new Date();
      const fifteenMinutesFromNow = new Date(now.getTime() + 15 * 60 * 1000);

      // Aqui você implementaria a lógica para buscar jogos
      // Por enquanto, vamos simular com dados de exemplo
      const upcomingMatches = await this.getUpcomingMatches(
        now,
        fifteenMinutesFromNow
      );

      for (const match of upcomingMatches) {
        const minutesUntilStart = Math.round(
          (match.startTime.getTime() - now.getTime()) / (1000 * 60)
        );

        // Só envia alerta se faltar exatamente 10 minutos
        if (minutesUntilStart === 10) {
          await this.sendMatchStartingAlert({
            ...match,
            minutesUntilStart,
          });
        }
      }
    } catch (error) {
      console.error("❌ Erro ao verificar alertas:", error);
    }
  }

  /**
   * Busca jogos que começam em breve
   */
  private async getUpcomingMatches(
    from: Date,
    to: Date
  ): Promise<Omit<MatchAlert, "minutesUntilStart">[]> {
    // Aqui você implementaria a busca real no banco/cache
    // Por enquanto, retorna dados simulados para teste

    // Simular alguns jogos para teste
    const mockMatches = [
      {
        homeTeam: "Fluxo",
        awayTeam: "Ninjas In Pyjamas",
        startTime: new Date(Date.now() + 10 * 60 * 1000), // 10 minutos a partir de agora
        tournament: "ESL Challenger League",
      },
      {
        homeTeam: "FURIA",
        awayTeam: "Natus Vincere",
        startTime: new Date(Date.now() + 25 * 60 * 1000), // 25 minutos (não deve alertar)
        tournament: "BLAST Premier",
      },
    ];

    // Filtrar apenas jogos dentro do intervalo
    return mockMatches.filter(
      (match) => match.startTime >= from && match.startTime <= to
    );
  }

  /**
   * Utility para pausas
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Exportar instância singleton
export const alertService = new AlertService();
