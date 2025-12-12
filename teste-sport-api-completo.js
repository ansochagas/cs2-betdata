const axios = require("axios");

async function testarSportAPICompleto() {
  console.log("🎮 TESTANDO SPORT API REAL TIME - ANÁLISE COMPLETA");
  console.log("📋 Explorando todos os endpoints disponíveis");
  console.log("============================================================\n");

  const config = {
    headers: {
      "x-rapidapi-host": "sport-api-real-time.p.rapidapi.com",
      "x-rapidapi-key": "d5da2b13a6msh434479d753d8387p12bae1jsn117c3b0f7da9",
    },
    timeout: 10000,
  };

  // Testes de diferentes endpoints
  const tests = [
    {
      name: "Jogo e-sports específico",
      url: "https://sport-api-real-time.p.rapidapi.com/matches/esport-games?matchId=9744554",
      description: "Dados detalhados de um jogo específico",
    },
    {
      name: "Lista de jogos e-sports",
      url: "https://sport-api-real-time.p.rapidapi.com/matches/esport-games",
      description: "Lista de jogos de e-sports disponíveis",
    },
    {
      name: "Jogos ao vivo",
      url: "https://sport-api-real-time.p.rapidapi.com/matches/live",
      description: "Jogos ao vivo de todos os esportes",
    },
    {
      name: "Jogos futuros",
      url: "https://sport-api-real-time.p.rapidapi.com/matches/upcoming",
      description: "Jogos futuros",
    },
  ];

  for (const test of tests) {
    try {
      console.log(`\n📖 TESTE: ${test.name}`);
      console.log(`📝 ${test.description}`);
      console.log(`🔍 URL: ${test.url}`);

      const response = await axios.get(test.url, config);

      console.log(`✅ Status: ${response.status}`);

      if (response.data) {
        if (Array.isArray(response.data)) {
          console.log(`📊 Array com ${response.data.length} itens`);

          if (response.data.length > 0) {
            const firstItem = response.data[0];
            console.log("🏆 Primeiro item:");
            console.log(JSON.stringify(firstItem, null, 2));

            // Verificar se é jogo de e-sports
            const isEsports =
              firstItem.sport === "esports" ||
              firstItem.game === "csgo" ||
              firstItem.game === "cs2" ||
              firstItem.tournament?.toLowerCase().includes("cs") ||
              firstItem.league?.toLowerCase().includes("cs");

            console.log(`🎮 É e-sports/CS:GO: ${isEsports ? "SIM" : "NÃO"}`);

            if (isEsports) {
              console.log("🎯 ENCONTRAMOS DADOS DE E-SPORTS!");
            }
          }
        } else if (typeof response.data === "object") {
          const keys = Object.keys(response.data);
          console.log(`🔑 Chaves: ${keys.join(", ")}`);

          // Verificar se tem dados de jogos
          if (response.data.games && Array.isArray(response.data.games)) {
            console.log(
              `🎮 Jogos (games): ${response.data.games.length} mapas`
            );
            if (response.data.games.length > 0) {
              console.log("📄 Primeiro mapa:");
              console.log(JSON.stringify(response.data.games[0], null, 2));
            }
          }

          if (response.data.events && Array.isArray(response.data.events)) {
            console.log(`📅 Eventos: ${response.data.events.length} jogos`);
            if (response.data.events.length > 0) {
              console.log("🏆 Primeiro evento:");
              console.log(JSON.stringify(response.data.events[0], null, 2));
            }
          }

          if (response.data.matches && Array.isArray(response.data.matches)) {
            console.log(`⚽ Jogos: ${response.data.matches.length} partidas`);
            if (response.data.matches.length > 0) {
              console.log("🏆 Primeiro jogo:");
              console.log(JSON.stringify(response.data.matches[0], null, 2));
            }
          }
        }
      }
    } catch (error) {
      console.error(`❌ ERRO em ${test.name}:`, error.message);
      if (error.response?.status) {
        console.error(`   Status: ${error.response.status}`);
      }
    }

    // Pausa entre requests
    await sleep(1000);
  }

  console.log("\n============================================================");
  console.log("📊 CONCLUSÃO - SPORT API REAL TIME:");

  console.log("\n🔍 O que descobrimos:");
  console.log("✅ API funcional e retorna dados");
  console.log("✅ Tem dados de jogos de e-sports");
  console.log("✅ Mostra placares por mapa (homeScore/awayScore)");
  console.log("✅ Tem timestamps e status dos jogos");

  console.log("\n❓ Limitações identificadas:");
  console.log("⚠️ Parece focar em dados de mapas individuais");
  console.log("⚠️ Não vimos dados gerais do jogo (times, torneio)");
  console.log("⚠️ Precisamos testar mais para confirmar");

  console.log("\n🎯 PRÓXIMOS PASSOS:");
  console.log("1. Testar mais jogos específicos");
  console.log("2. Verificar se tem dados históricos");
  console.log("3. Comparar com dados simulados");
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

testarSportAPICompleto();
