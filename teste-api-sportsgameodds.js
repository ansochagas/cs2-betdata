// TESTE ISOLADO - Avaliação da API SportsGameOdds
// NÃO MODIFICA NENHUMA PARTE DO SISTEMA EXISTENTE

const axios = require("axios");

// Configuração da API SportsGameOdds
const API_KEY = "45d5e1cb4bbbd5dff0c798f9211026d0";
const BASE_URL = "https://api.sportsgameodds.com/v2";

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Bearer ${API_KEY}`,
    "Content-Type": "application/json",
  },
});

// Função para testar endpoints
async function testEndpoint(
  endpoint,
  params = {},
  description,
  method = "GET"
) {
  console.log(`\n🔍 Testando: ${description}`);
  console.log(`📍 Endpoint: ${endpoint}`);
  console.log(`📋 Método: ${method}`);
  if (Object.keys(params).length > 0) {
    console.log(`📋 Parâmetros:`, params);
  }

  try {
    const response = await apiClient.request({
      method,
      url: endpoint,
      params: method === "GET" ? params : undefined,
      data: method !== "GET" ? params : undefined,
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

// Testes específicos para a API SportsGameOdds
async function runAPITests() {
  console.log("🎮 INICIANDO TESTES DA API SPORTS GAME ODDS");
  console.log("=".repeat(50));

  const results = {};

  // Teste 1: Verificar status da API
  results.status = await testEndpoint("/status", {}, "Status da API");

  // Teste 2: Listar esportes disponíveis
  results.sports = await testEndpoint("/sports", {}, "Esportes disponíveis");

  // Teste 3: Buscar especificamente por CS:GO/esports
  results.sportsCSGO = await testEndpoint(
    "/sports",
    { sport: "csgo" },
    "Esportes filtrados por CS:GO"
  );

  // Teste 4: Buscar por esports em geral
  results.sportsEsports = await testEndpoint(
    "/sports",
    { sport: "esports" },
    "Esportes filtrados por esports"
  );

  // Teste 5: Listar ligas/campeonatos
  results.leagues = await testEndpoint(
    "/leagues",
    {},
    "Ligas/campeonatos disponíveis"
  );

  // Teste 6: Buscar ligas de CS:GO
  results.leaguesCSGO = await testEndpoint(
    "/leagues",
    { sport: "csgo" },
    "Ligas de CS:GO"
  );

  // Teste 7: Jogos/odds atuais
  results.games = await testEndpoint("/games", {}, "Jogos/odds atuais");

  // Teste 8: Jogos de CS:GO
  results.gamesCSGO = await testEndpoint(
    "/games",
    { sport: "csgo" },
    "Jogos de CS:GO"
  );

  // Teste 9: Odds específicas
  results.odds = await testEndpoint("/odds", {}, "Dados de odds");

  // Teste 10: Odds de CS:GO
  results.oddsCSGO = await testEndpoint(
    "/odds",
    { sport: "csgo" },
    "Odds de CS:GO"
  );

  console.log("\n" + "=".repeat(50));
  console.log("📊 RESUMO DOS TESTES DA API SPORTS GAME ODDS");

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
        JSON.stringify(r.data).toLowerCase().includes("esports") ||
        (Array.isArray(r.data) &&
          r.data.some(
            (item) =>
              item.sport?.toLowerCase().includes("csgo") ||
              item.sport?.toLowerCase().includes("esports") ||
              item.league?.toLowerCase().includes("csgo")
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
        r.data.some((item) => item.odds || item.markets)) ||
        (typeof r.data === "object" && (r.data.odds || r.data.markets)))
  );

  if (hasOddsData) {
    console.log("✅ Dados de apostas/odds: DISPONÍVEIS");
  } else {
    console.log("❌ Dados de apostas/odds: NÃO encontrados");
  }

  // Verificar ligas/campeonatos
  const hasLeaguesData =
    results.leagues?.success &&
    Array.isArray(results.leagues.data) &&
    results.leagues.data.length > 0;

  if (hasLeaguesData) {
    console.log("✅ Ligas/campeonatos: DISPONÍVEIS");
  } else {
    console.log("❌ Ligas/campeonatos: NÃO encontrados");
  }

  // Verificar jogos
  const hasGamesData =
    results.games?.success &&
    Array.isArray(results.games.data) &&
    results.games.data.length > 0;

  if (hasGamesData) {
    console.log("✅ Jogos/partidas: DISPONÍVEIS");
  } else {
    console.log("❌ Jogos/partidas: NÃO encontrados");
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
  if (successfulTests >= 7 && hasCSGOData && hasOddsData) {
    console.log("🟢 API EXCELENTE para CS:GO Scout");
    console.log("   - Dados de CS:GO encontrados");
    console.log("   - Odds e apostas disponíveis");
    console.log("   - Alta taxa de sucesso");
  } else if (successfulTests >= 5 && (hasCSGOData || hasOddsData)) {
    console.log("🟡 API BOA com POTENCIAL");
    console.log("   - Funciona bem, pode ter dados de CS:GO");
  } else if (successfulTests >= 3) {
    console.log("🟠 API FUNCIONAL");
    console.log("   - Funciona mas limitada");
  } else {
    console.log("🔴 API COM PROBLEMAS");
    console.log("   - Poucos endpoints funcionais");
  }

  console.log("\n📋 PRÓXIMOS PASSOS:");
  console.log("1. 📊 ANALISAR dados retornados em api-test-results.json");
  console.log("2. 🎯 VERIFICAR dados específicos de CS:GO");
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
      "sportsgameodds-api-test-results.json",
      JSON.stringify(results, null, 2)
    );
    console.log(
      "📄 Resultados salvos em: sportsgameodds-api-test-results.json"
    );
  })
  .catch((error) => {
    console.error("❌ Erro geral nos testes:", error.message);
  });
