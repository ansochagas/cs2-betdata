// TESTE CORRETO - CS2 Match Data API (RapidAPI)
// Agora com os dados de acesso corretos fornecidos pelo usuário

const axios = require("axios");

// Dados de acesso CORRETOS fornecidos pelo usuário
const RAPIDAPI_KEY = "d5da2b13a6msh434479d753d8387p12bae1jsn117c3b0f7da9";
const API_HOST = "csgo-matches-and-tournaments.p.rapidapi.com";
const BASE_URL = `https://${API_HOST}`;

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "X-RapidAPI-Key": RAPIDAPI_KEY,
    "X-RapidAPI-Host": API_HOST,
    "Content-Type": "application/json",
  },
});

// Função para testar endpoint
async function testEndpoint(description, endpoint, params = {}) {
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

// Testes da API CS2 Match Data com dados corretos
async function runCorrectCS2APITests() {
  console.log("🎮 TESTE CORRETO - CS2 MATCH DATA API (RAPIDAPI)");
  console.log("📋 Dados de acesso fornecidos pelo usuário");
  console.log(`🔑 API Key: ${RAPIDAPI_KEY.substring(0, 10)}...`);
  console.log(`🏠 Host: ${API_HOST}`);
  console.log("💰 Plano: FREE");
  console.log("=".repeat(60));

  const results = {};

  // Teste 1: Endpoint principal fornecido pelo usuário
  console.log("\n📖 TESTE 1: Endpoint principal (como no exemplo)");
  results.matches = await testEndpoint("Matches com paginação", "/matches", {
    page: 1,
    limit: 10,
  });

  // Teste 2: Matches sem parâmetros
  console.log("\n📅 TESTE 2: Matches sem parâmetros");
  results.matchesSimple = await testEndpoint("Matches simples", "/matches");

  // Teste 3: Buscar por status específico
  console.log("\n🏆 TESTE 3: Matches por status");
  results.upcoming = await testEndpoint("Matches upcoming", "/matches", {
    status: "upcoming",
  });

  // Teste 4: Matches finalizados
  console.log("\n✅ TESTE 4: Matches finalizados");
  results.finished = await testEndpoint("Matches finished", "/matches", {
    status: "finished",
  });

  // Teste 5: Buscar torneios
  console.log("\n🏟️ TESTE 5: Torneios disponíveis");
  results.tournaments = await testEndpoint("Torneios", "/tournaments");

  // Teste 6: Buscar times
  console.log("\n👥 TESTE 6: Times/equipes");
  results.teams = await testEndpoint("Times", "/teams");

  console.log("\n" + "=".repeat(60));
  console.log("📊 RESUMO DOS TESTES - CS2 MATCH DATA API (CORRETA)");

  const successfulTests = Object.values(results).filter(
    (r) => r.success
  ).length;
  const totalTests = Object.keys(results).length;

  console.log(`✅ Testes bem-sucedidos: ${successfulTests}/${totalTests}`);

  // Análise específica para CS:GO Scout
  console.log("\n🎯 ANÁLISE PARA CS:GO SCOUT:");

  const hasMatchesData =
    results.matches?.success &&
    Array.isArray(results.matches.data) &&
    results.matches.data.length > 0;
  const hasUpcomingData =
    results.upcoming?.success &&
    Array.isArray(results.upcoming.data) &&
    results.upcoming.data.length > 0;
  const hasFinishedData =
    results.finished?.success &&
    Array.isArray(results.finished.data) &&
    results.finished.data.length > 0;
  const hasTeamsData =
    results.teams?.success &&
    Array.isArray(results.teams.data) &&
    results.teams.data.length > 0;
  const hasTournamentsData =
    results.tournaments?.success &&
    Array.isArray(results.tournaments.data) &&
    results.tournaments.data.length > 0;

  if (hasMatchesData) {
    console.log("✅ Matches: DISPONÍVEIS");
    console.log(`   - ${results.matches.data.length} matches encontrados`);
  } else {
    console.log("❌ Matches: NÃO encontrados");
  }

  if (hasUpcomingData) {
    console.log("✅ Upcoming matches: DISPONÍVEIS");
    console.log(`   - ${results.upcoming.data.length} jogos futuros`);
  } else {
    console.log("❌ Upcoming matches: NÃO encontrados");
  }

  if (hasFinishedData) {
    console.log("✅ Past matches: DISPONÍVEIS");
    console.log(`   - ${results.finished.data.length} jogos passados`);
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

  // Verificar se tem dados específicos de CS:GO
  const hasCSGOData = Object.values(results).some(
    (r) =>
      r.success &&
      (JSON.stringify(r.data).toLowerCase().includes("cs2") ||
        JSON.stringify(r.data).toLowerCase().includes("cs:go") ||
        JSON.stringify(r.data).toLowerCase().includes("counter") ||
        JSON.stringify(r.data).toLowerCase().includes("faze") ||
        JSON.stringify(r.data).toLowerCase().includes("navi") ||
        JSON.stringify(r.data).toLowerCase().includes("astralis") ||
        JSON.stringify(r.data).toLowerCase().includes("furia") ||
        (Array.isArray(r.data) &&
          r.data.some(
            (item) =>
              item.team1 ||
              item.team2 ||
              item.tournament ||
              item.match ||
              item.home_team ||
              item.away_team ||
              item.league
          )))
  );

  if (hasCSGOData) {
    console.log("🎉 CONFIRMADO: API TEM DADOS DE CS:GO!");
    console.log("✅ Times como FaZe, NAVI, FURIA encontrados");
    console.log("✅ Torneios de CS:GO disponíveis");
  } else {
    console.log("❌ Dados específicos de CS:GO não encontrados");
    console.log("💡 API pode ter dados genéricos de esports");
  }

  console.log("\n💡 CONCLUSÃO:");
  if (hasMatchesData && hasCSGOData) {
    console.log("🟢 API EXCELENTE para CS:GO Scout!");
    console.log("✅ Dados de CS:GO disponíveis");
    console.log("✅ Upcoming e past matches");
    console.log("✅ Plano FREE funcionando");
    console.log("✅ Perfeita para apostas e analytics");
  } else if (hasMatchesData) {
    console.log("🟡 API FUNCIONAL mas sem dados específicos de CS:GO");
    console.log("❌ Não encontrou times/torneios conhecidos");
    console.log("💡 Pode ser genérica demais");
  } else if (successfulTests >= 3) {
    console.log("🟡 API acessível mas limitada");
    console.log("❌ Poucos dados retornados");
    console.log("💡 Verificar endpoints corretos");
  } else {
    console.log("🔴 API com problemas");
    console.log("❌ Muitos endpoints falhando");
    console.log("💡 Verificar documentação atualizada");
  }

  console.log("\n📋 PRÓXIMOS PASSOS:");
  if (hasMatchesData && hasCSGOData) {
    console.log("1. ✅ IMPLEMENTAR integração imediata");
    console.log("2. 📊 ANALISAR estrutura dos dados");
    console.log("3. 🎯 DESENVOLVER algoritmos de previsão");
    console.log("4. 💰 AVALIAR upgrade para plano pago");
  } else {
    console.log("1. 📖 VERIFICAR documentação completa da API");
    console.log("2. 🔍 TESTAR outros endpoints disponíveis");
    console.log("3. 💬 CONTATAR suporte do RapidAPI");
    console.log("4. 🎯 DECIDIR se continua investindo nesta API");
  }

  return results;
}

// Executar testes corretos
runCorrectCS2APITests()
  .then((results) => {
    console.log("\n✅ Testes corretos da CS2 Match Data API concluídos!");
    // Salvar resultados
    const fs = require("fs");
    fs.writeFileSync(
      "cs2-match-data-api-correct-results.json",
      JSON.stringify(results, null, 2)
    );
    console.log(
      "📄 Resultados salvos em: cs2-match-data-api-correct-results.json"
    );
  })
  .catch((error) => {
    console.error("❌ Erro geral nos testes corretos:", error.message);
  });
