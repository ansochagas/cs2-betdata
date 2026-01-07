import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const PANDASCORE_BASE_URL =
  process.env.PANDASCORE_BASE_URL ?? "https://api.pandascore.co";
const PANDASCORE_API_KEY = process.env.PANDASCORE_API_KEY || "";

type MatchResult = {
  finished: boolean;
  winnerName: string | null;
  scoreHome: number | null;
  scoreAway: number | null;
};

function safeLower(value: string | null | undefined) {
  return (value || "").toLowerCase();
}

async function fetchMatchResult(prediction: {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamId: number | null;
  awayTeamId: number | null;
}): Promise<MatchResult | null> {
  if (!PANDASCORE_API_KEY) {
    console.error("PANDASCORE_API_KEY nao configurada");
    return null;
  }

  const response = await fetch(
    `${PANDASCORE_BASE_URL}/csgo/matches/${prediction.matchId}`,
    {
      headers: {
        Authorization: `Bearer ${PANDASCORE_API_KEY}`,
        Accept: "application/json",
      },
    }
  );

  if (!response.ok) {
    console.error(`PandaScore error: ${response.status}`);
    return null;
  }

  const match = await response.json();
  const isFinished = match.status === "finished";

  if (!isFinished) {
    return { finished: false, winnerName: null, scoreHome: null, scoreAway: null };
  }

  const opponents = Array.isArray(match.opponents) ? match.opponents : [];
  const results = Array.isArray(match.results) ? match.results : [];

  const nameById = new Map<number, string>();
  opponents.forEach((opponent: any) => {
    if (opponent?.opponent?.id && opponent?.opponent?.name) {
      nameById.set(opponent.opponent.id, opponent.opponent.name);
    }
  });

  const scoreById = new Map<number, number>();
  results.forEach((result: any) => {
    if (typeof result?.team_id === "number") {
      scoreById.set(result.team_id, result.score ?? 0);
    }
  });

  const winnerId = match.winner?.id || null;
  let winnerName = winnerId ? nameById.get(winnerId) || null : null;

  let scoreHome: number | null = null;
  let scoreAway: number | null = null;

  if (prediction.homeTeamId) {
    scoreHome = scoreById.get(prediction.homeTeamId) ?? null;
  }
  if (prediction.awayTeamId) {
    scoreAway = scoreById.get(prediction.awayTeamId) ?? null;
  }

  if (scoreHome === null || scoreAway === null) {
    for (const [teamId, name] of nameById.entries()) {
      if (safeLower(name) === safeLower(prediction.homeTeam)) {
        scoreHome = scoreById.get(teamId) ?? scoreHome;
      }
      if (safeLower(name) === safeLower(prediction.awayTeam)) {
        scoreAway = scoreById.get(teamId) ?? scoreAway;
      }
    }
  }

  if (!winnerName && scoreHome !== null && scoreAway !== null) {
    if (scoreHome > scoreAway) winnerName = prediction.homeTeam;
    if (scoreAway > scoreHome) winnerName = prediction.awayTeam;
  }

  return {
    finished: true,
    winnerName: winnerName || null,
    scoreHome,
    scoreAway,
  };
}

async function refreshPending(limit: number) {
  const now = new Date();
  const pending = await prisma.matchPrediction.findMany({
    where: {
      status: "PENDING",
      scheduledAt: {
        lt: now,
      },
    },
    orderBy: {
      scheduledAt: "desc",
    },
    take: limit,
  });

  for (const prediction of pending) {
    if (!prediction.matchId) continue;
    try {
      const result = await fetchMatchResult({
        matchId: prediction.matchId,
        homeTeam: prediction.homeTeam,
        awayTeam: prediction.awayTeam,
        homeTeamId: prediction.homeTeamId ?? null,
        awayTeamId: prediction.awayTeamId ?? null,
      });

      if (!result || !result.finished) {
        continue;
      }

      const status = result.winnerName
        ? safeLower(result.winnerName) === safeLower(prediction.predictedWinner)
          ? "WIN"
          : "LOSS"
        : "VOID";

      await prisma.matchPrediction.update({
        where: { id: prediction.id },
        data: {
          status,
          actualWinner: result.winnerName,
          scoreHome: result.scoreHome,
          scoreAway: result.scoreAway,
          resolvedAt: new Date(),
        },
      });
    } catch (error) {
      console.error("Erro ao atualizar resultado:", error);
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const refresh = searchParams.get("refresh") === "true";
    const daysParam = Number(searchParams.get("days") || "30");
    const limitParam = Number(searchParams.get("limit") || "200");
    const refreshLimit = Number(searchParams.get("refreshLimit") || "30");

    const days = Number.isFinite(daysParam) ? Math.min(daysParam, 120) : 30;
    const limit = Number.isFinite(limitParam) ? Math.min(limitParam, 500) : 200;

    if (refresh) {
      await refreshPending(refreshLimit);
    }

    const since = new Date(Date.now() - days * 86400000);

    const items = await prisma.matchPrediction.findMany({
      where: {
        createdAt: {
          gte: since,
        },
        source: "prelive",
      },
      orderBy: [
        { scheduledAt: "desc" },
        { createdAt: "desc" },
      ],
      take: limit,
    });

    const wins = items.filter((item) => item.status === "WIN").length;
    const losses = items.filter((item) => item.status === "LOSS").length;
    const pending = items.filter((item) => item.status === "PENDING").length;
    const voided = items.filter((item) => item.status === "VOID").length;
    const resolved = wins + losses;
    const accuracy = resolved > 0 ? (wins / resolved) * 100 : 0;

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          total: items.length,
          wins,
          losses,
          pending,
          voided,
          accuracy,
          windowDays: days,
        },
        items,
        refreshed: refresh,
      },
    });
  } catch (error: any) {
    console.error("Erro ao gerar relatorio:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno" },
      { status: 500 }
    );
  }
}
