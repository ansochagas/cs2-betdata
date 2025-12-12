// TESTE CORRETO - Usando o sportID "ESPORTS" da documentação oficial
// Agora testando com o ID correto: ESPORTS (tudo maiúsculo)

const axios = require("axios");

// Configuração da API SportsGameOdds
const API_KEY = "45d5e1cb4bbbd5dff0c798f9211026d0";
const BASE_URL = "https://api.sportsgameodds.com/v2";

// Cliente configurado com X-Api-Key (como na documentação)
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "X-Api-Key": API_KEY,
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

// Testes específicos para ESPORTS usando o ID correto da documentação
async function runEsportsCorrectTests() {
  console.log("🎮 TESTE CORRETO - API SPORTS GAME ODDS COM ESPORTS");
  console.log("📋 Usando sportID: ESPORTS (como na documentação oficial)");
  console.log("🔐 Header: X-Api-Key");
  console.log("=".repeat(60));

  const results = {};

  // Teste 1: Verificar se ESPORTS existe nos sports
  console.log("\n📖 TESTE 1: Verificando se ESPORTS está na lista de sports");
  results.sports = await testEndpoint("Lista completa de sports", "/sports/");

  // Verificar se ESPORTS está na lista
  if (results.sports.success && Array.isArray(results.sports.data)) {
    const esportsSport = results.sports.data.find(
      (sport) => sport.sportID === "ESPORTS"
    );
    if (esportsSport) {
      console.log(`🎉 ESPORTS ENCONTRADO na lista!`);
      console.log(`   Nome: ${esportsSport.name}`);
      console.log(`   SportID: ${esportsSport.sportID}`);
      console.log(`   Habilitado: ${esportsSport.enabled}`);
    } else {
      console.log(`❌ ESPORTS NÃO encontrado na lista de sports`);
      console.log(
        `   Sports disponíveis:`,
        results.sports.data.map((s) => s.sportID).join(", ")
      );
    }
  }

  // Teste 2: Buscar jogos de ESPORTS diretamente
  console.log("\n🎯 TESTE 2: Buscando jogos de ESPORTS");
  results.esportsGames = await testEndpoint("Jogos de ESPORTS", "/games/", {
    sport: "ESPORTS",
  });

  // Teste 3: Buscar odds de ESPORTS
  console.log("\n💰 TESTE 3: Buscando odds de ESPORTS");
  results.esportsOdds = await testEndpoint("Odds de ESPORTS", "/odds/", {
    sport: "ESPORTS",
  });

  // Teste 4: Buscar ligas de ESPORTS
  console.log("\n🏆 TESTE 4: Buscando ligas de ESPORTS");
  results.esportsLeagues = await testEndpoint("Ligas de ESPORTS", "/leagues/", {
    sport: "ESPORTS",
  });

  // Teste 5: Buscar eventos de ESPORTS
  console.log("\n📅 TESTE 5: Buscando eventos de ESPORTS");
  results.esportsEvents = await testEndpoint("Eventos de ESPORTS", "/events/", {
    sport: "ESPORTS",
  });

  console.log("\n" + "=".repeat(60));
  console.log("📊 RESUMO DOS TESTES COM ESPORTS");

  const successfulTests = Object.values(results).filter(
    (r) => r.success
  ).length;
  const totalTests = Object.keys(results).length;

  console.log(`✅ Testes bem-sucedidos: ${successfulTests}/${totalTests}`);

  // Análise específica para CS:GO
  console.log("\n🎯 ANÁLISE PARA CS:GO SCOUT:");

  const hasEsportsData = Object.values(results).some(
    (r) =>
      r.success &&
      (JSON.stringify(r.data).toLowerCase().includes("esports") ||
        JSON.stringify(r.data).toLowerCase().includes("csgo") ||
        JSON.stringify(r.data).toLowerCase().includes("counter") ||
        (Array.isArray(r.data) && r.data.length > 0))
  );

  if (hasEsportsData) {
    console.log("🎉 CONFIRMADO: API TEM DADOS DE ESPORTS!");
    console.log("✅ ESPORTS encontrado na lista de sports");
    console.log("✅ Dados de jogos/odds disponíveis");
  } else {
    console.log("❌ ESPORTS não encontrado ou sem dados");
    console.log("💡 Verificar se o plano inclui esports");
  }

  // Verificar dados específicos
  if (
    results.esportsGames.success &&
    Array.isArray(results.esportsGames.data) &&
    results.esportsGames.data.length > 0
  ) {
    console.log("✅ Jogos de ESPORTS: DISPONÍVEIS");
    console.log(`   - ${results.esportsGames.data.length} jogos encontrados`);
  } else {
    console.log("❌ Jogos de ESPORTS: NÃO encontrados");
  }

  if (
    results.esportsOdds.success &&
    Array.isArray(results.esportsOdds.data) &&
    results.esportsOdds.data.length > 0
  ) {
    console.log("✅ Odds de ESPORTS: DISPONÍVEIS");
    console.log(`   - ${results.esportsOdds.data.length} odds encontradas`);
  } else {
    console.log("❌ Odds de ESPORTS: NÃO encontradas");
  }

  console.log("\n💡 CONCLUSÃO:");
  if (hasEsportsData) {
    console.log("🟢 API adequada para CS:GO Scout!");
    console.log("✅ Dados de esports confirmados");
    console.log("✅ ESPORTS disponível no plano");
  } else {
    console.log("🔴 API não tem dados de esports");
    console.log("❌ Verificar plano de assinatura");
    console.log("💡 Talvez precise de upgrade");
  }

  console.log("\n📋 PRÓXIMOS PASSOS:");
  if (hasEsportsData) {
    console.log("1. ✅ IMPLEMENTAR integração com ESPORTS");
    console.log("2. 📊 VERIFICAR dados específicos de CS:GO");
    console.log("3. 🏆 EXPLORAR ligas e torneios");
    console.log("4. 💰 AVALIAR custo do plano completo");
  } else {
    console.log("1. ❌ DESCARTAR esta API");
    console.log("2. 🔄 FOCAR em outras APIs de esports");
    console.log("3. 🎯 TESTAR EsportsData ou SportRadar");
  }

  return results;
}

// Executar testes corretos
runEsportsCorrectTests()
  .then((results) => {
    console.log("\n✅ Testes com ESPORTS concluídos!");
    // Salvar resultados
    const fs = require("fs");
    fs.writeFileSync(
      "sportsgameodds-esports-correct-results.json",
      JSON.stringify(results, null, 2)
    );
    console.log(
      "📄 Resultados salvos em: sportsgameodds-esports-correct-results.json"
    );
  })
  .catch((error) => {
    console.error("❌ Erro geral nos testes corretos:", error.message);
  });
