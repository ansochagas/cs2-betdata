// TESTE - CS2 Match Data API (RapidAPI)
// API especializada em dados de CS2 matches

const axios = require("axios");

// Configuração da API CS2 Match Data (se disponível)
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || "YOUR_RAPIDAPI_KEY";
const BASE_URL = "https://cs2-match-data-api.p.rapidapi.com";

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "X-RapidAPI-Key": RAPIDAPI_KEY,
    "X-RapidAPI-Host": "cs2-match-data-api.p.rapidapi.com",
    "Content-Type": "application/json",
  },
});

// Função para testar endpoint
async function testEndpoint(description, endpoint, params = {}) {
  console.log(`\n🔍 Testando: ${description}`);
  console.log(`📍 Endpoint: ${endpoint}`);
  console.log(`📋 Método: GET`);

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

// Testes da API CS2 Match Data
async function runCS2APITests() {
  console.log("🎮 TESTE - CS2 MATCH DATA API (RAPIDAPI)");
  console.log("📋 API especializada em dados de CS2");
  console.log("🎯 Perfeita para CS:GO Scout");
  console.log("=".repeat(60));

  const results = {};

  // Teste 1: Verificar status da API
  console.log("\n📖 TESTE 1: Verificando conectividade");
  results.status = await testEndpoint("Teste de conectividade", "/");

  // Teste 2: Buscar upcoming matches
  console.log("\n📅 TESTE 2: Buscando upcoming matches");
  results.upcoming = await testEndpoint("Upcoming matches", "/upcoming");

  // Teste 3: Buscar past matches
  console.log("\n🏆 TESTE 3: Buscando past matches");
  results.past = await testEndpoint("Past matches", "/past");

  // Teste 4: Buscar matches por torneio
  console.log("\n🏟️ TESTE 4: Buscando matches por torneio");
  results.tournaments = await testEndpoint(
    "Matches por torneio",
    "/tournaments"
  );

  // Teste 5: Buscar times
  console.log("\n👥 TESTE 5: Buscando dados de times");
  results.teams = await testEndpoint("Dados de times", "/teams");

  // Teste 6: Buscar estatísticas
  console.log("\n📊 TESTE 6: Buscando estatísticas");
  results.stats = await testEndpoint("Estatísticas", "/stats");

  console.log("\n" + "=".repeat(60));
  console.log("📊 RESUMO DOS TESTES - CS2 MATCH DATA API");

  const successfulTests = Object.values(results).filter(
    (r) => r.success
  ).length;
  const totalTests = Object.keys(results).length;

  console.log(`✅ Testes bem-sucedidos: ${successfulTests}/${totalTests}`);

  // Análise específica para CS:GO Scout
  console.log("\n🎯 ANÁLISE PARA CS:GO SCOUT:");

  const hasUpcomingMatches =
    results.upcoming?.success &&
    Array.isArray(results.upcoming.data) &&
    results.upcoming.data.length > 0;
  const hasPastMatches =
    results.past?.success &&
    Array.isArray(results.past.data) &&
    results.past.data.length > 0;
  const hasTeamsData =
    results.teams?.success &&
    Array.isArray(results.teams.data) &&
    results.teams.data.length > 0;
  const hasTournamentsData =
    results.tournaments?.success &&
    Array.isArray(results.tournaments.data) &&
    results.tournaments.data.length > 0;

  if (hasUpcomingMatches) {
    console.log("✅ Upcoming matches: DISPONÍVEIS");
    console.log(
      `   - ${results.upcoming.data.length} jogos futuros encontrados`
    );
  } else {
    console.log("❌ Upcoming matches: NÃO encontrados");
  }

  if (hasPastMatches) {
    console.log("✅ Past matches: DISPONÍVEIS");
    console.log(`   - ${results.past.data.length} jogos passados encontrados`);
  } else {
    console.log("❌ Past matches: NÃO encontrados");
  }

  if (hasTeamsData) {
    console.log("✅ Dados de times: DISPONÍVEIS");
    console.log(`   - ${results.teams.data.length} times encontrados`);
  } else {
    console.log("❌ Dados de times: NÃO encontrados");
  }

  if (hasTournamentsData) {
    console.log("✅ Dados de torneios: DISPONÍVEIS");
    console.log(`   - ${results.tournaments.data.length} torneios encontrados`);
  } else {
    console.log("❌ Dados de torneios: NÃO encontrados");
  }

  // Verificar se tem dados estruturados de CS:GO
  const hasCSGOData = Object.values(results).some(
    (r) =>
      r.success &&
      (JSON.stringify(r.data).toLowerCase().includes("cs2") ||
        JSON.stringify(r.data).toLowerCase().includes("cs:go") ||
        JSON.stringify(r.data).toLowerCase().includes("counter") ||
        JSON.stringify(r.data).toLowerCase().includes("valorant") ||
        JSON.stringify(r.data).toLowerCase().includes("faze") ||
        JSON.stringify(r.data).toLowerCase().includes("navi") ||
        (Array.isArray(r.data) &&
          r.data.some(
            (item) => item.team1 || item.team2 || item.tournament || item.match
          )))
  );

  if (hasCSGOData) {
    console.log("🎉 CONFIRMADO: API TEM DADOS DE CS:GO!");
    console.log("✅ Dados específicos de CS2 encontrados");
  } else {
    console.log("❌ Dados específicos de CS:GO não encontrados");
  }

  console.log("\n💡 CONCLUSÃO:");
  if (hasUpcomingMatches && hasPastMatches && hasCSGOData) {
    console.log("🟢 API EXCELENTE para CS:GO Scout!");
    console.log("✅ Upcoming e past matches disponíveis");
    console.log("✅ Dados específicos de CS2");
    console.log("✅ Perfeita para apostas e analytics");
  } else if (successfulTests >= 3) {
    console.log("🟡 API PROMISSORA mas precisa de API key");
    console.log("❌ Verificar se tem dados de CS:GO");
    console.log("💡 Provavelmente precisa de subscription no RapidAPI");
  } else {
    console.log("🔴 API inacessível");
    console.log("❌ Verificar API key ou subscription");
    console.log("💡 Pode precisar de conta no RapidAPI");
  }

  console.log("\n📋 PRÓXIMOS PASSOS:");
  if (hasUpcomingMatches && hasPastMatches && hasCSGOData) {
    console.log("1. ✅ IMPLEMENTAR integração imediata");
    console.log("2. 📊 TESTAR endpoints de odds (se disponíveis)");
    console.log("3. 💰 VERIFICAR custo da subscription");
    console.log("4. 🎯 USAR para dados de CS:GO Scout");
  } else {
    console.log("1. 🔑 VERIFICAR se tem API key válida");
    console.log("2. 💳 VERIFICAR subscription no RapidAPI");
    console.log("3. 📞 CONTATAR suporte se necessário");
    console.log("4. 🎯 DECIDIR se vale o investimento");
  }

  return results;
}

// Executar testes
runCS2APITests()
  .then((results) => {
    console.log("\n✅ Testes da CS2 Match Data API concluídos!");
    // Salvar resultados
    const fs = require("fs");
    fs.writeFileSync(
      "cs2-match-data-api-test-results.json",
      JSON.stringify(results, null, 2)
    );
    console.log(
      "📄 Resultados salvos em: cs2-match-data-api-test-results.json"
    );
  })
  .catch((error) => {
    console.error("❌ Erro geral nos testes:", error.message);
  });
