// Teste dos novos endpoints Pandascore Premium
// Plano Histórico - 1 semana grátis

const PANDASCORE_API_KEY =
  "YpNRtsc43jMD6EH_JdXmbjyOorxQGuOMDlkuRmlGYALserFw0OM"; // Atualizar se necessário
const BASE_URL = "https://api.pandascore.co";

// Headers para autenticação
const headers = {
  Authorization: `Bearer ${PANDASCORE_API_KEY}`,
  Accept: "application/json",
};

// 1. Testar endpoint de estatísticas de jogador
async function testPlayerStats() {
  console.log("🎯 Testando estatísticas de jogador...");

  try {
    // Exemplo: estatísticas de coldzera (jogador famoso)
    const response = await fetch(`${BASE_URL}/csgo/players/1/stats`, {
      headers,
    });

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Estatísticas de jogador obtidas:");
      console.log(JSON.stringify(data, null, 2));
    } else {
      console.log(`❌ Erro: ${response.status} - ${response.statusText}`);
    }
  } catch (error) {
    console.error("Erro ao testar estatísticas de jogador:", error);
  }
}

// 2. Testar endpoint de estatísticas de equipe
async function testTeamStats() {
  console.log("\n🏆 Testando estatísticas de equipe...");

  try {
    // Exemplo: estatísticas da FURIA
    const response = await fetch(`${BASE_URL}/csgo/teams/1/stats`, { headers });

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Estatísticas de equipe obtidas:");
      console.log(JSON.stringify(data, null, 2));
    } else {
      console.log(`❌ Erro: ${response.status} - ${response.statusText}`);
    }
  } catch (error) {
    console.error("Erro ao testar estatísticas de equipe:", error);
  }
}

// 3. Testar jogos com estatísticas detalhadas (detailed_stats = true)
async function testDetailedMatches() {
  console.log("\n📊 Testando jogos com estatísticas detalhadas...");

  try {
    // Buscar jogos recentes com estatísticas detalhadas
    const response = await fetch(
      `${BASE_URL}/csgo/matches?filter[detailed_stats]=true&page[size]=5&sort=-begin_at`,
      { headers }
    );

    if (response.ok) {
      const data = await response.json();
      console.log(
        `✅ Encontrados ${data.length} jogos com estatísticas detalhadas:`
      );

      data.forEach((match, index) => {
        console.log(`\n--- Jogo ${index + 1}: ${match.name} ---`);
        console.log(`ID: ${match.id}`);
        console.log(`Status: ${match.status}`);
        console.log(
          `Torneio: ${match.tournament?.name} (${match.tournament?.tier})`
        );
        console.log(`Data: ${match.begin_at}`);
        console.log(
          `Times: ${match.opponents
            ?.map((opp) => opp.opponent.name)
            .join(" vs ")}`
        );

        if (match.games && match.games.length > 0) {
          console.log(`Mapas jogados: ${match.games.length}`);
          match.games.forEach((game, gameIndex) => {
            console.log(
              `  Mapa ${gameIndex + 1}: ${
                game.length ? `${Math.round(game.length / 60)}min` : "N/A"
              }`
            );
          });
        }

        if (match.results && match.results.length > 0) {
          console.log(
            `Resultado: ${match.results.map((r) => r.score).join("-")}`
          );
        }
      });
    } else {
      console.log(`❌ Erro: ${response.status} - ${response.statusText}`);
    }
  } catch (error) {
    console.error("Erro ao testar jogos detalhados:", error);
  }
}

// 4. Testar torneios com diferentes níveis de cobertura
async function testTournamentCoverage() {
  console.log("\n🏟️ Testando níveis de cobertura dos torneios...");

  try {
    const response = await fetch(
      `${BASE_URL}/csgo/tournaments?page[size]=10&sort=-begin_at`,
      { headers }
    );

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Níveis de cobertura dos torneios:");

      data.forEach((tournament, index) => {
        console.log(`\n--- Torneio ${index + 1}: ${tournament.name} ---`);
        console.log(`ID: ${tournament.id}`);
        console.log(`Tier: ${tournament.tier}`);
        console.log(
          `Detailed Stats: ${tournament.detailed_stats ? "✅" : "❌"}`
        );
        console.log(
          `Live Supported: ${tournament.live_supported ? "✅" : "❌"}`
        );
        console.log(`Status: ${tournament.status}`);
      });
    } else {
      console.log(`❌ Erro: ${response.status} - ${response.statusText}`);
    }
  } catch (error) {
    console.error("Erro ao testar cobertura de torneios:", error);
  }
}

// 5. Testar dados de jogos finalizados (pós-jogo)
async function testFinishedMatches() {
  console.log("\n🏁 Testando dados pós-jogo de jogos finalizados...");

  try {
    const response = await fetch(
      `${BASE_URL}/csgo/matches?filter[status]=finished&filter[detailed_stats]=true&page[size]=3&sort=-end_at`,
      { headers }
    );

    if (response.ok) {
      const data = await response.json();
      console.log(
        `✅ Encontrados ${data.length} jogos finalizados com dados pós-jogo:`
      );

      data.forEach((match, index) => {
        console.log(`\n--- Jogo Finalizado ${index + 1}: ${match.name} ---`);
        console.log(`ID: ${match.id}`);
        console.log(`Vencedor: ${match.winner?.name || "N/A"}`);
        console.log(
          `Duração total: ${
            match.end_at && match.begin_at
              ? `${Math.round(
                  (new Date(match.end_at) - new Date(match.begin_at)) /
                    (1000 * 60)
                )}min`
              : "N/A"
          }`
        );

        if (match.games && match.games.length > 0) {
          console.log("Detalhes dos mapas:");
          match.games.forEach((game, gameIndex) => {
            console.log(
              `  Mapa ${gameIndex + 1}: ${game.status} (${
                game.length ? `${Math.round(game.length / 60)}min` : "N/A"
              })`
            );
          });
        }
      });
    } else {
      console.log(`❌ Erro: ${response.status} - ${response.statusText}`);
    }
  } catch (error) {
    console.error("Erro ao testar jogos finalizados:", error);
  }
}

// Executar todos os testes
async function runAllTests() {
  console.log("🚀 Iniciando testes do plano Pandascore Premium...\n");

  await testPlayerStats();
  await testTeamStats();
  await testDetailedMatches();
  await testTournamentCoverage();
  await testFinishedMatches();

  console.log("\n✅ Todos os testes concluídos!");
}

// Executar se chamado diretamente
if (require.main === module) {
  runAllTests();
}

module.exports = {
  testPlayerStats,
  testTeamStats,
  testDetailedMatches,
  testTournamentCoverage,
  testFinishedMatches,
  runAllTests,
};
