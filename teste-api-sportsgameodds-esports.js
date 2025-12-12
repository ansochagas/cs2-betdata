// TESTE ESPECÍFICO - Busca por Esports/CS:GO na API SportsGameOdds
// NÃO MODIFICA NENHUMA PARTE DO SISTEMA EXISTENTE

const axios = require("axios");

// Configuração da API SportsGameOdds
const API_KEY = "45d5e1cb4bbbd5dff0c798f9211026d0";
const BASE_URL = "https://api.sportsgameodds.com/v2";

// Diferentes configurações de autenticação para testar
const authConfigs = [
  {
    name: "Bearer Token",
    config: {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
    },
  },
  {
    name: "API Key Header",
    config: {
      headers: {
        "X-API-Key": API_KEY,
        "Content-Type": "application/json",
      },
    },
  },
  {
    name: "API Key Query",
    config: {
      params: { apiKey: API_KEY },
      headers: { "Content-Type": "application/json" },
    },
  },
  {
    name: "Token Query",
    config: {
      params: { token: API_KEY },
      headers: { "Content-Type": "application/json" },
    },
  },
];

// Função para testar endpoint com diferentes auth
async function testEndpointWithAuth(
  endpoint,
  params = {},
  description,
  method = "GET"
) {
  console.log(`\n🔍 Testando: ${description}`);
  console.log(`📍 Endpoint: ${endpoint}`);
  console.log(`📋 Método: ${method}`);

  for (const auth of authConfigs) {
    console.log(`\n   🔐 Testando auth: ${auth.name}`);

    try {
      const response = await axios.request({
        method,
        url: `${BASE_URL}${endpoint}`,
        ...auth.config,
        params:
          method === "GET" ? { ...auth.config.params, ...params } : params,
        data: method !== "GET" ? params : undefined,
        timeout: 10000,
      });

      console.log(`   ✅ Status: ${response.status} (${auth.name})`);
      console.log(`   📊 Dados recebidos:`);

      if (Array.isArray(response.data)) {
        console.log(`      - Tipo: Array com ${response.data.length} itens`);
        if (response.data.length > 0) {
          console.log(
            `      - Primeiro item:`,
            JSON.stringify(response.data[0], null, 2)
          );
        }
      } else if (typeof response.data === "object") {
        console.log(`      - Tipo: Object`);
        console.log(`      - Chaves:`, Object.keys(response.data));
        console.log(`      - Dados:`, JSON.stringify(response.data, null, 2));
      } else {
        console.log(`      - Conteúdo:`, response.data);
      }

      return { success: true, data: response.data, auth: auth.name };
    } catch (error) {
      console.log(
        `   ❌ ${auth.name}: ${error.response?.status || error.message}`
      );
      if (error.response?.status === 401) {
        console.log(`      - API key rejeitada`);
      } else if (error.response?.status === 404) {
        console.log(`      - Endpoint não encontrado`);
      }
    }
  }

  return { success: false, error: "Todas as autenticações falharam" };
}

// Busca específica por esports
async function runEsportsTests() {
  console.log("🎮 BUSCA ESPECÍFICA POR ESPORTS NA API SPORTS GAME ODDS");
  console.log("=".repeat(60));

  const results = {};

  // Teste 1: Verificar documentação/status
  console.log("\n📖 PASSO 1: Verificando documentação e status...");
  results.docs = await testEndpointWithAuth(
    "/",
    {},
    "Página inicial/Documentação"
  );

  // Teste 2: Buscar por ESPORTS (como sugerido pelo usuário)
  console.log("\n🎯 PASSO 2: Buscando por ESPORTS...");
  results.esports = await testEndpointWithAuth(
    "/esports",
    {},
    "Endpoint ESPORTS direto"
  );

  // Teste 3: Buscar esportes com filtro ESPORTS
  results.sportsEsports = await testEndpointWithAuth(
    "/sports",
    { sport: "ESPORTS" },
    "Esportes filtrados por ESPORTS"
  );

  // Teste 4: Buscar por CS:GO especificamente
  results.sportsCSGO = await testEndpointWithAuth(
    "/sports",
    { sport: "CSGO" },
    "Esportes filtrados por CSGO"
  );

  // Teste 5: Buscar por COUNTER STRIKE
  results.sportsCounterStrike = await testEndpointWithAuth(
    "/sports",
    { sport: "COUNTER STRIKE" },
    "Esportes filtrados por COUNTER STRIKE"
  );

  // Teste 6: Tentar endpoint de jogos com ESPORTS
  results.gamesEsports = await testEndpointWithAuth(
    "/games",
    { sport: "ESPORTS" },
    "Jogos de ESPORTS"
  );

  // Teste 7: Tentar endpoint de odds com ESPORTS
  results.oddsEsports = await testEndpointWithAuth(
    "/odds",
    { sport: "ESPORTS" },
    "Odds de ESPORTS"
  );

  // Teste 8: Verificar se há endpoint de torneios
  results.tournaments = await testEndpointWithAuth(
    "/tournaments",
    {},
    "Torneios disponíveis"
  );

  // Teste 9: Buscar torneios de ESPORTS
  results.tournamentsEsports = await testEndpointWithAuth(
    "/tournaments",
    { sport: "ESPORTS" },
    "Torneios de ESPORTS"
  );

  // Teste 10: Tentar endpoints alternativos
  const alternativeEndpoints = [
    "/leagues",
    "/competitions",
    "/matches",
    "/events",
    "/fixtures",
  ];

  console.log("\n🔍 PASSO 3: Testando endpoints alternativos...");
  for (const endpoint of alternativeEndpoints) {
    console.log(`\n   Testando: ${endpoint}`);
    const result = await testEndpointWithAuth(
      endpoint,
      {},
      `Endpoint ${endpoint}`
    );
    if (result.success) {
      results[`alt_${endpoint.replace("/", "")}`] = result;
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("📊 RESUMO DA BUSCA POR ESPORTS");

  const successfulTests = Object.values(results).filter(
    (r) => r.success
  ).length;
  const totalTests = Object.keys(results).length;

  console.log(`✅ Testes bem-sucedidos: ${successfulTests}/${totalTests}`);

  // Análise específica
  console.log("\n🎯 ANÁLISE PARA CS:GO SCOUT:");

  const hasEsportsData = Object.values(results).some(
    (r) =>
      r.success &&
      (JSON.stringify(r.data).toLowerCase().includes("esports") ||
        JSON.stringify(r.data).toLowerCase().includes("csgo") ||
        JSON.stringify(r.data).toLowerCase().includes("counter") ||
        (Array.isArray(r.data) &&
          r.data.some(
            (item) =>
              item.sport?.toLowerCase().includes("esports") ||
              item.sport?.toLowerCase().includes("csgo") ||
              item.name?.toLowerCase().includes("esports")
          )))
  );

  if (hasEsportsData) {
    console.log("🎉 ESPORTS/CS:GO ENCONTRADOS!");
    console.log("✅ API tem dados de esports");
  } else {
    console.log("❌ ESPORTS/CS:GO NÃO encontrados");
    console.log("💡 API pode não ter esports ou estar inacessível");
  }

  // Verificar autenticação
  const authSuccess = Object.values(results).some((r) => r.success);
  if (authSuccess) {
    console.log("✅ Autenticação: FUNCIONANDO (pelo menos uma configuração)");
  } else {
    console.log("❌ Autenticação: FALHANDO (todas as configurações)");
    console.log("💡 Verificar se API key está correta ou expirada");
  }

  console.log("\n💡 CONCLUSÃO:");
  if (hasEsportsData && authSuccess) {
    console.log("🟢 API adequada para CS:GO Scout!");
    console.log("✅ Dados de esports encontrados");
    console.log("✅ Autenticação funcionando");
  } else if (authSuccess) {
    console.log("🟡 API acessível mas sem esports");
    console.log("❌ Não tem dados de CS:GO");
    console.log("💡 Focada em esportes tradicionais");
  } else {
    console.log("🔴 API inacessível");
    console.log("❌ Problemas de autenticação");
    console.log("💡 Verificar API key ou documentação");
  }

  return results;
}

// Executar testes
runEsportsTests()
  .then((results) => {
    console.log("\n✅ Busca por esports concluída!");
    // Salvar resultados em arquivo
    const fs = require("fs");
    fs.writeFileSync(
      "sportsgameodds-esports-search-results.json",
      JSON.stringify(results, null, 2)
    );
    console.log(
      "📄 Resultados salvos em: sportsgameodds-esports-search-results.json"
    );
  })
  .catch((error) => {
    console.error("❌ Erro na busca por esports:", error.message);
  });
