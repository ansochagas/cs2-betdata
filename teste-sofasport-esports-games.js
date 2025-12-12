const axios = require("axios");

async function testarSofaSportEsportsGames() {
  console.log("🎮 TESTE FINAL - SOFASPORT ESPORTS GAMES");
  console.log("📋 Endpoint correto fornecido pelo usuário");
  console.log("🎯 event_id=10289011 - VAMOS ENCONTRAR CS:GO!");
  console.log("💰 Gratuita com limites via RapidAPI");
  console.log("============================================================\n");

  const API_KEY = "d5da2b13a6msh434479d753d8387p12bae1jsn117c3b0f7da9";
  const API_HOST = "sofasport.p.rapidapi.com";

  try {
    // Teste 1: Endpoint correto fornecido
    console.log("📖 TESTE 1: Esports games com event_id específico");
    const esportsResponse = await axios.get(
      "https://sofasport.p.rapidapi.com/v1/events/esports-games?event_id=10289011",
      {
        headers: {
          "x-rapidapi-host": API_HOST,
          "x-rapidapi-key": API_KEY,
        },
        timeout: 10000,
      }
    );

    console.log(`✅ Status: ${esportsResponse.status}`);
    console.log(
      `📊 Dados recebidos: ${JSON.stringify(esportsResponse.data, null, 2)}`
    );

    if (esportsResponse.data) {
      // Verificar se é CS:GO
      const dataStr = JSON.stringify(esportsResponse.data).toLowerCase();
      if (
        dataStr.includes("cs") ||
        dataStr.includes("counter") ||
        dataStr.includes("furia") ||
        dataStr.includes("navi") ||
        dataStr.includes("mibr") ||
        dataStr.includes("faze") ||
        dataStr.includes("esports") ||
        dataStr.includes("valorant") ||
        dataStr.includes("lol")
      ) {
        console.log("🎉 CONFIRMADO: DADOS DE ESPORTS/CS:GO!");
      } else {
        console.log("⚠️ Dados recebidos, mas não identificados como CS:GO");
      }
    }

    // Teste 2: Tentar outros event_ids
    console.log("\n📖 TESTE 2: Testando outros event_ids");
    const possibleEventIds = [
      10289010, 10289012, 10289013, 10289014, 10289015, 10289016,
    ];

    for (const eventId of possibleEventIds) {
      try {
        console.log(`🔍 Testando event_id: ${eventId}`);
        const response = await axios.get(
          `https://sofasport.p.rapidapi.com/v1/events/esports-games?event_id=${eventId}`,
          {
            headers: {
              "x-rapidapi-host": API_HOST,
              "x-rapidapi-key": API_KEY,
            },
            timeout: 5000,
          }
        );

        if (response.data) {
          console.log(`✅ event_id ${eventId} - Dados encontrados`);
          const dataStr = JSON.stringify(response.data).toLowerCase();
          if (
            dataStr.includes("cs") ||
            dataStr.includes("counter") ||
            dataStr.includes("furia") ||
            dataStr.includes("navi") ||
            dataStr.includes("mibr") ||
            dataStr.includes("faze")
          ) {
            console.log(`🎯 CS:GO ENCONTRADO no event_id ${eventId}!`);
            console.log(
              `📊 Sample: ${JSON.stringify(response.data).substring(0, 300)}...`
            );
            break; // Para se encontrou
          }
        }
      } catch (error) {
        if (error.response?.status === 404) {
          console.log(`❌ event_id ${eventId} não encontrado`);
        } else {
          console.log(`⚠️ Erro no event_id ${eventId}: ${error.message}`);
        }
      }
    }

    // Teste 3: Tentar sem event_id específico
    console.log("\n📖 TESTE 3: Esports games sem event_id");
    try {
      const allEsportsResponse = await axios.get(
        "https://sofasport.p.rapidapi.com/v1/events/esports-games",
        {
          headers: {
            "x-rapidapi-host": API_HOST,
            "x-rapidapi-key": API_KEY,
          },
          timeout: 10000,
        }
      );

      console.log(`✅ Status: ${allEsportsResponse.status}`);
      console.log(
        `📊 Jogos de eSports encontrados: ${
          Array.isArray(allEsportsResponse.data)
            ? allEsportsResponse.data.length
            : "N/A"
        }`
      );

      if (
        Array.isArray(allEsportsResponse.data) &&
        allEsportsResponse.data.length > 0
      ) {
        console.log("\n🏆 JOGOS DE ESPORTS ENCONTRADOS:");
        allEsportsResponse.data.slice(0, 10).forEach((game, index) => {
          const homeTeam = game.home_team?.name || game.homeTeam?.name || "TBD";
          const awayTeam = game.away_team?.name || game.awayTeam?.name || "TBD";
          const league = game.league?.name || game.tournament?.name || "N/A";
          const sport = game.sport?.name || "eSports";

          console.log(`${index + 1}. ${homeTeam} vs ${awayTeam}`);
          console.log(`   🏆 Liga: ${league}`);
          console.log(`   🎮 Esporte: ${sport}`);

          // Verificar se é CS:GO
          const teamsStr = `${homeTeam} ${awayTeam} ${league}`.toLowerCase();
          if (
            teamsStr.includes("cs") ||
            teamsStr.includes("counter") ||
            teamsStr.includes("furia") ||
            teamsStr.includes("navi") ||
            teamsStr.includes("mibr") ||
            teamsStr.includes("faze")
          ) {
            console.log(`   🎯 POSSÍVEL CS:GO!`);
          }
          console.log("");
        });

        // Contar CS:GO
        const csgoGames = allEsportsResponse.data.filter((game) => {
          const homeTeam = game.home_team?.name || game.homeTeam?.name || "";
          const awayTeam = game.away_team?.name || game.awayTeam?.name || "";
          const league = game.league?.name || game.tournament?.name || "";

          const teamsStr = `${homeTeam} ${awayTeam} ${league}`.toLowerCase();
          return (
            teamsStr.includes("cs") ||
            teamsStr.includes("counter") ||
            teamsStr.includes("furia") ||
            teamsStr.includes("navi") ||
            teamsStr.includes("mibr") ||
            teamsStr.includes("faze")
          );
        });

        console.log(`🎮 Total de jogos CS:GO encontrados: ${csgoGames.length}`);

        if (csgoGames.length > 0) {
          console.log("\n🎯 JOGOS DE CS:GO CONFIRMADOS:");
          csgoGames.slice(0, 5).forEach((game, index) => {
            const homeTeam =
              game.home_team?.name || game.homeTeam?.name || "TBD";
            const awayTeam =
              game.away_team?.name || game.awayTeam?.name || "TBD";
            const league = game.league?.name || game.tournament?.name || "N/A";
            const startTime =
              game.start_at || game.startTimestamp
                ? new Date(
                    (game.start_at || game.startTimestamp) * 1000
                  ).toISOString()
                : "N/A";

            console.log(`${index + 1}. ${homeTeam} vs ${awayTeam}`);
            console.log(`   🏆 Liga: ${league}`);
            console.log(`   📅 Início: ${startTime}`);
            console.log("");
          });
        }
      }
    } catch (error) {
      console.log(
        `❌ Erro ao buscar todos os jogos de eSports: ${error.message}`
      );
    }

    console.log(
      "\n============================================================"
    );
    console.log("📊 RESUMO - SOFASPORT ESPORTS GAMES");

    console.log("✅ Endpoint correto testado");
    console.log("🎯 Possível fonte de dados de CS:GO");
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

testarSofaSportEsportsGames();
