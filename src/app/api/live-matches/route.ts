import { NextRequest, NextResponse } from "next/server";

const BETSAPI_BASE_URL = "https://api.b365api.com";
const API_TOKEN = process.env.API_KEY_1;

interface LiveMatch {
  id: string;
  time: string;
  league: {
    name: string;
    id: string;
  };
  home: {
    name: string;
    id: string;
  };
  away: {
    name: string;
    id: string;
  };
  status: string;
  scores?: {
    home: number;
    away: number;
  };
  timer?: string;
  raw: any;
}

// Função para detectar se um jogo é de CS:GO/CS2
function checkIfCsgoMatch(match: any): boolean {
  if (!match) return false;

  const leagueName = (
    match.league?.name ||
    match.league_name ||
    ""
  ).toLowerCase();
  const homeName = (match.home?.name || match.home_name || "").toLowerCase();
  const awayName = (match.away?.name || match.away_name || "").toLowerCase();

  // Palavras-chave que indicam CS:GO/CS2
  const csgoKeywords = [
    "counter",
    "strike",
    "cs:go",
    "csgo",
    "cs2",
    "counter-strike",
    "counter strike",
    "esports",
    "e-sports",
    "cct",
    "sharks",
    "gaimin",
    "gladiators",
    "blast",
    "iem",
    "esl",
    "pgl",
    "dreamhack",
    "starladder",
    "navi",
    "faze",
    "vitality",
    "astralis",
    "liquid",
    "fnatic",
    "cloud9",
    "g2",
    "heroic",
    "ence",
    "nip",
    "mouz",
    "big",
    "furia",
    "imperial",
    "pain",
    "fluxo",
    "case",
    "los gigantes",
    "9z",
    "red canids",
    "intz",
    "kabum",
    "vivo keyd",
  ];

  const allText = `${leagueName} ${homeName} ${awayName}`;

  return csgoKeywords.some((keyword) => allText.includes(keyword));
}

export async function GET(request: NextRequest) {
  if (!API_TOKEN || API_TOKEN === "YOUR_BETSAPI_TOKEN_HERE") {
    return NextResponse.json(
      {
        error: "API token not configured. Please set API_KEY_1 in .env file",
        setup: {
          step1: "Add your BETSAPI token to .env file",
          step2: "Set API_KEY_1=your_token_here",
          step3: "Restart the development server",
        },
      },
      { status: 400 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const sportId = searchParams.get("sport_id") || "151";
    const eventId = searchParams.get("event_id"); // ID específico do BET365

    console.log(
      `🔴 Buscando jogos AO VIVO no sport_id=${sportId} (eSports)...`
    );

    let apiUrl = `${BETSAPI_BASE_URL}/v3/events/inplay?sport_id=${sportId}&token=${API_TOKEN}`;

    // Se especificar um event_id, buscar apenas esse jogo
    if (eventId) {
      console.log(`🎯 Buscando jogo específico: ${eventId}`);
      apiUrl = `${BETSAPI_BASE_URL}/v3/events/inplay?sport_id=${sportId}&token=${API_TOKEN}&event_id=${eventId}`;
    }

    const liveResponse = await fetch(apiUrl, {
      headers: {
        Accept: "application/json",
        "User-Agent": "CSGO-Intel/1.0",
      },
    });

    if (!liveResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          error: `Erro na API BETSAPI: ${liveResponse.status}`,
          sportId: 151,
        },
        { status: liveResponse.status }
      );
    }

    const liveData = await liveResponse.json();
    const matchCount = liveData.results?.length || 0;

    console.log(`📊 Resposta completa da API para sport_id=151:`);
    console.log(JSON.stringify(liveData, null, 2));

    // Retornar a resposta INTEGRA da API
    return NextResponse.json({
      success: true,
      sportId: 151,
      totalMatches: matchCount,
      rawApiResponse: liveData,
      matches: liveData.results || [],
      metadata: {
        apiStatus: "success",
        sportId: 151,
        matchesFound: matchCount,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error("Erro ao buscar jogos ao vivo:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erro ao buscar jogos ao vivo",
        details: error.message,
        sportId: 151,
        date: new Date().toISOString().split("T")[0],
      },
      { status: 500 }
    );
  }
}
