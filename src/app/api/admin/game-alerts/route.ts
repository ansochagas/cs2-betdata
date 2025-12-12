import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { GameAlertsService } from "@/lib/game-alerts";

export async function GET(request: NextRequest) {
  try {
    // Verificar se é admin
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Não autenticado" },
        { status: 401 }
      );
    }

    const adminEmails = ["admin@csgoscout.com", "andersonchagas45@gmail.com"];

    if (!adminEmails.includes(session.user.email)) {
      return NextResponse.json(
        { success: false, error: "Acesso negado" },
        { status: 403 }
      );
    }

    console.log("🎮 Verificando status dos alertas de jogos...");

    // Por enquanto, apenas retorna status básico
    // TODO: Implementar estatísticas reais de alertas enviados

    return NextResponse.json({
      success: true,
      status: {
        serviceActive: true,
        lastCheck: new Date().toISOString(),
        alertsEnabled: true,
        checkInterval: "1 minuto",
        message: "Sistema de alertas de jogos ativo",
      },
    });
  } catch (error: any) {
    console.error("Erro ao verificar alertas de jogos:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verificar se é admin
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Não autenticado" },
        { status: 401 }
      );
    }

    const adminEmails = ["admin@csgoscout.com", "andersonchagas45@gmail.com"];

    if (!adminEmails.includes(session.user.email)) {
      return NextResponse.json(
        { success: false, error: "Acesso negado" },
        { status: 403 }
      );
    }

    const { action } = await request.json();

    if (action === "check") {
      console.log("🔍 Executando verificação manual de alertas de jogos...");

      const result = await GameAlertsService.checkAndSendAlerts();

      return NextResponse.json({
        success: true,
        result,
        message: `Verificação concluída: ${result.alertsSent} alertas enviados`,
      });
    } else if (action === "clear-cache") {
      console.log("🗑️ Limpando cache de alertas enviados...");

      GameAlertsService.clearSentAlertsCache();

      return NextResponse.json({
        success: true,
        message: "Cache de alertas limpo com sucesso",
      });
    }

    return NextResponse.json(
      { success: false, error: "Ação inválida" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Erro ao processar alertas de jogos:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
