const HLTV = require("hltv-api").default;

async function testarHLTVAPICorreto() {
  console.log("🎮 TESTE CORRETO - HLTV-API (do site)");
  console.log("📋 Usando require('hltv-api').default");
  console.log("🎯 Seguindo exemplo oficial do site");
  console.log("============================================================\n");

  try {
    // Teste 1: Team Ranking
    console.log("📖 TESTE 1: Team Ranking");
    const teamRanking = await HLTV.getTeamRanking();
    console.log(`✅ Times encontrados: ${teamRanking.length}`);

    if (teamRanking.length > 0) {
      console.log("⭐ Top 5 times:");
      teamRanking.slice(0, 5).forEach((team, index) => {
        console.log(
          `${index + 1}. ${team.name || "N/A"} - Pontos: ${
            team.points || "N/A"
          }`
        );
      });
    }

    // Teste 2: Recent Results
    console.log("\n📖 TESTE 2: Recent Results");
    const recentResults = await HLTV.getResults();
    console.log(`✅ Resultados encontrados: ${recentResults.length}`);

    if (recentResults.length > 0) {
      console.log("🏆 Primeiro resultado:");
      console.log(JSON.stringify(recentResults[0], null, 2));

      // Análise de datas dos resultados
      const now = new Date();
      const resultsWithDates = recentResults.filter((result) => result.date);

      if (resultsWithDates.length > 0) {
        const oldestDate = new Date(
          Math.min(...resultsWithDates.map((r) => r.date))
        );
        const newestDate = new Date(
          Math.max(...resultsWithDates.map((r) => r.date))
        );

        console.log("\n📅 ANÁLISE DE DATAS DOS RESULTADOS:");
        console.log(`   - Total de resultados: ${recentResults.length}`);
        console.log(`   - Data mais antiga: ${oldestDate.toISOString()}`);
        console.log(`   - Data mais recente: ${newestDate.toISOString()}`);
        console.log(
          `   - Dias desde o resultado mais antigo: ${Math.floor(
            (now - oldestDate) / (1000 * 60 * 60 * 24)
          )}`
        );
        console.log(
          `   - Dias desde o resultado mais recente: ${Math.floor(
            (now - newestDate) / (1000 * 60 * 60 * 24)
          )}`
        );
      }
    }

    // Teste 3: Matches (se disponível)
    console.log("\n📖 TESTE 3: Matches");
    try {
      const matches = await HLTV.getMatches();
      console.log(`✅ Matches encontrados: ${matches.length}`);

      if (matches.length > 0) {
        console.log("📅 Primeiro match:");
        console.log(JSON.stringify(matches[0], null, 2));

        // Verificar jogos futuros
        const now = new Date();
        const futureMatches = matches.filter(
          (match) => match.date && match.date > now
        );
        if (futureMatches.length > 0) {
          console.log("\n🎯 JOGOS FUTUROS ENCONTRADOS:");
          futureMatches.slice(0, 3).forEach((match, index) => {
            console.log(
              `${index + 1}. ${match.team1?.name || "TBD"} vs ${
                match.team2?.name || "TBD"
              }`
            );
            console.log(`   📅 ${match.date?.toISOString()}`);
            console.log(`   🏆 ${match.event?.name || "N/A"}`);
          });
        }
      }
    } catch (error) {
      console.log(`⚠️ Erro ao buscar matches: ${error.message}`);
    }

    console.log(
      "\n============================================================"
    );
    console.log("📊 RESUMO - HLTV-API CORRETO");
    console.log("✅ Usando sintaxe correta do site");
    console.log("✅ Faz scraping direto do HLTV.org");

    if (recentResults.length > 0) {
      console.log("✅ TEM DADOS DE CS:GO!");
      console.log("🎯 PERFEITA PARA CS:GO SCOUT!");
    } else {
      console.log("❌ Nenhum dado encontrado");
    }
  } catch (error) {
    console.error("❌ ERRO GERAL:", error.message);
    console.error("Stack:", error.stack);
  }
}

testarHLTVAPICorreto();
