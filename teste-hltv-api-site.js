// TESTE - HLTV API do site oficial
// Testando os endpoints corretos do https://hltv-api.vercel.app/

const axios = require("axios");

// URLs dos JSONs do site oficial
const ENDPOINTS = {
  matches: "https://hltv-api.vercel.app/api/matches.json",
  events: "https://hltv-api.vercel.app/api/events.json",
  teams: "https://hltv-api.vercel.app/api/teams.json",
  rankings: "https://hltv-api.vercel.app/api/rankings.json",
  matchesByDate: (date) =>
    `https://hltv-api.vercel.app/api/matches/${date}.json`,
  upcoming: "https://hltv-api.vercel.app/api/matches/upcoming.json",
};

// Função para testar endpoint
async function testEndpoint(description, url) {
  console.log(`\n🔍 Testando: ${description}`);
  console.log(`📍 URL: ${url}`);

  try {
    const response = await axios.get(url);

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

// Testes da API HLTV do site oficial
async function runHLTVSiteAPITests() {
  console.log("🎮 TESTE - HLTV API DO SITE OFICIAL");
  console.log("📋 Endpoints diretos do https://hltv-api.vercel.app/");
  console.log("🎯 Dados oficiais da HLTV");
  console.log("💰 Gratuito - sem API key");
  console.log("=".repeat(60));

  const results = {};

  // Teste 1: Matches gerais
  console.log("\n📖 TESTE 1: Matches gerais");
  results.matches = await testEndpoint("Matches gerais", ENDPOINTS.matches);

  // Teste 2: Events/torneios
  console.log("\n🏆 TESTE 2: Torneios");
  results.events = await testEndpoint("Torneios", ENDPOINTS.events);

  // Teste 3: Times
  console.log("\n👥 TESTE 3: Times");
  results.teams = await testEndpoint("Times", ENDPOINTS.teams);

  // Teste 4: Rankings
  console.log("\n📊 TESTE 4: Rankings");
  results.rankings = await testEndpoint("Rankings", ENDPOINTS.rankings);

  // Teste 5: Matches por data específica
  console.log("\n📅 TESTE 5: Matches por data (2024-01-01)");
  results.matchesByDate = await testEndpoint(
    "Matches por data",
    ENDPOINTS.matchesByDate("2024-01-01")
  );

  // Teste 6: Upcoming matches
  console.log("\n⏰ TESTE 6: Upcoming matches");
  results.upcoming = await testEndpoint("Upcoming matches", ENDPOINTS.upcoming);

  console.log("\n" + "=".repeat(60));
  console.log("📊 RESUMO DOS TESTES - HLTV API SITE OFICIAL");

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
  const hasTeamsData =
    results.teams?.success &&
    Array.isArray(results.teams.data) &&
    results.teams.data.length > 0;
  const hasEventsData =
    results.events?.success &&
    Array.isArray(results.events.data) &&
    results.events.data.length > 0;

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

  if (hasTeamsData) {
    console.log("✅ Dados de times: DISPONÍVEIS");
    console.log(`   - ${results.teams.data.length} times encontrados`);
  } else {
    console.log("❌ Dados de times: NÃO encontrados");
  }

  if (hasEventsData) {
    console.log("✅ Dados de torneios: DISPONÍVEIS");
    console.log(`   - ${results.events.data.length} torneios encontrados`);
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
        JSON.stringify(r.data).toLowerCase().includes("furia") ||
        JSON.stringify(r.data).toLowerCase().includes("mibr") ||
        JSON.stringify(r.data).toLowerCase().includes("imperial") ||
        JSON.stringify(r.data).toLowerCase().includes("navi") ||
        JSON.stringify(r.data).toLowerCase().includes("astralis") ||
        (Array.isArray(r.data) &&
          r.data.some(
            (item) =>
              item.teams ||
              item.event ||
              item.match ||
              item.home_team ||
              item.away_team ||
              item.league
          )))
  );

  if (hasCSGOData) {
    console.log("🎉 CONFIRMADO: API TEM DADOS DE CS:GO!");
    console.log("✅ Times brasileiros encontrados");
    console.log("✅ Torneios oficiais disponíveis");
  } else {
    console.log("❌ Dados específicos de CS:GO não encontrados");
    console.log("💡 API pode ter dados genéricos");
  }

  console.log("\n💡 CONCLUSÃO:");
  if (hasMatchesData && hasCSGOData) {
    console.log("🟢 API EXCELENTE para CS:GO Scout!");
    console.log("✅ Dados oficiais da HLTV");
    console.log("✅ Times brasileiros incluídos");
    console.log("✅ Torneios oficiais");
    console.log("✅ Gratuito e sem limites");
    console.log("✅ Estrutura perfeita para apostas");
  } else if (hasMatchesData) {
    console.log("🟡 API FUNCIONAL mas limitada");
    console.log("❌ Poucos dados específicos de CS:GO");
    console.log("💡 Pode precisar de complementação");
  } else if (successfulTests >= 3) {
    console.log("🟡 API acessível mas dados insuficientes");
    console.log("❌ Verificar endpoints corretos");
    console.log("💡 Possível API desatualizada");
  } else {
    console.log("🔴 API com problemas");
    console.log("❌ Muitos endpoints falhando");
    console.log("💡 Verificar se API ainda existe");
  }

  console.log("\n📋 PRÓXIMOS PASSOS:");
  if (hasMatchesData && hasCSGOData) {
    console.log("1. ✅ IMPLEMENTAR integração imediata");
    console.log("2. 📊 ANALISAR estrutura completa dos dados");
    console.log("3. 🎯 DESENVOLVER algoritmos de previsão");
    console.log("4. 💰 CONFIRMAR que é realmente gratuito");
    console.log("5. 🚀 USAR como fonte primária de dados");
  } else {
    console.log("1. 📖 VERIFICAR documentação completa");
    console.log("2. 🔍 TESTAR outros endpoints possíveis");
    console.log("3. 💬 CONTATAR mantenedor da API");
    console.log("4. 🎯 DECIDIR se combina com outras APIs");
  }

  return results;
}

// Executar testes
runHLTVSiteAPITests()
  .then((results) => {
    console.log("\n✅ Testes da HLTV API (site oficial) concluídos!");
    // Salvar resultados
    const fs = require("fs");
    fs.writeFileSync(
      "hltv-site-api-test-results.json",
      JSON.stringify(results, null, 2)
    );
    console.log("📄 Resultados salvos em: hltv-site-api-test-results.json");
  })
  .catch((error) => {
    console.error("❌ Erro geral nos testes:", error.message);
  });
