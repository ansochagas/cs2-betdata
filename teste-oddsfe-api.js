const axios = require("axios");

async function testarOddsFEAPI() {
  console.log("🎮 TESTE FINAL - ODDSFE API");
  console.log("📋 API de apostas com Esports incluído");
  console.log("🎯 Odds ao vivo e pré-jogo + histórico");
  console.log("💰 Gratuita com limites via RapidAPI");
  console.log("============================================================\n");

  const API_KEY = "d5da2b13a6msh434479d753d8387p12bae1jsn117c3b0f7da9";
  const API_HOST = "oddsfe.p.rapidapi.com";

  try {
    // Teste 1: Pegar lista de eventos (seguindo tutorial)
    console.log("📖 TESTE 1: Lista de eventos (FINISHED, datas recentes)");
    const eventsResponse = await axios.get(
      "https://oddsfe.p.rapidapi.com/api/v1/events",
      {
        headers: {
          "x-rapidapi-host": API_HOST,
          "x-rapidapi-key": API_KEY,
        },
        params: {
          status: "FINISHED",
          start_at_max: "2025-11-25 23:59:59", // Hoje
          start_at_min: "2025-11-20 00:00:00", // Últimos 5 dias
          page: 0,
        },
        timeout: 15000,
      }
    );

    console.log(`✅ Status: ${eventsResponse.status}`);
    console.log(
      `📊 Eventos encontrados: ${eventsResponse.data?.data?.length || 0}`
    );

    if (eventsResponse.data?.data && eventsResponse.data.data.length > 0) {
      const events = eventsResponse.data.data;

      // Procurar por eventos de eSports/CS:GO
      const esportsEvents = events.filter(
        (event) =>
          event.sport?.name?.toLowerCase().includes("esports") ||
          event.sport?.name?.toLowerCase().includes("cs") ||
          event.sport?.name?.toLowerCase().includes("counter") ||
          event.home_team?.name?.toLowerCase().includes("furia") ||
          event.away_team?.name?.toLowerCase().includes("navi") ||
          event.home_team?.name?.toLowerCase().includes("mibr") ||
          event.away_team?.name?.toLowerCase().includes("faze")
      );

      console.log(
        `🎯 Eventos de eSports/CS:GO encontrados: ${esportsEvents.length}`
      );

      if (esportsEvents.length > 0) {
        console.log("\n🏆 EVENTOS DE ESPORTS/CS:GO:");
        esportsEvents.slice(0, 10).forEach((event, index) => {
          const homeTeam = event.home_team?.name || "TBD";
          const awayTeam = event.away_team?.name || "TBD";
          const sport = event.sport?.name || "Unknown";
          const tournament = event.tournament?.name || "N/A";
          const startTime = event.start_at || "Unknown";
          const status = event.status || "Unknown";

          console.log(`${index + 1}. ${homeTeam} vs ${awayTeam}`);
          console.log(`   🏆 Torneio: ${tournament}`);
          console.log(`   🎮 Esporte: ${sport}`);
          console.log(`   📅 Início: ${startTime}`);
          console.log(`   📊 Status: ${status}`);
          console.log(`   🆔 Event ID: ${event.id}`);
          console.log("");
        });

        // Pegar os primeiros IDs de eventos de eSports para testar markets
        const eventIds = esportsEvents
          .slice(0, 3)
          .map((event) => event.id)
          .join(",");
        console.log(`🎯 Testando markets para eventos: ${eventIds}`);

        // Teste 2: Pegar markets/odds para eventos de eSports
        try {
          const marketsResponse = await axios.get(
            "https://oddsfe.p.rapidapi.com/api/v1/markets/feed",
            {
              headers: {
                "x-rapidapi-host": API_HOST,
                "x-rapidapi-key": API_KEY,
              },
              params: {
                event_ids: eventIds,
                market_name: "ASIAN_HANDICAP", // Testando handicap asiático
              },
              timeout: 15000,
            }
          );

          console.log(
            `✅ Markets encontrados: ${marketsResponse.data?.data?.length || 0}`
          );

          if (
            marketsResponse.data?.data &&
            marketsResponse.data.data.length > 0
          ) {
            console.log("\n💰 MARKETS/ODDS ENCONTRADOS:");
            marketsResponse.data.data.slice(0, 5).forEach((market, index) => {
              console.log(`${index + 1}. Market ID: ${market.id}`);
              console.log(`   📊 Tipo: ${market.market_name}`);
              console.log(`   🎯 Valor: ${market.value}`);
              console.log(`   📅 Período: ${market.period}`);
              console.log(
                `   🏦 Books disponíveis: ${market.market_books?.length || 0}`
              );

              if (market.market_books && market.market_books.length > 0) {
                console.log("   📈 Odds por sportsbook:");
                market.market_books.slice(0, 3).forEach((book, bookIndex) => {
                  console.log(
                    `      ${bookIndex + 1}. ${book.book}: ${
                      book.outcome_0 || "N/A"
                    } | ${book.outcome_1 || "N/A"}`
                  );
                });
              }
              console.log("");
            });
          }
        } catch (error) {
          console.log(`❌ Erro ao buscar markets: ${error.message}`);
        }
      } else {
        console.log("\n❌ Nenhum evento de eSports/CS:GO encontrado");
      }

      // Mostrar distribuição por esporte
      const sportCounts = {};
      events.forEach((event) => {
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

    // Teste 3: Buscar eventos atuais/futuros
    console.log("\n📖 TESTE 3: Eventos atuais e futuros");
    try {
      const currentEventsResponse = await axios.get(
        "https://oddsfe.p.rapidapi.com/api/v1/events",
        {
          headers: {
            "x-rapidapi-host": API_HOST,
            "x-rapidapi-key": API_KEY,
          },
          params: {
            status: "NOT_STARTED,UPCOMING,LIVE", // Eventos futuros e ao vivo
            start_at_min: "2025-11-25 00:00:00", // A partir de hoje
            page: 0,
          },
          timeout: 15000,
        }
      );

      console.log(
        `✅ Eventos atuais/futuros encontrados: ${
          currentEventsResponse.data?.data?.length || 0
        }`
      );

      if (
        currentEventsResponse.data?.data &&
        currentEventsResponse.data.data.length > 0
      ) {
        const currentEsportsEvents = currentEventsResponse.data.data.filter(
          (event) =>
            event.sport?.name?.toLowerCase().includes("esports") ||
            event.sport?.name?.toLowerCase().includes("cs")
        );

        console.log(
          `🎮 Eventos atuais de eSports: ${currentEsportsEvents.length}`
        );

        if (currentEsportsEvents.length > 0) {
          console.log("\n🏆 EVENTOS DE ESPORTS ATUAIS/FUTUROS:");
          currentEsportsEvents.slice(0, 5).forEach((event, index) => {
            const homeTeam = event.home_team?.name || "TBD";
            const awayTeam = event.away_team?.name || "TBD";
            const startTime = event.start_at || "Unknown";
            const status = event.status || "Unknown";

            console.log(
              `${
                index + 1
              }. ${homeTeam} vs ${awayTeam} (${status}) - ${startTime}`
            );
          });
        }
      }
    } catch (error) {
      console.log(`❌ Erro ao buscar eventos atuais: ${error.message}`);
    }

    console.log(
      "\n============================================================"
    );
    console.log("📊 RESUMO - ODDSFE API");

    const hasEsports = eventsResponse.data?.data?.some(
      (event) =>
        event.sport?.name?.toLowerCase().includes("esports") ||
        event.sport?.name?.toLowerCase().includes("cs")
    );

    if (hasEsports) {
      console.log("🎉 SUCESSO! ODDSFE TEM ESPORTS/CS:GO!");
      console.log("✅ Eventos de eSports encontrados");
      console.log("💰 Sistema de odds completo disponível");
      console.log("📈 Histórico de odds para prediction");
      console.log("🎯 POSSÍVEL API DEFINITIVA PARA CS:GO SCOUT!");
    } else {
      console.log("❌ Nenhum evento de eSports encontrado");
      console.log("💡 Focada em esportes tradicionais");
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

testarOddsFEAPI();
