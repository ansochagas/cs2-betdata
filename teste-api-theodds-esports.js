// TESTE ESPECÍFICO - Busca por Esports/CS:GO na API The Odds
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

// Função para procurar esports nos dados
function findEsportsInData(data) {
  if (!Array.isArray(data)) return [];

  const esportsKeywords = [
    "esports",
    "e-sports",
    "e sports",
    "cs:go",
    "csgo",
    "counter-strike",
    "counter strike",
    "valorant",
    "league of legends",
    "lol",
    "dota",
    "dota 2",
    "overwatch",
    "rainbow six",
    "siege",
    "r6",
    "apex legends",
    "apex",
    "fortnite",
    "pubg",
  ];

  return data.filter((sport) => {
    const sportText = `${sport.key} ${sport.title} ${
      sport.description || ""
    }`.toLowerCase();
    return esportsKeywords.some((keyword) => sportText.includes(keyword));
  });
}

// Testes específicos para encontrar esports
async function runEsportsTests() {
  console.log("🎮 BUSCA ESPECÍFICA POR ESPORTS/CS:GO NA API THE ODDS");
  console.log("=".repeat(60));

  const results = {};

  // Teste 1: Listar TODOS os esportes disponíveis
  console.log("\n📋 PASSO 1: Listando todos os esportes disponíveis...");
  results.allSports = await testEndpoint(
    "/v4/sports",
    {},
    "Todos os esportes disponíveis"
  );

  if (results.allSports.success && Array.isArray(results.allSports.data)) {
    console.log(
      `\n🎯 ENCONTRADOS ${results.allSports.data.length} ESPORTES NO TOTAL`
    );

    // Procurar por esports nos dados
    const esportsFound = findEsportsInData(results.allSports.data);

    console.log(`\n🎮 ESPORTS/CS:GO ENCONTRADOS: ${esportsFound.length}`);
    if (esportsFound.length > 0) {
      console.log("=".repeat(50));
      esportsFound.forEach((sport, index) => {
        console.log(`${index + 1}. ${sport.title} (${sport.key})`);
        console.log(`   Descrição: ${sport.description}`);
        console.log(`   Ativo: ${sport.active ? "✅" : "❌"}`);
        console.log(`   Outrights: ${sport.has_outrights ? "✅" : "❌"}`);
        console.log("");
      });
    } else {
      console.log("❌ NENHUM ESPORT ENCONTRADO NOS DADOS!");
    }

    // Teste 2: Tentar IDs específicos que podem existir
    const possibleEsportsIds = [
      "esports",
      "e-sports",
      "e_sports",
      "csgo",
      "cs:go",
      "counter_strike",
      "counter-strike",
      "valorant",
      "league_of_legends",
      "lol",
      "dota2",
      "dota_2",
      "overwatch",
      "rainbow_six",
      "r6_siege",
    ];

    console.log("\n🔍 PASSO 2: Testando IDs específicos de esports...");

    for (const sportId of possibleEsportsIds) {
      console.log(`\n🎯 Testando ID: ${sportId}`);
      const oddsResult = await testEndpoint(
        `/v4/sports/${sportId}/odds`,
        {
          regions: "us",
          markets: "h2h",
          oddsFormat: "decimal",
        },
        `Odds para ${sportId}`
      );

      if (oddsResult.success) {
        console.log(`🎉 ENCONTRADO! ${sportId} existe na API!`);
        results.foundEsports = results.foundEsports || [];
        results.foundEsports.push({ id: sportId, data: oddsResult.data });
      } else {
        console.log(`❌ ${sportId} não encontrado`);
      }
    }

    // Teste 3: Verificar se há esports na lista geral
    console.log("\n📊 PASSO 3: Análise detalhada dos esportes encontrados...");

    const allSports = results.allSports.data;
    const sportsByGroup = {};

    allSports.forEach((sport) => {
      const group = sport.group || "Outros";
      if (!sportsByGroup[group]) {
        sportsByGroup[group] = [];
      }
      sportsByGroup[group].push(sport);
    });

    console.log("\n🏷️ ESPORTES AGRUPADOS POR CATEGORIA:");
    Object.keys(sportsByGroup).forEach((group) => {
      const sports = sportsByGroup[group];
      console.log(`\n${group} (${sports.length} esportes):`);
      sports.slice(0, 3).forEach((sport) => {
        console.log(`  - ${sport.title} (${sport.key})`);
      });
      if (sports.length > 3) {
        console.log(`  ... e mais ${sports.length - 3} esportes`);
      }
    });
  } else {
    console.log("❌ Não foi possível obter a lista de esportes!");
  }

  console.log("\n" + "=".repeat(60));
  console.log("📊 RESUMO DA BUSCA POR ESPORTS");

  const hasEsports = results.foundEsports && results.foundEsports.length > 0;

  if (hasEsports) {
    console.log("🎉 ESPORTS ENCONTRADOS NA API!");
    console.log(`✅ ${results.foundEsports.length} esporte(s) identificado(s)`);
    results.foundEsports.forEach((esport) => {
      console.log(`   - ${esport.id}`);
    });
  } else {
    console.log("❌ NENHUM ESPORT ENCONTRADO");
    console.log("💡 A API The Odds não inclui esports/CS:GO");
  }

  console.log("\n💡 CONCLUSÃO:");
  if (hasEsports) {
    console.log("🟢 API adequada para CS:GO Scout!");
    console.log("✅ Podemos usar para dados de esports");
  } else {
    console.log("🔴 API NÃO adequada para CS:GO Scout");
    console.log("❌ Focada apenas em esportes tradicionais");
    console.log("💡 Precisamos de APIs especializadas em esports");
  }

  return results;
}

// Executar testes
runEsportsTests()
  .then((results) => {
    console.log("\n✅ Busca por esports concluída!");
    // Salvar resultados em arquivo se necessário
    const fs = require("fs");
    fs.writeFileSync(
      "theodds-esports-search-results.json",
      JSON.stringify(results, null, 2)
    );
    console.log("📄 Resultados salvos em: theodds-esports-search-results.json");
  })
  .catch((error) => {
    console.error("❌ Erro na busca por esports:", error.message);
  });
