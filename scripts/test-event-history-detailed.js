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

async function testDifferentEventIds() {
  console.log("🔢 TESTANDO DIFERENTES FORMATOS DE EVENT_ID");
  console.log("=".repeat(60));

  // Primeiro buscar jogos atuais
  const currentGames = await makeRequest("/bet365/upcoming", { sport_id: 151 });

  if (!currentGames.success || !currentGames.data.results) {
    console.log("❌ Não conseguiu buscar jogos atuais");
    return;
  }

  const sampleGame = currentGames.data.results[0];
  console.log(
    `🎮 Jogo teste: ${sampleGame.home.name} vs ${sampleGame.away.name}`
  );
  console.log(`   Event ID original: ${sampleGame.id}`);
  console.log(`   Our Event ID: ${sampleGame.our_event_id}`);
  console.log(`   R ID: ${sampleGame.r_id}`);

  // Testar diferentes formatos/variantes do event_id
  const eventIdsToTest = [
    sampleGame.id, // ID original
    sampleGame.our_event_id, // Our event ID
    sampleGame.r_id, // R ID
    String(sampleGame.id), // Como string
    parseInt(sampleGame.id), // Como número
    `event_${sampleGame.id}`, // Com prefixo
    `${sampleGame.id}_1`, // Com sufixo
  ].filter((id) => id != null && id !== "null" && id !== "");

  console.log(`\n🧪 Testando ${eventIdsToTest.length} variações do event_id:`);

  for (const eventId of eventIdsToTest) {
    console.log(`\n🔍 Testando event_id: ${eventId} (tipo: ${typeof eventId})`);

    const history = await makeRequest("/event/history", { event_id: eventId });

    if (history.success) {
      console.log(`   ✅ SUCESSO! Resposta recebida`);
      console.log(`   📄 JSON COMPLETO:`);
      console.log(JSON.stringify(history.data, null, 2));

      if (history.data && history.data.success === 1) {
        console.log(`   🎉 DADOS VÁLIDOS ENCONTRADOS!`);
        return history.data;
      } else {
        console.log(`   ⚠️ Resposta recebida mas sem dados válidos`);
      }
    } else {
      console.log(`   ❌ Erro: ${history.error?.error || history.status}`);
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  return null;
}

async function testFinishedGames() {
  console.log("\n🏁 TESTANDO JOGOS FINALIZADOS");
  console.log("=".repeat(60));

  // Tentar buscar jogos finalizados por diferentes métodos
  const methods = [
    {
      name: "Jogos passados (últimos 7 dias)",
      params: { sport_id: 151, days: 7 },
    },
    {
      name: "Jogos passados (últimos 30 dias)",
      params: { sport_id: 151, days: 30 },
    },
    { name: "Todos os jogos CS:GO", params: { sport_id: 151 } },
  ];

  for (const method of methods) {
    console.log(`\n📅 ${method.name}`);

    // Tentar diferentes endpoints que podem ter jogos finalizados
    const endpoints = [
      "/bet365/results",
      "/bet365/ended",
      "/bet365/finished",
      "/bet365/completed",
    ];

    for (const endpoint of endpoints) {
      const result = await makeRequest(endpoint, method.params);

      if (
        result.success &&
        result.data?.results &&
        result.data.results.length > 0
      ) {
        console.log(
          `   ✅ ${endpoint} retornou ${result.data.results.length} jogos!`
        );

        // Pegar o primeiro jogo finalizado
        const finishedGame = result.data.results[0];
        console.log(
          `   🏆 Primeiro jogo: ${finishedGame.home?.name} vs ${finishedGame.away?.name}`
        );
        console.log(`   📊 Placar: ${finishedGame.ss || "N/A"}`);
        console.log(`   🆔 Event ID: ${finishedGame.id}`);

        // Tentar buscar histórico deste jogo
        console.log(`   🔍 Testando histórico do jogo finalizado...`);
        const history = await makeRequest("/event/history", {
          event_id: finishedGame.id,
        });

        if (history.success && history.data && history.data.success === 1) {
          console.log(`   🎉 HISTÓRICO ENCONTRADO PARA JOGO FINALIZADO!`);
          console.log(`   📄 JSON COMPLETO:`);
          console.log(JSON.stringify(history.data, null, 2));
          return history.data;
        } else {
          console.log(`   ❌ Sem histórico para jogo finalizado`);
        }
      }
    }
  }

  return null;
}

async function testManualEventIds() {
  console.log("\n🎯 TESTANDO EVENT_IDS MANUAIS");
  console.log("=".repeat(60));

  // Testar alguns event_ids que podem existir na documentação
  const manualIds = [
    "219465", // Exemplo da documentação do usuário
    "123456",
    "100000",
    "200000",
    "185430091", // IDs que vimos nos testes anteriores
    "185430093",
  ];

  for (const eventId of manualIds) {
    console.log(`\n🔍 Testando event_id manual: ${eventId}`);

    const history = await makeRequest("/event/history", { event_id: eventId });

    if (history.success) {
      console.log(`   ✅ Resposta recebida para ${eventId}`);
      console.log(`   📄 JSON:`);
      console.log(JSON.stringify(history.data, null, 2));

      if (history.data && history.data.success === 1) {
        console.log(`   🎉 DADOS VÁLIDOS! Este event_id funciona!`);
        return history.data;
      }
    } else {
      console.log(`   ❌ Erro: ${history.error?.error || history.status}`);
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  return null;
}

async function main() {
  console.log("🎯 TESTE DETALHADO - /event/history");
  console.log("Objetivo: Encontrar dados de kills por time");
  console.log("=".repeat(60));

  let result = null;

  // 1. Testar diferentes formatos de event_id
  result = await testDifferentEventIds();
  if (result) {
    console.log("\n🎉 ENCONTRADO! Funciona com jogos atuais");
    return;
  }

  // 2. Testar jogos finalizados
  result = await testFinishedGames();
  if (result) {
    console.log("\n🎉 ENCONTRADO! Funciona com jogos finalizados");
    return;
  }

  // 3. Testar event_ids manuais
  result = await testManualEventIds();
  if (result) {
    console.log("\n🎉 ENCONTRADO! Funciona com event_ids específicos");
    return;
  }

  console.log("\n❌ NENHUM TESTE FUNCIONOU");
  console.log("💡 Conclusão: BETSAPI não fornece dados históricos detalhados");
  console.log("🔄 Continuar com Pandascore para kills por time");
}

main().catch(console.error);
