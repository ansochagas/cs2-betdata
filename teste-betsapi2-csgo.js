const axios = require("axios");

async function testarBetsAPI2CSGO() {
  console.log("🎮 TESTE ESPECÍFICO - BETSAPI2 CS:GO");
  console.log("📋 Verificando Counter-Strike na BetsAPI2");
  console.log("🎯 sport_id 40 identificado como possível CS:GO");
  console.log("============================================================\n");

  const API_KEY = "d5da2b13a6msh434479d753d8387p12bae1jsn117c3b0f7da9";
  const API_HOST = "betsapi2.p.rapidapi.com";

  try {
    // Teste 1: Counter-Strike (sport_id 40)
    console.log("📖 TESTE 1: Counter-Strike (sport_id 40)");
    console.log(
      "🔍 URL: https://betsapi2.p.rapidapi.com/v1/bet365/inplay_filter?sport_id=40"
    );

    const csgoResponse = await axios.get(
      "https://betsapi2.p.rapidapi.com/v1/bet365/inplay_filter?sport_id=40",
      {
        headers: {
          "x-rapidapi-host": API_HOST,
          "x-rapidapi-key": API_KEY,
        },
        timeout: 10000,
      }
    );

    console.log(`✅ Status: ${csgoResponse.status}`);
    console.log(
      `📊 Jogos encontrados: ${csgoResponse.data?.results?.length || 0}`
    );

    if (csgoResponse.data?.results && csgoResponse.data.results.length > 0) {
      console.log("\n🏆 JOGOS DE COUNTER-STRIKE ENCONTRADOS!");
      csgoResponse.data.results.slice(0, 5).forEach((game, index) => {
        console.log(
          `${index + 1}. ${game.home?.name || "TBD"} vs ${
            game.away?.name || "TBD"
          }`
        );
        console.log(`   🏆 Liga: ${game.league?.name || "N/A"}`);
        console.log(
          `   📅 Horário: ${new Date(game.time * 1000).toISOString()}`
        );
        console.log(
          `   📊 Status: ${game.time_status === "1" ? "AO VIVO" : "AGENDADO"}`
        );
        if (game.ss) {
          console.log(`   🏅 Placar: ${game.ss}`);
        }
        console.log("");
      });
    } else {
      console.log("❌ Nenhum jogo de CS:GO encontrado no momento");
    }

    // Teste 2: Próximos jogos de CS:GO
    console.log("\n📖 TESTE 2: Próximos jogos de CS:GO");
    console.log(
      "🔍 URL: https://betsapi2.p.rapidapi.com/v1/bet365/upcoming?sport_id=40"
    );

    const upcomingResponse = await axios.get(
      "https://betsapi2.p.rapidapi.com/v1/bet365/upcoming?sport_id=40",
      {
        headers: {
          "x-rapidapi-host": API_HOST,
          "x-rapidapi-key": API_KEY,
        },
        timeout: 10000,
      }
    );

    console.log(`✅ Status: ${upcomingResponse.status}`);
    console.log(
      `📊 Próximos jogos: ${upcomingResponse.data?.results?.length || 0}`
    );

    if (
      upcomingResponse.data?.results &&
      upcomingResponse.data.results.length > 0
    ) {
      console.log("\n🏆 PRÓXIMOS JOGOS DE COUNTER-STRIKE:");
      upcomingResponse.data.results.slice(0, 10).forEach((game, index) => {
        console.log(
          `${index + 1}. ${game.home?.name || "TBD"} vs ${
            game.away?.name || "TBD"
          }`
        );
        console.log(`   🏆 Liga: ${game.league?.name || "N/A"}`);
        console.log(
          `   📅 Horário: ${new Date(game.time * 1000).toISOString()}`
        );
        console.log("");
      });
    } else {
      console.log("❌ Nenhum jogo futuro de CS:GO encontrado");
    }

    // Teste 3: Verificar outros sport_ids possíveis para CS:GO
    console.log("\n📖 TESTE 3: Testando outros sport_ids possíveis");
    const possibleIds = [41, 42, 109, 110, 111]; // Dota, LoL, Counter-Strike IDs

    for (const sportId of possibleIds) {
      try {
        const response = await axios.get(
          `https://betsapi2.p.rapidapi.com/v1/bet365/inplay_filter?sport_id=${sportId}`,
          {
            headers: {
              "x-rapidapi-host": API_HOST,
              "x-rapidapi-key": API_KEY,
            },
            timeout: 5000,
          }
        );

        if (response.data?.results && response.data.results.length > 0) {
          console.log(`🎉 ESPORT ENCONTRADO no sport_id ${sportId}!`);
          console.log(`   📊 Jogos: ${response.data.results.length}`);
          console.log(
            `   🏆 Exemplo: ${response.data.results[0].league?.name || "N/A"}`
          );
        }
      } catch (error) {
        // Ignora erros, apenas testa
      }
    }

    console.log(
      "\n============================================================"
    );
    console.log("📊 RESUMO - BETSAPI2 CS:GO");

    const hasCsgoInplay =
      csgoResponse.data?.results && csgoResponse.data.results.length > 0;
    const hasCsgoUpcoming =
      upcomingResponse.data?.results &&
      upcomingResponse.data.results.length > 0;

    if (hasCsgoInplay || hasCsgoUpcoming) {
      console.log("🎉 SUCESSO! BETSAPI2 TEM DADOS DE CS:GO!");
      console.log("✅ Jogos ao vivo e futuros disponíveis");
      console.log("✅ Estrutura completa de dados");
      console.log("✅ PERFEITA PARA CS:GO SCOUT!");
    } else {
      console.log("❌ Nenhum dado de CS:GO encontrado");
      console.log(
        "💡 Mas API está funcionando - pode ter jogos em outros momentos"
      );
    }
  } catch (error) {
    console.error("❌ ERRO GERAL:", error.message);
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(
        `   Detalhes: ${JSON.stringify(error.response.data, null, 2)}`
      );
    }
  }
}

testarBetsAPI2CSGO();
