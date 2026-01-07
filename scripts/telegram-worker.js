const path = require("path");

require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });

process.env.NODE_OPTIONS =
  (process.env.NODE_OPTIONS || "") + " --dns-result-order=ipv4first";

const { Telegraf } = require("telegraf");
const { PrismaClient } = require("@prisma/client");

const INTERNAL_APP_URL = process.env.INTERNAL_APP_URL || "http://127.0.0.1:3000";
const PUBLIC_APP_URL = process.env.NEXTAUTH_URL || INTERNAL_APP_URL;
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const BOT_USERNAME = process.env.TELEGRAM_BOT_USERNAME;

const ENABLE_GAME_ALERTS = (process.env.ENABLE_GAME_ALERTS || "true") === "true";
const GAME_ALERT_CHECK_INTERVAL_MS = Number.parseInt(
  process.env.GAME_ALERT_CHECK_INTERVAL_MS || "",
  10
);
const GAME_ALERT_WINDOW_START_MINUTES = Number.parseInt(
  process.env.GAME_ALERT_WINDOW_START_MINUTES || "",
  10
);
const GAME_ALERT_WINDOW_END_MINUTES = Number.parseInt(
  process.env.GAME_ALERT_WINDOW_END_MINUTES || "",
  10
);

const EFFECTIVE_GAME_ALERT_CHECK_INTERVAL_MS =
  Number.isFinite(GAME_ALERT_CHECK_INTERVAL_MS) &&
  GAME_ALERT_CHECK_INTERVAL_MS > 0
    ? GAME_ALERT_CHECK_INTERVAL_MS
    : 2 * 60 * 1000; // 2 minutos (janela é curta)

const EFFECTIVE_GAME_ALERT_WINDOW_START_MINUTES =
  Number.isFinite(GAME_ALERT_WINDOW_START_MINUTES) &&
  GAME_ALERT_WINDOW_START_MINUTES > 0
    ? GAME_ALERT_WINDOW_START_MINUTES
    : 8;

const EFFECTIVE_GAME_ALERT_WINDOW_END_MINUTES =
  Number.isFinite(GAME_ALERT_WINDOW_END_MINUTES) &&
  GAME_ALERT_WINDOW_END_MINUTES > 0
    ? GAME_ALERT_WINDOW_END_MINUTES
    : 10;

const ENABLE_PRELIVE_SEEDER =
  (process.env.ENABLE_PRELIVE_SEEDER || "true") === "true";
const PRELIVE_SEED_INTERVAL_MS = Number.parseInt(
  process.env.PRELIVE_SEED_INTERVAL_MS || "",
  10
);
const PRELIVE_SEED_LOOKAHEAD_DAYS = Number.parseInt(
  process.env.PRELIVE_SEED_LOOKAHEAD_DAYS || "",
  10
);
const PRELIVE_SEED_MAX_MATCHES_PER_RUN = Number.parseInt(
  process.env.PRELIVE_SEED_MAX_MATCHES_PER_RUN || "",
  10
);
const PRELIVE_SEED_DELAY_MS = Number.parseInt(
  process.env.PRELIVE_SEED_DELAY_MS || "",
  10
);

const EFFECTIVE_PRELIVE_SEED_INTERVAL_MS =
  Number.isFinite(PRELIVE_SEED_INTERVAL_MS) &&
  PRELIVE_SEED_INTERVAL_MS > 0
    ? PRELIVE_SEED_INTERVAL_MS
    : 60 * 60 * 1000; // 1 hora
const EFFECTIVE_PRELIVE_SEED_LOOKAHEAD_DAYS =
  Number.isFinite(PRELIVE_SEED_LOOKAHEAD_DAYS) &&
  PRELIVE_SEED_LOOKAHEAD_DAYS > 0
    ? PRELIVE_SEED_LOOKAHEAD_DAYS
    : 1;
const EFFECTIVE_PRELIVE_SEED_MAX_MATCHES =
  Number.isFinite(PRELIVE_SEED_MAX_MATCHES_PER_RUN) &&
  PRELIVE_SEED_MAX_MATCHES_PER_RUN > 0
    ? PRELIVE_SEED_MAX_MATCHES_PER_RUN
    : 50;
const EFFECTIVE_PRELIVE_SEED_DELAY_MS =
  Number.isFinite(PRELIVE_SEED_DELAY_MS) && PRELIVE_SEED_DELAY_MS >= 0
    ? PRELIVE_SEED_DELAY_MS
    : 300;


const prisma = new PrismaClient();

function normalizeSubscriptionStatus(status) {
  if (!status) return "";
  return String(status).trim().toLowerCase();
}

function isSubscriptionAccessAllowed(subscription) {
  if (!subscription) return false;

  const status = normalizeSubscriptionStatus(subscription.status);
  const now = new Date();

  if (status === "active") {
    return subscription.currentPeriodEnd
      ? new Date(subscription.currentPeriodEnd) > now
      : false;
  }

  if (status === "trialing") {
    const trialEnd = subscription.trialEndsAt
      ? new Date(subscription.trialEndsAt)
      : subscription.currentPeriodEnd
        ? new Date(subscription.currentPeriodEnd)
        : null;
    return trialEnd ? trialEnd > now : false;
  }

  return false;
}

function calcDaysRemaining(dateValue) {
  if (!dateValue) return 0;
  const end = new Date(dateValue);
  const now = new Date();
  const diffMs = end.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function safeJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

if (!BOT_TOKEN) {
  console.error(
    "[telegram-worker] TELEGRAM_BOT_TOKEN não configurado (.env.local). Encerrando."
  );
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);

bot.start(async (ctx) => {
  const telegramId = String(ctx.from.id);
  const firstName = ctx.from.first_name || "Usuário";

  try {
    const existingUser = await prisma.user.findFirst({
      where: { telegramId },
      include: { subscription: true },
    });

    if (existingUser) {
      await ctx.reply(
        `✅ Olá ${firstName}!\n\n` +
          `Sua conta já está vinculada ao CS:GO Scout.\n` +
          `E-mail: ${existingUser.email}\n\n` +
          `Use /help para ver os comandos disponíveis.`
      );
      return;
    }

    const botRef = BOT_USERNAME ? `@${BOT_USERNAME}` : "o bot do Telegram";

    await ctx.reply(
      `🤖 Olá ${firstName}!\n\n` +
        `Bem-vindo ao CS:GO Scout Bot!\n\n` +
        `Para vincular sua conta:\n` +
        `1) Acesse: ${PUBLIC_APP_URL}\n` +
        `2) Vá em "Minha Conta" > Telegram Bot\n` +
        `3) Gere o código de vínculo\n` +
        `4) Envie o código aqui para ${botRef}\n\n` +
        `Use /help para mais informações.`
    );
  } catch (error) {
    console.error("[telegram-worker] Erro no /start:", error);
    await ctx.reply("❌ Ocorreu um erro. Tente novamente em alguns minutos.");
  }
});

bot.help(async (ctx) => {
  await ctx.reply(
    `🤖 *CS:GO Scout Bot* — Ajuda\n\n` +
      `*Comandos:*\n` +
      `/start — Iniciar e ver instruções\n` +
      `/status — Ver status do seu plano\n` +
      `/alerts — Ver resumo dos seus alertas\n` +
      `/help — Ajuda\n\n` +
      `*Dica:* envie o código ` +
      "`LINK_XXXXXXXX` " +
      `gerado no site para concluir a vinculação.`,
    { parse_mode: "Markdown" }
  );
});

bot.command("status", async (ctx) => {
  const telegramId = String(ctx.from.id);

  try {
    const user = await prisma.user.findFirst({
      where: { telegramId },
      include: { subscription: true },
    });

    if (!user) {
      await ctx.reply(
        `❌ Conta não vinculada!\n\n` +
          `Use /start para ver como vincular sua conta do CS:GO Scout.`
      );
      return;
    }

    const subscription = user.subscription;
    const status = normalizeSubscriptionStatus(subscription?.status);
    const daysRemaining = subscription
      ? calcDaysRemaining(subscription.currentPeriodEnd)
      : 0;
    const isAllowed = subscription ? isSubscriptionAccessAllowed(subscription) : false;

    const label =
      status === "active"
        ? "Ativo"
        : status === "trialing"
          ? "Trial"
          : status
            ? status
            : "Inativo";

    await ctx.reply(
      `📌 *Status da sua conta:*\n\n` +
        `👤 *Usuário:* ${user.name || user.email}\n` +
        `📧 *E-mail:* ${user.email}\n` +
        `💳 *Plano:* ${subscription?.planId || "Nenhum"}\n` +
        `🟢 *Status:* ${label}\n` +
        `📅 *Dias restantes:* ${daysRemaining}\n\n` +
        `${isAllowed ? "✅ *Alertas habilitados (plano válido).*" : "❌ *Plano/trial expirado — renove para receber alertas.*"}`,
      { parse_mode: "Markdown" }
    );
  } catch (error) {
    console.error("[telegram-worker] Erro no /status:", error);
    await ctx.reply("❌ Ocorreu um erro ao consultar seu status.");
  }
});

bot.command("alerts", async (ctx) => {
  const telegramId = String(ctx.from.id);

  try {
    const user = await prisma.user.findFirst({
      where: { telegramId },
      include: { telegramConfig: true, subscription: true },
    });

    if (!user) {
      await ctx.reply("❌ Conta não vinculada! Use /start primeiro.");
      return;
    }

    const config = user.telegramConfig;
    if (!config) {
      await ctx.reply(
        "⚠️ Sua conta está vinculada, mas não encontrei as configurações de alertas. Gere um novo vínculo no site."
      );
      return;
    }

    const isAllowed = user.subscription
      ? isSubscriptionAccessAllowed(user.subscription)
      : false;

    const types = Array.isArray(config.alertTypes) ? config.alertTypes : [];
    const typesText =
      types.length > 0 ? types.map((t) => `- ${t}`).join("\n") : "- (nenhum)";

    await ctx.reply(
      `🔔 *Seus alertas*\n\n` +
        `*Ativos:* ${config.alertsEnabled ? "Sim" : "Não"}\n` +
        `*Tipos:*\n${typesText}\n\n` +
        `${isAllowed ? "✅ Plano válido." : "❌ Plano/trial expirado — alertas serão bloqueados."}`,
      { parse_mode: "Markdown" }
    );
  } catch (error) {
    console.error("[telegram-worker] Erro no /alerts:", error);
    await ctx.reply("❌ Ocorreu um erro ao buscar seus alertas.");
  }
});

bot.on("text", async (ctx) => {
  const message = String(ctx.message.text || "").trim();
  const telegramId = String(ctx.from.id);
  const chatId = String(ctx.chat.id);

  if (!message.startsWith("LINK_")) return;

  try {
    const response = await fetch(`${INTERNAL_APP_URL}/api/telegram/link`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ linkCode: message, telegramId, chatId }),
    });

    const data = await safeJson(response);

    if (response.ok && data?.success) {
      await ctx.reply(
        `✅ *Conta vinculada com sucesso!*\n\n` +
          `Agora você receberá alertas no Telegram.\n` +
          `Use /status para ver seu plano e /alerts para suas configurações.`,
        { parse_mode: "Markdown" }
      );
      return;
    }

    const errorMsg =
      (data && (data.error || data.message)) ||
      `Falha na vinculação (HTTP ${response.status}).`;
    await ctx.reply(
      `❌ *Erro na vinculação*\n\n${errorMsg}\n\n` +
        `Gere um novo código no site e envie novamente.`,
      { parse_mode: "Markdown" }
    );
  } catch (error) {
    console.error("[telegram-worker] Erro ao processar LINK_:", error);
    await ctx.reply(
      `❌ Ocorreu um erro ao processar sua vinculação. Tente novamente em alguns minutos.`
    );
  }
});

bot.catch((err, ctx) => {
  console.error("[telegram-worker] Erro no bot:", err);
  try {
    ctx.reply("❌ Ocorreu um erro. Tente novamente mais tarde.");
  } catch {
    // ignore
  }
});

// =========================
// Scheduler: alertas de jogos
// =========================

const sentAlerts = new Map();
const ALERT_CACHE_DURATION_MS = 60 * 60 * 1000;
let isChecking = false;
let intervalHandle = null;

function cleanupSentAlerts() {
  const now = Date.now();
  for (const [key, ts] of sentAlerts.entries()) {
    if (now - ts > ALERT_CACHE_DURATION_MS) {
      sentAlerts.delete(key);
    }
  }
}

function isAlertAlreadySent(alertKey) {
  const lastSent = sentAlerts.get(alertKey);
  if (!lastSent) return false;
  return Date.now() - lastSent < ALERT_CACHE_DURATION_MS;
}

function markAlertAsSent(alertKey) {
  sentAlerts.set(alertKey, Date.now());
  cleanupSentAlerts();
}

function formatGameAlertMessage(game) {
  const gameTime = new Date(game.scheduledAt);
  const timeString = gameTime.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  });

  const tournament = game.tournament || game.league || "Torneio";

  return (
    `⏰ *JOGO COMEÇANDO EM BREVE!*\n\n` +
    `🏆 *${tournament}*\n` +
    `🎮 *${game.homeTeam}* vs *${game.awayTeam}*\n` +
    `🕒 *Horário:* ${timeString} (BRT)\n` +
    `⭐ *Tier:* ${game.tier || "N/A"}\n\n` +
    `Acesse o dashboard para a análise completa e estatísticas.\n` +
    `${PUBLIC_APP_URL}/dashboard`
  );
}

async function fetchUpcomingMatches() {
  return fetchUpcomingMatchesByDays(1);
}

async function fetchUpcomingMatchesByDays(days) {
  const response = await fetch(
    `${INTERNAL_APP_URL}/api/pandascore/upcoming-matches?days=${days}`,
    { headers: { Accept: "application/json" } }
  );
  if (!response.ok) {
    const data = await safeJson(response);
    const error = data?.error ? ` - ${data.error}` : "";
    throw new Error(`Falha ao buscar jogos (HTTP ${response.status})${error}`);
  }
  const data = await response.json();
  if (!data?.success || !Array.isArray(data.data)) {
    throw new Error("Resposta invalida da API de jogos.");
  }
  return data.data;
}


let preliveIntervalHandle = null;
let isPreliveSeeding = false;

async function seedPrelivePredictions() {
  if (!ENABLE_PRELIVE_SEEDER || isPreliveSeeding) return;

  isPreliveSeeding = true;
  try {
    const matches = await fetchUpcomingMatchesByDays(
      EFFECTIVE_PRELIVE_SEED_LOOKAHEAD_DAYS
    );

    if (!matches.length) {
      return;
    }

    const matchIds = matches.map((match) => String(match.id));
    const existing = await prisma.matchPrediction.findMany({
      where: {
        source: "prelive",
        matchId: { in: matchIds },
      },
      select: { matchId: true },
    });
    const existingIds = new Set(existing.map((item) => item.matchId));
    const pending = matches.filter(
      (match) => !existingIds.has(String(match.id))
    );

    if (pending.length === 0) {
      return;
    }

    const toProcess = pending.slice(0, EFFECTIVE_PRELIVE_SEED_MAX_MATCHES);
    console.log(
      `[telegram-worker] Seed prelive: ${toProcess.length}/${pending.length} jogos pendentes`
    );

    for (const match of toProcess) {
      const params = new URLSearchParams();
      params.set("team1", match.homeTeam);
      params.set("team2", match.awayTeam);
      params.set("matchId", String(match.id));
      params.set("source", "prelive");
      if (match.scheduledAt) {
        params.set("scheduledAt", match.scheduledAt);
      }
      if (match.tournament) {
        params.set("tournament", match.tournament);
      }
      if (match.homeTeamId) {
        params.set("homeTeamId", String(match.homeTeamId));
      }
      if (match.awayTeamId) {
        params.set("awayTeamId", String(match.awayTeamId));
      }

      const url = `${INTERNAL_APP_URL}/api/pandascore/match-analysis?${params.toString()}`;
      const response = await fetch(url, { headers: { Accept: "application/json" } });
      const data = await safeJson(response);

      if (!response.ok || !data?.success) {
        console.log(
          `[telegram-worker] Seed prelive falhou para match ${match.id} (${match.homeTeam} vs ${match.awayTeam})`
        );
      } else {
        console.log(
          `[telegram-worker] Seed prelive ok para match ${match.id} (${match.homeTeam} vs ${match.awayTeam})`
        );
      }

      if (EFFECTIVE_PRELIVE_SEED_DELAY_MS > 0) {
        await sleep(EFFECTIVE_PRELIVE_SEED_DELAY_MS);
      }
    }
  } catch (error) {
    console.error("[telegram-worker] Erro no seed prelive:", error);
  } finally {
    isPreliveSeeding = false;
  }
}

async function getUsersToAlert() {
  const users = await prisma.user.findMany({
    where: {
      telegramId: { not: null },
      telegramConfig: {
        alertsEnabled: true,
        alertTypes: {
          has: "games",
        },
      },
    },
    include: {
      telegramConfig: true,
      subscription: true,
    },
  });

  return users.filter(
    (u) =>
      u.telegramConfig?.chatId &&
      u.subscription &&
      isSubscriptionAccessAllowed(u.subscription)
  );
}

async function checkAndSendGameAlerts() {
  if (!ENABLE_GAME_ALERTS) return;
  if (isChecking) return;

  isChecking = true;
  try {
    const now = new Date();
    const windowStart = new Date(
      now.getTime() + EFFECTIVE_GAME_ALERT_WINDOW_START_MINUTES * 60 * 1000
    );
    const windowEnd = new Date(
      now.getTime() + EFFECTIVE_GAME_ALERT_WINDOW_END_MINUTES * 60 * 1000
    );

    const games = await fetchUpcomingMatches();
    const gamesStartingSoon = games.filter((game) => {
      const gameTime = new Date(game.scheduledAt);
      return gameTime >= windowStart && gameTime <= windowEnd;
    });

    if (gamesStartingSoon.length === 0) {
      return;
    }

    const users = await getUsersToAlert();
    if (users.length === 0) {
      console.log(
        `[telegram-worker] Nenhum usuário elegível para alertas (plano inválido ou sem Telegram).`
      );
      return;
    }

    let totalSent = 0;

    for (const game of gamesStartingSoon) {
      const alertKey = `game-${game.id}-${Math.floor(
        Date.now() / (10 * 60 * 1000)
      )}`;

      if (isAlertAlreadySent(alertKey)) continue;

      const message = formatGameAlertMessage(game);

      let sentForGame = 0;
      for (const user of users) {
        try {
          await bot.telegram.sendMessage(user.telegramConfig.chatId, message, {
            parse_mode: "Markdown",
          });
          sentForGame++;
          totalSent++;
          await sleep(150);
        } catch (error) {
          console.error(
            `[telegram-worker] Falha ao enviar alerta para userId=${user.id}:`,
            error
          );
        }
      }

      markAlertAsSent(alertKey);
      console.log(
        `[telegram-worker] Alertas enviados para jogo ${game.homeTeam} vs ${game.awayTeam}: ${sentForGame}/${users.length}`
      );
    }

    if (totalSent > 0) {
      console.log(`[telegram-worker] Total de mensagens enviadas: ${totalSent}`);
    }
  } catch (error) {
    console.error("[telegram-worker] Erro no scheduler de alertas:", error);
  } finally {
    isChecking = false;
  }
}

async function main() {
  console.log("[telegram-worker] Iniciando worker do Telegram...");
  console.log(`[telegram-worker] INTERNAL_APP_URL=${INTERNAL_APP_URL}`);
  console.log(`[telegram-worker] ENABLE_GAME_ALERTS=${ENABLE_GAME_ALERTS}`);
  console.log(`[telegram-worker] ENABLE_PRELIVE_SEEDER=${ENABLE_PRELIVE_SEEDER}`);
  console.log(
    `[telegram-worker] Interval=${EFFECTIVE_GAME_ALERT_CHECK_INTERVAL_MS}ms | Janela=${EFFECTIVE_GAME_ALERT_WINDOW_START_MINUTES}-${EFFECTIVE_GAME_ALERT_WINDOW_END_MINUTES}min`
  );
  console.log(
    `[telegram-worker] Prelive seed: Interval=${EFFECTIVE_PRELIVE_SEED_INTERVAL_MS}ms | Dias=${EFFECTIVE_PRELIVE_SEED_LOOKAHEAD_DAYS} | Max=${EFFECTIVE_PRELIVE_SEED_MAX_MATCHES}`
  );

  try {
    const botInfo = await bot.telegram.getMe();
    console.log(
      `[telegram-worker] Conectado como @${botInfo.username} (${botInfo.first_name})`
    );
  } catch (error) {
    console.error("[telegram-worker] Falha ao validar token (getMe):", error);
  }

  console.log("[telegram-worker] Iniciando long polling (getUpdates)...");

  // Observação: no Telegraf v4, `launch()` fica "pendurado" no loop do polling.
  // Portanto, não devemos aguardar o resolve para considerar o bot operacional.
  void bot.launch({ dropPendingUpdates: true }).catch((error) => {
    console.error("[telegram-worker] Falha ao iniciar bot (launch):", error);
    process.exit(1);
  });

  if (ENABLE_GAME_ALERTS) {
    await checkAndSendGameAlerts();
    intervalHandle = setInterval(
      checkAndSendGameAlerts,
      EFFECTIVE_GAME_ALERT_CHECK_INTERVAL_MS
    );
  }

  if (ENABLE_PRELIVE_SEEDER) {
    await seedPrelivePredictions();
    preliveIntervalHandle = setInterval(
      seedPrelivePredictions,
      EFFECTIVE_PRELIVE_SEED_INTERVAL_MS
    );
  }

  console.log("[telegram-worker] Pronto. Ouvindo mensagens...");
}

function shutdown(signal) {
  console.log(`[telegram-worker] Recebido ${signal}. Encerrando...`);

  if (intervalHandle) {
    clearInterval(intervalHandle);
    intervalHandle = null;
  }
  if (preliveIntervalHandle) {
    clearInterval(preliveIntervalHandle);
    preliveIntervalHandle = null;
  }

  bot.stop(signal);

  prisma
    .$disconnect()
    .catch(() => {
      // ignore
    })
    .finally(() => process.exit(0));
}

process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));

main().catch((error) => {
  console.error("[telegram-worker] Erro fatal:", error);
  process.exit(1);
});
