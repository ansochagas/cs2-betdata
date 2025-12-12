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
    // Verificar se usuário é admin
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Não autenticado" },
        { status: 401 }
      );
    }

    // Verificar se é admin
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
        { success: false, error: "Título e mensagem são obrigatórios" },
        { status: 400 }
      );
    }

    // Construir filtro baseado no target
    let subscriptionFilter = {};

    switch (target) {
      case "active":
        subscriptionFilter = { status: "ACTIVE" };
        break;
      case "trial":
        subscriptionFilter = { status: "TRIALING" };
        break;
      case "all":
      default:
        // Para "all", não aplicamos filtro de subscription
        break;
    }

    // Buscar usuários com Telegram vinculado baseado no target
    let usersWithTelegram;

    if (target === "all") {
      usersWithTelegram = await prisma.user.findMany({
        where: {
          telegramId: { not: null },
        },
        include: {
          telegramConfig: true,
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
      `📢 Broadcast para ${usersWithTelegram.length} usuários (${target})`
    );

    if (usersWithTelegram.length === 0) {
      return NextResponse.json({
        success: false,
        error: `Nenhum usuário encontrado para o target "${target}"`,
      });
    }

    // Criar mensagem formatada
    const formattedMessage = `🚨 *${title}*

${message}

*#CSGO #CSGOIntel*`;

    // Enviar para cada usuário
    let successCount = 0;
    let errorCount = 0;

    // Importar telegramBot dinamicamente para evitar problemas de inicialização
    const { telegramBot } = await import("@/lib/telegram-bot");

    for (const user of usersWithTelegram) {
      try {
        if (user.telegramConfig?.chatId) {
          const sent = await telegramBot.sendMessage(
            user.telegramConfig.chatId,
            formattedMessage,
            {
              parse_mode: "Markdown",
            }
          );

          if (sent) {
            successCount++;
            console.log(
              `✅ Broadcast enviado para ${user.name} (${user.telegramConfig.chatId})`
            );
          } else {
            errorCount++;
            console.log(
              `❌ Falha ao enviar para ${user.name} (${user.telegramConfig.chatId})`
            );
          }
        }

        // Pequena pausa para não sobrecarregar a API
        await new Promise((resolve) => setTimeout(resolve, 200));
      } catch (error) {
        errorCount++;
        console.error(`❌ Erro ao enviar broadcast para ${user.name}:`, error);
      }
    }

    console.log(
      `📊 Broadcast concluído: ${successCount} sucesso, ${errorCount} erros`
    );

    return NextResponse.json({
      success: true,
      sentCount: successCount,
      errorCount,
      totalTargeted: usersWithTelegram.length,
      message: `Mensagem enviada para ${successCount} de ${usersWithTelegram.length} usuários`,
    });
  } catch (error: any) {
    console.error("Erro no broadcast:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
