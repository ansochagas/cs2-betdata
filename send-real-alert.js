const BOT_TOKEN = "8300243291:AAHlc9KRg6nd-Q-Z9_ElZM1qP3vFn4LBqmA";

async function sendRealAlert() {
  try {
    console.log("🚀 Enviando alerta real via Telegram API...");

    const message = `🔔 *ALERTA DE TESTE REAL - CS:GO Intel*

Olá Anderson!

Este é um alerta REAL enviado diretamente via API do Telegram para testar se a vinculação está funcionando.

✅ Se você recebeu esta mensagem, a vinculação está 100% funcional!

📊 *Status da vinculação:*
- Telegram ID: 662586857
- Chat ID: Verificado
- Status: Ativo

🎯 *Próximos passos:*
- Configure seus alertas no dashboard
- Receba notificações automáticas
- Monitore jogos em tempo real

_Boa sorte nas apostas!_ 🚀`;

    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: "662586857", // Telegram ID do usuário
        text: message,
        parse_mode: "Markdown",
      }),
    });

    const data = await response.json();

    if (data.ok) {
      console.log("✅ Alerta enviado com sucesso!");
      console.log("📱 Verifique seu Telegram para ver a mensagem");
    } else {
      console.log("❌ Erro ao enviar alerta:", data.description);
    }
  } catch (error) {
    console.error("❌ Erro:", error.message);
  }
}

sendRealAlert();
