// TESTE ISOLADO - Avaliação da API SportBex (Trial)
// NÃO MODIFICA NENHUMA PARTE DO SISTEMA EXISTENTE

const axios = require("axios");

// Configuração da API SportBex (dados do trial fornecidos)
const SPORTBEX_API_KEY = "ZQus03Av2LCixvk1HtSIbmYoJjQVKj4b1HbsJPvq";
const BASE_URL = "https://trial-api.sportbex.com";

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "sportbex-api-key": SPORTBEX_API_KEY,
  },
});

// Função para testar endpoints
async function testEndpoint(endpoint, description) {
  console.log(`\n🔍 Testando: ${description}`);
  console.log(`📍 Endpoint: ${endpoint}`);

  try {
    const response = await apiClient.get(endpoint);
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

// Testes específicos para a API SportBex
async function runAPITests() {
  console.log("🚀 INICIANDO TESTES DA API SPORTBEX (TRIAL)");
  console.log("=".repeat(50));

  const results = {};

  // Teste 1: Endpoint fornecido como exemplo (competitions/4)
  results.competitions4 = await testEndpoint(
    "/api/betfair/competitions/4",
    "Competição ID 4 (exemplo fornecido)"
  );

  // Teste 2: Listar todas as competições
  results.competitions = await testEndpoint(
    "/api/betfair/competitions",
    "Lista de competições"
  );

  // Teste 3: Buscar competições de eSports/CS:GO
  results.esportsCompetitions = await testEndpoint(
    "/api/betfair/competitions?filter=esports",
    "Competições eSports"
  );

  // Teste 4: Buscar por CS:GO especificamente
  results.csgoCompetitions = await testEndpoint(
    "/api/betfair/competitions?filter=csgo",
    "Competições CS:GO"
  );

  // Teste 5: Verificar eventos de uma competição (se existir)
  if (results.competitions4.success) {
    results.events4 = await testEndpoint(
      "/api/betfair/competitions/4/events",
      "Eventos da competição 4"
    );
  }

  // Teste 6: Mercados/odds (se existir)
  if (results.competitions4.success) {
    results.markets4 = await testEndpoint(
      "/api/betfair/competitions/4/markets",
      "Mercados da competição 4"
    );
  }

  // Teste 7: Verificar se tem dados de times/jogadores
  results.teams = await testEndpoint("/api/betfair/teams", "Times disponíveis");

  // Teste 8: Verificar dados de apostas/odds
  results.odds = await testEndpoint("/api/betfair/odds", "Dados de odds");

  console.log("\n" + "=".repeat(50));
  console.log("📊 RESUMO DOS TESTES DA API SPORTBEX");

  const successfulTests = Object.values(results).filter(
    (r) => r.success
  ).length;
  const totalTests = Object.keys(results).length;

  console.log(`✅ Testes bem-sucedidos: ${successfulTests}/${totalTests}`);

  // Análise específica para CS:GO Scout
  console.log("\n🎯 ANÁLISE PARA CS:GO SCOUT:");

  // Verificar se encontrou dados de CS:GO
  const hasCSGOData = Object.values(results).some(
    (r) => r.success && JSON.stringify(r.data).toLowerCase().includes("csgo")
  );

  if (hasCSGOData) {
    console.log("✅ Dados de CS:GO: ENCONTRADOS");
  } else {
    console.log("❌ Dados de CS:GO: NÃO encontrados");
  }

  // Verificar se tem dados de eSports
  const hasEsportsData = Object.values(results).some(
    (r) => r.success && JSON.stringify(r.data).toLowerCase().includes("esports")
  );

  if (hasEsportsData) {
    console.log("✅ Dados de eSports: ENCONTRADOS");
  } else {
    console.log("❌ Dados de eSports: NÃO encontrados");
  }

  // Verificar estrutura de competições
  if (results.competitions?.success) {
    console.log("✅ Competições: ESTRUTURADAS");
  } else {
    console.log("❌ Competições: NÃO disponíveis");
  }

  // Verificar dados de apostas
  if (results.odds?.success || results.markets4?.success) {
    console.log("✅ Dados de apostas: DISPONÍVEIS");
  } else {
    console.log("❌ Dados de apostas: NÃO encontrados");
  }

  console.log("\n💡 AVALIAÇÃO GERAL:");
  if (successfulTests >= 6 && (hasCSGOData || hasEsportsData)) {
    console.log("🟢 API EXCELENTE para CS:GO Scout");
    console.log("   - Dados de CS:GO encontrados");
    console.log("   - Boa taxa de sucesso");
    console.log("   - Estrutura profissional");
  } else if (successfulTests >= 4) {
    console.log("🟡 API BOA com POTENCIAL");
    console.log("   - Funciona bem, pode ter dados de CS:GO");
  } else if (successfulTests >= 2) {
    console.log("🟠 API BÁSICA");
    console.log("   - Funciona mas limitada");
  } else {
    console.log("🔴 API PROBLEMÁTICA");
    console.log("   - Poucos endpoints funcionais");
  }

  console.log("\n📋 PRÓXIMOS PASSOS:");
  console.log("1. 📊 ANALISAR dados retornados em api-test-results.json");
  console.log("2. 🎯 VERIFICAR dados específicos de CS:GO");
  console.log("3. 🏆 AVALIAR se inclui estatísticas de times");
  console.log("4. 💰 VERIFICAR custo do plano completo");
  console.log("5. ✅ DECIDIR contratação ou continuar busca");

  return results;
}

// Executar testes
runAPITests()
  .then((results) => {
    console.log("\n✅ Testes concluídos!");
    // Salvar resultados em arquivo se necessário
    const fs = require("fs");
    fs.writeFileSync(
      "sportbex-api-test-results.json",
      JSON.stringify(results, null, 2)
    );
    console.log("📄 Resultados salvos em: sportbex-api-test-results.json");
  })
  .catch((error) => {
    console.error("❌ Erro geral nos testes:", error.message);
  });
