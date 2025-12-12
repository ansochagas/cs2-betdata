require("dotenv").config({ path: "../.env.local" });
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    console.log("🚀 Criando conta admin...");

    const adminEmail = "andersonchagas45@gmail.com";
    const adminPassword = "Poker@2301";
    const adminName = "Anderson Chagas";

    // Verificar se usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingUser) {
      console.log("⚠️ Usuário admin já existe, atualizando...");

      // Atualizar senha se necessário
      const hashedPassword = await bcrypt.hash(adminPassword, 12);

      await prisma.user.update({
        where: { email: adminEmail },
        data: {
          password: hashedPassword,
          name: adminName,
        },
      });

      console.log("✅ Usuário admin atualizado!");
    } else {
      // Criar novo usuário
      const hashedPassword = await bcrypt.hash(adminPassword, 12);

      const newUser = await prisma.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          name: adminName,
        },
      });

      console.log("✅ Novo usuário admin criado:", newUser.id);
    }

    // Criar ou atualizar subscription ativa de 12 meses
    const user = await prisma.user.findUnique({
      where: { email: adminEmail },
      include: { subscription: true },
    });

    if (!user) {
      throw new Error("Usuário não encontrado após criação");
    }

    const subscriptionEndDate = new Date();
    subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 12); // 12 meses a partir de hoje

    if (user.subscription) {
      // Atualizar subscription existente
      await prisma.subscription.update({
        where: { userId: user.id },
        data: {
          status: "ACTIVE",
          currentPeriodStart: new Date(),
          currentPeriodEnd: subscriptionEndDate,
          planId: "admin-plan",
        },
      });
      console.log("✅ Subscription admin atualizada (12 meses)");
    } else {
      // Criar nova subscription
      await prisma.subscription.create({
        data: {
          userId: user.id,
          status: "ACTIVE",
          currentPeriodStart: new Date(),
          currentPeriodEnd: subscriptionEndDate,
          planId: "admin-plan",
        },
      });
      console.log("✅ Nova subscription admin criada (12 meses)");
    }

    // Verificar se TelegramConfig existe, se não, criar uma básica
    const telegramConfig = await prisma.telegramConfig.findUnique({
      where: { userId: user.id },
    });

    if (!telegramConfig) {
      await prisma.telegramConfig.create({
        data: {
          userId: user.id,
          chatId: "admin-chat-placeholder", // Placeholder - será atualizado quando vincular
          alertsEnabled: true,
          alertTypes: ["games"],
        },
      });
      console.log("✅ Configuração Telegram criada para admin");
    }

    console.log("\n🎉 Conta admin criada com sucesso!");
    console.log("📧 Email:", adminEmail);
    console.log("🔑 Senha:", adminPassword);
    console.log(
      "📅 Plano ativo até:",
      subscriptionEndDate.toLocaleDateString("pt-BR")
    );
    console.log("\n🔐 Agora apenas esta conta pode acessar /admin");
  } catch (error) {
    console.error("❌ Erro ao criar conta admin:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar
createAdminUser();
