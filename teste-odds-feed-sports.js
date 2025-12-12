const axios = require("axios");

async function testarOddsFeedSports() {
  console.log("🎮 TESTE FINAL - ODDS-FEED API SPORTS");
  console.log("📋 Verificando lista de esportes disponíveis");
  console.log("🎯 Procurando CS:GO na lista");
  console.log("💰 Gratuita com limites via RapidAPI");
  console.log("============================================================\n");

  const API_KEY = "d5da2b13a6msh434479d753d8387p12bae1jsn117c3b0f7da9";
  const API_HOST = "odds-feed.p.rapidapi.com";

  try {
    // Teste 1: Pegar lista de esportes
    console.log("📖 TESTE 1: Lista completa de esportes");
    const sportsResponse = await axios.get(
      "https://odds-feed.p.rapidapi.com/api/v1/sports",
      {
        headers: {
          "x-rapidapi-host": API_HOST,
          "x-rapidapi-key": API_KEY,
        },
        timeout: 15000,
      }
    );

    console.log(`✅ Status: ${sportsResponse.status}`);
    console.log(
      `📊 Esportes encontrados: ${sportsResponse.data?.data?.length || 0}`
    );

    if (sportsResponse.data?.data && sportsResponse.data.data.length > 0) {
      const sports = sportsResponse.data.data;

      // Procurar por CS:GO ou eSports
      const csgoSports = sports.filter(
        (sport) =>
          sport.name?.toLowerCase().includes("counter") ||
          sport.name?.toLowerCase().includes("cs:go") ||
          sport.name?.toLowerCase().includes("csgo") ||
          sport.name?.toLowerCase().includes("esports") ||
          sport.name?.toLowerCase().includes("valorant") ||
          sport.name?.toLowerCase().includes("lol") ||
          sport.name?.toLowerCase().includes("dota") ||
          sport.name?.toLowerCase().includes("overwatch") ||
          sport.slug?.toLowerCase().includes("cs") ||
          sport.slug?.toLowerCase().includes("esports")
      );

      console.log(
        `🎯 Esportes relacionados a CS:GO encontrados: ${csgoSports.length}`
      );

      if (csgoSports.length > 0) {
        console.log("\n🏆 ESPORTS/CS:GO ENCONTRADOS:");
        csgoSports.forEach((sport, index) => {
          console.log(
            `${index + 1}. ${sport.name} (ID: ${sport.id}, Slug: ${sport.slug})`
          );
        });

        // Para cada esporte de eSports encontrado, buscar eventos
        for (const sport of csgoSports.slice(0, 3)) {
          console.log(
            `\n🏆 BUSCANDO EVENTOS PARA: ${sport.name} (ID: ${sport.id})`
          );

          try {
            const eventsResponse = await axios.get(
              "https://odds-feed.p.rapidapi.com/api/v1/events",
              {
                headers: {
                  "x-rapidapi-host": API_HOST,
                  "x-rapidapi-key": API_KEY,
                },
                params: {
                  sport_id: sport.id,
                  status: "NOT_STARTED,UPCOMING", // Jogos futuros
                  start_at_min: "2025-11-25 00:00:00", // Hoje
                  start_at_max: "2025-12-10 23:59:59", // Próximos 15 dias
                  page: 0,
                },
                timeout: 15000,
              }
            );

            console.log(
              `   ✅ Eventos futuros encontrados: ${
                eventsResponse.data?.data?.length || 0
              }`
            );

            if (
              eventsResponse.data?.data &&
              eventsResponse.data.data.length > 0
            ) {
              console.log("   🏆 PRÓXIMOS JOGOS:");
              eventsResponse.data.data.slice(0, 5).forEach((event, index) => {
                const homeTeam = event.home_team?.name || "TBD";
                const awayTeam = event.away_team?.name || "TBD";
                const tournament = event.tournament?.name || "N/A";
                const startTime = event.start_at || "Unknown";

                console.log(`      ${index + 1}. ${homeTeam} vs ${awayTeam}`);
                console.log(`         🏆 ${tournament} | 📅 ${startTime}`);
              });

              // Testar markets/odds para o primeiro evento
              if (eventsResponse.data.data.length > 0) {
                const firstEvent = eventsResponse.data.data[0];
                console.log(
                  `\n   💰 BUSCANDO ODDS PARA: ${
                    firstEvent.home_team?.name || "TBD"
                  } vs ${firstEvent.away_team?.name || "TBD"}`
                );

                try {
                  const marketsResponse = await axios.get(
                    "https://odds-feed.p.rapidapi.com/api/v1/markets/feed",
                    {
                      headers: {
                        "x-rapidapi-host": API_HOST,
                        "x-rapidapi-key": API_KEY,
                      },
                      params: {
                        event_ids: firstEvent.id,
                        market_name: "1X2",
                        market_placing: "PREMATCH",
                      },
                      timeout: 15000,
                    }
                  );

                  console.log(
                    `      ✅ Markets encontrados: ${
                      marketsResponse.data?.data?.length || 0
                    }`
                  );

                  if (
                    marketsResponse.data?.data &&
                    marketsResponse.data.data.length > 0
                  ) {
                    const market = marketsResponse.data.data[0];
                    console.log(
                      `      📊 Market: ${market.market_name} (${market.period})`
                    );
                    console.log(
                      `      🏦 Books: ${market.market_books?.length || 0}`
                    );

                    if (market.market_books && market.market_books.length > 0) {
                      market.market_books.slice(0, 2).forEach((book, idx) => {
                        console.log(
                          `         ${book.book}: ${
                            book.outcome_0 || "N/A"
                          } | ${book.outcome_1 || "N/A"} | ${
                            book.outcome_2 || "N/A"
                          }`
                        );
                      });
                    }
                  }
                } catch (error) {
                  console.log(`      ❌ Erro ao buscar odds: ${error.message}`);
                }
              }
            }
          } catch (error) {
            console.log(`   ❌ Erro ao buscar eventos: ${error.message}`);
          }
        }
      } else {
        console.log("\n❌ Nenhum esporte de CS:GO/eSports encontrado");
      }

      // Mostrar todos os esportes disponíveis (primeiros 20)
      console.log("\n🎯 TODOS OS ESPORTES DISPONÍVEIS (primeiros 20):");
      sports.slice(0, 20).forEach((sport, index) => {
        console.log(`${index + 1}. ${sport.name} (ID: ${sport.id})`);
      });

      if (sports.length > 20) {
        console.log(`... e mais ${sports.length - 20} esportes`);
      }
    }

    console.log(
      "\n============================================================"
    );
    console.log("📊 RESUMO - ODDS-FEED API SPORTS");

    if (sportsResponse.data?.data) {
      const hasEsports = sportsResponse.data.data.some(
        (sport) =>
          sport.name?.toLowerCase().includes("esports") ||
          sport.name?.toLowerCase().includes("cs") ||
          sport.name?.toLowerCase().includes("counter")
      );

      if (hasEsports) {
        console.log("🎉 ENCONTROU ESPORTS/CS:GO!");
        console.log("✅ Esportes de eSports disponíveis");
        console.log("🎯 POSSÍVEL API PARA CS:GO SCOUT!");
        console.log("💰 Odds e eventos futuros disponíveis");
      } else {
        console.log("❌ NENHUM ESPORT ENCONTRADO");
        console.log("💡 Focada em esportes tradicionais");
      }
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

testarOddsFeedSports();
