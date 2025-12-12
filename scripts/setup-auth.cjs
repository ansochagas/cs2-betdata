const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function ensureSchema() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "User" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "email" TEXT NOT NULL UNIQUE,
      "password" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Subscription" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "userId" TEXT NOT NULL UNIQUE,
      "status" TEXT NOT NULL,
      "planId" TEXT NOT NULL,
      "currentPeriodStart" DATETIME NOT NULL,
      "currentPeriodEnd" DATETIME NOT NULL,
      "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT 0,
      "trialEndsAt" DATETIME,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
    );
  `);
}

async function main() {
  await ensureSchema();

  const email = "teste@csgointel.com";
  const password = "Teste123!";
  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password: passwordHash,
      name: "Tester CS:GO",
    },
    create: {
      email,
      password: passwordHash,
      name: "Tester CS:GO",
    },
  });

  const now = new Date();
  const nextMonth = new Date(now);
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  const trialEnds = new Date(now);
  trialEnds.setDate(trialEnds.getDate() + 7);

  await prisma.subscription.upsert({
    where: { userId: user.id },
    update: {
      status: "trialing",
      currentPeriodStart: now,
      currentPeriodEnd: nextMonth,
      trialEndsAt: trialEnds,
      planId: "pro_plan",
      cancelAtPeriodEnd: false,
    },
    create: {
      userId: user.id,
      status: "trialing",
      planId: "pro_plan",
      currentPeriodStart: now,
      currentPeriodEnd: nextMonth,
      trialEndsAt: trialEnds,
      cancelAtPeriodEnd: false,
    },
  });

  console.log("Usuário de teste criado:");
  console.log(`Email: ${email}`);
  console.log(`Senha: ${password}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

