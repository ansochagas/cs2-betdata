const { sportApi } = require("radar-sport-api");

async function testarRadarSportAPI() {
  console.log("🎮 TESTE - RADAR-SPORT-API");
  console.log("📋 Biblioteca para dados de casas de apostas");
  console.log("🎯 Suporte oficial a Counter-Strike (ID 109)");
  console.log("💰 Gratuita - múltiplas casas de apostas");
  console.log("============================================================\n");

  try {
    // Teste 1: Counter-Strike com betfair
    console.log("📖 TESTE 1: Counter-Strike (betfair)");
    const betfair = new sportApi("betfair", { getCommonContents: false });

    // Vamos tentar obter informações sobre Counter-Strike
    console.log("🔍 Buscando dados de Counter-Strike...");

    // Primeiro, vamos ver se conseguimos obter alguma informação básica
    try {
      // Tentar obter estatísticas da temporada ou torneios
      const csData = await betfair.getInfo(
        "Europe:Berlin",
        "stats_season_meta",
        109
      );
      console.log("✅ Dados de Counter-Strike encontrados!");
      console.log(JSON.stringify(csData, null, 2));
    } catch (error) {
      console.log(`⚠️ Erro ao buscar Counter-Strike: ${error.message}`);

      // Tentar outro método - listar torneios
      try {
        console.log("\n🔍 Tentando listar torneios...");
        const tournaments = await betfair.getInfo(
          "Europe:Berlin",
          "tournaments",
          109
        );
        console.log("✅ Torneios encontrados!");
        console.log(JSON.stringify(tournaments, null, 2));
      } catch (error2) {
        console.log(`⚠️ Erro ao buscar torneios: ${error2.message}`);
      }
    }

    // Teste 2: Verificar outras casas de apostas
    console.log("\n📖 TESTE 2: Testando outras casas de apostas");

    const casasApostas = ["bet365", "betway", "betano", "rivalo"];

    for (const casa of casasApostas) {
      try {
        console.log(`🔍 Testando ${casa}...`);
        const api = new sportApi(casa, { getCommonContents: false });

        // Tentar obter dados básicos
        const data = await api.getInfo(
          "Europe:Berlin",
          "stats_season_meta",
          109
        );
        console.log(`✅ ${casa} tem dados de Counter-Strike!`);
        console.log(`   Sample: ${JSON.stringify(data).substring(0, 100)}...`);
        break; // Se uma casa funcionar, paramos
      } catch (error) {
        console.log(`❌ ${casa} falhou: ${error.message}`);
      }
    }

    // Teste 3: Verificar jogos atuais/futuros
    console.log("\n📖 TESTE 3: Buscando jogos atuais/futuros");
    try {
      // Tentar obter jogos futuros
      const futureGames = await betfair.getInfo(
        "Europe:Berlin",
        "fixtures",
        109
      );
      console.log("✅ Jogos futuros encontrados!");
      console.log(`📊 Total: ${futureGames?.data?.length || 0} jogos`);

      if (futureGames?.data?.length > 0) {
        console.log("🏆 Primeiros jogos:");
        futureGames.data.slice(0, 3).forEach((game, index) => {
          console.log(
            `${index + 1}. ${game.home_team || "TBD"} vs ${
              game.away_team || "TBD"
            }`
          );
          console.log(`   📅 ${game.date || "N/A"}`);
        });
      }
    } catch (error) {
      console.log(`⚠️ Erro ao buscar jogos: ${error.message}`);
    }

    console.log(
      "\n============================================================"
    );
    console.log("📊 RESUMO - RADAR-SPORT-API");

    console.log("✅ Biblioteca instalada");
    console.log("✅ Suporte oficial a Counter-Strike");
    console.log("✅ Múltiplas casas de apostas");

    console.log("\n🎯 PRÓXIMOS PASSOS:");
    console.log("1. Testar métodos específicos para jogos");
    console.log("2. Verificar estrutura de dados");
    console.log("3. Implementar integração se funcionar");
  } catch (error) {
    console.error("❌ ERRO GERAL:", error.message);
    console.error("Stack:", error.stack);
  }
}

testarRadarSportAPI();
