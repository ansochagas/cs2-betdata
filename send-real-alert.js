const path = require("path");

require("dotenv").config({ path: path.join(__dirname, ".env.local") });

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_TEST_CHAT_ID || process.argv[2];

if (!BOT_TOKEN) {
  console.error("❌ TELEGRAM_BOT_TOKEN não configurado no .env.local");
  process.exit(1);
}

if (!CHAT_ID) {
  console.error(
    "❌ Informe o chat_id via TELEGRAM_TEST_CHAT_ID no .env.local ou como argumento: node send-real-alert.js <chat_id>"
  );
  process.exit(1);
}

async function sendRealAlert() {
  try {
    console.log("📨 Enviando alerta real via Telegram API...");

    const message = `🧪 *ALERTA DE TESTE REAL - CS:GO Intel*

Olá!

Este é um alerta REAL enviado diretamente via API do Telegram para testar se a vinculação está funcionando.

✅ Se você recebeu esta mensagem, o envio do bot está funcional.

🚀 Próximos passos:
- Vincule sua conta no site (código LINK_...)
- Configure seus alertas no dashboard
- Receba notificações automáticas

Boa sorte nas apostas!`;

    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: String(CHAT_ID),
        text: message,
        parse_mode: "Markdown",
      }),
    });

    const data = await response.json();

    if (data.ok) {
      console.log("✅ Alerta enviado com sucesso! Verifique seu Telegram.");
    } else {
      console.log("❌ Erro ao enviar alerta:", data.description || data);
    }
  } catch (error) {
    console.error("❌ Erro:", error?.message || error);
  }
}

sendRealAlert();
