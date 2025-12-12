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

async function testEventHistoryEndpoint() {
  console.log("🎯 TESTANDO ENDPOINT: /event/history");
  console.log("=".repeat(60));

  // Primeiro, vamos buscar jogos atuais de CS:GO para ter event_ids válidos
  console.log("📅 1. BUSCANDO JOGOS ATUAIS DE CS:GO...");
  const currentGames = await makeRequest("/bet365/upcoming", { sport_id: 151 });

  if (!currentGames.success || !currentGames.data.results) {
    console.log("❌ Não conseguiu buscar jogos atuais");
    return;
  }

  console.log(
    `✅ Encontrados ${currentGames.data.results.length} jogos atuais`
  );

  // Pegar alguns event_ids para testar
  const sampleGames = currentGames.data.results.slice(0, 3);
  console.log("\n🎮 JOGOS PARA TESTAR HISTÓRICO:");
  sampleGames.forEach((game, i) => {
    console.log(
      `${i + 1}. ${game.home.name} vs ${game.away.name} (ID: ${game.id})`
    );
  });

  // Agora testar o endpoint /event/history para cada jogo
  console.log("\n📊 2. TESTANDO /event/history PARA CADA JOGO...");

  for (const game of sampleGames) {
    console.log(
      `\n🏆 Testando histórico do jogo: ${game.home.name} vs ${game.away.name}`
    );
    console.log(`   Event ID: ${game.id}`);

    const history = await makeRequest("/event/history", { event_id: game.id });

    if (history.success) {
      console.log(`   ✅ HISTÓRICO ENCONTRADO!`);
      console.log(`   📄 JSON COMPLETO DO HISTÓRICO:`);
      console.log(JSON.stringify(history.data, null, 2));

      // Verificar se tem dados de kills, mapas, etc.
      if (history.data && typeof history.data === "object") {
        console.log(`   🔍 ANÁLISE DOS DADOS:`);

        if (Array.isArray(history.data)) {
          console.log(`      - Tipo: Array com ${history.data.length} itens`);
          if (history.data.length > 0) {
            console.log(
              `      - Primeiro item:`,
              JSON.stringify(history.data[0], null, 2)
            );
          }
        } else {
          console.log(`      - Chaves disponíveis:`, Object.keys(history.data));

          // Procurar por dados relevantes
          Object.keys(history.data).forEach((key) => {
            const value = history.data[key];
            if (
              key.toLowerCase().includes("kill") ||
              key.toLowerCase().includes("map") ||
              key.toLowerCase().includes("score") ||
              key.toLowerCase().includes("round") ||
              key.toLowerCase().includes("stat")
            ) {
              console.log(
                `      🎯 DADO RELEVANTE: ${key} = ${JSON.stringify(
                  value
                ).substring(0, 100)}...`
              );
            }
          });
        }
      }

      // Se encontrou dados, podemos parar aqui
      console.log(`\n🎉 SUCESSO! O endpoint /event/history FUNCIONA!`);
      return history.data;
    } else {
      console.log(`   ❌ Sem histórico para este jogo`);
    }

    // Pequena pausa
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log("\n❌ Nenhum jogo teve histórico disponível");
  return null;
}

// Testar especificamente com o jogo FURIA vs FALCONS se conseguir encontrar
async function findFuriaFalconsHistory() {
  console.log("\n🎯 3. PROCURANDO HISTÓRICO DE FURIA VS FALCONS...");

  // Buscar jogos atuais novamente, talvez o jogo ainda esteja listado
  const currentGames = await makeRequest("/bet365/upcoming", { sport_id: 151 });

  if (currentGames.success && currentGames.data.results) {
    const furiaGame = currentGames.data.results.find((game) => {
      const homeName = game.home?.name?.toLowerCase() || "";
      const awayName = game.away?.name?.toLowerCase() || "";
      return homeName.includes("furia") && awayName.includes("falcon");
    });

    if (furiaGame) {
      console.log(`✅ Jogo FURIA vs FALCONS encontrado! ID: ${furiaGame.id}`);

      const history = await makeRequest("/event/history", {
        event_id: furiaGame.id,
      });

      if (history.success) {
        console.log(`🎉 HISTÓRICO COMPLETO DE FURIA VS FALCONS:`);
        console.log(JSON.stringify(history.data, null, 2));
        return history.data;
      }
    } else {
      console.log("❌ Jogo FURIA vs FALCONS não encontrado nos jogos atuais");
    }
  }

  return null;
}

async function main() {
  const historyData = await testEventHistoryEndpoint();

  if (!historyData) {
    await findFuriaFalconsHistory();
  }

  console.log("\n" + "=".repeat(60));
  console.log("📊 CONCLUSÃO - ENDPOINT /event/history");
  console.log("=".repeat(60));

  if (historyData) {
    console.log("✅ ENDPOINT FUNCIONA! Dados históricos disponíveis");
    console.log("💡 Agora podemos implementar a busca de kills por time");
  } else {
    console.log("❌ Endpoint não retorna dados ou jogos não têm histórico");
    console.log("💡 Continuamos com Pandascore para dados históricos");
  }
}

main().catch(console.error);
