import { NextRequest, NextResponse } from "next/server";
import {
  getTeamLogo,
  updatePandaScoreLogos,
  LOCAL_TEAM_LOGOS,
} from "@/lib/team-logos";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { teamNames } = body;

    if (!teamNames || !Array.isArray(teamNames)) {
      return NextResponse.json(
        { success: false, error: "teamNames deve ser um array" },
        { status: 400 }
      );
    }

    console.log(`🔍 Buscando logos para ${teamNames.length} times:`, teamNames);

    // 1. Primeiro tentar logos locais (prioridade máxima)
    const logos: Record<string, string | null> = {};
    const teamsWithoutLocalLogo: string[] = [];

    for (const teamName of teamNames) {
      const teamLogo = getTeamLogo(teamName);

      if (teamLogo.source === "local") {
        logos[teamName] = teamLogo.logoUrl;
        console.log(
          `✅ Logo local encontrado para ${teamName}: ${teamLogo.logoUrl}`
        );
      } else {
        logos[teamName] = null;
        teamsWithoutLocalLogo.push(teamName);
      }
    }

    // 2. Para times sem logo local, tentar PandaScore
    if (teamsWithoutLocalLogo.length > 0) {
      console.log(
        `🔄 Buscando ${teamsWithoutLocalLogo.length} logos na PandaScore...`
      );

      try {
        const pandaScoreLogos = await updatePandaScoreLogos(
          teamsWithoutLocalLogo
        );

        for (const teamName of teamsWithoutLocalLogo) {
          if (pandaScoreLogos[teamName]) {
            logos[teamName] = pandaScoreLogos[teamName];
            console.log(`✅ Logo PandaScore encontrada para ${teamName}`);
          } else {
            // Fallback para ícone padrão
            logos[teamName] = "/icons/counterstrike.svg";
            console.log(
              `⚠️ Logo não encontrada para ${teamName}, usando fallback`
            );
          }
        }
      } catch (pandaError) {
        console.error("Erro ao buscar logos na PandaScore:", pandaError);

        // Aplicar fallback para todos os times sem logo
        for (const teamName of teamsWithoutLocalLogo) {
          logos[teamName] = "/icons/counterstrike.svg";
        }
      }
    }

    const foundLogos = Object.values(logos).filter(
      (logo) => logo !== null && logo !== "/icons/counterstrike.svg"
    ).length;

    const localLogos = Object.values(logos).filter(
      (logo) => logo && Object.values(LOCAL_TEAM_LOGOS).includes(logo)
    ).length;

    console.log(
      `✅ Resultado: ${foundLogos}/${teamNames.length} logos encontradas (${localLogos} locais)`
    );

    return NextResponse.json({
      success: true,
      logos,
      stats: {
        total: teamNames.length,
        found: foundLogos,
        local: localLogos,
        fallback: teamNames.length - foundLogos,
      },
      source: "Local + PandaScore + Fallback",
      requestedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Teams logos API error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message ?? "Erro ao buscar logos dos times",
      },
      { status: 500 }
    );
  }
}
