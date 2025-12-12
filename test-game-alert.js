const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function createTestGame() {
  try {
    console.log("🎮 Criando jogo de teste que começa em 10 minutos...");

    // Calcular horário: 10 minutos a partir de agora
    const now = new Date();
    const gameTime = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutos

    console.log(`⏰ Horário do jogo: ${gameTime.toISOString()}`);
    console.log(`📅 Horário formatado: ${gameTime.toLocaleString("pt-BR")}`);

    // Criar jogo fake (não salvar no banco, apenas simular)
    const testGame = {
      id: "test-game-" + Date.now(),
      homeTeam: "FURIA",
      awayTeam: "NAVI",
      scheduledAt: gameTime.toISOString(),
      tournament: "ESL Pro League",
      tier: "S",
      league: { name: "ESL Pro League" },
      odds: {
        moneyline: {
          home: 2.1,
          away: 1.75,
        },
      },
      predictedMaps: "BO3",
    };

    console.log("✅ Jogo de teste criado:");
    console.log(JSON.stringify(testGame, null, 2));

    console.log(
      "\n🚀 Sistema de alertas será testado automaticamente em 10 minutos!"
    );
    console.log("📱 Monitore o terminal para ver os logs de alertas.");
    console.log(
      "📨 Você deve receber uma mensagem no Telegram quando faltar 10 minutos."
    );
  } catch (error) {
    console.error("❌ Erro ao criar jogo de teste:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestGame();
