// TESTE ISOLADO - Avaliação da API esportapi1.p.rapidapi.com
// NÃO MODIFICA NENHUMA PARTE DO SISTEMA EXISTENTE

const axios = require("axios");

// Configuração da API esportapi1 (informações fornecidas pelo usuário)
const RAPIDAPI_KEY = "d5da2b13a6msh434479d753d8387p12bae1jsn117c3b0f7da9";
const BASE_URL = "https://esportapi1.p.rapidapi.com";

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "X-RapidAPI-Key": RAPIDAPI_KEY,
    "X-RapidAPI-Host": "esportapi1.p.rapidapi.com",
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

// Testes específicos para a API esportapi1
async function runAPITests() {
  console.log("🚀 INICIANDO TESTES DA API ESPORTAPI1");
  console.log("=".repeat(50));

  const results = {};

  // Teste 1: Endpoint fornecido como exemplo
  results.searchATK = await testEndpoint(
    "/api/esport/search/ATK",
    "Busca por ATK (exemplo fornecido)"
  );

  // Teste 2: Buscar times CS:GO brasileiros
  results.searchFuria = await testEndpoint(
    "/api/esport/search/FURIA",
    "Busca por FURIA"
  );

  // Teste 3: Buscar NAVI
  results.searchNavi = await testEndpoint(
    "/api/esport/search/NAVI",
    "Busca por NAVI"
  );

  // Teste 4: Buscar outros times brasileiros
  results.searchMibr = await testEndpoint(
    "/api/esport/search/MIBR",
    "Busca por MIBR"
  );

  // Teste 5: Buscar jogador
  results.searchYuurih = await testEndpoint(
    "/api/esport/search/yuurih",
    "Busca por jogador yuurih"
  );

  // Teste 6: Tentar outros endpoints comuns
  results.matches = await testEndpoint(
    "/api/esport/matches",
    "Partidas (se existir)"
  );

  // Teste 7: Times (se existir)
  results.teams = await testEndpoint("/api/esport/teams", "Times (se existir)");

  // Teste 8: Torneios (se existir)
  results.tournaments = await testEndpoint(
    "/api/esport/tournaments",
    "Torneios (se existir)"
  );

  console.log("\n" + "=".repeat(50));
  console.log("📊 RESUMO DOS TESTES DA API ESPORTAPI1");

  const successfulTests = Object.values(results).filter(
    (r) => r.success
  ).length;
  const totalTests = Object.keys(results).length;

  console.log(`✅ Testes bem-sucedidos: ${successfulTests}/${totalTests}`);

  // Análise específica para CS:GO Scout
  console.log("\n🎯 ANÁLISE PARA CS:GO SCOUT:");

  // Verificar se encontrou times brasileiros
  const foundBrazilianTeams = ["searchFuria", "searchMibr"].some(
    (key) => results[key]?.success && results[key]?.data
  );

  if (foundBrazilianTeams) {
    console.log("✅ Times brasileiros: ENCONTRADOS (FURIA, MIBR, etc.)");
  } else {
    console.log("❌ Times brasileiros: NÃO encontrados");
  }

  // Verificar cenário competitivo
  if (results.searchNavi?.success) {
    console.log(
      "✅ Cenário competitivo: CONFIRMADO (NAVI, times internacionais)"
    );
  } else {
    console.log("❌ Cenário competitivo: LIMITADO ou ausente");
  }

  // Verificar estrutura de dados
  const hasStructuredData = Object.values(results).some(
    (r) =>
      r.success && typeof r.data === "object" && Object.keys(r.data).length > 0
  );

  if (hasStructuredData) {
    console.log("✅ Estrutura de dados: ESTRUTURADA (JSON válido)");
  } else {
    console.log("❌ Estrutura de dados: PROBLEMÁTICA");
  }

  // Verificar se é API de busca ou dados completos
  const isSearchAPI =
    Object.keys(results).filter(
      (key) => key.startsWith("search") && results[key].success
    ).length >= 3;

  if (isSearchAPI) {
    console.log(
      "✅ Tipo de API: BUSCA (pode ser expandida para dados completos)"
    );
  } else {
    console.log("❌ Tipo de API: LIMITADA (apenas busca básica)");
  }

  console.log("\n💡 AVALIAÇÃO GERAL:");
  if (successfulTests >= 5 && foundBrazilianTeams) {
    console.log("🟢 API MUITO PROMISSORA para CS:GO Scout");
    console.log("   - Times brasileiros encontrados");
    console.log("   - Cenário competitivo presente");
    console.log("   - Boa taxa de sucesso nos testes");
  } else if (successfulTests >= 3) {
    console.log("🟡 API PROMISSORA com LIMITAÇÕES");
    console.log("   - Funciona mas pode precisar de expansão");
  } else {
    console.log("🔴 API NÃO ADEQUADA para CS:GO Scout");
    console.log("   - Poucos endpoints funcionais");
    console.log("   - Dados insuficientes");
  }

  console.log("\n📋 PRÓXIMOS PASSOS:");
  console.log("1. 📊 ANALISAR dados retornados em api-test-results.json");
  console.log("2. 🎯 VERIFICAR se inclui estatísticas (kills, rounds, mapas)");
  console.log("3. 🏆 AVALIAR cenário competitivo completo");
  console.log("4. 💰 COMPARAR custo-benefício com alternativas");
  console.log("5. ✅ DECIDIR contratação ou buscar EsportsData/SportRadar");

  return results;
}

// Executar testes
runAPITests()
  .then((results) => {
    console.log("\n✅ Testes concluídos!");
    // Salvar resultados em arquivo se necessário
    const fs = require("fs");
    fs.writeFileSync("api-test-results.json", JSON.stringify(results, null, 2));
    console.log("📄 Resultados salvos em: api-test-results.json");
  })
  .catch((error) => {
    console.error("❌ Erro geral nos testes:", error.message);
  });
