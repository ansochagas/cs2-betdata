const fetch = require("node-fetch");

async function analyzeTeamKills(teamName) {
  console.log(`🎯 Analisando dados de kills do time: ${teamName}`);
  console.log(`📊 Buscando últimos 6 jogos via PandaScore API...\n`);

  try {
    // Simular a chamada que o sistema faz
    const response = await fetch(
      `http://localhost:3000/api/pandascore/match-analysis?team1=${encodeURIComponent(
        teamName
      )}&team2=FURIA`
    );
    const data = await response.json();

    console.log(`🔍 RESPOSTA COMPLETA DA API:`);
    console.log(JSON.stringify(data, null, 2));
    console.log(`\n${"=".repeat(50)}\n`);

    if (data.success && data.data) {
      console.log(`✅ Análise completa para ${teamName}:\n`);

      // Mostrar estatísticas detalhadas
      if (data.data.team1Stats) {
        const stats = data.data.team1Stats;
        console.log(`📈 ESTATÍSTICAS DE ${teamName.toUpperCase()}:`);
        console.log(
          `• Jogos analisados: ${
            stats.gamesAnalyzed || stats.totalGames || "N/A"
          }`
        );
        console.log(
          `• Vitórias: ${stats.wins || 0}, Derrotas: ${stats.losses || 0}`
        );
        console.log(
          `• Win Rate: ${
            stats.winRate ? (stats.winRate * 100).toFixed(1) + "%" : "N/A"
          }`
        );
        console.log(
          `• Média de kills/mapa: ${
            stats.avgKillsPerMap ? stats.avgKillsPerMap.toFixed(1) : "N/A"
          }`
        );
        console.log(
          `• Média de mapas/jogo: ${
            stats.avgMapsPerMatch ? stats.avgMapsPerMatch.toFixed(1) : "N/A"
          }`
        );
        console.log(`• Forma recente: ${stats.recentForm || "N/A"}\n`);

        // Mostrar detalhes dos jogos se disponíveis
        if (stats.recentMatches && stats.recentMatches.length > 0) {
          console.log(`🎮 ÚLTIMOS JOGOS ANALISADOS:`);
          stats.recentMatches.slice(0, 6).forEach((match, index) => {
            console.log(
              `${index + 1}. ${match.opponent || match.vs} - ${match.result} (${
                match.kills || "N/A"
              } kills em ${match.maps || "N/A"} mapas)`
            );
          });
        }
      }

      // Mostrar dados combinados se disponíveis
      if (data.data.combined) {
        console.log(`\n🔄 DADOS COMBINADOS:`);
        console.log(
          `• Média de kills/mapa: ${data.data.combined.avgKillsPerMap || "N/A"}`
        );
        console.log(
          `• Média de mapas/jogo: ${
            data.data.combined.avgMapsPerMatch || "N/A"
          }`
        );
        console.log(
          `• Média de rounds/mapa: ${
            data.data.combined.avgRoundsPerMap || "N/A"
          }`
        );
      }
    } else {
      console.log(
        `❌ Erro na análise: ${data.error || "Dados não disponíveis"}`
      );
    }
  } catch (error) {
    console.error(`❌ Erro ao buscar dados:`, error.message);
  }
}

// Testar com FURIA (campeã dos últimos 2 majors - deve ter jogos oficiais)
analyzeTeamKills("FURIA");
