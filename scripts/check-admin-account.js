require("dotenv").config({ path: "../.env.local" });
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function checkAdminAccount() {
  try {
    console.log("🔍 Verificando conta admin...");

    const adminEmail = "andersonchagas45@gmail.com";

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email: adminEmail },
      include: {
        subscription: true,
        telegramConfig: true,
      },
    });

    if (!user) {
      console.log("❌ Usuário admin não encontrado!");
      return;
    }

    console.log("✅ Usuário encontrado:");
    console.log("   ID:", user.id);
    console.log("   Nome:", user.name);
    console.log("   Email:", user.email);
    console.log("   Criado em:", user.createdAt.toISOString());

    // Verificar subscription
    if (!user.subscription) {
      console.log("❌ Subscription não encontrada!");
      return;
    }

    console.log("\n✅ Subscription encontrada:");
    console.log("   ID:", user.subscription.id);
    console.log("   Status:", user.subscription.status);
    console.log("   Plan ID:", user.subscription.planId);
    console.log(
      "   Período atual - Início:",
      user.subscription.currentPeriodStart.toISOString()
    );
    console.log(
      "   Período atual - Fim:",
      user.subscription.currentPeriodEnd.toISOString()
    );
    console.log(
      "   Trial ends:",
      user.subscription.trialEndsAt?.toISOString() || "N/A"
    );

    // Calcular dias restantes
    const now = new Date();
    const endDate = new Date(user.subscription.currentPeriodEnd);
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    console.log("   Dias restantes:", diffDays);

    // Verificar Telegram config
    if (user.telegramConfig) {
      console.log("\n✅ Telegram config encontrada:");
      console.log("   Chat ID:", user.telegramConfig.chatId);
      console.log("   Alerts enabled:", user.telegramConfig.alertsEnabled);
    } else {
      console.log("\n⚠️ Telegram config não encontrada");
    }

    console.log("\n🎉 Verificação concluída!");
  } catch (error) {
    console.error("❌ Erro ao verificar conta admin:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar
checkAdminAccount();
