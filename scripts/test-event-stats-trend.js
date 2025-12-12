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

    console.log(`🔍 Request: ${fullUrl}`);

    const response = await apiClient.get(fullUrl);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status,
    };
  }
}

async function testStatsTrendEndpoint() {
  console.log("📈 TESTANDO ENDPOINT: /event/stats_trend");
  console.log("Objetivo: Encontrar dados detalhados de kills, mapas, etc.");
  console.log("=".repeat(70));

  // Primeiro buscar jogos atuais de CS:GO
  console.log("🎮 1. BUSCANDO JOGOS ATUAIS DE CS:GO...");
  const currentGames = await makeRequest("/bet365/upcoming", { sport_id: 151 });

  if (!currentGames.success || !currentGames.data.results) {
    console.log("❌ Não conseguiu buscar jogos atuais");
    return;
  }

  console.log(
    `✅ Encontrados ${currentGames.data.results.length} jogos atuais`
  );

  // Pegar alguns jogos para testar
  const sampleGames = currentGames.data.results.slice(0, 5);
  console.log("\n🎯 JOGOS PARA TESTAR STATS TREND:");
  sampleGames.forEach((game, i) => {
    console.log(
      `${i + 1}. ${game.home.name} vs ${game.away.name} (ID: ${
        game.id
      }, OurID: ${game.our_event_id})`
    );
  });

  // Testar /event/stats_trend para cada jogo
  console.log("\n📊 2. TESTANDO /event/stats_trend PARA CADA JOGO...");

  for (const game of sampleGames) {
    console.log(
      `\n🏆 Testando stats trend: ${game.home.name} vs ${game.away.name}`
    );
    console.log(`   Event ID: ${game.id}`);

    const statsTrend = await makeRequest("/event/stats_trend", {
      event_id: game.id,
    });

    if (statsTrend.success) {
      console.log(`   ✅ STATS TREND ENCONTRADO!`);
      console.log(`   📄 JSON COMPLETO DO STATS TREND:`);
      console.log(JSON.stringify(statsTrend.data, null, 2));

      // Verificar se tem dados relevantes
      if (statsTrend.data && typeof statsTrend.data === "object") {
        console.log(`   🔍 ANÁLISE DETALHADA:`);

        if (Array.isArray(statsTrend.data)) {
          console.log(
            `      - Tipo: Array com ${statsTrend.data.length} itens`
          );
          if (statsTrend.data.length > 0) {
            console.log(
              `      - Primeiro item:`,
              JSON.stringify(statsTrend.data[0], null, 2)
            );
          }
        } else {
          console.log(
            `      - Chaves disponíveis:`,
            Object.keys(statsTrend.data)
          );

          // Procurar por dados de kills, mapas, stats
          Object.keys(statsTrend.data).forEach((key) => {
            const value = statsTrend.data[key];
            if (
              key.toLowerCase().includes("kill") ||
              key.toLowerCase().includes("map") ||
              key.toLowerCase().includes("score") ||
              key.toLowerCase().includes("round") ||
              key.toLowerCase().includes("stat") ||
              key.toLowerCase().includes("trend") ||
              key.toLowerCase().includes("home") ||
              key.toLowerCase().includes("away")
            ) {
              console.log(
                `      🎯 DADO RELEVANTE: ${key} = ${JSON.stringify(
                  value
                ).substring(0, 150)}...`
              );
            }
          });
        }

        // Verificar se tem estrutura de stats por time
        if (statsTrend.data.home && statsTrend.data.away) {
          console.log(`      🏠 STATS DO TIME DA CASA (${game.home.name}):`);
          console.log(
            `         ${JSON.stringify(statsTrend.data.home, null, 2)}`
          );

          console.log(`      ✈️ STATS DO TIME VISITANTE (${game.away.name}):`);
          console.log(
            `         ${JSON.stringify(statsTrend.data.away, null, 2)}`
          );
        }

        // Se encontrou dados ricos, pode ser o que procuramos
        if (
          statsTrend.data.success === 1 ||
          Object.keys(statsTrend.data).length > 2
        ) {
          console.log(
            `      🎉 DADOS RICOS ENCONTRADOS! Este pode ter kills/mapas!`
          );
          return statsTrend.data;
        }
      }
    } else {
      console.log(
        `   ❌ Erro: ${statsTrend.error?.error || statsTrend.status}`
      );
    }

    // Pequena pausa
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log("\n❌ Nenhum jogo teve stats trend válido");
  return null;
}

async function testWithDifferentEventIds() {
  console.log("\n🔢 3. TESTANDO COM EVENT_IDS DIFERENTES...");
  console.log("=".repeat(70));

  // Testar com event_id do exemplo da documentação
  const testIds = [
    "294607", // Exemplo da documentação
    "219465", // Outro exemplo
    "185433342", // Jogos atuais que testamos
    "11046445", // Our event ID que funcionou no history
  ];

  for (const eventId of testIds) {
    console.log(`\n🎯 Testando event_id: ${eventId}`);

    const statsTrend = await makeRequest("/event/stats_trend", {
      event_id: eventId,
    });

    if (statsTrend.success) {
      console.log(`   ✅ Resposta recebida!`);
      console.log(`   📄 JSON COMPLETO:`);
      console.log(JSON.stringify(statsTrend.data, null, 2));

      if (statsTrend.data && statsTrend.data.success === 1) {
        console.log(`   🎉 DADOS VÁLIDOS! Este event_id funciona!`);
        return statsTrend.data;
      }
    } else {
      console.log(
        `   ❌ Erro: ${statsTrend.error?.error || statsTrend.status}`
      );
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  return null;
}

async function main() {
  console.log("🎯 TESTE AVANÇADO - /event/stats_trend");
  console.log("Buscando: kills por time, stats por mapa, tendências");
  console.log("=".repeat(70));

  let result = null;

  // 1. Testar com jogos atuais
  result = await testStatsTrendEndpoint();
  if (result) {
    console.log("\n🎉 SUCESSO! /event/stats_trend funciona com jogos atuais!");
    return;
  }

  // 2. Testar com event_ids específicos
  result = await testWithDifferentEventIds();
  if (result) {
    console.log(
      "\n🎉 SUCESSO! /event/stats_trend funciona com event_ids específicos!"
    );
    return;
  }

  console.log(
    "\n❌ RESULTADO: /event/stats_trend não retorna dados detalhados"
  );
  console.log(
    "💡 Conclusão: BETSAPI foca em odds e jogos, não em stats detalhadas"
  );
  console.log("🔄 Melhor fonte para kills/mapas continua sendo Pandascore");
}

main().catch(console.error);
