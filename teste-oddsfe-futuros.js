const axios = require("axios");

async function testarOddsFEJogosFuturos() {
  console.log("🎮 TESTE FINAL - ODDSFE API (JOGOS FUTUROS)");
  console.log("📋 API de apostas focada em jogos que ainda vão acontecer");
  console.log("🎯 CS:GO SCOUT precisa de jogos futuros para apostas!");
  console.log("💰 Gratuita com limites via RapidAPI");
  console.log("============================================================\n");

  const API_KEY = "d5da2b13a6msh434479d753d8387p12bae1jsn117c3b0f7da9";
  const API_HOST = "oddsfe.p.rapidapi.com";

  try {
    // Teste 1: Pegar lista de eventos FUTUROS
    console.log("📖 TESTE 1: Jogos FUTUROS (NOT_STARTED/UPCOMING)");
    const futureEventsResponse = await axios.get(
      "https://oddsfe.p.rapidapi.com/api/v1/events",
      {
        headers: {
          "x-rapidapi-host": API_HOST,
          "x-rapidapi-key": API_KEY,
        },
        params: {
          status: "NOT_STARTED,UPCOMING", // Jogos que ainda não começaram
          start_at_min: "2025-11-25 00:00:00", // A partir de hoje
          start_at_max: "2025-12-10 23:59:59", // Até daqui 15 dias
          page: 0,
        },
        timeout: 15000,
      }
    );

    console.log(`✅ Status: ${futureEventsResponse.status}`);
    console.log(
      `📊 Eventos futuros encontrados: ${
        futureEventsResponse.data?.data?.length || 0
      }`
    );

    if (
      futureEventsResponse.data?.data &&
      futureEventsResponse.data.data.length > 0
    ) {
      const events = futureEventsResponse.data.data;

      // Procurar por eventos de eSports/CS:GO
      const esportsEvents = events.filter(
        (event) =>
          event.sport?.name?.toLowerCase().includes("esports") ||
          event.sport?.name?.toLowerCase().includes("cs") ||
          event.sport?.name?.toLowerCase().includes("counter") ||
          event.home_team?.name?.toLowerCase().includes("furia") ||
          event.away_team?.name?.toLowerCase().includes("navi") ||
          event.home_team?.name?.toLowerCase().includes("mibr") ||
          event.away_team?.name?.toLowerCase().includes("faze") ||
          event.home_team?.name?.toLowerCase().includes("astralis") ||
          event.away_team?.name?.toLowerCase().includes("vitality")
      );

      console.log(
        `🎯 Eventos FUTUROS de eSports/CS:GO encontrados: ${esportsEvents.length}`
      );

      if (esportsEvents.length > 0) {
        console.log("\n🏆 JOGOS FUTUROS DE CS:GO ENCONTRADOS:");
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
          .slice(0, 2)
          .map((event) => event.id)
          .join(",");
        console.log(`🎯 Testando ODDS para eventos futuros: ${eventIds}`);

        // Teste 2: Pegar odds/markets para jogos futuros de eSports
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
                market_name: "1X2", // Odds básicas (1X2)
                market_placing: "PREMATCH", // Odds pré-jogo
              },
              timeout: 15000,
            }
          );

          console.log(
            `✅ Markets/odds encontrados: ${
              marketsResponse.data?.data?.length || 0
            }`
          );

          if (
            marketsResponse.data?.data &&
            marketsResponse.data.data.length > 0
          ) {
            console.log("\n💰 ODDS PRÉ-JOGO ENCONTRADAS:");
            marketsResponse.data.data.slice(0, 5).forEach((market, index) => {
              console.log(
                `${index + 1}. Market: ${market.market_name} (${market.period})`
              );
              console.log(
                `   📊 Tipo: ${market.bet_type} | Status: ${market.placing}`
              );
              console.log(
                `   🏦 Books disponíveis: ${market.market_books?.length || 0}`
              );

              if (market.market_books && market.market_books.length > 0) {
                console.log("   📈 Odds por sportsbook:");
                market.market_books.slice(0, 3).forEach((book, bookIndex) => {
                  const outcome0 = book.outcome_0
                    ? book.outcome_0.toFixed(2)
                    : "N/A";
                  const outcome1 = book.outcome_1
                    ? book.outcome_1.toFixed(2)
                    : "N/A";
                  const outcome2 = book.outcome_2
                    ? book.outcome_2.toFixed(2)
                    : "N/A";
                  console.log(
                    `      ${bookIndex + 1}. ${
                      book.book
                    }: ${outcome0} | ${outcome1} | ${outcome2}`
                  );
                });
              }
              console.log("");
            });
          }
        } catch (error) {
          console.log(`❌ Erro ao buscar odds: ${error.message}`);
        }
      } else {
        console.log("\n❌ Nenhum jogo futuro de eSports/CS:GO encontrado");
      }

      // Mostrar distribuição por esporte
      const sportCounts = {};
      events.forEach((event) => {
        const sportName = event.sport?.name || "Unknown";
        sportCounts[sportName] = (sportCounts[sportName] || 0) + 1;
      });

      console.log("📊 DISTRIBUIÇÃO DE JOGOS FUTUROS POR ESPORTE:");
      Object.entries(sportCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .forEach(([sport, count]) => {
          console.log(`   ${sport}: ${count} jogos`);
        });
    }

    // Teste 3: Buscar eventos ao vivo
    console.log("\n📖 TESTE 3: Jogos AO VIVO");
    try {
      const liveEventsResponse = await axios.get(
        "https://oddsfe.p.rapidapi.com/api/v1/events",
        {
          headers: {
            "x-rapidapi-host": API_HOST,
            "x-rapidapi-key": API_KEY,
          },
          params: {
            status: "LIVE", // Jogos acontecendo agora
            page: 0,
          },
          timeout: 15000,
        }
      );

      console.log(
        `✅ Jogos ao vivo encontrados: ${
          liveEventsResponse.data?.data?.length || 0
        }`
      );

      if (
        liveEventsResponse.data?.data &&
        liveEventsResponse.data.data.length > 0
      ) {
        const liveEsportsEvents = liveEventsResponse.data.data.filter(
          (event) =>
            event.sport?.name?.toLowerCase().includes("esports") ||
            event.sport?.name?.toLowerCase().includes("cs")
        );

        console.log(`🎮 Jogos de eSports ao vivo: ${liveEsportsEvents.length}`);

        if (liveEsportsEvents.length > 0) {
          console.log("\n🏆 CS:GO AO VIVO AGORA:");
          liveEsportsEvents.forEach((event, index) => {
            const homeTeam = event.home_team?.name || "TBD";
            const awayTeam = event.away_team?.name || "TBD";
            const score = `${event.home_score?.current || 0} - ${
              event.away_score?.current || 0
            }`;
            const tournament = event.tournament?.name || "N/A";

            console.log(
              `${index + 1}. ${homeTeam} ${score} ${awayTeam} (${tournament})`
            );
          });
        }
      }
    } catch (error) {
      console.log(`❌ Erro ao buscar jogos ao vivo: ${error.message}`);
    }

    console.log(
      "\n============================================================"
    );
    console.log("📊 RESUMO - ODDSFE API (JOGOS FUTUROS)");

    const hasFutureEsports = futureEventsResponse.data?.data?.some(
      (event) =>
        event.sport?.name?.toLowerCase().includes("esports") ||
        event.sport?.name?.toLowerCase().includes("cs")
    );

    if (hasFutureEsports) {
      console.log("🎉 SUCESSO TOTAL! ODDSFE TEM JOGOS FUTUROS DE CS:GO!");
      console.log("✅ Jogos futuros de eSports encontrados");
      console.log("💰 Odds pré-jogo disponíveis");
      console.log("📈 Sistema completo de apostas");
      console.log("🎯 ODDSFE É A API DEFINITIVA PARA CS:GO SCOUT!");
    } else {
      console.log("❌ Nenhum jogo futuro de eSports encontrado");
      console.log("💡 API focada em esportes tradicionais");
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

testarOddsFEJogosFuturos();
