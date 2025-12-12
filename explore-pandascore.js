const axios = require("axios");

const PANDASCORE_API_KEY =
  "YpNRtsc43jMD6EH_JdXmbjyOorxQGuOMDlkuRmlGYALserFw0OM";
const BASE_URL = "https://api.pandascore.co";

async function explorePandascoreEndpoints() {
  try {
    console.log(
      "🔍 Explorando endpoints da Pandascore para dados de kills...\n"
    );

    // 1. Verificar se há endpoint de players com stats
    console.log("1️⃣ Testando endpoint /csgo/players com filtros...");
    try {
      const playersResponse = await axios.get(`${BASE_URL}/csgo/players`, {
        headers: { Authorization: `Bearer ${PANDASCORE_API_KEY}` },
        params: {
          "filter[detailed_stats]": true,
          "page[size]": 5,
          sort: "-modified_at",
        },
      });
      console.log(
        `✅ Players endpoint: ${playersResponse.data.length} jogadores`
      );
      if (playersResponse.data.length > 0) {
        console.log(
          "📊 Primeiro jogador:",
          JSON.stringify(playersResponse.data[0], null, 2)
        );
      }
    } catch (error) {
      console.log("❌ Erro no endpoint players:", error.response?.status);
    }

    console.log("\n2️⃣ Testando endpoint /csgo/player-stats...");
    try {
      const playerStatsResponse = await axios.get(
        `${BASE_URL}/csgo/player-stats`,
        {
          headers: { Authorization: `Bearer ${PANDASCORE_API_KEY}` },
          params: {
            "page[size]": 5,
            sort: "-updated_at",
          },
        }
      );
      console.log(
        `✅ Player-stats endpoint: ${playerStatsResponse.data.length} stats`
      );
      if (playerStatsResponse.data.length > 0) {
        console.log(
          "📊 Primeira stat:",
          JSON.stringify(playerStatsResponse.data[0], null, 2)
        );
      }
    } catch (error) {
      console.log("❌ Erro no endpoint player-stats:", error.response?.status);
    }

    console.log("\n3️⃣ Testando endpoint /csgo/matches com detailed_stats...");
    try {
      const matchesResponse = await axios.get(`${BASE_URL}/csgo/matches`, {
        headers: { Authorization: `Bearer ${PANDASCORE_API_KEY}` },
        params: {
          "filter[detailed_stats]": true,
          "filter[status]": "finished",
          "page[size]": 3,
          sort: "-begin_at",
        },
      });
      console.log(
        `✅ Matches com detailed_stats: ${matchesResponse.data.length} jogos`
      );
      if (matchesResponse.data.length > 0) {
        const match = matchesResponse.data[0];
        console.log("📊 Primeiro jogo detalhado:");
        console.log(`- ID: ${match.id}`);
        console.log(`- Nome: ${match.name}`);
        console.log(`- Status: ${match.status}`);
        console.log(`- Detailed stats: ${match.detailed_stats}`);
        console.log(`- Tem games: ${!!match.games}`);
        if (match.games && match.games.length > 0) {
          console.log(
            `- Primeiro game:`,
            JSON.stringify(match.games[0], null, 2)
          );
        }
      }
    } catch (error) {
      console.log(
        "❌ Erro no endpoint matches detailed:",
        error.response?.status
      );
    }

    console.log("\n4️⃣ Testando endpoint específico de um jogo...");
    try {
      // Pegar um jogo específico que sabemos que tem dados
      const specificMatchResponse = await axios.get(
        `${BASE_URL}/csgo/matches/1264134`,
        {
          headers: { Authorization: `Bearer ${PANDASCORE_API_KEY}` },
        }
      );
      console.log("✅ Jogo específico:");
      console.log(`- ID: ${specificMatchResponse.data.id}`);
      console.log(`- Nome: ${specificMatchResponse.data.name}`);
      console.log(
        `- Detailed stats: ${specificMatchResponse.data.detailed_stats}`
      );
      console.log(`- Games: ${specificMatchResponse.data.games?.length || 0}`);
      if (
        specificMatchResponse.data.games &&
        specificMatchResponse.data.games.length > 0
      ) {
        console.log("📊 Detalhes do primeiro game:");
        console.log(
          JSON.stringify(specificMatchResponse.data.games[0], null, 2)
        );
      }
    } catch (error) {
      console.log("❌ Erro no jogo específico:", error.response?.status);
    }

    console.log(
      "\n5️⃣ Testando endpoint /csgo/games (estatísticas por mapa)..."
    );
    try {
      const gamesResponse = await axios.get(`${BASE_URL}/csgo/games`, {
        headers: { Authorization: `Bearer ${PANDASCORE_API_KEY}` },
        params: {
          "page[size]": 3,
          sort: "-begin_at",
        },
      });
      console.log(`✅ Games endpoint: ${gamesResponse.data.length} games`);
      if (gamesResponse.data.length > 0) {
        console.log(
          "📊 Primeiro game:",
          JSON.stringify(gamesResponse.data[0], null, 2)
        );
      }
    } catch (error) {
      console.log("❌ Erro no endpoint games:", error.response?.status);
    }

    console.log("\n6️⃣ Verificando documentação de filtros disponíveis...");
    console.log("💡 Filtros importantes para kills:");
    console.log("- filter[detailed_stats]=true");
    console.log("- filter[status]=finished");
    console.log("- include=players,teams,games");
    console.log("- range[begin_at]=data_inicial,data_final");
  } catch (error) {
    console.error("❌ Erro geral:", error.message);
  }
}

explorePandascoreEndpoints();
