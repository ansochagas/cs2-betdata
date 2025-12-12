const axios = require("axios");

async function testarSofaSportJogosAtuais() {
  console.log("🎮 TESTE - SOFASPORT JOGOS ATUAIS");
  console.log("📋 Buscando jogos de hoje e amanhã");
  console.log("🎯 CS:GO SCOUT precisa de jogos futuros!");
  console.log("============================================================\n");

  const API_KEY = "d5da2b13a6msh434479d753d8387p12bae1jsn117c3b0f7da9";
  const API_HOST = "sofasport.p.rapidapi.com";

  try {
    // Teste 1: Esportes disponíveis (verificar se há CS:GO específico)
    console.log("📖 TESTE 1: Verificando esportes disponíveis");
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

    console.log(
      `✅ Esportes encontrados: ${sportsResponse.data?.data?.length || 0}`
    );

    // Procurar especificamente por CS:GO ou Counter-Strike
    const csgoSports =
      sportsResponse.data?.data?.filter(
        (sport) =>
          sport.name?.toLowerCase().includes("counter") ||
          sport.name?.toLowerCase().includes("cs:go") ||
          sport.name?.toLowerCase().includes("csgo") ||
          sport.name?.toLowerCase().includes("esports") ||
          sport.slug?.toLowerCase().includes("cs")
      ) || [];

    console.log(`🎯 Esportes relacionados a CS:GO: ${csgoSports.length}`);
    if (csgoSports.length > 0) {
      csgoSports.forEach((sport, index) => {
        console.log(
          `   ${index + 1}. ${sport.name} (ID: ${sport.id}, Slug: ${
            sport.slug
          })`
        );
      });
    }

    // Teste 2: Buscar jogos atuais/ao vivo
    console.log("\n📖 TESTE 2: Jogos ao vivo");
    try {
      const liveResponse = await axios.get(
        "https://sofasport.p.rapidapi.com/v1/events/live",
        {
          headers: {
            "x-rapidapi-host": API_HOST,
            "x-rapidapi-key": API_KEY,
          },
          params: {
            sport_id: 72, // eSports
          },
          timeout: 10000,
        }
      );

      console.log(
        `✅ Jogos ao vivo encontrados: ${liveResponse.data?.data?.length || 0}`
      );

      if (liveResponse.data?.data && liveResponse.data.data.length > 0) {
        console.log("🏆 JOGOS AO VIVO:");
        liveResponse.data.data.slice(0, 5).forEach((event, index) => {
          const homeTeam = event.home_team?.name || "TBD";
          const awayTeam = event.away_team?.name || "TBD";
          const sport = event.sport?.name || "Unknown";
          const score = `${event.home_score?.current || 0} - ${
            event.away_score?.current || 0
          }`;

          console.log(
            `${index + 1}. ${homeTeam} ${score} ${awayTeam} (${sport})`
          );
        });
      }
    } catch (error) {
      console.log(`❌ Erro ao buscar jogos ao vivo: ${error.message}`);
    }

    // Teste 3: Buscar jogos futuros
    console.log("\n📖 TESTE 3: Jogos futuros");
    try {
      const upcomingResponse = await axios.get(
        "https://sofasport.p.rapidapi.com/v1/events/upcoming",
        {
          headers: {
            "x-rapidapi-host": API_HOST,
            "x-rapidapi-key": API_KEY,
          },
          params: {
            sport_id: 72, // eSports
          },
          timeout: 10000,
        }
      );

      console.log(
        `✅ Jogos futuros encontrados: ${
          upcomingResponse.data?.data?.length || 0
        }`
      );

      if (
        upcomingResponse.data?.data &&
        upcomingResponse.data.data.length > 0
      ) {
        console.log("🏆 PRÓXIMOS JOGOS:");
        upcomingResponse.data.data.slice(0, 10).forEach((event, index) => {
          const homeTeam = event.home_team?.name || "TBD";
          const awayTeam = event.away_team?.name || "TBD";
          const sport = event.sport?.name || "Unknown";
          const startTime = event.start_at
            ? new Date(event.start_at * 1000).toISOString()
            : "Unknown";

          console.log(`${index + 1}. ${homeTeam} vs ${awayTeam}`);
          console.log(`   🏆 Esporte: ${sport}`);
          console.log(`   📅 Início: ${startTime}`);
          console.log("");
        });
      }
    } catch (error) {
      console.log(`❌ Erro ao buscar jogos futuros: ${error.message}`);
    }

    // Teste 4: Buscar por data específica (hoje)
    console.log("\n📖 TESTE 4: Jogos de hoje");
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0]; // YYYY-MM-DD

    try {
      const todayResponse = await axios.get(
        "https://sofasport.p.rapidapi.com/v1/events",
        {
          headers: {
            "x-rapidapi-host": API_HOST,
            "x-rapidapi-key": API_KEY,
          },
          params: {
            sport_id: 72, // eSports
            date: todayStr,
          },
          timeout: 10000,
        }
      );

      console.log(
        `✅ Jogos de hoje encontrados: ${todayResponse.data?.data?.length || 0}`
      );

      if (todayResponse.data?.data && todayResponse.data.data.length > 0) {
        console.log("🏆 JOGOS DE HOJE:");
        todayResponse.data.data.forEach((event, index) => {
          const homeTeam = event.home_team?.name || "TBD";
          const awayTeam = event.away_team?.name || "TBD";
          const sport = event.sport?.name || "Unknown";
          const startTime = event.start_at
            ? new Date(event.start_at * 1000).toISOString()
            : "Unknown";

          console.log(
            `${index + 1}. ${homeTeam} vs ${awayTeam} (${sport}) - ${startTime}`
          );
        });
      }
    } catch (error) {
      console.log(`❌ Erro ao buscar jogos de hoje: ${error.message}`);
    }

    // Teste 5: Buscar por torneios de eSports
    console.log("\n📖 TESTE 5: Torneios de eSports");
    try {
      const tournamentsResponse = await axios.get(
        "https://sofasport.p.rapidapi.com/v1/tournaments",
        {
          headers: {
            "x-rapidapi-host": API_HOST,
            "x-rapidapi-key": API_KEY,
          },
          params: {
            sport_id: 72, // eSports
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
        console.log("🏆 TORNEIOS DE ESPORTS:");
        tournamentsResponse.data.data
          .slice(0, 5)
          .forEach((tournament, index) => {
            console.log(`${index + 1}. ${tournament.name} (${tournament.id})`);
            console.log(`   País: ${tournament.category?.name || "N/A"}`);
          });

        // Pegar eventos do primeiro torneio
        const firstTournament = tournamentsResponse.data.data[0];
        console.log(
          `\n📅 Buscando eventos do torneio: ${firstTournament.name}`
        );

        try {
          const tournamentEventsResponse = await axios.get(
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
            `✅ Eventos do torneio encontrados: ${
              tournamentEventsResponse.data?.data?.events?.length || 0
            }`
          );

          if (
            tournamentEventsResponse.data?.data?.events &&
            tournamentEventsResponse.data.data.events.length > 0
          ) {
            console.log("🏆 EVENTOS DO TORNEIO:");
            tournamentEventsResponse.data.data.events
              .slice(0, 3)
              .forEach((event, index) => {
                const homeTeam = event.home_team?.name || "TBD";
                const awayTeam = event.away_team?.name || "TBD";
                const startTime = event.start_at
                  ? new Date(event.start_at * 1000).toISOString()
                  : "Unknown";

                console.log(
                  `${index + 1}. ${homeTeam} vs ${awayTeam} - ${startTime}`
                );
              });
          }
        } catch (error) {
          console.log(`❌ Erro ao buscar eventos do torneio: ${error.message}`);
        }
      }
    } catch (error) {
      console.log(`❌ Erro ao buscar torneios: ${error.message}`);
    }

    console.log(
      "\n============================================================"
    );
    console.log("📊 RESUMO - SOFASPORT JOGOS ATUAIS");
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

testarSofaSportJogosAtuais();
