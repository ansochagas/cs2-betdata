const axios = require("axios");

async function testarBetsAPI2Correto() {
  console.log("🎮 TESTE CORRETO - BETSAPI2 (RapidAPI)");
  console.log("📋 Usando endpoint fornecido pelo usuário");
  console.log("🎯 Via RapidAPI - dados de apostas");
  console.log("💰 Teste gratuito");
  console.log("============================================================\n");

  const API_KEY = "d5da2b13a6msh434479d753d8387p12bae1jsn117c3b0f7da9";
  const API_HOST = "betsapi2.p.rapidapi.com";

  try {
    // Teste 1: Usar endpoint fornecido pelo usuário
    console.log("📖 TESTE 1: Endpoint fornecido (inplay_filter)");
    console.log(
      "🔍 URL: https://betsapi2.p.rapidapi.com/v1/bet365/inplay_filter?sport_id=1"
    );

    const inplayResponse = await axios.get(
      "https://betsapi2.p.rapidapi.com/v1/bet365/inplay_filter?sport_id=1",
      {
        headers: {
          "x-rapidapi-host": API_HOST,
          "x-rapidapi-key": API_KEY,
        },
        timeout: 10000,
      }
    );

    console.log(`✅ Status: ${inplayResponse.status}`);
    console.log(
      `📊 Dados recebidos: ${JSON.stringify(inplayResponse.data, null, 2)}`
    );

    // Teste 2: Tentar outros sport_ids para CS:GO
    console.log("\n📖 TESTE 2: Testando diferentes sport_ids para CS:GO");

    const possibleCsgoIds = [40, 41, 42, 109, 110, 111]; // Possíveis IDs de CS:GO

    for (const sportId of possibleCsgoIds) {
      try {
        console.log(`🔍 Testando sport_id: ${sportId}`);
        const response = await axios.get(
          `https://betsapi2.p.rapidapi.com/v1/bet365/inplay_filter?sport_id=${sportId}`,
          {
            headers: {
              "x-rapidapi-host": API_HOST,
              "x-rapidapi-key": API_KEY,
            },
            timeout: 5000,
          }
        );

        console.log(`✅ Status: ${response.status}`);
        console.log(`📊 Dados: ${JSON.stringify(response.data, null, 2)}`);

        // Se encontrou dados, pode ser CS:GO
        if (response.data && Object.keys(response.data).length > 0) {
          console.log(`🎉 POSSÍVEL CS:GO ENCONTRADO no sport_id ${sportId}!`);
          break;
        }
      } catch (error) {
        if (error.response?.status === 404) {
          console.log(`❌ sport_id ${sportId} não encontrado`);
        } else {
          console.log(`⚠️ Erro no sport_id ${sportId}: ${error.message}`);
        }
      }
    }

    // Teste 3: Verificar endpoints disponíveis
    console.log("\n📖 TESTE 3: Explorando endpoints disponíveis");

    const endpointsToTest = [
      "https://betsapi2.p.rapidapi.com/v1/bet365/inplay",
      "https://betsapi2.p.rapidapi.com/v1/bet365/upcoming?sport_id=1",
      "https://betsapi2.p.rapidapi.com/v1/bet365/events",
      "https://betsapi2.p.rapidapi.com/v1/sports",
    ];

    for (const endpoint of endpointsToTest) {
      try {
        console.log(`🔍 Testando: ${endpoint}`);
        const response = await axios.get(endpoint, {
          headers: {
            "x-rapidapi-host": API_HOST,
            "x-rapidapi-key": API_KEY,
          },
          timeout: 5000,
        });

        console.log(`✅ ${endpoint} - Status: ${response.status}`);
        console.log(
          `📊 Dados: ${JSON.stringify(response.data).substring(0, 200)}...`
        );

        // Verificar se há esports nos dados
        const dataStr = JSON.stringify(response.data).toLowerCase();
        if (
          dataStr.includes("cs") ||
          dataStr.includes("counter") ||
          dataStr.includes("esports") ||
          dataStr.includes("valorant") ||
          dataStr.includes("lol") ||
          dataStr.includes("dota")
        ) {
          console.log(`🎉 POSSÍVEL ESPORT ENCONTRADO em ${endpoint}!`);
        }
      } catch (error) {
        console.log(`❌ ${endpoint} - Erro: ${error.message}`);
      }
    }

    console.log(
      "\n============================================================"
    );
    console.log("📊 RESUMO - BETSAPI2");

    console.log("✅ API acessível após inscrição");
    console.log("🎯 Explorando possibilidades de CS:GO");
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

testarBetsAPI2Correto();
