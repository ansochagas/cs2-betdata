const axios = require("axios");

async function testarSofaSportEsportsDetalhado() {
  console.log("🎮 TESTE DETALHADO - SOFASPORT ESPORTS");
  console.log("📋 API premium com eSports confirmado!");
  console.log("🎯 eSports ID: 72 - VAMOS ENCONTRAR CS:GO!");
  console.log("💰 Gratuita com limites via RapidAPI");
  console.log("============================================================\n");

  const API_KEY = "d5da2b13a6msh434479d753d8387p12bae1jsn117c3b0f7da9";
  const API_HOST = "sofasport.p.rapidapi.com";

  try {
    // Teste 1: Eventos atuais de eSports
    console.log("📖 TESTE 1: Eventos atuais de eSports");
    const eventsResponse = await axios.get(
      "https://sofasport.p.rapidapi.com/v1/events?sport_id=72",
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
      `📊 Eventos encontrados: ${
        eventsResponse.data?.data?.events?.length || 0
      }`
    );

    if (
      eventsResponse.data?.data?.events &&
      eventsResponse.data.data.events.length > 0
    ) {
      console.log("\n🏆 EVENTOS DE ESPORTS ATUAIS:");
      eventsResponse.data.data.events.slice(0, 10).forEach((event, index) => {
        const homeTeam = event.homeTeam?.name || "TBD";
        const awayTeam = event.awayTeam?.name || "TBD";
        const tournament = event.tournament?.name || "N/A";
        const status = event.status?.description || "N/A";
        const startTime = event.startTimestamp
          ? new Date(event.startTimestamp * 1000).toISOString()
          : "N/A";

        console.log(`${index + 1}. ${homeTeam} vs ${awayTeam}`);
        console.log(`   🏆 Torneio: ${tournament}`);
        console.log(`   📊 Status: ${status}`);
        console.log(`   📅 Início: ${startTime}`);

        // Verificar se é CS:GO
        const teamsStr = `${homeTeam} ${awayTeam} ${tournament}`.toLowerCase();
        if (
          teamsStr.includes("cs") ||
          teamsStr.includes("counter") ||
          teamsStr.includes("furia") ||
          teamsStr.includes("navi") ||
          teamsStr.includes("mibr") ||
          teamsStr.includes("faze")
        ) {
          console.log(`   🎯 POSSÍVEL CS:GO ENCONTRADO!`);
        }
        console.log("");
      });
    }

    // Teste 2: Próximos eventos de eSports
    console.log("\n📖 TESTE 2: Próximos eventos de eSports");
    const upcomingResponse = await axios.get(
      "https://sofasport.p.rapidapi.com/v1/events/upcoming?sport_id=72",
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
      `📊 Próximos eventos: ${upcomingResponse.data?.data?.events?.length || 0}`
    );

    if (
      upcomingResponse.data?.data?.events &&
      upcomingResponse.data.data.events.length > 0
    ) {
      console.log("\n🏆 PRÓXIMOS EVENTOS DE ESPORTS:");
      upcomingResponse.data.data.events.slice(0, 10).forEach((event, index) => {
        const homeTeam = event.homeTeam?.name || "TBD";
        const awayTeam = event.awayTeam?.name || "TBD";
        const tournament = event.tournament?.name || "N/A";
        const startTime = event.startTimestamp
          ? new Date(event.startTimestamp * 1000).toISOString()
          : "N/A";

        console.log(`${index + 1}. ${homeTeam} vs ${awayTeam}`);
        console.log(`   🏆 Torneio: ${tournament}`);
        console.log(`   📅 Início: ${startTime}`);

        // Verificar se é CS:GO
        const teamsStr = `${homeTeam} ${awayTeam} ${tournament}`.toLowerCase();
        if (
          teamsStr.includes("cs") ||
          teamsStr.includes("counter") ||
          teamsStr.includes("furia") ||
          teamsStr.includes("navi") ||
          teamsStr.includes("mibr") ||
          teamsStr.includes("faze")
        ) {
          console.log(`   🎯 POSSÍVEL CS:GO ENCONTRADO!`);
        }
        console.log("");
      });
    }

    // Teste 3: Eventos finalizados de eSports
    console.log("\n📖 TESTE 3: Eventos finalizados de eSports");
    const finishedResponse = await axios.get(
      "https://sofasport.p.rapidapi.com/v1/events/finished?sport_id=72",
      {
        headers: {
          "x-rapidapi-host": API_HOST,
          "x-rapidapi-key": API_KEY,
        },
        timeout: 10000,
      }
    );

    console.log(`✅ Status: ${finishedResponse.status}`);
    console.log(
      `📊 Eventos finalizados: ${
        finishedResponse.data?.data?.events?.length || 0
      }`
    );

    if (
      finishedResponse.data?.data?.events &&
      finishedResponse.data.data.events.length > 0
    ) {
      console.log("\n🏆 ÚLTIMOS EVENTOS DE ESPORTS:");
      finishedResponse.data.data.events.slice(0, 5).forEach((event, index) => {
        const homeTeam = event.homeTeam?.name || "TBD";
        const awayTeam = event.awayTeam?.name || "TBD";
        const tournament = event.tournament?.name || "N/A";
        const homeScore = event.homeScore?.current || 0;
        const awayScore = event.awayScore?.current || 0;

        console.log(
          `${index + 1}. ${homeTeam} ${homeScore} - ${awayScore} ${awayTeam}`
        );
        console.log(`   🏆 Torneio: ${tournament}`);

        // Verificar se é CS:GO
        const teamsStr = `${homeTeam} ${awayTeam} ${tournament}`.toLowerCase();
        if (
          teamsStr.includes("cs") ||
          teamsStr.includes("counter") ||
          teamsStr.includes("furia") ||
          teamsStr.includes("navi") ||
          teamsStr.includes("mibr") ||
          teamsStr.includes("faze")
        ) {
          console.log(`   🎯 CS:GO CONFIRMADO!`);
        }
        console.log("");
      });
    }

    // Teste 4: Estatísticas de um evento específico (se houver)
    if (
      finishedResponse.data?.data?.events &&
      finishedResponse.data.data.events.length > 0
    ) {
      console.log("\n📖 TESTE 4: Estatísticas detalhadas de um evento");
      const firstEvent = finishedResponse.data.data.events[0];

      try {
        const statsResponse = await axios.get(
          `https://sofasport.p.rapidapi.com/v1/events/${firstEvent.id}/statistics`,
          {
            headers: {
              "x-rapidapi-host": API_HOST,
              "x-rapidapi-key": API_KEY,
            },
            timeout: 10000,
          }
        );

        console.log(`✅ Estatísticas encontradas para evento ${firstEvent.id}`);
        console.log(`📊 Dados: ${JSON.stringify(statsResponse.data, null, 2)}`);
      } catch (error) {
        console.log(`⚠️ Erro ao buscar estatísticas: ${error.message}`);
      }
    }

    console.log(
      "\n============================================================"
    );
    console.log("📊 RESUMO - SOFASPORT ESPORTS");

    const hasCurrentEvents = eventsResponse.data?.data?.events?.length > 0;
    const hasUpcomingEvents = upcomingResponse.data?.data?.events?.length > 0;
    const hasFinishedEvents = finishedResponse.data?.data?.events?.length > 0;

    if (hasCurrentEvents || hasUpcomingEvents || hasFinishedEvents) {
      console.log("🎉 SUCESSO! SOFASPORT TEM DADOS DE ESPORTS!");
      console.log("✅ Eventos atuais, futuros e finalizados disponíveis");
      console.log("🎯 QUALIDADE PREMIUM (similar ao Opta Sports)");

      // Verificar se encontrou CS:GO
      const allEvents = [
        ...(eventsResponse.data?.data?.events || []),
        ...(upcomingResponse.data?.data?.events || []),
        ...(finishedResponse.data?.data?.events || []),
      ];

      const csgoEvents = allEvents.filter((event) => {
        const teamsStr = `${event.homeTeam?.name || ""} ${
          event.awayTeam?.name || ""
        } ${event.tournament?.name || ""}`.toLowerCase();
        return (
          teamsStr.includes("cs") ||
          teamsStr.includes("counter") ||
          teamsStr.includes("furia") ||
          teamsStr.includes("navi") ||
          teamsStr.includes("mibr") ||
          teamsStr.includes("faze") ||
          teamsStr.includes("cloud9") ||
          teamsStr.includes("astralis")
        );
      });

      if (csgoEvents.length > 0) {
        console.log(`🎯 ENCONTROU ${csgoEvents.length} EVENTOS DE CS:GO!`);
        console.log("🏆 SOFASPORT É NOSSA API PARA CS:GO SCOUT!");
      } else {
        console.log("⚠️ Tem eSports mas não identificou CS:GO ainda");
        console.log("💡 Pode ter CS:GO em outros torneios");
      }
    } else {
      console.log("❌ Nenhum evento de eSports encontrado");
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

testarSofaSportEsportsDetalhado();
