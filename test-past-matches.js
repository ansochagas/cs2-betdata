const API_KEY = "POciMXi8fwRIbuW3qEWvPVqGTv_Yfv55T-_mwp8DzpYOR-1mYjo";
const BASE_URL = "https://api.pandascore.co";

async function testPastMatches() {
  console.log("🔍 Testando endpoint /csgo/matches com jogos finalizados...\n");

  try {
    // Buscar jogos que já terminaram
    const response = await fetch(
      `${BASE_URL}/csgo/matches?filter[status]=finished&page[size]=10&sort=-end_at`,
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          Accept: "application/json",
        },
      }
    );

    console.log(`📊 Status Code: ${response.status}`);

    if (response.ok) {
      const matches = await response.json();
      console.log(`✅ Encontrados ${matches.length} jogos finalizados\n`);

      // Analisar o primeiro jogo detalhadamente
      if (matches.length > 0) {
        const match = matches[0];
        console.log(`🎮 Analisando jogo: ${match.name}`);
        console.log(`🏆 ID: ${match.id}`);
        console.log(`📅 Data: ${match.begin_at}`);
        console.log(
          `🏟️ Torneio: ${match.tournament?.name} (${match.tournament?.tier})`
        );
        console.log(
          `⚔️ Times: ${match.opponents
            ?.map((opp) => opp.opponent.name)
            .join(" vs ")}`
        );
        console.log(
          `📊 Placar geral: ${
            match.results?.map((r) => r.score).join("-") || "N/A"
          }`
        );
        console.log(`🗺️ Número de mapas: ${match.games?.length || "N/A"}`);

        // Verificar dados dos mapas
        if (match.games && match.games.length > 0) {
          console.log(`\n🗺️ DETALHES DOS MAPAS:`);
          match.games.forEach((game, index) => {
            console.log(`  Mapa ${index + 1}:`);
            console.log(`    - ID: ${game.id}`);
            console.log(`    - Status: ${game.status}`);
            console.log(`    - Mapa: ${game.map || "N/A"}`);
            console.log(`    - Placar: ${game.score || "N/A"}`);
            console.log(`    - Vencedor: ${game.winner?.id || "N/A"}`);
            console.log(`    - Duração: ${game.length || "N/A"} segundos`);
            console.log("");
          });
        } else {
          console.log(`❌ Nenhum detalhe de mapas disponível`);
        }

        // Verificar se há estatísticas detalhadas
        console.log(`📈 ESTRUTURA COMPLETA DO JOGO:`);
        console.log(JSON.stringify(match, null, 2));
      }
    } else {
      const errorText = await response.text();
      console.log(`❌ Erro: ${errorText}`);
    }
  } catch (error) {
    console.log(`❌ Erro de conexão: ${error.message}`);
  }
}

testPastMatches();
