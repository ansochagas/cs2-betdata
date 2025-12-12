// TESTE OFICIAL - Seguindo EXATAMENTE as orientações da SportsGameOdds
// Usando X-Api-Key (como no exemplo oficial) e não X-API-Key

const axios = require("axios");

// Configuração EXATA da documentação oficial
const API_KEY = "45d5e1cb4bbbd5dff0c798f9211026d0";
const BASE_URL = "https://api.sportsgameodds.com/v2";

// Cliente configurado EXATAMENTE como na documentação
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    // EXATO como no exemplo: 'X-Api-Key' (não 'X-API-Key')
    "X-Api-Key": API_KEY,
    "Content-Type": "application/json",
  },
});

// Função para testar endpoint seguindo a documentação
async function testEndpointOficial(endpoint, params = {}, description) {
  console.log(`\n🔍 Testando: ${description}`);
  console.log(`📍 Endpoint: ${endpoint}`);
  console.log(`📋 Método: GET`);
  console.log(`🔐 Header usado: X-Api-Key (como na documentação)`);

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

// Testes seguindo EXATAMENTE a documentação oficial
async function runOfficialTests() {
  console.log("🎯 TESTE OFICIAL - SPORTS GAME ODDS API");
  console.log("📋 Seguindo EXATAMENTE as orientações da documentação");
  console.log("🔐 Usando: X-Api-Key (como no exemplo oficial)");
  console.log("=".repeat(60));

  const results = {};

  // Teste 1: Endpoint principal da documentação
  console.log(
    "\n📖 TESTE 1: Endpoint principal /sports/ (como na documentação)"
  );
  results.sports = await testEndpointOficial(
    "/sports/",
    {},
    "Lista de esportes - Endpoint oficial"
  );

  // Teste 2: Verificar se há esports na lista
  if (results.sports.success && Array.isArray(results.sports.data)) {
    console.log(
      `\n🎮 ANALISANDO ESPORTES ENCONTRADOS (${results.sports.data.length}):`
    );

    const esportsFound = results.sports.data.filter(
      (sport) =>
        sport.name?.toLowerCase().includes("esports") ||
        sport.name?.toLowerCase().includes("cs:go") ||
        sport.name?.toLowerCase().includes("csgo") ||
        sport.name?.toLowerCase().includes("counter") ||
        sport.name?.toLowerCase().includes("valorant") ||
        sport.name?.toLowerCase().includes("league") ||
        sport.name?.toLowerCase().includes("dota") ||
        sport.name?.toLowerCase().includes("overwatch") ||
        sport.sportID?.toLowerCase().includes("esports") ||
        sport.sportID?.toLowerCase().includes("csgo")
    );

    if (esportsFound.length > 0) {
      console.log(`🎉 ESPORTS ENCONTRADOS: ${esportsFound.length}`);
      esportsFound.forEach((sport, index) => {
        console.log(`${index + 1}. ${sport.name} (${sport.sportID})`);
      });
    } else {
      console.log(`❌ NENHUM ESPORT encontrado na lista`);
      console.log(
        `📋 Esportes disponíveis:`,
        results.sports.data.map((s) => s.name).join(", ")
      );
    }
  }

  // Teste 3: Buscar jogos/eventos (se houver)
  console.log("\n📅 TESTE 2: Buscando jogos/eventos");
  results.events = await testEndpointOficial(
    "/events/",
    {},
    "Eventos/jogos disponíveis"
  );

  // Teste 4: Verificar odds
  console.log("\n💰 TESTE 3: Verificando odds disponíveis");
  results.odds = await testEndpointOficial("/odds/", {}, "Odds disponíveis");

  // Teste 5: Verificar ligas
  console.log("\n🏆 TESTE 4: Verificando ligas/campeonatos");
  results.leagues = await testEndpointOficial(
    "/leagues/",
    {},
    "Ligas/campeonatos"
  );

  // Teste 6: Tentar buscar especificamente por CS:GO
  console.log("\n🎯 TESTE 5: Busca específica por CS:GO");
  results.csgoSearch = await testEndpointOficial(
    "/sports/",
    { search: "csgo" },
    "Busca por 'csgo'"
  );

  // Teste 7: Tentar buscar por esports
  console.log("\n🎮 TESTE 6: Busca específica por esports");
  results.esportsSearch = await testEndpointOficial(
    "/sports/",
    { search: "esports" },
    "Busca por 'esports'"
  );

  console.log("\n" + "=".repeat(60));
  console.log("📊 RESUMO DOS TESTES OFICIAIS");

  const successfulTests = Object.values(results).filter(
    (r) => r.success
  ).length;
  const totalTests = Object.keys(results).length;

  console.log(`✅ Testes bem-sucedidos: ${successfulTests}/${totalTests}`);

  // Análise final
  console.log("\n🎯 ANÁLISE FINAL PARA CS:GO SCOUT:");

  const hasEsportsData = Object.values(results).some(
    (r) =>
      r.success &&
      (JSON.stringify(r.data).toLowerCase().includes("esports") ||
        JSON.stringify(r.data).toLowerCase().includes("csgo") ||
        JSON.stringify(r.data).toLowerCase().includes("counter") ||
        (Array.isArray(r.data) &&
          r.data.some(
            (item) =>
              item.name?.toLowerCase().includes("esports") ||
              item.name?.toLowerCase().includes("csgo") ||
              item.sportID?.toLowerCase().includes("esports")
          )))
  );

  if (hasEsportsData) {
    console.log("🎉 CONFIRMADO: API TEM DADOS DE ESPORTS/CS:GO!");
    console.log("✅ Podemos usar para CS:GO Scout");
  } else {
    console.log("❌ CONFIRMADO: API NÃO tem dados de esports/CS:GO");
    console.log("💡 Focada apenas em esportes tradicionais");
  }

  // Verificar se autenticação funcionou
  const authWorked = Object.values(results).some((r) => r.success);
  if (authWorked) {
    console.log("✅ Autenticação: FUNCIONANDO (X-Api-Key correto)");
  } else {
    console.log("❌ Autenticação: FALHANDO (verificar API key)");
  }

  console.log("\n💡 CONCLUSÃO:");
  if (hasEsportsData && authWorked) {
    console.log("🟢 API adequada para CS:GO Scout!");
    console.log("✅ Dados de esports encontrados");
    console.log("✅ Autenticação funcionando");
  } else if (authWorked) {
    console.log("🟡 API acessível mas sem esports");
    console.log("❌ Não tem dados de CS:GO");
    console.log("💡 Focada em esportes tradicionais");
  } else {
    console.log("🔴 API inacessível");
    console.log("❌ Problemas de autenticação");
    console.log("💡 Verificar API key ou conta");
  }

  console.log("\n📋 PRÓXIMOS PASSOS:");
  if (hasEsportsData) {
    console.log("1. ✅ IMPLEMENTAR integração com CS:GO");
    console.log("2. 📊 TESTAR endpoints de odds para esports");
    console.log("3. 🏆 VERIFICAR dados de torneios");
    console.log("4. 💰 AVALIAR custo do plano completo");
  } else {
    console.log("1. ❌ DESCARTAR esta API");
    console.log("2. 🔄 FOCAR em APIs especializadas em esports");
    console.log("3. 🎯 TESTAR EsportsData ou SportRadar");
  }

  return results;
}

// Executar testes oficiais
runOfficialTests()
  .then((results) => {
    console.log("\n✅ Testes oficiais concluídos!");
    // Salvar resultados
    const fs = require("fs");
    fs.writeFileSync(
      "sportsgameodds-oficial-test-results.json",
      JSON.stringify(results, null, 2)
    );
    console.log(
      "📄 Resultados salvos em: sportsgameodds-oficial-test-results.json"
    );
  })
  .catch((error) => {
    console.error("❌ Erro geral nos testes oficiais:", error.message);
  });
