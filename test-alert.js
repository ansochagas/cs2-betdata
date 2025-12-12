const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function sendTestAlert() {
  try {
    console.log("🔔 Enviando alerta de teste...");

    // Buscar usuário vinculado
    const user = await prisma.user.findFirst({
      where: { telegramId: "662586857" },
      include: { telegramConfig: true },
    });

    if (!user) {
      console.log("❌ Usuário não encontrado ou não vinculado");
      return;
    }

    console.log(`✅ Usuário encontrado: ${user.name} (${user.email})`);
    console.log(`📱 Telegram ID: ${user.telegramId}`);
    console.log(`💬 Chat ID: ${user.telegramConfig?.chatId}`);

    // Simular envio de alerta
    const alertMessage = `🔔 *ALERTA DE TESTE - CS:GO Intel*

Olá ${user.name}!

Este é um alerta de teste para verificar se sua vinculação com o Telegram está funcionando corretamente.

✅ Sua conta está vinculada e pronta para receber notificações!

📊 *Próximos jogos hoje:*
- FURIA vs NAVI (18:00)
- FaZe vs Vitality (20:00)

🎯 Use /status para ver seu plano atual.
🎛️ Use /alerts para configurar suas preferências.

_Boa sorte nas apostas!_ 🚀`;

    console.log("📤 Alerta que seria enviado:");
    console.log("=====================================");
    console.log(alertMessage);
    console.log("=====================================");

    // Aqui você poderia integrar com o bot para enviar de verdade
    console.log("💡 Para enviar de verdade, use o bot:");
    console.log(
      `curl "https://api.telegram.org/bot[BOT_TOKEN]/sendMessage?chat_id=${
        user.telegramConfig?.chatId
      }&text=${encodeURIComponent(alertMessage)}&parse_mode=Markdown"`
    );
  } catch (error) {
    console.error("❌ Erro ao enviar alerta de teste:", error);
  } finally {
    await prisma.$disconnect();
  }
}

sendTestAlert();
