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

async function main() {
  console.log("🎮 TESTANDO BETSAPI COM CONFIGURAÇÃO CORRIGIDA");
  console.log("=".repeat(60));
  console.log(`🔑 Token: ${API_TOKEN}`);
  console.log(`🌐 URL Base: ${BETSAPI_BASE_URL}`);
  console.log("=".repeat(60));

  const results = {};

  // Teste 1: Status da conta
  console.log("\n📖 TESTE 1: Verificando status da conta");
  results.status = await testEndpoint("Status da conta", "/bet365/premium");

  // Teste 2: Lista de esportes
  console.log("\n🏆 TESTE 2: Buscando lista de esportes");
  results.sports = await testEndpoint("Lista de esportes", "/bet365/sports");

  // Teste 3: Eventos atuais
  console.log("\n📅 TESTE 3: Buscando eventos atuais");
  results.events = await testEndpoint("Eventos atuais", "/bet365/upcoming", {
    sport_id: 1,
  });

  // Teste 4: Específico para ESPORTS
  console.log("\n🎯 TESTE 4: Buscando eventos ESPORTS");
  results.esports = await testEndpoint("Eventos ESPORTS", "/bet365/upcoming", {
    sport_id: "ESPORTS",
  });

  // Teste 5: Testar sport_ids que podem ser CS:GO
  console.log("\n🔢 TESTE 5: Testando sport_ids para CS:GO");
  const sportIdsToTest = [78, 90, 150, 151, 152, 153, 154, 200, 300];

  for (const sportId of sportIdsToTest) {
    console.log(`\n   Testando sport_id: ${sportId}`);
    const result = await testEndpoint(
      `Eventos sport_id ${sportId}`,
      "/bet365/upcoming",
      { sport_id: sportId }
    );
    results[`sport_${sportId}`] = result;

    // Verificar se encontrou CS:GO
    if (
      result.success &&
      Array.isArray(result.data) &&
      result.data.length > 0
    ) {
      const sampleEvent = result.data[0];
      const eventText = `${sampleEvent.league?.name || ""} ${
        sampleEvent.home?.name || ""
      } ${sampleEvent.away?.name || ""}`.toLowerCase();

      const isCsgo = [
        "counter",
        "strike",
        "cs:go",
        "csgo",
        "cs2",
        "furia",
        "mibr",
        "imperial",
        "navi",
        "faze",
        "astralis",
      ].some((keyword) => eventText.includes(keyword));

      if (isCsgo) {
        console.log(`   🎉 ENCONTRADO CS:GO no sport_id ${sportId}!`);
        console.log(`   📋 Evento: ${eventText}`);
      }
    }
  }

  // Análise final
  console.log("\n" + "=".repeat(60));
  console.log("📊 ANÁLISE FINAL - BETSAPI");

  const successfulTests = Object.values(results).filter(
    (r) => r.success
  ).length;
  const totalTests = Object.keys(results).length;

  console.log(`✅ Testes bem-sucedidos: ${successfulTests}/${totalTests}`);

  // Verificar CS:GO
  const foundCsgoData = Object.entries(results).some(([key, result]) => {
    if (!result.success || !Array.isArray(result.data)) return false;

    return result.data.some((event) => {
      const eventText = `${event.league?.name || ""} ${
        event.home?.name || ""
      } ${event.away?.name || ""}`.toLowerCase();

      return [
        "counter",
        "strike",
        "cs:go",
        "csgo",
        "cs2",
        "furia",
        "mibr",
        "imperial",
        "navi",
        "faze",
        "astralis",
      ].some((keyword) => eventText.includes(keyword));
    });
  });

  console.log("\n🎯 RESULTADO PARA CS:GO SCOUT:");
  if (foundCsgoData) {
    console.log("🎉 ✅ BETSAPI TEM DADOS DE CS:GO!");
    console.log("✅ Times e torneios encontrados");
    console.log("✅ API adequada para o projeto");
  } else {
    console.log("❌ BETSAPI NÃO tem dados de CS:GO");
    console.log("💡 Focada em esportes tradicionais");
    console.log("🔄 Precisamos usar outra API para esports");
  }

  return results;
}

main()
  .then((results) => {
    console.log("\n✅ Testes concluídos!");
    // Salvar resultados
    const fs = require("fs");
    fs.writeFileSync(
      "betsapi-corrected-test-results.json",
      JSON.stringify(results, null, 2)
    );
    console.log("📄 Resultados salvos em: betsapi-corrected-test-results.json");
  })
  .catch((error) => {
    console.error("❌ Erro geral:", error.message);
  });
