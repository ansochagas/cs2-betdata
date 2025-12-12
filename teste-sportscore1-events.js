const axios = require("axios");

async function testarSportScore1Events() {
  console.log("🎮 TESTE FINAL - SPORTSCORE1 EVENTS");
  console.log("📋 Endpoint fornecido pelo usuário");
  console.log("🎯 Documentação aberta - vamos encontrar CS:GO!");
  console.log("💰 Gratuita com limites via RapidAPI");
  console.log("============================================================\n");

  const API_KEY = "d5da2b13a6msh434479d753d8387p12bae1jsn117c3b0f7da9";
  const API_HOST = "sportscore1.p.rapidapi.com";

  try {
    // Teste 1: Eventos gerais (endpoint fornecido)
    console.log("📖 TESTE 1: Todos os eventos (página 1)");
    const eventsResponse = await axios.get(
      "https://sportscore1.p.rapidapi.com/events?page=1",
      {
        headers: {
          "x-rapidapi-host": API_HOST,
          "x-rapidapi-key": API_KEY,
        },
        timeout: 10000,
      }
    );

    console.log(`✅ Status: ${eventsResponse.status}`);
    console.log(
      `📊 Eventos encontrados: ${eventsResponse.data?.data?.length || 0}`
    );

    if (eventsResponse.data?.data && eventsResponse.data.data.length > 0) {
      console.log("\n🏆 EVENTOS ENCONTRADOS:");

      // Procurar por CS:GO nos eventos
      const csgoEvents = eventsResponse.data.data.filter((event) => {
        const sportName = event.sport?.name || "";
        const leagueName = event.league?.name || "";
        const homeTeam = event.home_team?.name || "";
        const awayTeam = event.away_team?.name || "";

        const searchText =
          `${sportName} ${leagueName} ${homeTeam} ${awayTeam}`.toLowerCase();

        return (
          searchText.includes("cs") ||
          searchText.includes("counter") ||
          searchText.includes("furia") ||
          searchText.includes("navi") ||
          searchText.includes("mibr") ||
          searchText.includes("faze") ||
          searchText.includes("esports") ||
          searchText.includes("valorant") ||
          searchText.includes("lol") ||
          searchText.includes("dota")
        );
      });

      console.log(
        `🎮 Eventos de eSports/CS:GO encontrados: ${csgoEvents.length}`
      );

      if (csgoEvents.length > 0) {
        console.log("\n🎯 EVENTOS DE CS:GO ENCONTRADOS:");
        csgoEvents.slice(0, 10).forEach((event, index) => {
          const homeTeam = event.home_team?.name || "TBD";
          const awayTeam = event.away_team?.name || "TBD";
          const league = event.league?.name || "N/A";
          const sport = event.sport?.name || "N/A";
          const status = event.status?.name || "N/A";
          const startTime = event.start_at
            ? new Date(event.start_at).toISOString()
            : "N/A";

          console.log(`${index + 1}. ${homeTeam} vs ${awayTeam}`);
          console.log(`   🏆 Liga: ${league}`);
          console.log(`   🎮 Esporte: ${sport}`);
          console.log(`   📊 Status: ${status}`);
          console.log(`   📅 Início: ${startTime}`);
          console.log("");
        });
      }

      // Mostrar distribuição por esporte
      const sportCounts = {};
      eventsResponse.data.data.forEach((event) => {
        const sportName = event.sport?.name || "Unknown";
        sportCounts[sportName] = (sportCounts[sportName] || 0) + 1;
      });

      console.log("📊 DISTRIBUIÇÃO POR ESPORTE:");
      Object.entries(sportCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .forEach(([sport, count]) => {
          console.log(`   ${sport}: ${count} eventos`);
        });
    }

    // Teste 2: Eventos ao vivo
    console.log("\n📖 TESTE 2: Eventos ao vivo");
    const liveResponse = await axios.get(
      "https://sportscore1.p.rapidapi.com/events/live?page=1",
      {
        headers: {
          "x-rapidapi-host": API_HOST,
          "x-rapidapi-key": API_KEY,
        },
        timeout: 10000,
      }
    );

    console.log(`✅ Status: ${liveResponse.status}`);
    console.log(`📊 Eventos ao vivo: ${liveResponse.data?.data?.length || 0}`);

    if (liveResponse.data?.data && liveResponse.data.data.length > 0) {
      const liveCsgoEvents = liveResponse.data.data.filter((event) => {
        const sportName = event.sport?.name || "";
        const leagueName = event.league?.name || "";
        const homeTeam = event.home_team?.name || "";
        const awayTeam = event.away_team?.name || "";

        const searchText =
          `${sportName} ${leagueName} ${homeTeam} ${awayTeam}`.toLowerCase();

        return (
          searchText.includes("cs") ||
          searchText.includes("counter") ||
          searchText.includes("furia") ||
          searchText.includes("navi") ||
          searchText.includes("mibr") ||
          searchText.includes("faze") ||
          searchText.includes("esports")
        );
      });

      console.log(`🎮 Eventos CS:GO ao vivo: ${liveCsgoEvents.length}`);

      if (liveCsgoEvents.length > 0) {
        console.log("\n🏆 CS:GO AO VIVO AGORA:");
        liveCsgoEvents.forEach((event, index) => {
          const homeTeam = event.home_team?.name || "TBD";
          const awayTeam = event.away_team?.name || "TBD";
          const league = event.league?.name || "N/A";
          const score = `${event.home_score?.current || 0} - ${
            event.away_score?.current || 0
          }`;

          console.log(
            `${index + 1}. ${homeTeam} ${score} ${awayTeam} (${league})`
          );
        });
      }
    }

    // Teste 3: Próximos eventos
    console.log("\n📖 TESTE 3: Próximos eventos");
    const upcomingResponse = await axios.get(
      "https://sportscore1.p.rapidapi.com/events/upcoming?page=1",
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
      `📊 Próximos eventos: ${upcomingResponse.data?.data?.length || 0}`
    );

    if (upcomingResponse.data?.data && upcomingResponse.data.data.length > 0) {
      const upcomingCsgoEvents = upcomingResponse.data.data.filter((event) => {
        const sportName = event.sport?.name || "";
        const leagueName = event.league?.name || "";
        const homeTeam = event.home_team?.name || "";
        const awayTeam = event.away_team?.name || "";

        const searchText =
          `${sportName} ${leagueName} ${homeTeam} ${awayTeam}`.toLowerCase();

        return (
          searchText.includes("cs") ||
          searchText.includes("counter") ||
          searchText.includes("furia") ||
          searchText.includes("navi") ||
          searchText.includes("mibr") ||
          searchText.includes("faze") ||
          searchText.includes("esports")
        );
      });

      console.log(`🎮 Próximos eventos CS:GO: ${upcomingCsgoEvents.length}`);

      if (upcomingCsgoEvents.length > 0) {
        console.log("\n🏆 PRÓXIMOS JOGOS DE CS:GO:");
        upcomingCsgoEvents.slice(0, 5).forEach((event, index) => {
          const homeTeam = event.home_team?.name || "TBD";
          const awayTeam = event.away_team?.name || "TBD";
          const league = event.league?.name || "N/A";
          const startTime = event.start_at
            ? new Date(event.start_at).toISOString()
            : "N/A";

          console.log(`${index + 1}. ${homeTeam} vs ${awayTeam}`);
          console.log(`   🏆 Liga: ${league}`);
          console.log(`   📅 Início: ${startTime}`);
          console.log("");
        });
      }
    }

    console.log(
      "\n============================================================"
    );
    console.log("📊 RESUMO - SPORTSCORE1 EVENTS");

    const totalEvents = eventsResponse.data?.data?.length || 0;
    const liveEvents = liveResponse.data?.data?.length || 0;
    const upcomingEvents = upcomingResponse.data?.data?.length || 0;

    const totalCsgoEvents = [
      ...(eventsResponse.data?.data || []),
      ...(liveResponse.data?.data || []),
      ...(upcomingResponse.data?.data || []),
    ].filter((event) => {
      const sportName = event.sport?.name || "";
      const leagueName = event.league?.name || "";
      const homeTeam = event.home_team?.name || "";
      const awayTeam = event.away_team?.name || "";

      const searchText =
        `${sportName} ${leagueName} ${homeTeam} ${awayTeam}`.toLowerCase();

      return (
        searchText.includes("cs") ||
        searchText.includes("counter") ||
        searchText.includes("furia") ||
        searchText.includes("navi") ||
        searchText.includes("mibr") ||
        searchText.includes("faze") ||
        searchText.includes("esports")
      );
    }).length;

    if (totalCsgoEvents > 0) {
      console.log(`🎉 SUCESSO! ENCONTROU ${totalCsgoEvents} EVENTOS DE CS:GO!`);
      console.log("✅ SPORTSCORE1 É NOSSA API PARA CS:GO SCOUT!");
      console.log("🏆 SISTEMA COMPLETO DISPONÍVEL!");
    } else if (totalEvents > 0) {
      console.log("⚠️ API funciona mas não encontrou CS:GO ainda");
      console.log("💡 Pode ter CS:GO em outras páginas ou filtros");
      console.log("🔍 Vamos testar mais páginas ou filtros específicos");
    } else {
      console.log("❌ Nenhum evento encontrado na API");
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

testarSportScore1Events();
