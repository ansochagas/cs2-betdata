import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { alertService } from "@/lib/alert-service";

const prisma = new PrismaClient();

interface BroadcastRequest {
  title: string;
  message: string;
  target: "all" | "active" | "trial";
}

export async function POST(request: NextRequest) {
  try {
    // Verificar se usuÃ¡rio Ã© admin
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "NÃ£o autenticado" },
        { status: 401 }
      );
    }

    // Verificar se Ã© admin
    const adminEmails = [
      "admin@csgoscout.com",
      "andersonchagas45@gmail.com", // Conta admin criada
    ];

    if (!adminEmails.includes(session.user.email)) {
      return NextResponse.json(
        { success: false, error: "Acesso negado" },
        { status: 403 }
      );
    }

    const { title, message, target }: BroadcastRequest = await request.json();

    if (!title || !message) {
      return NextResponse.json(
        { success: false, error: "TÃ­tulo e mensagem sÃ£o obrigatÃ³rios" },
        { status: 400 }
      );
    }

    // Construir filtro baseado no target (aceitando maiÃºsculas/minÃºsculas)
    let subscriptionFilter: any = {};

    switch (target) {
      case "active":
        subscriptionFilter = { status: { in: ["ACTIVE", "active"] } };
        break;
      case "trial":
        subscriptionFilter = { status: { in: ["TRIALING", "trialing"] } };
        break;
      case "all":
      default:
        // Para "all", nÃ£o aplicamos filtro de subscription
        break;
    }

    // Buscar usuÃ¡rios com Telegram vinculado baseado no target
    let usersWithTelegram;

    if (target === "all") {
      usersWithTelegram = await prisma.user.findMany({
        where: {
          telegramId: { not: null },
        },
        include: {
          telegramConfig: true,
          subscription: true,
        },
      });
    } else {
      usersWithTelegram = await prisma.user.findMany({
        where: {
          telegramId: { not: null },
          subscription: subscriptionFilter,
        },
        include: {
          telegramConfig: true,
          subscription: true,
        },
      });
    }

    console.log(
      `ðŸ“¢ Broadcast para ${usersWithTelegram.length} usuÃ¡rios (${target})`
    );

    if (usersWithTelegram.length === 0) {
      return NextResponse.json({
        success: false,
        error: `Nenhum usuÃ¡rio encontrado para o target "${target}"`,
      });
    }

    // Criar mensagem formatada
    const formattedMessage = `ðŸš¨ *${title}*

${message}

*#CSGO #CSGOIntel*`;

    // Enviar para cada usuÃ¡rio
    let successCount = 0;
    let errorCount = 0;

    // Importar telegramBot dinamicamente para evitar problemas de inicializaÃ§Ã£o
    const { getTelegramBot } = await import("@/lib/telegram-bot");
    const telegramBot = getTelegramBot();

    for (const user of usersWithTelegram) {
      try {
        const chatId =
          (user as any)?.telegramConfig?.chatId || (user as any)?.telegramId || null;

        if (!chatId) {
          console.log(
            `[broadcast] usuario ${user.email} sem chatId/telegramId`
          );
          errorCount++;
          continue;
        }

        const sent = await telegramBot.sendMessage(chatId, formattedMessage, {
          parse_mode: "Markdown",
        });

        if (sent) {
          successCount++;
        } else {
          errorCount++;
        }


        // Pequena pausa para nÃ£o sobrecarregar a API
        await new Promise((resolve) => setTimeout(resolve, 200));
      } catch (error) {
        errorCount++;
        console.error(`âŒ Erro ao enviar broadcast para ${user.name}:`, error);
      }
    }

    console.log(
      `ðŸ“Š Broadcast concluÃ­do: ${successCount} sucesso, ${errorCount} erros`
    );

    return NextResponse.json({
      success: true,
      sentCount: successCount,
      errorCount,
      totalTargeted: usersWithTelegram.length,
      message: `Mensagem enviada para ${successCount} de ${usersWithTelegram.length} usuÃ¡rios`,
    });
  } catch (error: any) {
    console.error("Erro no broadcast:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

