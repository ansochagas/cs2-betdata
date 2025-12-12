const { Hltv } = require("hltv");

async function testarGigobyteHLTVCorreto() {
  console.log("🎮 TESTE CORRETO - GIGOBYTE/HLTV API");
  console.log("📋 Usando classe Hltv corretamente");
  console.log("============================================================\n");

  try {
    // Criar instância da classe Hltv
    const hltv = new Hltv();

    // Teste 1: Matches recentes
    console.log("📖 TESTE 1: Matches recentes");
    const recentMatches = await hltv.getMatches();
    console.log(`✅ Matches encontrados: ${recentMatches.length}`);

    if (recentMatches.length > 0) {
      console.log("📅 Primeiro match:");
      console.log(JSON.stringify(recentMatches[0], null, 2));

      // Análise de datas
      const now = new Date();
      const matchesWithDates = recentMatches.filter((match) => match.date);

      if (matchesWithDates.length > 0) {
        const oldestDate = new Date(
          Math.min(...matchesWithDates.map((m) => m.date))
        );
        const newestDate = new Date(
          Math.max(...matchesWithDates.map((m) => m.date))
        );

        console.log("\n📅 ANÁLISE DE DATAS DOS JOGOS:");
        console.log(`   - Total de jogos: ${recentMatches.length}`);
        console.log(`   - Data mais antiga: ${oldestDate.toISOString()}`);
        console.log(`   - Data mais recente: ${newestDate.toISOString()}`);
        console.log(
          `   - Jogos futuros: ${
            recentMatches.filter((match) => match.date && match.date > now)
              .length
          }`
        );
        console.log(
          `   - Jogos passados: ${
            recentMatches.filter((match) => match.date && match.date <= now)
              .length
          }`
        );
        console.log(
          `   - Dias desde o jogo mais antigo: ${Math.floor(
            (now - oldestDate) / (1000 * 60 * 60 * 24)
          )}`
        );
        console.log(
          `   - Dias até o jogo mais recente: ${Math.floor(
            (now - newestDate) / (1000 * 60 * 60 * 24)
          )}`
        );

        // Verificar jogos futuros
        const futureMatches = recentMatches.filter(
          (match) => match.date && match.date > now
        );
        if (futureMatches.length > 0) {
          console.log("\n🎯 JOGOS FUTUROS ENCONTRADOS:");
          futureMatches.slice(0, 5).forEach((match, index) => {
            console.log(
              `${index + 1}. ${match.team1?.name || "TBD"} vs ${
                match.team2?.name || "TBD"
              }`
            );
            console.log(`   📅 ${match.date?.toISOString()}`);
            console.log(`   🏆 ${match.event?.name || "N/A"}`);
            console.log("");
          });
        }
      }
    }

    // Teste 2: Próximos jogos
    console.log("\n📖 TESTE 2: Próximos jogos");
    try {
      const upcomingMatches = await hltv.getMatches({ upcoming: true });
      console.log(`✅ Próximos matches encontrados: ${upcomingMatches.length}`);

      if (upcomingMatches.length > 0) {
        console.log("📅 Primeiro jogo futuro:");
        console.log(JSON.stringify(upcomingMatches[0], null, 2));
      }
    } catch (error) {
      console.log(`⚠️ Erro ao buscar próximos jogos: ${error.message}`);
    }

    // Teste 3: Times top
    console.log("\n📖 TESTE 3: Times top");
    try {
      const topTeams = await hltv.getTeamRanking();
      console.log(`✅ Times encontrados: ${topTeams.length}`);

      if (topTeams.length > 0) {
        console.log("⭐ Top 5 times:");
        topTeams.slice(0, 5).forEach((team, index) => {
          console.log(
            `${index + 1}. ${team.name} - Pontos: ${team.points || "N/A"}`
          );
        });
      }
    } catch (error) {
      console.log(`⚠️ Erro ao buscar times: ${error.message}`);
    }

    console.log(
      "\n============================================================"
    );
    console.log("📊 RESUMO - GIGOBYTE/HLTV API");
    console.log("✅ Biblioteca funcionando com classe Hltv");
    console.log("✅ Faz scraping direto do HLTV.org");

    const futureMatches = recentMatches.filter(
      (match) => match.date && match.date > new Date()
    );
    if (futureMatches.length > 0) {
      console.log(`🎉 ENCONTROU ${futureMatches.length} JOGOS FUTUROS!`);
      console.log("✅ PERFEITA PARA CS:GO SCOUT!");
    } else {
      console.log("❌ Nenhum jogo futuro encontrado");
    }
  } catch (error) {
    console.error("❌ ERRO GERAL:", error.message);
    console.error("Stack:", error.stack);
  }
}

testarGigobyteHLTVCorreto();
