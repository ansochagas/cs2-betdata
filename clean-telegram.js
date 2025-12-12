const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function cleanTelegramLink() {
  try {
    console.log("🧹 Limpando vinculação do Telegram ID: 662586857");

    // 1. Remover telegramId do usuário
    const updatedUser = await prisma.user.updateMany({
      where: { telegramId: "662586857" },
      data: { telegramId: null },
    });

    console.log(`✅ Removido telegramId de ${updatedUser.count} usuário(s)`);

    // 2. Remover configurações do Telegram
    const deletedConfig = await prisma.telegramConfig.deleteMany({
      where: { chatId: "662586857" },
    });

    console.log(
      `✅ Removido ${deletedConfig.count} configuração(ões) do Telegram`
    );

    // 3. Remover códigos de vinculação expirados
    const deletedCodes = await prisma.telegramLinkCode.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });

    console.log(
      `✅ Removido ${deletedCodes.count} código(s) de vinculação expirado(s)`
    );

    console.log("🎉 Limpeza concluída! Agora você pode vincular novamente.");
  } catch (error) {
    console.error("❌ Erro ao limpar vinculação:", error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanTelegramLink();
