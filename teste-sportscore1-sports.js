const axios = require("axios");

async function testarSportScore1Sports() {
  console.log("🎮 TESTE FINAL - SPORTSCORE1 SPORTS");
  console.log("📋 Pegando lista de esportes disponíveis");
  console.log("🎯 Procurando ID do CS:GO");
  console.log("💰 Gratuita com limites via RapidAPI");
  console.log("============================================================\n");

  const API_KEY = "d5da2b13a6msh434479d753d8387p12bae1jsn117c3b0f7da9";
  const API_HOST = "sportscore1.p.rapidapi.com";

  try {
    // Teste 1: Pegar lista de esportes
    console.log("📖 TESTE 1: Lista de esportes disponíveis");
    const sportsResponse = await axios.get(
      "https://sportscore1.p.rapidapi.com/sports",
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

        // Para cada esporte de eSports encontrado, buscar torneios
        for (const sport of csgoSports.slice(0, 3)) {
          console.log(
            `\n🏆 BUSCANDO TORNEIOS PARA: ${sport.name} (ID: ${sport.id})`
          );

          try {
            const tournamentsResponse = await axios.get(
              `https://sportscore1.p.rapidapi.com/sports/${sport.id}/tournaments`,
              {
                headers: {
                  "x-rapidapi-host": API_HOST,
                  "x-rapidapi-key": API_KEY,
                },
                timeout: 10000,
              }
            );

            console.log(
              `   ✅ Torneios encontrados: ${
                tournamentsResponse.data?.data?.length || 0
              }`
            );

            if (
              tournamentsResponse.data?.data &&
              tournamentsResponse.data.data.length > 0
            ) {
              console.log("   🏆 TORNEIOS:");
              tournamentsResponse.data.data
                .slice(0, 5)
                .forEach((tournament, index) => {
                  console.log(
                    `      ${index + 1}. ${tournament.name} (ID: ${
                      tournament.id
                    })`
                  );
                });

              // Pegar eventos do primeiro torneio
              const firstTournament = tournamentsResponse.data.data[0];
              console.log(
                `\n   📅 BUSCANDO EVENTOS DO TORNEIO: ${firstTournament.name}`
              );

              try {
                const eventsResponse = await axios.get(
                  `https://sportscore1.p.rapidapi.com/tournaments/${firstTournament.id}/events`,
                  {
                    headers: {
                      "x-rapidapi-host": API_HOST,
                      "x-rapidapi-key": API_KEY,
                    },
                    timeout: 10000,
                  }
                );

                console.log(
                  `      ✅ Eventos encontrados: ${
                    eventsResponse.data?.data?.length || 0
                  }`
                );

                if (
                  eventsResponse.data?.data &&
                  eventsResponse.data.data.length > 0
                ) {
                  console.log("      🏆 EVENTOS:");
                  eventsResponse.data.data
                    .slice(0, 3)
                    .forEach((event, index) => {
                      const homeTeam = event.home_team?.name || "TBD";
                      const awayTeam = event.away_team?.name || "TBD";
                      const startTime = event.start_at
                        ? new Date(event.start_at).toISOString()
                        : "Unknown";
                      const status = event.status?.name || "Unknown";

                      console.log(
                        `         ${index + 1}. ${homeTeam} vs ${awayTeam}`
                      );
                      console.log(`            📅 ${startTime} | 📊 ${status}`);
                    });
                }
              } catch (error) {
                console.log(
                  `      ❌ Erro ao buscar eventos: ${error.message}`
                );
              }
            }
          } catch (error) {
            console.log(`   ❌ Erro ao buscar torneios: ${error.message}`);
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
    console.log("📊 RESUMO - SPORTSCORE1 SPORTS");

    if (sportsResponse.data?.data) {
      const hasEsports = sportsResponse.data.data.some(
        (sport) =>
          sport.name?.toLowerCase().includes("esports") ||
          sport.name?.toLowerCase().includes("cs") ||
          sport.name?.toLowerCase().includes("counter")
      );

      if (hasEsports) {
        console.log("🎉 ENCONTROU ESPORTS/CS:GO!");
        console.log("✅ POSSÍVEL FONTE DE DADOS DE CS:GO SCOUT!");
        console.log("🎯 VAMOS TESTAR TORNEIOS E EVENTOS!");
      } else {
        console.log("❌ NENHUM ESPORT ENCONTRADO");
        console.log("💡 FOCADA EM ESPORTES TRADICIONAIS");
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

testarSportScore1Sports();
