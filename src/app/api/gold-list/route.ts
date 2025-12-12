import { NextRequest, NextResponse } from "next/server";
import { advancedCache } from "@/services/advanced-cache-service";

export const dynamic = "force-dynamic";

interface GoldListOpportunity {
  rank: number;
  match: {
    id: number;
    homeTeam: string;
    awayTeam: string;
    tournament: string;
    scheduledAt: string;
  };
  expectedValue: number;
  confidence: number;
  reasoning: string;
  analysis: {
    team1Stats: any;
    team2Stats: any;
  };
}

interface GoldListResponse {
  date: string;
  categories: {
    overKills: GoldListOpportunity[];
    overRounds: GoldListOpportunity[];
    moneyline: GoldListOpportunity[];
  };
  metadata: {
    totalMatches: number;
    analyzedMatches: number;
    lastUpdate: string;
    dataSource: string;
  };
}

export async function GET(request: NextRequest) {
  try {
    console.log("💎 Buscando LISTA DE OURO - melhores oportunidades do dia...");

    const { searchParams } = new URL(request.url);
    const forceRecalculate = searchParams.get("force") === "true";

    const today = new Date();
    const dateString = today.toISOString().split("T")[0]; // YYYY-MM-DD
    const cacheKey = `daily-${dateString}`;

    // 1. Verificar se temos dados em cache (TTL: 24 horas)
    console.log(`🔍 Verificando cache para ${cacheKey}...`);
    const cachedData = await advancedCache.get<GoldListResponse>(
      "gold-list",
      cacheKey
    );

    console.log(`📊 Cache encontrado: ${cachedData ? "SIM" : "NÃO"}`);
    console.log(`🔄 Force recalculate: ${forceRecalculate ? "SIM" : "NÃO"}`);

    if (cachedData && !forceRecalculate) {
      console.log("✅ Dados retornados do CACHE diário");
      return NextResponse.json({
        success: true,
        data: cachedData,
        cached: true,
        cacheDate: dateString,
      });
    }

    if (forceRecalculate) {
      console.log("🔄 Forçando recálculo da Lista de Ouro...");
    } else {
      console.log("🔄 Cache não encontrado, calculando Lista de Ouro...");
    }

    // IMPORTANTE: Se temos cache válido, não devemos tentar buscar jogos novamente
    // Isso evita rate limits desnecessários. O cache é calculado uma vez por dia.

    // 2. Buscar jogos do dia atual
    console.log("📅 Buscando jogos do dia atual...");
    const matchesResponse = await fetch(
      `${
        process.env.NEXTAUTH_URL || "http://localhost:3000"
      }/api/pandascore/upcoming-matches?days=1`
    );

    if (!matchesResponse.ok) {
      throw new Error("Erro ao buscar jogos do dia");
    }

    const matchesData = await matchesResponse.json();

    if (!matchesData.success || !matchesData.data) {
      return NextResponse.json({
        success: false,
        error: "Nenhum jogo encontrado para hoje",
      });
    }

    const todayMatches = matchesData.data.filter((match: any) => {
      const matchDate = new Date(match.scheduledAt).toISOString().split("T")[0];
      return matchDate === dateString;
    });

    console.log(`✅ Encontrados ${todayMatches.length} jogos para hoje`);

    if (todayMatches.length === 0) {
      const emptyResponse: GoldListResponse = {
        date: dateString,
        categories: {
          overKills: [],
          overRounds: [],
          moneyline: [],
        },
        metadata: {
          totalMatches: 0,
          analyzedMatches: 0,
          lastUpdate: new Date().toISOString(),
          dataSource: "PandaScore API",
        },
      };

      // Salvar no cache mesmo dados vazios
      await advancedCache.set("gold-list", cacheKey, emptyResponse, {
        memory: 86400, // 24 horas em memória
        redis: 86400, // 24 horas no Redis
      });

      return NextResponse.json({
        success: true,
        data: emptyResponse,
      });
    }

    // 2. Analisar cada jogo e identificar oportunidades
    const opportunities = {
      overKills: [] as GoldListOpportunity[],
      overRounds: [] as GoldListOpportunity[],
      moneyline: [] as GoldListOpportunity[],
    };

    let analyzedCount = 0;

    for (const match of todayMatches) {
      try {
        console.log(`🎯 Analisando ${match.homeTeam} vs ${match.awayTeam}...`);

        // Buscar análise detalhada do jogo
        const analysisResponse = await fetch(
          `${
            process.env.NEXTAUTH_URL || "http://localhost:3000"
          }/api/pandascore/match-analysis?team1=${encodeURIComponent(
            match.homeTeam
          )}&team2=${encodeURIComponent(match.awayTeam)}`
        );

        if (!analysisResponse.ok) {
          console.warn(
            `⚠️ Não foi possível analisar ${match.homeTeam} vs ${match.awayTeam}`
          );
          continue;
        }

        const analysisData = await analysisResponse.json();

        if (!analysisData.success || !analysisData.data) {
          console.warn(
            `⚠️ Análise falhou para ${match.homeTeam} vs ${match.awayTeam}`
          );
          continue;
        }

        const analysis = analysisData.data;
        analyzedCount++;

        // 3. Aplicar algoritmos para identificar oportunidades

        // OVER KILLS (threshold: 75+ kills totais para best-of-3, 125+ para best-of-5)
        const overKillsOpportunity = calculateOverKillsOpportunity(
          match,
          analysis
        );
        if (overKillsOpportunity) {
          opportunities.overKills.push(overKillsOpportunity);
        }

        // OVER ROUNDS (threshold: 72+ rounds totais para best-of-3, 120+ para best-of-5)
        const overRoundsOpportunity = calculateOverRoundsOpportunity(
          match,
          analysis
        );
        if (overRoundsOpportunity) {
          opportunities.overRounds.push(overRoundsOpportunity);
        }

        // MONEYLINE (melhor palpite de vencedor)
        const moneylineOpportunity = calculateMoneylineOpportunity(
          match,
          analysis
        );
        if (moneylineOpportunity) {
          opportunities.moneyline.push(moneylineOpportunity);
        }

        // Pequena pausa para não sobrecarregar
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.error(
          `❌ Erro ao analisar ${match.homeTeam} vs ${match.awayTeam}:`,
          error
        );
        continue;
      }
    }

    // 4. Ordenar e limitar resultados (TOP 5 por categoria)
    opportunities.overKills.sort((a, b) => b.expectedValue - a.expectedValue);
    opportunities.overKills = opportunities.overKills
      .slice(0, 5)
      .map((opp, index) => ({
        ...opp,
        rank: index + 1,
      }));

    opportunities.overRounds.sort((a, b) => b.expectedValue - a.expectedValue);
    opportunities.overRounds = opportunities.overRounds
      .slice(0, 5)
      .map((opp, index) => ({
        ...opp,
        rank: index + 1,
      }));

    opportunities.moneyline.sort((a, b) => b.confidence - a.confidence);
    opportunities.moneyline = opportunities.moneyline
      .slice(0, 5)
      .map((opp, index) => ({
        ...opp,
        rank: index + 1,
      }));

    console.log(`💎 LISTA DE OURO gerada com sucesso!`);
    console.log(
      `   - Over Kills: ${opportunities.overKills.length} oportunidades`
    );
    console.log(
      `   - Over Rounds: ${opportunities.overRounds.length} oportunidades`
    );
    console.log(
      `   - Moneyline: ${opportunities.moneyline.length} oportunidades`
    );

    const response: GoldListResponse = {
      date: dateString,
      categories: opportunities,
      metadata: {
        totalMatches: todayMatches.length,
        analyzedMatches: analyzedCount,
        lastUpdate: new Date().toISOString(),
        dataSource: "PandaScore API (plano pago)",
      },
    };

    // Salvar no cache diário (24 horas)
    console.log(`💾 Salvando no cache diário: ${cacheKey}`);
    console.log(
      `📊 Dados para salvar: ${JSON.stringify(response).length} caracteres`
    );

    await advancedCache.set("gold-list", cacheKey, response, {
      memory: 86400, // 24 horas em memória
      redis: 86400, // 24 horas no Redis
    });

    console.log(`✅ Cache salvo com sucesso`);

    return NextResponse.json({
      success: true,
      data: response,
      cached: false,
      calculated: true,
    });
  } catch (error: any) {
    console.error("❌ Erro na API gold-list:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Erro interno",
        metadata: {
          generatedAt: new Date().toISOString(),
          dataSource: "Gold List API",
        },
      },
      { status: 500 }
    );
  }
}

// Algoritmos de cálculo de oportunidades

function calculateOverKillsOpportunity(
  match: any,
  analysis: any
): GoldListOpportunity | null {
  try {
    const team1Stats = analysis.team1Stats;
    const team2Stats = analysis.team2Stats;

    if (
      !team1Stats.stats?.avgKillsPerMap ||
      !team2Stats.stats?.avgKillsPerMap
    ) {
      return null;
    }

    // Estimar número de mapas (baseado em histórico)
    const avgMapsPlayed = Math.max(
      team1Stats.stats.avgMapsPlayed || 2.3,
      team2Stats.stats.avgMapsPlayed || 2.3
    );

    // Calcular ações esperadas POR MAPA (kills + deaths = volume total do jogo)
    // Em CS:GO, cada time tem ~70 ações por mapa (kills + deaths), totalizando ~140 ações por mapa
    const team1Kills = team1Stats.stats.avgKillsPerMap || 0;
    const team2Kills = team2Stats.stats.avgKillsPerMap || 0;

    // Cálculo correto: cada time ~70 ações = total ~140 ações por mapa
    // As kills atuais representam parte das ações, multiplicamos para chegar ao total real
    const expectedKillsPerMap = Math.round((team1Kills + team2Kills) * 3.07); // ~140 ações por mapa

    // Thresholds realistas baseados no formato (total de ações por mapa):
    // Best-of-1: 70+ ações/mapa
    // Best-of-3: 140+ ações/mapa (média real de CS:GO ~140 ações)
    // Best-of-5: 210+ ações/mapa
    const minThresholdPerMap = 120; // Threshold mínimo por mapa (~140 ações)

    if (expectedKillsPerMap < minThresholdPerMap) {
      return null;
    }

    // Calcular confiança baseada na consistência dos dados
    const team1Games = team1Stats.stats.totalMatches;
    const team2Games = team2Stats.stats.totalMatches;
    const confidence = Math.min((team1Games + team2Games) / 20, 1) * 0.85; // Max 85%

    // Bonus para jogos entre times agressivos
    const aggressiveBonus =
      team1Stats.stats.avgKillsPerMap > 18 &&
      team2Stats.stats.avgKillsPerMap > 18
        ? 0.1
        : 0;

    const finalConfidence = Math.min(confidence + aggressiveBonus, 0.95);

    return {
      rank: 0, // Será definido depois da ordenação
      match: {
        id: match.id,
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        tournament: match.tournament,
        scheduledAt: match.scheduledAt,
      },
      expectedValue: expectedKillsPerMap,
      confidence: finalConfidence,
      reasoning: `${expectedKillsPerMap} ações esperadas por mapa. Times com ${team1Stats.stats.avgKillsPerMap.toFixed(
        1
      )} + ${team2Stats.stats.avgKillsPerMap.toFixed(1)} kills/mapa`,
      analysis: {
        team1Stats,
        team2Stats,
      },
    };
  } catch (error) {
    console.error("Erro ao calcular oportunidade Over Kills:", error);
    return null;
  }
}

function calculateOverRoundsOpportunity(
  match: any,
  analysis: any
): GoldListOpportunity | null {
  try {
    const team1Stats = analysis.team1Stats;
    const team2Stats = analysis.team2Stats;

    if (
      !team1Stats.stats?.avgRoundsPerMap ||
      !team2Stats.stats?.avgRoundsPerMap
    ) {
      return null;
    }

    // Estimar número de mapas
    const avgMapsPlayed = Math.max(
      team1Stats.stats.avgMapsPlayed || 2.3,
      team2Stats.stats.avgMapsPlayed || 2.3
    );

    // Calcular rounds esperadas POR MAPA (soma das médias dos times)
    // Exemplo: FURIA (12.9 rounds/mapa) + G2 (11.7 rounds/mapa) = 24.6 rounds esperadas por mapa
    const expectedRoundsPerMap =
      team1Stats.stats.avgRoundsPerMap + team2Stats.stats.avgRoundsPerMap;

    // Thresholds realistas baseados no formato (por mapa):
    // Best-of-1: 20+ rounds/mapa
    // Best-of-3: 45+ rounds/mapa (15/mapa médio)
    // Best-of-5: 75+ rounds/mapa (15/mapa médio)
    const minThresholdPerMap = 20; // Threshold mínimo por mapa

    if (expectedRoundsPerMap < minThresholdPerMap) {
      return null;
    }

    // Calcular confiança
    const team1Games = team1Stats.stats.totalMatches;
    const team2Games = team2Stats.stats.totalMatches;
    const confidence = Math.min((team1Games + team2Games) / 20, 1) * 0.8; // Max 80%

    // Bonus para jogos equilibrados (win rates próximos)
    const winRateDiff = Math.abs(
      team1Stats.stats.winRate - team2Stats.stats.winRate
    );
    const balanceBonus =
      winRateDiff < 0.2 ? 0.15 : winRateDiff < 0.4 ? 0.05 : 0; // Bonus maior para jogos equilibrados

    const finalConfidence = Math.min(confidence + balanceBonus, 0.95);

    return {
      rank: 0,
      match: {
        id: match.id,
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        tournament: match.tournament,
        scheduledAt: match.scheduledAt,
      },
      expectedValue: expectedRoundsPerMap,
      confidence: finalConfidence,
      reasoning: `${expectedRoundsPerMap.toFixed(
        1
      )} rounds esperadas por mapa (${team1Stats.stats.avgRoundsPerMap.toFixed(
        1
      )} + ${team2Stats.stats.avgRoundsPerMap.toFixed(
        1
      )}) - jogo equilibrado com alta disputa`,
      analysis: {
        team1Stats,
        team2Stats,
      },
    };
  } catch (error) {
    console.error("Erro ao calcular oportunidade Over Rounds:", error);
    return null;
  }
}

function calculateMoneylineOpportunity(
  match: any,
  analysis: any
): GoldListOpportunity | null {
  try {
    const team1Stats = analysis.team1Stats;
    const team2Stats = analysis.team2Stats;

    // Calcular força relativa baseada em múltiplos fatores
    const team1Score =
      team1Stats.stats.winRate * 0.4 + // 40% win rate
      ((team1Stats.stats.recentForm?.split("W").length - 1 || 0) / 5) * 0.3 + // 30% forma recente
      (team1Stats.stats.avgKillsPerMap / 100) * 0.3; // 30% performance individual

    const team2Score =
      team2Stats.stats.winRate * 0.4 +
      ((team2Stats.stats.recentForm?.split("W").length - 1 || 0) / 5) * 0.3 +
      (team2Stats.stats.avgKillsPerMap / 100) * 0.3;

    const winner = team1Score > team2Score ? match.homeTeam : match.awayTeam;
    const winnerStats = team1Score > team2Score ? team1Stats : team2Stats;
    const confidence = Math.abs(team1Score - team2Score) * 0.8; // Diferença normalizada

    if (confidence < 0.6) {
      return null; // Não é uma oportunidade clara
    }

    return {
      rank: 0,
      match: {
        id: match.id,
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        tournament: match.tournament,
        scheduledAt: match.scheduledAt,
      },
      expectedValue: 0, // Não aplicável para moneyline
      confidence: Math.min(confidence, 0.9),
      reasoning: `${winner} tem vantagem baseada em win rate de ${(
        winnerStats.stats.winRate * 100
      ).toFixed(0)}% e forma recente`,
      analysis: {
        team1Stats,
        team2Stats,
      },
    };
  } catch (error) {
    console.error("Erro ao calcular oportunidade Moneyline:", error);
    return null;
  }
}
