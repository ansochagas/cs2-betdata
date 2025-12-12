const axios = require("axios");

const BETSAPI_BASE_URL = "https://api.b365api.com/v1";
const API_TOKEN = "49870-gVcC3i5RZ38gX2";

const apiClient = axios.create({
  baseURL: BETSAPI_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

async function makeRequest(endpoint, params = {}) {
  try {
    const url = `${endpoint}?token=${API_TOKEN}`;
    const fullUrl = params
      ? `${url}&${new URLSearchParams(params).toString()}`
      : url;

    console.log(`🔍 Fazendo request: ${fullUrl}`);

    const response = await apiClient.get(fullUrl);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    console.log(
      `❌ Erro na request ${endpoint}:`,
      error.response?.status || error.code
    );
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status,
    };
  }
}

async function searchFuriaFalconsGame() {
  console.log("🎮 PROCURANDO JOGO: FURIA VS FALCONS (16/11/2025)");
  console.log("=".repeat(70));

  const targetDate = "2025-11-16"; // Formato YYYY-MM-DD
  const targetTimestamp = Math.floor(new Date(targetDate).getTime() / 1000);

  console.log(`📅 Data alvo: ${targetDate} (timestamp: ${targetTimestamp})`);
  console.log(`👥 Times: FURIA vs FALCONS`);
  console.log("");

  // Lista de endpoints a testar
  const endpointsToTest = [
    // Resultados históricos
    {
      name: "Resultados CS:GO",
      endpoint: "/bet365/results",
      params: { sport_id: 151, days: 30 },
    },
    {
      name: "Resultados gerais",
      endpoint: "/bet365/results",
      params: { days: 30 },
    },
    {
      name: "Resultados por data",
      endpoint: "/bet365/results",
      params: { day: targetDate },
    },

    // Jogos finalizados
    {
      name: "Jogos finalizados CS:GO",
      endpoint: "/bet365/ended",
      params: { sport_id: 151 },
    },
    { name: "Jogos finalizados gerais", endpoint: "/bet365/ended", params: {} },

    // Busca por eventos
    {
      name: "Eventos CS:GO",
      endpoint: "/bet365/events",
      params: { sport_id: 151 },
    },
    {
      name: "Eventos por data",
      endpoint: "/bet365/events",
      params: { day: targetDate },
    },

    // Endpoints alternativos
    {
      name: "Histórico CS:GO",
      endpoint: "/bet365/history",
      params: { sport_id: 151 },
    },
    { name: "Histórico geral", endpoint: "/bet365/history", params: {} },
    {
      name: "Matches CS:GO",
      endpoint: "/bet365/matches",
      params: { sport_id: 151 },
    },
    {
      name: "Matches finalizados",
      endpoint: "/bet365/matches",
      params: { status: "finished" },
    },

    // Endpoints não documentados que podem existir
    {
      name: "Finished games CS:GO",
      endpoint: "/bet365/finished",
      params: { sport_id: 151 },
    },
    {
      name: "Completed games",
      endpoint: "/bet365/completed",
      params: { sport_id: 151 },
    },
    {
      name: "Past events CS:GO",
      endpoint: "/bet365/past",
      params: { sport_id: 151 },
    },
  ];

  let foundGames = [];

  for (const test of endpointsToTest) {
    console.log(`\n🔍 Testando: ${test.name}`);
    console.log(`📍 Endpoint: ${test.endpoint}`);
    console.log(`📋 Params:`, test.params);

    const result = await makeRequest(test.endpoint, test.params);

    if (result.success) {
      console.log(`✅ Status: ${result.status}`);

      if (
        result.data &&
        result.data.results &&
        Array.isArray(result.data.results)
      ) {
        console.log(`📊 Encontrados ${result.data.results.length} resultados`);

        // Procurar por FURIA vs FALCONS
        const furiaGames = result.data.results.filter((game) => {
          const homeName = game.home?.name?.toLowerCase() || "";
          const awayName = game.away?.name?.toLowerCase() || "";
          const leagueName = game.league?.name?.toLowerCase() || "";

          const hasFuria =
            homeName.includes("furia") ||
            awayName.includes("furia") ||
            leagueName.includes("furia");
          const hasFalcons =
            homeName.includes("falcon") ||
            awayName.includes("falcon") ||
            leagueName.includes("falcon");

          return hasFuria && hasFalcons;
        });

        if (furiaGames.length > 0) {
          console.log(
            `🎉 ENCONTRADO! ${furiaGames.length} jogo(s) FURIA vs FALCONS!`
          );

          furiaGames.forEach((game, index) => {
            console.log(`\n🏆 JOGO ${index + 1} ENCONTRADO:`);
            console.log(`   ID: ${game.id}`);
            console.log(`   Time: ${game.home?.name} vs ${game.away?.name}`);
            console.log(`   Liga: ${game.league?.name}`);
            console.log(`   Data: ${new Date(game.time * 1000).toISOString()}`);
            console.log(`   Placar: ${game.ss || "N/A"}`);
            console.log(`   Status: ${game.time_status}`);

            foundGames.push({
              endpoint: test.endpoint,
              game: game,
              fullResponse: result.data,
            });
          });
        } else {
          console.log(
            `❌ Nenhum jogo FURIA vs FALCONS encontrado neste endpoint`
          );
        }

        // Mostrar primeiros 2 jogos como exemplo
        if (result.data.results.length > 0) {
          console.log(`\n📋 Exemplos de jogos encontrados:`);
          result.data.results.slice(0, 2).forEach((game, i) => {
            console.log(
              `   ${i + 1}. ${game.home?.name} vs ${game.away?.name} (${
                game.league?.name
              })`
            );
          });
        }
      } else {
        console.log(`📊 Resposta:`, JSON.stringify(result.data, null, 2));
      }
    } else {
      console.log(`❌ Falhou: ${result.error}`);
    }

    // Pequena pausa entre requests
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  // Análise final
  console.log("\n" + "=".repeat(70));
  console.log("📊 RESULTADO FINAL - BUSCA FURIA VS FALCONS");
  console.log("=".repeat(70));

  if (foundGames.length > 0) {
    console.log(
      `🎉 SUCESSO! Encontrados ${foundGames.length} jogos FURIA vs FALCONS:`
    );

    foundGames.forEach((found, index) => {
      console.log(`\n🏆 JOGO ${index + 1}:`);
      console.log(`   Endpoint: ${found.endpoint}`);
      console.log(`   ID: ${found.game.id}`);
      console.log(
        `   Times: ${found.game.home?.name} vs ${found.game.away?.name}`
      );
      console.log(`   Liga: ${found.game.league?.name}`);
      console.log(`   Data: ${new Date(found.game.time * 1000).toISOString()}`);
      console.log(`   Placar: ${found.game.ss || "N/A"}`);

      console.log(`\n📄 JSON COMPLETO DO JOGO:`);
      console.log(JSON.stringify(found.game, null, 2));

      console.log(`\n📄 JSON COMPLETO DA RESPOSTA:`);
      console.log(JSON.stringify(found.fullResponse, null, 2));
    });
  } else {
    console.log(
      "❌ Nenhum jogo FURIA vs FALCONS encontrado em nenhum endpoint testado"
    );
    console.log("\n💡 Possíveis razões:");
    console.log("   - Jogo ainda não aconteceu (data futura)");
    console.log("   - BETSAPI não tem dados históricos detalhados");
    console.log("   - Endpoint correto não foi testado");
    console.log("   - Jogo pode estar em outro sport_id");
  }

  console.log("\n🔍 Endpoints testados: " + endpointsToTest.length);
  console.log("📅 Data procurada: " + targetDate);
  console.log("👥 Times procurados: FURIA vs FALCONS");
}

searchFuriaFalconsGame().catch(console.error);
