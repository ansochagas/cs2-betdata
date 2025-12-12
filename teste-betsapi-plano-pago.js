// TESTE - BetsAPI com plano pago (verificar acesso a CS:GO)
// Testando se plano pago tem dados de esports/CS:GO

const axios = require("axios");

// Credenciais da BetsAPI (mesmas do teste anterior)
const API_KEY = "45d5e1cb4bbbd5dff0c798f9211026d0";
const BASE_URL = "https://api.b365api.com/v1";

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Função para testar endpoint
async function testEndpoint(description, endpoint, params = {}) {
  console.log(`\n🔍 Testando: ${description}`);
  console.log(`📍 Endpoint: ${endpoint}`);
  console.log(`📋 Parâmetros:`, params);

  try {
    const response = await apiClient.get(endpoint, {
      params: {
        token: API_KEY,
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

// Testes específicos para verificar acesso a CS:GO no plano pago
async function runBetsAPIPaidTests() {
  console.log("🎮 TESTE - BETSAPI COM PLANO PAGO");
  console.log("📋 Verificando acesso a dados de CS:GO");
  console.log("🔑 API Key: mesma do teste anterior");
  console.log("💰 Plano: FREE (mesmo plano)");
  console.log("🎯 Objetivo: verificar se plano pago tem dados diferentes");
  console.log("=".repeat(60));

  const results = {};

  // Teste 1: Verificar status da conta/plano
  console.log("\n📖 TESTE 1: Verificando status da conta");
  results.status = await testEndpoint("Status da conta", "/bet365/premium");

  // Teste 2: Buscar todos os esportes disponíveis
  console.log("\n🏆 TESTE 2: Buscando todos os esportes disponíveis");
  results.sports = await testEndpoint("Lista de esportes", "/bet365/sports");

  // Teste 3: Buscar eventos por sport_id específico (CS:GO)
  console.log("\n🎯 TESTE 3: Buscando eventos CS:GO (sport_id=ESPORTS)");
  results.esportsEvents = await testEndpoint(
    "Eventos ESPORTS",
    "/bet365/upcoming",
    { sport_id: "ESPORTS" }
  );

  // Teste 4: Buscar por sport_id numérico (testar vários)
  console.log("\n🔢 TESTE 4: Testando sport_ids numéricos para CS:GO");
  const sportIdsToTest = [78, 90, 150, 151, 152, 153, 154]; // IDs que podem ser CS:GO

  for (const sportId of sportIdsToTest) {
    console.log(`\n   Testando sport_id: ${sportId}`);
    const result = await testEndpoint(
      `Eventos sport_id ${sportId}`,
      "/bet365/upcoming",
      { sport_id: sportId }
    );
    results[`sport_${sportId}`] = result;

    // Se encontrou dados, verificar se são de CS:GO
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
      ].some((keyword) => eventText.includes(keyword));

      if (isCsgo) {
        console.log(`   🎉 ENCONTRADO CS:GO no sport_id ${sportId}!`);
        console.log(`   📋 Evento: ${eventText}`);
      }
    }
  }

  // Teste 5: Buscar por filtros de texto (CS:GO)
  console.log("\n🔍 TESTE 5: Busca por texto 'CS:GO'");
  results.csgoSearch = await testEndpoint(
    "Busca por CS:GO",
    "/bet365/upcoming",
    { sport_id: 1 }
  ); // Usar sport_id 1 e filtrar depois

  // Teste 6: Verificar endpoints premium
  console.log("\n💎 TESTE 6: Verificando endpoints premium");
  results.premium = await testEndpoint("Dados premium", "/bet365/premium/data");

  console.log("\n" + "=".repeat(60));
  console.log("📊 RESUMO - BETSAPI PLANO PAGO");

  const successfulTests = Object.values(results).filter(
    (r) => r.success
  ).length;
  const totalTests = Object.keys(results).length;

  console.log(`✅ Testes bem-sucedidos: ${successfulTests}/${totalTests}`);

  // Análise específica para CS:GO
  console.log("\n🎯 ANÁLISE PARA CS:GO SCOUT:");

  // Verificar se encontrou dados de CS:GO em algum sport_id
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

  if (foundCsgoData) {
    console.log("🎉 CONFIRMADO: BETSAPI TEM DADOS DE CS:GO!");
    console.log("✅ Times e torneios de CS:GO encontrados");
    console.log("✅ Plano pago tem acesso a esports");
  } else {
    console.log("❌ NÃO encontrado dados de CS:GO");
    console.log("💡 Plano atual pode não incluir esports");
    console.log("💰 Upgrade pode ser necessário");
  }

  // Verificar se há diferença do teste anterior
  console.log("\n🔄 COMPARAÇÃO COM TESTE ANTERIOR:");
  console.log("📊 Teste anterior: 0 dados de CS:GO encontrados");
  console.log(
    `📊 Teste atual: ${
      foundCsgoData ? "DADOS DE CS:GO ENCONTRADOS" : "Sem dados de CS:GO"
    }`
  );

  if (foundCsgoData) {
    console.log("✅ MELHORIA: Dados de CS:GO agora disponíveis!");
    console.log("💡 Possível upgrade de plano ou mudança de endpoint");
  } else {
    console.log("❌ SEM MUDANÇA: Mesmo resultado do teste anterior");
    console.log("💡 BetsAPI provavelmente não tem dados de CS:GO");
  }

  console.log("\n💡 CONCLUSÃO:");
  if (foundCsgoData) {
    console.log("🟢 BETSAPI adequada para CS:GO Scout!");
    console.log("✅ Dados de CS:GO confirmados");
    console.log("✅ Plano pago tem acesso a esports");
    console.log("💰 Custo-benefício excelente");
  } else {
    console.log("🔴 BETSAPI NÃO tem dados de CS:GO");
    console.log("❌ Focada apenas em esportes tradicionais");
    console.log("💡 Mesmo plano pago não inclui esports");
  }

  console.log("\n📋 PRÓXIMOS PASSOS:");
  if (foundCsgoData) {
    console.log("1. ✅ IMPLEMENTAR integração com BetsAPI");
    console.log("2. 📊 IDENTIFICAR sport_id correto para CS:GO");
    console.log("3. 🎯 DESENVOLVER algoritmos de previsão");
    console.log("4. 💰 AVALIAR custo do plano pago");
  } else {
    console.log("1. ❌ DESCARTAR BetsAPI para CS:GO");
    console.log("2. 🔄 FOCAR em APIs especializadas em esports");
    console.log("3. 🎯 USAR CS2 Match Data API (já testada)");
    console.log("4. 💡 CONSIDERAR EsportsData ou SportRadar");
  }

  return results;
}

// Executar testes
runBetsAPIPaidTests()
  .then((results) => {
    console.log("\n✅ Testes da BetsAPI (plano pago) concluídos!");
    // Salvar resultados
    const fs = require("fs");
    fs.writeFileSync(
      "betsapi-plano-pago-test-results.json",
      JSON.stringify(results, null, 2)
    );
    console.log(
      "📄 Resultados salvos em: betsapi-plano-pago-test-results.json"
    );
  })
  .catch((error) => {
    console.error("❌ Erro geral nos testes:", error.message);
  });
