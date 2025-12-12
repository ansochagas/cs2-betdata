const axios = require("axios");

async function testarBetsAPI2() {
  console.log("🎮 TESTE - BETSAPI2 (RapidAPI)");
  console.log("📋 API de apostas e eventos esportivos");
  console.log("🎯 Via RapidAPI - dados de apostas");
  console.log("💰 Gratuita com limites");
  console.log("============================================================\n");

  const API_KEY = "d5da2b13a6msh434479d753d8387p12bae1jsn117c3b0f7da9";
  const API_HOST = "betsapi2.p.rapidapi.com";

  try {
    // Teste 1: Esportes disponíveis
    console.log("📖 TESTE 1: Esportes disponíveis");
    const sportsResponse = await axios.get(
      "https://betsapi2.p.rapidapi.com/v1/bet365/sports",
      {
        headers: {
          "x-rapidapi-host": API_HOST,
          "x-rapidapi-key": API_KEY,
        },
        timeout: 10000,
      }
    );

    console.log(`✅ Status: ${sportsResponse.status}`);
    console.log(
      `📊 Esportes encontrados: ${sportsResponse.data?.results?.length || 0}`
    );

    if (sportsResponse.data?.results) {
      const sports = sportsResponse.data.results;

      // Procurar por CS:GO ou esports
      const esports = sports.filter(
        (sport) =>
          sport.name?.toLowerCase().includes("cs") ||
          sport.name?.toLowerCase().includes("counter") ||
          sport.name?.toLowerCase().includes("esports") ||
          sport.name?.toLowerCase().includes("valorant") ||
          sport.name?.toLowerCase().includes("lol") ||
          sport.name?.toLowerCase().includes("dota") ||
          sport.name?.toLowerCase().includes("overwatch") ||
          sport.name?.toLowerCase().includes("rainbow") ||
          sport.id == 40 || // Counter-Strike
          sport.id == 41 || // Dota 2
          sport.id == 42 // League of Legends
      );

      console.log(`🎮 Esportes de eSports encontrados: ${esports.length}`);

      if (esports.length > 0) {
        console.log("\n🏆 ESPORTS DISPONÍVEIS:");
        esports.forEach((sport, index) => {
          console.log(`${index + 1}. ${sport.name} (ID: ${sport.id})`);
          console.log("");
        });
      } else {
        console.log("\n❌ Nenhum esporte de eSports encontrado");
      }

      // Mostrar todos os esportes disponíveis (primeiros 15)
      console.log("🎯 TODOS OS ESPORTES DISPONÍVEIS (primeiros 15):");
      sports.slice(0, 15).forEach((sport, index) => {
        console.log(`${index + 1}. ${sport.name} (ID: ${sport.id})`);
      });

      if (sports.length > 15) {
        console.log(`... e mais ${sports.length - 15} esportes`);
      }
    }

    // Teste 2: Verificar eventos ao vivo (inplay)
    console.log("\n📖 TESTE 2: Eventos ao vivo (inplay)");
    const inplayResponse = await axios.get(
      "https://betsapi2.p.rapidapi.com/v1/bet365/inplay",
      {
        headers: {
          "x-rapidapi-host": API_HOST,
          "x-rapidapi-key": API_KEY,
        },
        timeout: 10000,
      }
    );

    console.log(`✅ Status: ${inplayResponse.status}`);
    console.log(
      `📊 Eventos ao vivo: ${inplayResponse.data?.results?.length || 0}`
    );

    if (inplayResponse.data?.results) {
      const inplayEvents = inplayResponse.data.results;

      // Procurar por CS:GO nos eventos ao vivo
      const csgoInplay = inplayEvents.filter(
        (event) =>
          event.league?.name?.toLowerCase().includes("cs") ||
          event.league?.name?.toLowerCase().includes("counter") ||
          event.league?.name?.toLowerCase().includes("esports") ||
          event.home?.name?.toLowerCase().includes("cs") ||
          event.away?.name?.toLowerCase().includes("cs") ||
          event.sport_id == 40
      );

      console.log(`🎮 Eventos CS:GO ao vivo: ${csgoInplay.length}`);

      if (csgoInplay.length > 0) {
        console.log("\n🏆 EVENTOS CS:GO AO VIVO:");
        csgoInplay.slice(0, 3).forEach((event, index) => {
          console.log(
            `${index + 1}. ${event.home?.name} vs ${event.away?.name}`
          );
          console.log(`   🏆 ${event.league?.name}`);
          console.log(
            `   📊 Score: ${event.scores?.home || 0} - ${
              event.scores?.away || 0
            }`
          );
          console.log("");
        });
      }
    }

    // Teste 3: Verificar eventos futuros
    console.log("\n📖 TESTE 3: Eventos futuros");
    const upcomingResponse = await axios.get(
      "https://betsapi2.p.rapidapi.com/v1/bet365/upcoming?sport_id=1&page=1",
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
      `📊 Eventos futuros: ${upcomingResponse.data?.results?.length || 0}`
    );

    if (upcomingResponse.data?.results) {
      const upcomingEvents = upcomingResponse.data.results;

      // Procurar por CS:GO nos eventos futuros
      const csgoUpcoming = upcomingEvents.filter(
        (event) =>
          event.league?.name?.toLowerCase().includes("cs") ||
          event.league?.name?.toLowerCase().includes("counter") ||
          event.league?.name?.toLowerCase().includes("esports") ||
          event.home?.name?.toLowerCase().includes("cs") ||
          event.away?.name?.toLowerCase().includes("cs") ||
          event.sport_id == 40
      );

      console.log(`🎮 Eventos CS:GO futuros: ${csgoUpcoming.length}`);

      if (csgoUpcoming.length > 0) {
        console.log("\n🏆 EVENTOS CS:GO FUTUROS:");
        csgoUpcoming.slice(0, 5).forEach((event, index) => {
          console.log(
            `${index + 1}. ${event.home?.name} vs ${event.away?.name}`
          );
          console.log(`   🏆 ${event.league?.name}`);
          console.log(`   📅 ${event.time}`);
          console.log("");
        });
      }
    }

    console.log(
      "\n============================================================"
    );
    console.log("📊 RESUMO - BETSAPI2");

    const hasEsports = sportsResponse.data?.results?.some(
      (sport) =>
        sport.name?.toLowerCase().includes("cs") ||
        sport.name?.toLowerCase().includes("counter") ||
        sport.name?.toLowerCase().includes("esports") ||
        sport.id == 40 ||
        sport.id == 41 ||
        sport.id == 42
    );

    const hasCsgoInplay = inplayResponse.data?.results?.some(
      (event) =>
        event.league?.name?.toLowerCase().includes("cs") ||
        event.league?.name?.toLowerCase().includes("counter") ||
        event.sport_id == 40
    );

    const hasCsgoUpcoming = upcomingResponse.data?.results?.some(
      (event) =>
        event.league?.name?.toLowerCase().includes("cs") ||
        event.league?.name?.toLowerCase().includes("counter") ||
        event.sport_id == 40
    );

    if (hasEsports || hasCsgoInplay || hasCsgoUpcoming) {
      console.log("🎉 ENCONTROU DADOS DE CS:GO!");
      console.log("✅ POSSÍVEL FONTE PARA CS:GO SCOUT!");
    } else {
      console.log("❌ NENHUM DADO DE CS:GO ENCONTRADO");
      console.log("💡 FOCADA EM ESPORTES TRADICIONAIS");
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

testarBetsAPI2();
