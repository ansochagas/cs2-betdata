const axios = require("axios");

const PANDASCORE_BASE_URL = "https://api.pandascore.co";
const API_TOKEN = "YpNRtsc43jMD6EH_JdXmbjyOorxQGuOMDlkuRmlGYALserFw0OM";

const apiClient = axios.create({
  baseURL: PANDASCORE_BASE_URL,
  headers: {
    Authorization: `Bearer ${API_TOKEN}`,
    Accept: "application/json",
  },
});

async function debugFuriaGames() {
  console.log("🔍 DEBUG: Investigando jogos da FURIA");
  console.log("=".repeat(60));

  try {
    // Buscar jogos da FURIA
    const response = await apiClient.get("/csgo/matches", {
      params: {
        "filter[opponent_id]": 124530,
        "filter[status]": "finished",
        sort: "-begin_at",
        "page[size]": 10,
      },
    });

    const games = response.data;
    console.log(`📊 Encontrados ${games.length} jogos finalizados da FURIA`);

    games.forEach((game, index) => {
      console.log(`\n🏆 JOGO ${index + 1}:`);
      console.log(`   ID: ${game.id}`);
      console.log(`   Data: ${game.begin_at}`);
      console.log(`   Status: ${game.status}`);
      console.log(`   Torneio: ${game.tournament?.name || "N/A"}`);
      console.log(`   Tier: ${game.tournament?.tier || "N/A"}`);

      // Verificar dados de mapas
      console.log(`   Maps disponíveis: ${game.maps ? game.maps.length : 0}`);
      if (game.maps && game.maps.length > 0) {
        console.log(`   ✅ TEM DADOS DE MAPAS!`);
        game.maps.forEach((map, mapIndex) => {
          console.log(`      Mapa ${mapIndex + 1}: ${map.name} - ${map.score}`);
        });
      } else {
        console.log(`   ❌ SEM DADOS DE MAPAS`);
      }

      // Verificar placar geral
      if (game.results && game.results.length > 0) {
        console.log(
          `   Placar geral: ${game.results.map((r) => r.score).join("-")}`
        );
      }

      // Verificar se tem winner
      if (game.winner) {
        console.log(`   Vencedor: ${game.winner.name}`);
      }
    });

    // Estatísticas gerais
    const gamesWithMaps = games.filter((g) => g.maps && g.maps.length > 0);
    console.log(`\n📈 RESUMO:`);
    console.log(`   Total de jogos: ${games.length}`);
    console.log(`   Jogos com mapas: ${gamesWithMaps.length}`);
    console.log(`   Jogos sem mapas: ${games.length - gamesWithMaps.length}`);

    if (gamesWithMaps.length === 0) {
      console.log(
        `\n❌ CONCLUSÃO: Nenhum jogo da FURIA tem dados de mapas na Pandascore`
      );
      console.log(`💡 Possíveis razões:`);
      console.log(
        `   - Jogos são de torneios que não fornecem dados detalhados`
      );
      console.log(`   - API gratuita não inclui dados de mapas`);
      console.log(`   - Dados estão em outro endpoint`);
    }
  } catch (error) {
    console.error("Erro:", error.response?.data || error.message);
  }
}

debugFuriaGames().catch(console.error);
