const axios = require("axios");

async function testarSportAPI7Esports() {
  console.log("🎮 TESTE FINAL - SPORTAPI7 ESPORTS");
  console.log("📋 Endpoint específico para eSports fornecido pelo dono");
  console.log("🎯 Verificando dados de CS:GO");
  console.log("============================================================\n");

  const API_KEY = "d5da2b13a6msh434479d753d8387p12bae1jsn117c3b0f7da9";
  const API_HOST = "sportapi7.p.rapidapi.com";

  try {
    // Teste 1: Endpoint de eSports fornecido pelo dono
    console.log("📖 TESTE 1: Endpoint eSports fornecido");

    // Primeiro, vamos tentar descobrir IDs de jogos de eSports
    console.log("🔍 Tentando descobrir jogos de eSports disponíveis...");

    // Vamos tentar alguns IDs comuns de CS:GO
    const possibleIds = [1, 2, 3, 4, 5, 10, 20, 50, 100, 500, 1000];

    for (const gameId of possibleIds) {
      try {
        console.log(`🔍 Testando game ID: ${gameId}`);
        const response = await axios.get(
          `https://sportapi7.p.rapidapi.com/api/v1/esports-game/${gameId}/statistics`,
          {
            headers: {
              "x-rapidapi-host": API_HOST,
              "x-rapidapi-key": API_KEY,
            },
            timeout: 5000,
          }
        );

        console.log(`✅ Game ID ${gameId} - Status: ${response.status}`);

        if (response.data) {
          console.log(`📊 Dados encontrados para game ID ${gameId}:`);
          console.log(JSON.stringify(response.data, null, 2));

          // Verificar se é CS:GO
          const dataStr = JSON.stringify(response.data).toLowerCase();
          if (
            dataStr.includes("cs") ||
            dataStr.includes("counter") ||
            dataStr.includes("esports") ||
            dataStr.includes("valorant") ||
            dataStr.includes("lol") ||
            dataStr.includes("dota") ||
            dataStr.includes("overwatch")
          ) {
            console.log(`🎉 ENCONTROU ESPORTS/CS:GO no game ID ${gameId}!`);
            return; // Para se encontrou
          }
        }
      } catch (error) {
        if (error.response?.status === 404) {
          console.log(`❌ Game ID ${gameId} não encontrado`);
        } else {
          console.log(`⚠️ Erro no game ID ${gameId}: ${error.message}`);
        }
      }
    }

    // Teste 2: Tentar outros endpoints de eSports
    console.log("\n📖 TESTE 2: Outros endpoints de eSports");

    const esportsEndpoints = [
      "https://sportapi7.p.rapidapi.com/api/v1/esports",
      "https://sportapi7.p.rapidapi.com/api/v1/esports/games",
      "https://sportapi7.p.rapidapi.com/api/v1/esports/tournaments",
      "https://sportapi7.p.rapidapi.com/api/v1/esports/matches",
    ];

    for (const endpoint of esportsEndpoints) {
      try {
        console.log(`🔍 Testando: ${endpoint}`);
        const response = await axios.get(endpoint, {
          headers: {
            "x-rapidapi-host": API_HOST,
            "x-rapidapi-key": API_KEY,
          },
          timeout: 5000,
        });

        console.log(
          `✅ ${endpoint.split("/").pop()} - Status: ${response.status}`
        );
        console.log(
          `📊 Dados: ${JSON.stringify(response.data).substring(0, 200)}...`
        );

        // Verificar se há esports
        const dataStr = JSON.stringify(response.data).toLowerCase();
        if (
          dataStr.includes("cs") ||
          dataStr.includes("counter") ||
          dataStr.includes("esports")
        ) {
          console.log(`🎉 ESPORTS ENCONTRADO em ${endpoint}!`);
        }
      } catch (error) {
        console.log(`❌ ${endpoint.split("/").pop()} - Erro: ${error.message}`);
      }
    }

    console.log(
      "\n============================================================"
    );
    console.log("📊 RESUMO - SPORTAPI7 ESPORTS");

    console.log("✅ Endpoint fornecido pelo dono testado");
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

testarSportAPI7Esports();
