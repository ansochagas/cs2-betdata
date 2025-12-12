const axios = require("axios");

const PANDASCORE_API_KEY =
  "YpNRtsc43jMD6EH_JdXmbjyOorxQGuOMDlkuRmlGYALserFw0OM";
const BASE_URL = "https://api.pandascore.co";

async function investigateGamesData() {
  try {
    console.log(
      "🎯 Investigando dados detalhados de games (kills, stats)...\n"
    );

    // 1. Buscar jogos com detailed_stats e incluir games
    console.log("1️⃣ Buscando jogos com detailed_stats e incluindo games...");
    const matchesResponse = await axios.get(`${BASE_URL}/csgo/matches`, {
      headers: { Authorization: `Bearer ${PANDASCORE_API_KEY}` },
      params: {
        "filter[detailed_stats]": true,
        "filter[status]": "finished",
        include: "games,players,teams",
        "page[size]": 2,
        sort: "-begin_at",
      },
    });

    console.log(
      `📊 Encontrados ${matchesResponse.data.length} jogos com detailed_stats`
    );

    for (let i = 0; i < matchesResponse.data.length; i++) {
      const match = matchesResponse.data[i];
      console.log(`\n🏆 JOGO ${i + 1}: ${match.name}`);
      console.log(`   ID: ${match.id}`);
      console.log(`   Status: ${match.status}`);
      console.log(`   Detailed stats: ${match.detailed_stats}`);
      console.log(`   Games: ${match.games?.length || 0}`);

      if (match.games && match.games.length > 0) {
        console.log(`   📈 Analisando games...`);

        for (let j = 0; j < match.games.length; j++) {
          const game = match.games[j];
          console.log(`      🎮 Game ${j + 1}:`);
          console.log(`         ID: ${game.id}`);
          console.log(`         Status: ${game.status}`);
          console.log(`         Detailed stats: ${game.detailed_stats}`);
          console.log(`         Winner: ${game.winner?.id || "N/A"}`);

          // Verificar se há propriedades de estatísticas
          const statKeys = Object.keys(game).filter(
            (key) =>
              key.includes("stat") ||
              key.includes("kill") ||
              key.includes("death") ||
              key.includes("score") ||
              key.includes("player")
          );

          if (statKeys.length > 0) {
            console.log(
              `         ✅ Propriedades de stats encontradas: ${statKeys.join(
                ", "
              )}`
            );
            statKeys.forEach((key) => {
              console.log(`            ${key}: ${JSON.stringify(game[key])}`);
            });
          } else {
            console.log(`         ❌ Nenhuma propriedade de stats encontrada`);
          }
        }
      }

      // Verificar se há dados de players no match
      if (match.players && match.players.length > 0) {
        console.log(`   👥 Players no match: ${match.players.length}`);
        console.log(
          `      Primeiro player:`,
          JSON.stringify(match.players[0], null, 2)
        );
      }

      // Verificar se há dados de teams no match
      if (match.teams && match.teams.length > 0) {
        console.log(`   🏟️ Teams no match: ${match.teams.length}`);
        console.log(
          `      Primeiro team:`,
          JSON.stringify(match.teams[0], null, 2)
        );
      }
    }

    // 2. Tentar buscar um game específico
    console.log("\n2️⃣ Tentando buscar game específico...");
    if (
      matchesResponse.data.length > 0 &&
      matchesResponse.data[0].games?.length > 0
    ) {
      const gameId = matchesResponse.data[0].games[0].id;
      console.log(`Buscando game ID: ${gameId}`);

      try {
        const gameResponse = await axios.get(
          `${BASE_URL}/csgo/games/${gameId}`,
          {
            headers: { Authorization: `Bearer ${PANDASCORE_API_KEY}` },
            params: {
              include: "players,teams,stats",
            },
          }
        );

        console.log("✅ Game específico encontrado:");
        console.log(JSON.stringify(gameResponse.data, null, 2));
      } catch (error) {
        console.log(
          `❌ Erro ao buscar game ${gameId}:`,
          error.response?.status
        );
      }
    }

    // 3. Verificar se há endpoint de stats
    console.log("\n3️⃣ Verificando endpoints de estatísticas...");
    const possibleEndpoints = [
      "/csgo/stats",
      "/csgo/match-stats",
      "/csgo/game-stats",
      "/csgo/player-match-stats",
    ];

    for (const endpoint of possibleEndpoints) {
      try {
        console.log(`Testando ${endpoint}...`);
        const response = await axios.get(`${BASE_URL}${endpoint}`, {
          headers: { Authorization: `Bearer ${PANDASCORE_API_KEY}` },
          params: { "page[size]": 1 },
        });
        console.log(`✅ ${endpoint}: ${response.data.length} registros`);
        if (response.data.length > 0) {
          console.log(
            `   Primeiro registro:`,
            JSON.stringify(response.data[0], null, 2)
          );
        }
      } catch (error) {
        console.log(`❌ ${endpoint}: ${error.response?.status}`);
      }
    }
  } catch (error) {
    console.error("❌ Erro geral:", error.message);
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    }
  }
}

investigateGamesData();
