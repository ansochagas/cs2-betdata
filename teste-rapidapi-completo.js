const axios = require("axios");

async function testarRapidAPICompleto() {
  console.log("🎮 TESTANDO RAPIDAPI - VÁRIOS ENDPOINTS");
  console.log("📋 Explorando todas as possibilidades");
  console.log("============================================================\n");

  const config = {
    headers: {
      "x-rapidapi-host": "esportapi1.p.rapidapi.com",
      "x-rapidapi-key": "d5da2b13a6msh434479d753d8387p12bae1jsn117c3b0f7da9",
    },
    timeout: 10000,
  };

  // Testes diferentes
  const tests = [
    {
      name: "Times disponíveis",
      url: "https://esportapi1.p.rapidapi.com/api/esport/teams",
      description: "Lista de times disponíveis",
    },
    {
      name: "Torneios CS:GO",
      url: "https://esportapi1.p.rapidapi.com/api/esport/tournaments",
      description: "Torneios disponíveis",
    },
    {
      name: "Jogos recentes gerais",
      url: "https://esportapi1.p.rapidapi.com/api/esport/matches/recent",
      description: "Jogos recentes de todos os esportes",
    },
    {
      name: "Time específico (teste outro ID)",
      url: "https://esportapi1.p.rapidapi.com/api/esport/team/1/matches/previous/1",
      description: "Time com ID 1",
    },
    {
      name: "Time FURIA (se existir)",
      url: "https://esportapi1.p.rapidapi.com/api/esport/search/teams?query=furia",
      description: "Buscar time FURIA",
    },
  ];

  for (const test of tests) {
    try {
      console.log(`\n📖 TESTE: ${test.name}`);
      console.log(`📝 ${test.description}`);
      console.log(`🔍 URL: ${test.url}`);

      const response = await axios.get(test.url, config);

      console.log(`✅ Status: ${response.status}`);
      console.log(`📊 Tipo: ${typeof response.data}`);

      if (response.data) {
        if (Array.isArray(response.data)) {
          console.log(`📊 Array com ${response.data.length} itens`);
          if (response.data.length > 0) {
            console.log("🏆 Primeiro item:");
            console.log(JSON.stringify(response.data[0], null, 2));
          }
        } else if (typeof response.data === "object") {
          const keys = Object.keys(response.data);
          console.log(`🔑 Chaves: ${keys.join(", ")}`);

          if (response.data.data && Array.isArray(response.data.data)) {
            console.log(
              `📄 Dados em 'data': ${response.data.data.length} itens`
            );
            if (response.data.data.length > 0) {
              console.log("🏆 Primeiro item em data:");
              console.log(JSON.stringify(response.data.data[0], null, 2));
            }
          } else {
            console.log("📄 Resposta completa:");
            console.log(JSON.stringify(response.data, null, 2));
          }
        }
      }

      // Verificar se tem dados úteis
      if (
        response.data &&
        (Array.isArray(response.data) || response.data.data)
      ) {
        const data = Array.isArray(response.data)
          ? response.data
          : response.data.data || [];
        if (data.length > 0) {
          const firstItem = data[0];

          // Verificar se é time
          if (firstItem.name && firstItem.id) {
            console.log("✅ PARECE SER LISTA DE TIMES!");
          }

          // Verificar se é jogo
          if (firstItem.homeTeam || firstItem.awayTeam) {
            console.log("✅ PARECE SER LISTA DE JOGOS!");
          }

          // Verificar se é torneio
          if (firstItem.tournament || firstItem.league) {
            console.log("✅ PARECE SER LISTA DE TORNEIOS!");
          }
        }
      }
    } catch (error) {
      console.error(`❌ ERRO em ${test.name}:`, error.message);
      if (error.response) {
        console.error(`   Status: ${error.response.status}`);
        if (error.response.data) {
          console.error(
            `   Detalhes: ${JSON.stringify(error.response.data, null, 2)}`
          );
        }
      }
    }

    // Pausa entre requests para não sobrecarregar
    await sleep(1000);
  }

  console.log("\n============================================================");
  console.log("📊 RESUMO DA EXPLORAÇÃO RAPIDAPI:");
  console.log("🎯 Objetivo: Encontrar API com dados históricos de CS:GO");
  console.log("💰 Status: API paga via RapidAPI");
  console.log("🔍 Resultados: Aguardando análise dos testes acima");
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

testarRapidAPICompleto();
