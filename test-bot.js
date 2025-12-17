const { Telegraf } = require("telegraf");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env.local") });

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

console.log("🧪 Testando bot Telegram...");

if (!BOT_TOKEN) {
  console.error("❌ Token não encontrado");
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);

bot.start((ctx) => {
  console.log("📨 Comando /start recebido!");
  ctx.reply("Olá! Bot está funcionando!");
});

bot.on("text", (ctx) => {
  const message = ctx.message.text;
  console.log(`📨 Mensagem recebida: ${message}`);

  if (message.startsWith("LINK_")) {
    ctx.reply("✅ Código de vinculação detectado!");
  }
});

console.log("🤖 Iniciando bot...");

bot
  .launch({
    dropPendingUpdates: true,
  })
  .then(() => {
    console.log("✅ Bot iniciado com sucesso!");
    console.log("📱 Bot está ouvindo mensagens...");
  })
  .catch((error) => {
    console.error("❌ Erro ao iniciar bot:", error.message);
    process.exit(1);
  });

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🛑 Parando bot...");
  bot.stop();
  process.exit(0);
});
