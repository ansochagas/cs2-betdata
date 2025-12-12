const axios = require("axios");

async function testarSportAPI7() {
  console.log("🎮 TESTE FINAL - SPORTAPI7 (RapidAPI)");
  console.log("📋 API de estatísticas esportivas");
  console.log("🎯 Usuário garante que tem dados de CS:GO");
  console.log("💰 Gratuita com limites");
  console.log("============================================================\n");

  const API_KEY = "d5da2b13a6msh434479d753d8387p12bae1jsn117c3b0f7da9";
  const API_HOST = "sportapi7.p.rapidapi.com";

  try {
    // Teste 1: Endpoint fornecido pelo usuário
    console.log("📖 TESTE 1: Endpoint fornecido (player ratings)");
    console.log(
      "🔍 URL: https://sportapi7.p.rapidapi.com/api/v1/player/817181/unique-tournament/132/season/65360/ratings"
    );

    const playerResponse = await axios.get(
      "https://sportapi7.p.rapidapi.com/api/v1/player/817181/unique-tournament/132/season/65360/ratings",
      {
        headers: {
          "x-rapidapi-host": API_HOST,
          "x-rapidapi-key": API_KEY,
        },
        timeout: 10000,
      }
    );

    console.log(`✅ Status: ${playerResponse.status}`);
    console.log(
      `📊 Dados recebidos: ${JSON.stringify(playerResponse.data, null, 2)}`
    );

    // Verificar se é CS:GO
    if (playerResponse.data) {
      const dataStr = JSON.stringify(playerResponse.data).toLowerCase();
      if (
        dataStr.includes("cs") ||
        dataStr.includes("counter") ||
        dataStr.includes("esports") ||
        dataStr.includes("valorant") ||
        dataStr.includes("lol") ||
        dataStr.includes("dota")
      ) {
        console.log("🎉 CONFIRMADO: DADOS DE ESPORTS/CS:GO!");
      } else {
        console.log("⚠️ Dados recebidos, mas não identificados como CS:GO");
      }
    }

    // Teste 2: Explorar outros endpoints
    console.log("\n📖 TESTE 2: Explorando estrutura da API");

    const endpointsToTest = [
      "https://sportapi7.p.rapidapi.com/api/v1/sports",
      "https://sportapi7.p.rapidapi.com/api/v1/tournaments",
      "https://sportapi7.p.rapidapi.com/api/v1/matches/last/0",
      "https://sportapi7.p.rapidapi.com/api/v1/matches/next/0",
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

        console.log(
          `✅ ${endpoint.split("/").pop()} - Status: ${response.status}`
        );

        // Verificar conteúdo
        const dataStr = JSON.stringify(response.data).toLowerCase();
        if (
          dataStr.includes("cs") ||
          dataStr.includes("counter") ||
          dataStr.includes("esports")
        ) {
          console.log(`🎉 ESPORTS ENCONTRADO em ${endpoint.split("/").pop()}!`);
          console.log(
            `📊 Sample: ${JSON.stringify(response.data).substring(0, 200)}...`
          );
        }
      } catch (error) {
        console.log(`❌ ${endpoint.split("/").pop()} - Erro: ${error.message}`);
      }
    }

    console.log(
      "\n============================================================"
    );
    console.log("📊 RESUMO - SPORTAPI7");

    console.log("✅ API acessível");
    console.log("🎯 Testando se realmente tem CS:GO");
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

testarSportAPI7();
