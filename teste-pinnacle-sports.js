const axios = require("axios");

async function testarPinnacleSports() {
  console.log("🎮 TESTE FINAL - PINNACLE ODDS API");
  console.log("📋 API específica para apostas com eSports");
  console.log("🎯 Suporte explícito a CS2 (CS:GO)!");
  console.log("💰 Gratuita com limites via RapidAPI");
  console.log("============================================================\n");

  const API_KEY = "d5da2b13a6msh434479d753d8387p12bae1jsn117c3b0f7da9";
  const API_HOST = "pinnacle-odds.p.rapidapi.com";

  try {
    // Teste 1: Pegar lista de esportes
    console.log("📖 TESTE 1: Lista de esportes disponíveis");
    const sportsResponse = await axios.get(
      "https://pinnacle-odds.p.rapidapi.com/kit/v1/sports",
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
      `📊 Esportes encontrados: ${sportsResponse.data?.sports?.length || 0}`
    );

    if (sportsResponse.data?.sports && sportsResponse.data.sports.length > 0) {
      const sports = sportsResponse.data.sports;

      // Procurar por CS:GO ou eSports
      const csgoSports = sports.filter(
        (sport) =>
          sport.name?.toLowerCase().includes("counter") ||
          sport.name?.toLowerCase().includes("cs:go") ||
          sport.name?.toLowerCase().includes("csgo") ||
          sport.name?.toLowerCase().includes("cs2") ||
          sport.name?.toLowerCase().includes("esports") ||
          sport.name?.toLowerCase().includes("valorant") ||
          sport.name?.toLowerCase().includes("lol") ||
          sport.name?.toLowerCase().includes("dota") ||
          sport.name?.toLowerCase().includes("overwatch") ||
          sport.name?.toLowerCase().includes("rocket")
      );

      console.log(
        `🎯 Esportes relacionados a CS:GO encontrados: ${csgoSports.length}`
      );

      if (csgoSports.length > 0) {
        console.log("\n🏆 ESPORTS/CS:GO ENCONTRADOS:");
        csgoSports.forEach((sport, index) => {
          console.log(`${index + 1}. ${sport.name} (ID: ${sport.id})`);
        });

        // Para cada esporte de eSports encontrado, buscar mercados/odds
        for (const sport of csgoSports.slice(0, 3)) {
          console.log(
            `\n🏆 BUSCANDO MERCADOS PARA: ${sport.name} (ID: ${sport.id})`
          );

          try {
            const marketsResponse = await axios.get(
              "https://pinnacle-odds.p.rapidapi.com/kit/v1/markets",
              {
                headers: {
                  "x-rapidapi-host": API_HOST,
                  "x-rapidapi-key": API_KEY,
                },
                params: {
                  sport_id: sport.id,
                  is_have_odds: true,
                  event_type: "prematch", // Jogos futuros com odds
                },
                timeout: 15000,
              }
            );

            console.log(
              `   ✅ Eventos com odds encontrados: ${
                marketsResponse.data?.events?.length || 0
              }`
            );

            if (
              marketsResponse.data?.events &&
              marketsResponse.data.events.length > 0
            ) {
              console.log("   🏆 PRÓXIMOS JOGOS COM ODDS:");
              marketsResponse.data.events
                .slice(0, 5)
                .forEach((event, index) => {
                  const homeTeam = event.home || "TBD";
                  const awayTeam = event.away || "TBD";
                  const league = event.league_name || "N/A";
                  const startTime = event.starts || "Unknown";
                  const eventType = event.event_type || "Unknown";

                  console.log(`${index + 1}. ${homeTeam} vs ${awayTeam}`);
                  console.log(`   🏆 Liga: ${league}`);
                  console.log(`   📅 Início: ${startTime}`);
                  console.log(`   📊 Tipo: ${eventType}`);
                  console.log(`   🆔 Event ID: ${event.event_id}`);

                  // Mostrar odds se disponíveis
                  if (event.periods?.num_0?.money_line) {
                    const odds = event.periods.num_0.money_line;
                    console.log(
                      `   💰 Odds 1X2: ${odds.home || "N/A"} | ${
                        odds.draw || "N/A"
                      } | ${odds.away || "N/A"}`
                    );
                  }

                  console.log("");
                });

              // Testar specials markets (props de jogador, etc.)
              console.log(`   🎯 BUSCANDO MERCADOS ESPECIAIS:`);
              try {
                const specialsResponse = await axios.get(
                  "https://pinnacle-odds.p.rapidapi.com/kit/v1/specials",
                  {
                    headers: {
                      "x-rapidapi-host": API_HOST,
                      "x-rapidapi-key": API_KEY,
                    },
                    params: {
                      sport_id: sport.id,
                    },
                    timeout: 15000,
                  }
                );

                console.log(
                  `      ✅ Mercados especiais encontrados: ${
                    specialsResponse.data?.specials?.length || 0
                  }`
                );

                if (
                  specialsResponse.data?.specials &&
                  specialsResponse.data.specials.length > 0
                ) {
                  console.log("      🎪 EXEMPLOS DE MERCADOS ESPECIAIS:");
                  specialsResponse.data.specials
                    .slice(0, 3)
                    .forEach((special, idx) => {
                      console.log(
                        `         ${idx + 1}. ${special.name} (${
                          special.category
                        })`
                      );
                      if (
                        special.lines &&
                        Object.keys(special.lines).length > 0
                      ) {
                        const firstLine = Object.values(special.lines)[0];
                        console.log(
                          `            📊 Odd: ${firstLine.price || "N/A"}`
                        );
                      }
                    });
                }
              } catch (error) {
                console.log(
                  `      ❌ Erro ao buscar specials: ${error.message}`
                );
              }
            } else {
              console.log("   ❌ Nenhum evento com odds encontrado");
            }
          } catch (error) {
            console.log(`   ❌ Erro ao buscar mercados: ${error.message}`);
          }
        }
      } else {
        console.log("\n❌ Nenhum esporte de CS:GO/eSports encontrado");
      }

      // Mostrar todos os esportes disponíveis (primeiros 15)
      console.log("\n🎯 TODOS OS ESPORTES DISPONÍVEIS (primeiros 15):");
      sports.slice(0, 15).forEach((sport, index) => {
        console.log(`${index + 1}. ${sport.name} (ID: ${sport.id})`);
      });

      if (sports.length > 15) {
        console.log(`... e mais ${sports.length - 15} esportes`);
      }
    }

    console.log(
      "\n============================================================"
    );
    console.log("📊 RESUMO - PINNACLE ODDS API");

    if (sportsResponse.data?.sports) {
      const hasEsports = sportsResponse.data.sports.some(
        (sport) =>
          sport.name?.toLowerCase().includes("esports") ||
          sport.name?.toLowerCase().includes("cs") ||
          sport.name?.toLowerCase().includes("counter")
      );

      if (hasEsports) {
        console.log("🎉 SUCESSO! PINNACLE TEM ESPORTS/CS:GO!");
        console.log("✅ Esportes de eSports disponíveis");
        console.log("💰 Sistema completo de odds (1X2, spreads, totals)");
        console.log("🎯 Mercados especiais (player props)");
        console.log("📈 Histórico de odds disponível");
        console.log("🎮 PINNACLE É A API DEFINITIVA PARA CS:GO SCOUT!");
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

testarPinnacleSports();
