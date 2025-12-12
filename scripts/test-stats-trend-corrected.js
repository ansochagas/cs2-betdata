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

async function testStatsTrendWithCorrectIds() {
  console.log("🎯 TESTANDO /event/stats_trend COM IDs CORRETOS");
  console.log("=".repeat(70));

  // Primeiro buscar jogos atuais para ter our_event_id correto
  const currentGames = await makeRequest("/bet365/upcoming", { sport_id: 151 });

  if (!currentGames.success || !currentGames.data.results) {
    console.log("❌ Não conseguiu buscar jogos atuais");
    return;
  }

  const sampleGame = currentGames.data.results[0];
  console.log(
    `🎮 Jogo teste: ${sampleGame.home.name} vs ${sampleGame.away.name}`
  );
  console.log(`   Event ID: ${sampleGame.id}`);
  console.log(`   Our Event ID: ${sampleGame.our_event_id}`);

  // Testar com our_event_id (que funcionou no /event/history)
  console.log(`\n🔍 Testando com OUR_EVENT_ID: ${sampleGame.our_event_id}`);
  const statsTrend = await makeRequest("/event/stats_trend", {
    event_id: sampleGame.our_event_id,
  });

  if (statsTrend.success) {
    console.log(`✅ STATS TREND FUNCIONOU!`);
    console.log(`📄 JSON COMPLETO:`);
    console.log(JSON.stringify(statsTrend.data, null, 2));

    if (statsTrend.data && statsTrend.data.success === 1) {
      console.log(`🎉 DADOS VÁLIDOS ENCONTRADOS!`);

      // Análise detalhada
      if (statsTrend.data.stats || statsTrend.data.trends) {
        console.log(`🔍 ANÁLISE DETALHADA:`);

        if (statsTrend.data.stats) {
          console.log(`   📊 STATS encontradas:`);
          Object.keys(statsTrend.data.stats).forEach((key) => {
            console.log(`      ${key}: ${statsTrend.data.stats[key]}`);
          });
        }

        if (statsTrend.data.trends) {
          console.log(`   📈 TRENDS encontradas:`);
          Object.keys(statsTrend.data.trends).forEach((key) => {
            console.log(`      ${key}: ${statsTrend.data.trends[key]}`);
          });
        }
      }

      return statsTrend.data;
    }
  } else {
    console.log(`❌ Erro: ${statsTrend.error?.error || statsTrend.status}`);
  }

  return null;
}

async function testWithDocumentationExample() {
  console.log("\n📚 TESTANDO COM EXEMPLO DA DOCUMENTAÇÃO");
  console.log("=".repeat(70));

  // Testar com o event_id do exemplo da documentação
  const docExampleId = "294607";

  console.log(`🔍 Testando event_id da documentação: ${docExampleId}`);

  const statsTrend = await makeRequest("/event/stats_trend", {
    event_id: docExampleId,
  });

  if (statsTrend.success) {
    console.log(`✅ FUNCIONOU COM EXEMPLO DA DOCUMENTAÇÃO!`);
    console.log(`📄 JSON COMPLETO:`);
    console.log(JSON.stringify(statsTrend.data, null, 2));

    if (statsTrend.data && statsTrend.data.success === 1) {
      console.log(`🎉 DADOS VÁLIDOS! Este é o formato correto!`);
      return statsTrend.data;
    }
  } else {
    console.log(`❌ Mesmo exemplo da documentação falhou`);
    console.log(`   Erro: ${statsTrend.error?.error || statsTrend.status}`);
  }

  return null;
}

async function testMultipleIds() {
  console.log("\n🔢 TESTANDO MÚLTIPLOS EVENT_IDS");
  console.log("=".repeat(70));

  // Lista de IDs para testar
  const testIds = [
    "294607", // Documentação
    "219465", // Outro exemplo
    "11046445", // Our event ID que funcionou no history
    "11048324", // Outro our event ID
    "185433342", // Event ID original
    "100000", // ID genérico
    "200000", // ID genérico
  ];

  for (const eventId of testIds) {
    console.log(`\n🎯 Testando event_id: ${eventId}`);

    const statsTrend = await makeRequest("/event/stats_trend", {
      event_id: eventId,
    });

    if (
      statsTrend.success &&
      statsTrend.data &&
      statsTrend.data.success === 1
    ) {
      console.log(`   ✅ SUCESSO! Dados válidos encontrados!`);
      console.log(`   📄 JSON:`);
      console.log(JSON.stringify(statsTrend.data, null, 2));
      return statsTrend.data;
    } else if (statsTrend.success) {
      console.log(`   ⚠️ Resposta recebida mas sem dados válidos`);
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
  console.log("🎯 TESTE CORRIGIDO - /event/stats_trend");
  console.log("Objetivo: Encontrar kills por time, stats por mapa");
  console.log("=".repeat(70));

  let result = null;

  // 1. Testar com our_event_id correto
  result = await testStatsTrendWithCorrectIds();
  if (result) {
    console.log("\n🎉 ENCONTRADO! Funciona com our_event_id");
    return;
  }

  // 2. Testar com exemplo da documentação
  result = await testWithDocumentationExample();
  if (result) {
    console.log("\n🎉 ENCONTRADO! Funciona com exemplo da documentação");
    return;
  }

  // 3. Testar múltiplos IDs
  result = await testMultipleIds();
  if (result) {
    console.log("\n🎉 ENCONTRADO! Funciona com algum event_id");
    return;
  }

  console.log(
    "\n❌ CONCLUSÃO: /event/stats_trend não fornece dados detalhados"
  );
  console.log(
    "💡 BETSAPI foca em odds e jogos básicos, não em stats esportivas"
  );
  console.log("🔄 Para kills/mapas, continuamos com Pandascore");
  console.log(
    "✅ Mas /event/history já nos dá histórico valioso de confrontos!"
  );
}

main().catch(console.error);
