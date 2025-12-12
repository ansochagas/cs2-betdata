const { spawn } = require("child_process");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });

// Iniciar o bot Telegram
async function startBot() {
  console.log("🤖 Iniciando bot Telegram...");
  console.log(
    "Token configurado:",
    process.env.TELEGRAM_BOT_TOKEN ? "✅ Sim" : "❌ Não"
  );

  try {
    // Importar e iniciar o bot
    const { telegramBot } = await import("../src/lib/telegram-bot.ts");

    // Aguardar um pouco para garantir que o Next.js esteja rodando
    setTimeout(async () => {
      await telegramBot.launch();

      // Iniciar scheduler de alertas após o bot estar pronto
      setTimeout(() => {
        startAlertScheduler();
      }, 2000);
    }, 3000);
  } catch (error) {
    console.error("❌ Erro ao iniciar bot Telegram:", error);
  }
}

// Scheduler para alertas automáticos de jogos
async function startAlertScheduler() {
  console.log("⏰ Iniciando scheduler de alertas de jogos...");

  try {
    const { gameAlertsService } = await import("../src/lib/game-alerts.ts");

    // Iniciar o serviço de alertas
    await gameAlertsService.start();

    console.log("✅ Serviço de alertas de jogos iniciado com sucesso");
  } catch (error) {
    console.error("❌ Erro ao iniciar scheduler de alertas:", error);
  }
}

// Iniciar Next.js
function startNextJS() {
  console.log("🚀 Iniciando Next.js...");

  const nextProcess = spawn("npm", ["run", "dev"], {
    stdio: "inherit",
    cwd: path.join(__dirname, ".."),
    shell: true,
  });

  nextProcess.on("close", (code) => {
    console.log(`Next.js process exited with code ${code}`);
  });

  return nextProcess;
}

// Função principal
async function main() {
  console.log("🎮 Iniciando CS:GO Scout com bot Telegram...");
  console.log("=====================================");

  // Iniciar Next.js
  const nextProcess = startNextJS();

  // Iniciar bot após um delay
  setTimeout(() => {
    startBot();
  }, 2000);

  // Graceful shutdown
  process.on("SIGINT", () => {
    console.log("\n🛑 Recebido SIGINT, encerrando processos...");
    nextProcess.kill("SIGINT");
    process.exit(0);
  });

  process.on("SIGTERM", () => {
    console.log("\n🛑 Recebido SIGTERM, encerrando processos...");
    nextProcess.kill("SIGTERM");
    process.exit(0);
  });
}

// Executar
main().catch((error) => {
  console.error("❌ Erro fatal:", error);
  process.exit(1);
});
