// TESTE ISOLADO - Avaliação da API The Odds API
// NÃO MODIFICA NENHUMA PARTE DO SISTEMA EXISTENTE

const axios = require("axios");

// Configuração da API The Odds API (dados fornecidos)
const API_KEY = "d99fb2ebd4fdfb564a5303c2a5fa7d8e";
const BASE_URL = "https://api.the-odds-api.com";

const apiClient = axios.create({
  baseURL: BASE_URL,
  params: {
    apiKey: API_KEY,
  },
});

// Função para testar endpoints
async function testEndpoint(endpoint, params = {}, description) {
  console.log(`\n🔍 Testando: ${description}`);
  console.log(`📍 Endpoint: ${endpoint}`);
  console.log(`📋 Parâmetros:`, params);

  try {
    const response = await apiClient.get(endpoint, { params });
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
      console.log(`   - Tipo: ${typeof response.data}`);
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

// Testes específicos para a API The Odds API
async function runAPITests() {
  console.log("🚀 INICIANDO TESTES DA API THE ODDS API");
  console.log("=".repeat(50));

  const results = {};

  // Teste 1: Listar esportes disponíveis
  results.sports = await testEndpoint("/v4/sports", {}, "Esportes disponíveis");

  // Teste 2: Buscar especificamente por CS:GO/esports
  results.sportsCSGO = await testEndpoint(
    "/v4/sports",
    { sport: "csgo" },
    "Esportes filtrados por CS:GO"
  );

  // Teste 3: Buscar por esports em geral
  results.sportsEsports = await testEndpoint(
    "/v4/sports",
    { sport: "esports" },
    "Esportes filtrados por esports"
  );

  // Teste 4: Odds de jogos futuros (próximos jogos)
  results.oddsUpcoming = await testEndpoint(
    "/v4/sports/upcoming/odds",
    {
      apiKey: API_KEY,
      regions: "us",
      markets: "h2h",
      oddsFormat: "decimal",
      limit: 5,
    },
    "Odds de jogos futuros (limitado a 5)"
  );

  // Teste 5: Odds de CS:GO especificamente
  results.oddsCSGO = await testEndpoint(
    "/v4/sports/csgo/odds",
    {
      apiKey: API_KEY,
      regions: "us",
      markets: "h2h",
      oddsFormat: "decimal",
    },
    "Odds específicas de CS:GO"
  );

  // Teste 6: Scores/resultados de jogos
  results.scores = await testEndpoint(
    "/v4/sports/scores",
    {
      apiKey: API_KEY,
      daysFrom: 1,
    },
    "Scores/resultados de jogos (último dia)"
  );

  // Teste 7: Scores de CS:GO
  results.scoresCSGO = await testEndpoint(
    "/v4/sports/csgo/scores",
    {
      apiKey: API_KEY,
      daysFrom: 7,
    },
    "Scores de CS:GO (última semana)"
  );

  // Teste 8: Verificar se tem dados históricos
  results.historical = await testEndpoint(
    "/v4/sports/csgo/odds",
    {
      apiKey: API_KEY,
      regions: "us",
      dateFormat: "iso",
      commenceTimeFrom: "2024-11-01T00:00:00Z",
      commenceTimeTo: "2024-11-24T00:00:00Z",
    },
    "Dados históricos de CS:GO (novembro 2024)"
  );

  console.log("\n" + "=".repeat(50));
  console.log("📊 RESUMO DOS TESTES DA API THE ODDS");

  const successfulTests = Object.values(results).filter(
    (r) => r.success
  ).length;
  const totalTests = Object.keys(results).length;

  console.log(`✅ Testes bem-sucedidos: ${successfulTests}/${totalTests}`);

  // Análise específica para CS:GO Scout
  console.log("\n🎯 ANÁLISE PARA CS:GO SCOUT:");

  // Verificar se tem dados de CS:GO
  const hasCSGOData = Object.values(results).some(
    (r) =>
      r.success &&
      (JSON.stringify(r.data).toLowerCase().includes("csgo") ||
        JSON.stringify(r.data).toLowerCase().includes("counter") ||
        JSON.stringify(r.data).toLowerCase().includes("valorant") ||
        (Array.isArray(r.data) &&
          r.data.some(
            (item) =>
              item.sport_key === "csgo" ||
              item.sport_key === "cs2" ||
              item.sport_title?.toLowerCase().includes("counter")
          )))
  );

  if (hasCSGOData) {
    console.log("✅ Dados de CS:GO: ENCONTRADOS");
  } else {
    console.log("❌ Dados de CS:GO: NÃO encontrados");
  }

  // Verificar dados de odds/apostas
  const hasOddsData = Object.values(results).some(
    (r) =>
      r.success &&
      r.data &&
      ((Array.isArray(r.data) &&
        r.data.some((item) => item.bookmakers || item.odds)) ||
        (typeof r.data === "object" && (r.data.bookmakers || r.data.odds)))
  );

  if (hasOddsData) {
    console.log("✅ Dados de apostas/odds: DISPONÍVEIS");
  } else {
    console.log("❌ Dados de apostas/odds: NÃO encontrados");
  }

  // Verificar dados históricos/resultados
  const hasHistoricalData =
    results.scores?.success || results.scoresCSGO?.success;

  if (hasHistoricalData) {
    console.log("✅ Dados históricos/resultados: DISPONÍVEIS");
  } else {
    console.log("❌ Dados históricos/resultados: NÃO encontrados");
  }

  // Verificar estrutura de dados
  const hasStructuredData = Object.values(results).some(
    (r) =>
      r.success && typeof r.data === "object" && Object.keys(r.data).length > 0
  );

  if (hasStructuredData) {
    console.log("✅ Estrutura de dados: PROFISSIONAL (JSON bem formatado)");
  } else {
    console.log("❌ Estrutura de dados: PROBLEMÁTICA");
  }

  console.log("\n💡 AVALIAÇÃO GERAL:");
  if (successfulTests >= 6 && hasCSGOData && hasOddsData) {
    console.log("🟢 API EXCELENTE para CS:GO Scout");
    console.log("   - Dados de CS:GO encontrados");
    console.log("   - Odds e apostas disponíveis");
    console.log("   - Boa taxa de sucesso");
  } else if (successfulTests >= 4 && (hasCSGOData || hasOddsData)) {
    console.log("🟡 API BOA para apostas, LIMITADA para stats");
    console.log("   - Ótima para odds, pode faltar estatísticas");
  } else if (successfulTests >= 2) {
    console.log("🟠 API FUNCIONAL mas GENÉRICA");
    console.log("   - Funciona mas pode não ter CS:GO");
  } else {
    console.log("🔴 API COM PROBLEMAS");
    console.log("   - Poucos endpoints funcionais");
  }

  console.log("\n📋 PRÓXIMOS PASSOS:");
  console.log("1. 📊 ANALISAR dados retornados em api-test-results.json");
  console.log("2. 🎯 VERIFICAR se tem dados específicos de CS:GO");
  console.log("3. 🏆 AVALIAR qualidade dos dados de apostas");
  console.log("4. 💰 VERIFICAR custo do plano completo");
  console.log("5. ✅ DECIDIR se é adequada para CS:GO Scout");

  return results;
}

// Executar testes
runAPITests()
  .then((results) => {
    console.log("\n✅ Testes concluídos!");
    // Salvar resultados em arquivo se necessário
    const fs = require("fs");
    fs.writeFileSync(
      "theodds-api-test-results.json",
      JSON.stringify(results, null, 2)
    );
    console.log("📄 Resultados salvos em: theodds-api-test-results.json");
  })
  .catch((error) => {
    console.error("❌ Erro geral nos testes:", error.message);
  });
