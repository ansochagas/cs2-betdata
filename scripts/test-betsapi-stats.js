const axios = require("axios");

const BETSAPI_BASE_URL = "https://api.b365api.com/v1";
const API_TOKEN = "49870-gVcC3i5RZ38gX2";

const apiClient = axios.create({
  baseURL: BETSAPI_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

async function testEndpoint(description, endpoint, params = {}) {
  console.log(`\n🔍 Testando: ${description}`);
  console.log(`📍 Endpoint: ${endpoint}`);
  console.log(`📋 Parâmetros:`, params);

  try {
    const response = await apiClient.get(endpoint, {
      params: {
        token: API_TOKEN,
        ...params,
      },
    });

    console.log(`✅ Status: ${response.status}`);
    console.log(`📊 Dados recebidos:`);

    if (Array.isArray(response.data)) {
      console.log(`   - Tipo: Array com ${response.data.length} itens`);
      if (response.data.length > 0) {
        console.log(
          `   - Primeiro item:`,
          JSON.stringify(response.data[0], null, 2)
        );
      }
    } else if (typeof response.data === "object") {
      console.log(`   - Tipo: Object`);
      console.log(`   - Chaves disponíveis:`, Object.keys(response.data));
      console.log(`   - Dados:`, JSON.stringify(response.data, null, 2));
    } else {
      console.log(`   - Conteúdo:`, response.data);
    }

    return { success: true, data: response.data };
  } catch (error) {
    console.log(`❌ Erro: ${error.response?.status || error.message}`);
    if (error.response?.data) {
      console.log(`   Detalhes:`, error.response.data);
    }
    return { success: false, error: error.message };
  }
}

async function exploreFinishedGames() {
  console.log("🎮 BUSCANDO JOGOS FINALIZADOS DE CS:GO COM STATS");
  console.log("=".repeat(60));

  // Buscar resultados históricos de CS:GO
  console.log("\n📅 1. BUSCANDO RESULTADOS HISTÓRICOS DE CS:GO");
  const results = await testEndpoint(
    "Resultados CS:GO últimos 7 dias",
    "/bet365/results",
    { sport_id: 151, days: 7 }
  );

  if (
    results.success &&
    results.data.results &&
    results.data.results.length > 0
  ) {
    console.log(
      `\n✅ Encontrados ${results.data.results.length} jogos finalizados`
    );

    // Analisar os primeiros jogos para ver estrutura
    const sampleGames = results.data.results.slice(0, 3);

    for (let i = 0; i < sampleGames.length; i++) {
      const game = sampleGames[i];
      console.log(
        `\n🏆 JOGO ${i + 1}: ${game.home?.name || "Unknown"} vs ${
          game.away?.name || "Unknown"
        }`
      );
      console.log(`   📅 Data: ${new Date(game.time * 1000).toISOString()}`);
      console.log(`   🏟️ Liga: ${game.league?.name || "Unknown"}`);
      console.log(`   📊 SS (Score): ${game.ss || "N/A"}`);

      // Verificar se há estatísticas disponíveis
      if (game.ss) {
        console.log(`   ✅ Tem placar! Analisando...`);

        // Tentar buscar stats detalhadas do evento
        const stats = await testEndpoint(
          `Stats do jogo ${game.id}`,
          "/bet365/event/stats",
          { event_id: game.id }
        );

        if (stats.success && stats.stats) {
          console.log(`   📈 STATS DETALHADAS ENCONTRADAS!`);
          console.log(`   🔍 Explorando stats...`);

          // Procurar por dados de kills, mapas, etc.
          Object.keys(stats.stats).forEach((key) => {
            const value = stats.stats[key];
            console.log(
              `      ${key}: ${JSON.stringify(value).substring(0, 100)}...`
            );

            // Verificar se são dados relevantes
            if (
              key.toLowerCase().includes("kill") ||
              key.toLowerCase().includes("map") ||
              key.toLowerCase().includes("score") ||
              key.toLowerCase().includes("round")
            ) {
              console.log(
                `      🎯 DADO RELEVANTE ENCONTRADO: ${key} = ${value}`
              );
            }
          });
        } else {
          console.log(`   ❌ Sem stats detalhadas disponíveis`);
        }
      } else {
        console.log(`   ⚠️ Sem placar detalhado`);
      }
    }
  } else {
    console.log("\n❌ Nenhum jogo finalizado encontrado");
  }

  // Testar busca por jogos específicos que sabemos que aconteceram
  console.log("\n🎯 2. TESTANDO JOGOS ESPECÍFICOS");
  const specificGames = [
    "185304554", // Eternal Fire vs HAVU (do teste anterior)
    "185453990", // Fluxo vs FaZe
  ];

  for (const gameId of specificGames) {
    console.log(`\n🔍 Verificando jogo ID: ${gameId}`);
    const gameStats = await testEndpoint(
      `Stats jogo ${gameId}`,
      "/bet365/event/stats",
      { event_id: gameId }
    );

    if (gameStats.success && gameStats.data && gameStats.data.stats) {
      console.log(`   ✅ Stats encontradas para jogo ${gameId}!`);
      console.log(
        `   📊 Chaves disponíveis:`,
        Object.keys(gameStats.data.stats)
      );

      // Mostrar todas as stats
      Object.entries(gameStats.data.stats).forEach(([key, value]) => {
        console.log(`      ${key}: ${value}`);
      });
    }
  }
}

async function main() {
  await exploreFinishedGames();

  console.log("\n" + "=".repeat(60));
  console.log("📊 ANÁLISE FINAL - STATS DE KILLS POR TIME");
  console.log("=".repeat(60));

  console.log("\n🔍 O QUE PROCURAMOS:");
  console.log("   ✅ Kills totais por time em cada mapa");
  console.log("   ✅ Exemplo: 'Furia teve 148 kills no mapa Dust2'");
  console.log("   ✅ Estatísticas por mapa (rounds, tempo, etc.)");

  console.log("\n💡 CONCLUSÃO:");
  console.log("   Baseado nos dados retornados, vamos determinar");
  console.log("   se a BETSAPI fornece stats de kills por time.");
}

main().catch(console.error);
