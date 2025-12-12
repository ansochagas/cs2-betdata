const axios = require("axios");

async function testarSofaSportAPI() {
  console.log("🎮 TESTE FINAL - SOFASPORT API");
  console.log("📋 API premium com dados similares ao Opta Sports");
  console.log('🎯 Inclui "Esports" na lista - POSSÍVEL CS:GO!');
  console.log("💰 Gratuita com limites via RapidAPI");
  console.log("============================================================\n");

  const API_KEY = "d5da2b13a6msh434479d753d8387p12bae1jsn117c3b0f7da9";
  const API_HOST = "sofasport.p.rapidapi.com";

  try {
    // Teste 1: Esportes disponíveis
    console.log("📖 TESTE 1: Esportes disponíveis");
    const sportsResponse = await axios.get(
      "https://sofasport.p.rapidapi.com/v1/sports",
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

    if (sportsResponse.data?.data) {
      const sports = sportsResponse.data.data;

      // Procurar por eSports
      const esports = sports.filter(
        (sport) =>
          sport.name?.toLowerCase().includes("esports") ||
          sport.name?.toLowerCase().includes("cs") ||
          sport.name?.toLowerCase().includes("counter") ||
          sport.name?.toLowerCase().includes("valorant") ||
          sport.name?.toLowerCase().includes("lol") ||
          sport.name?.toLowerCase().includes("dota") ||
          sport.name?.toLowerCase().includes("overwatch") ||
          sport.slug?.toLowerCase().includes("esports") ||
          sport.slug?.toLowerCase().includes("cs")
      );

      console.log(`🎮 Esportes de eSports encontrados: ${esports.length}`);

      if (esports.length > 0) {
        console.log("\n🏆 ESPORTS DISPONÍVEIS:");
        esports.forEach((sport, index) => {
          console.log(
            `${index + 1}. ${sport.name} (ID: ${sport.id}, Slug: ${sport.slug})`
          );
        });

        // Teste 2: Verificar torneios do eSport encontrado
        console.log("\n📖 TESTE 2: Torneios de eSports");
        const firstEsport = esports[0];

        try {
          const tournamentsResponse = await axios.get(
            `https://sofasport.p.rapidapi.com/v1/sports/${firstEsport.id}/tournaments`,
            {
              headers: {
                "x-rapidapi-host": API_HOST,
                "x-rapidapi-key": API_KEY,
              },
              timeout: 10000,
            }
          );

          console.log(
            `✅ Torneios encontrados: ${
              tournamentsResponse.data?.data?.length || 0
            }`
          );

          if (
            tournamentsResponse.data?.data &&
            tournamentsResponse.data.data.length > 0
          ) {
            console.log("🏆 Primeiros torneios:");
            tournamentsResponse.data.data
              .slice(0, 5)
              .forEach((tournament, index) => {
                console.log(
                  `${index + 1}. ${tournament.name} (${tournament.id})`
                );
                console.log(`   País: ${tournament.category?.name || "N/A"}`);
              });

            // Teste 3: Verificar jogos de um torneio
            console.log("\n📖 TESTE 3: Jogos de um torneio");
            const firstTournament = tournamentsResponse.data.data[0];

            try {
              const eventsResponse = await axios.get(
                `https://sofasport.p.rapidapi.com/v1/tournaments/${firstTournament.id}/events`,
                {
                  headers: {
                    "x-rapidapi-host": API_HOST,
                    "x-rapidapi-key": API_KEY,
                  },
                  timeout: 10000,
                }
              );

              console.log(
                `✅ Jogos encontrados: ${
                  eventsResponse.data?.data?.events?.length || 0
                }`
              );

              if (
                eventsResponse.data?.data?.events &&
                eventsResponse.data.data.events.length > 0
              ) {
                console.log("🏆 Primeiros jogos:");
                eventsResponse.data.data.events
                  .slice(0, 3)
                  .forEach((event, index) => {
                    const homeTeam = event.homeTeam?.name || "TBD";
                    const awayTeam = event.awayTeam?.name || "TBD";
                    const status = event.status?.description || "N/A";
                    console.log(`${index + 1}. ${homeTeam} vs ${awayTeam}`);
                    console.log(`   Status: ${status}`);
                    console.log(
                      `   Data: ${
                        event.startTimestamp
                          ? new Date(event.startTimestamp * 1000).toISOString()
                          : "N/A"
                      }`
                    );
                    console.log("");
                  });
              }
            } catch (error) {
              console.log(`⚠️ Erro ao buscar jogos: ${error.message}`);
            }
          }
        } catch (error) {
          console.log(`⚠️ Erro ao buscar torneios: ${error.message}`);
        }
      } else {
        console.log("\n❌ Nenhum esporte de eSports encontrado");
      }

      // Mostrar todos os esportes disponíveis (primeiros 10)
      console.log("\n🎯 TODOS OS ESPORTES DISPONÍVEIS (primeiros 10):");
      sports.slice(0, 10).forEach((sport, index) => {
        console.log(`${index + 1}. ${sport.name} (ID: ${sport.id})`);
      });

      if (sports.length > 10) {
        console.log(`... e mais ${sports.length - 10} esportes`);
      }
    }

    console.log(
      "\n============================================================"
    );
    console.log("📊 RESUMO - SOFASPORT API");

    if (sportsResponse.data?.data) {
      const hasEsports = sportsResponse.data.data.some(
        (sport) =>
          sport.name?.toLowerCase().includes("esports") ||
          sport.name?.toLowerCase().includes("cs") ||
          sport.name?.toLowerCase().includes("counter")
      );

      if (hasEsports) {
        console.log("🎉 ENCONTROU ESPORTS!");
        console.log("✅ POSSÍVEL FONTE DE DADOS DE CS:GO!");
        console.log("🎯 QUALIDADE PREMIUM (similar ao Opta Sports)");
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

testarSofaSportAPI();
