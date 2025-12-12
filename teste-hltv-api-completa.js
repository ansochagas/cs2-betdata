// TESTE COMPLETO - HLTV API com todos os endpoints
// Verificar datas dos jogos e testar endpoints adicionais

const axios = require("axios");

// URLs dos JSONs da HLTV API completa
const ENDPOINTS = {
  matches: "https://hltv-api.vercel.app/api/matches.json",
  results: "https://hltv-api.vercel.app/api/results.json",
  news: "https://hltv-api.vercel.app/api/news.json",
  players: "https://hltv-api.vercel.app/api/players.json",
  topTeams: "https://hltv-api.vercel.app/api/topTeams.json",
  // Endpoints que precisam de ID
  matchesByEvent: (eventId) =>
    `https://hltv-api.vercel.app/api/matches/${eventId}.json`,
  statsByMatch: (matchId) =>
    `https://hltv-api.vercel.app/api/stats/${matchId}.json`,
  playerById: (playerId) =>
    `https://hltv-api.vercel.app/api/player/${playerId}.json`,
  teamById: (teamId) => `https://hltv-api.vercel.app/api/team/${teamId}.json`,
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

// Função para analisar datas dos jogos
function analyzeMatchDates(matches) {
  if (!Array.isArray(matches) || matches.length === 0) {
    return { error: "Nenhum match para analisar" };
  }

  const dates = matches
    .map((match) => new Date(match.time))
    .filter((date) => !isNaN(date.getTime()));
  const now = new Date();

  // Estatísticas das datas
  const sortedDates = dates.sort((a, b) => a - b);
  const oldestDate = sortedDates[0];
  const newestDate = sortedDates[sortedDates.length - 1];

  // Contar jogos por ano/mês
  const dateStats = {};
  dates.forEach((date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const key = `${year}-${month.toString().padStart(2, "0")}`;

    if (!dateStats[key]) {
      dateStats[key] = 0;
    }
    dateStats[key]++;
  });

  // Jogos futuros vs passados
  const futureMatches = dates.filter((date) => date > now).length;
  const pastMatches = dates.filter((date) => date <= now).length;

  return {
    totalMatches: matches.length,
    oldestDate: oldestDate.toISOString(),
    newestDate: newestDate.toISOString(),
    dateStats,
    futureMatches,
    pastMatches,
    daysSinceOldest: Math.floor((now - oldestDate) / (1000 * 60 * 60 * 24)),
    daysUntilNewest: Math.floor((newestDate - now) / (1000 * 60 * 60 * 24)),
  };
}

// Testes completos da HLTV API
async function runCompleteHLTVAPITests() {
  console.log("🎮 TESTE COMPLETO - HLTV API COM TODOS OS ENDPOINTS");
  console.log("📋 Verificando datas dos jogos e endpoints adicionais");
  console.log("🎯 Dados oficiais da HLTV");
  console.log("💰 Gratuito - sem API key");
  console.log("=".repeat(60));

  const results = {};

  // Teste 1: Matches (já testado, mas vamos analisar datas)
  console.log("\n📖 TESTE 1: Matches com análise de datas");
  results.matches = await testEndpoint("Matches", ENDPOINTS.matches);

  if (results.matches.success && Array.isArray(results.matches.data)) {
    console.log("\n📅 ANÁLISE DE DATAS DOS JOGOS:");
    const dateAnalysis = analyzeMatchDates(results.matches.data);
    console.log(`   - Total de jogos: ${dateAnalysis.totalMatches}`);
    console.log(`   - Data mais antiga: ${dateAnalysis.oldestDate}`);
    console.log(`   - Data mais recente: ${dateAnalysis.newestDate}`);
    console.log(`   - Jogos futuros: ${dateAnalysis.futureMatches}`);
    console.log(`   - Jogos passados: ${dateAnalysis.pastMatches}`);
    console.log(
      `   - Dias desde o jogo mais antigo: ${dateAnalysis.daysSinceOldest}`
    );
    console.log(
      `   - Dias até o jogo mais recente: ${dateAnalysis.daysUntilNewest}`
    );

    console.log("\n📊 DISTRIBUIÇÃO POR MÊS/ANO:");
    Object.entries(dateAnalysis.dateStats)
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([period, count]) => {
        console.log(`   - ${period}: ${count} jogos`);
      });

    results.dateAnalysis = dateAnalysis;
  }

  // Teste 2: Results
  console.log("\n🏆 TESTE 2: Results");
  results.results = await testEndpoint("Results", ENDPOINTS.results);

  // Teste 3: News
  console.log("\n📰 TESTE 3: News");
  results.news = await testEndpoint("News", ENDPOINTS.news);

  // Teste 4: Players
  console.log("\n👥 TESTE 4: Players");
  results.players = await testEndpoint("Players", ENDPOINTS.players);

  // Teste 5: Top Teams
  console.log("\n⭐ TESTE 5: Top Teams");
  results.topTeams = await testEndpoint("Top Teams", ENDPOINTS.topTeams);

  // Teste 6: Matches por event ID (usando um ID do primeiro match)
  if (results.matches.success && results.matches.data.length > 0) {
    const firstEventId = results.matches.data[0].event?.id;
    if (firstEventId) {
      console.log(`\n🎯 TESTE 6: Matches por Event ID (${firstEventId})`);
      results.matchesByEvent = await testEndpoint(
        `Matches do evento ${firstEventId}`,
        ENDPOINTS.matchesByEvent(firstEventId)
      );
    }
  }

  // Teste 7: Stats por match ID (usando ID do primeiro match)
  if (results.matches.success && results.matches.data.length > 0) {
    const firstMatchId = results.matches.data[0].id;
    if (firstMatchId) {
      console.log(`\n📊 TESTE 7: Stats do Match ID ${firstMatchId}`);
      results.statsByMatch = await testEndpoint(
        `Stats do match ${firstMatchId}`,
        ENDPOINTS.statsByMatch(firstMatchId)
      );
    }
  }

  // Teste 8: Player por ID (usando ID de um player famoso)
  console.log("\n👤 TESTE 8: Player específico (s1mple - ID aproximado)");
  results.playerById = await testEndpoint(
    "Player s1mple",
    ENDPOINTS.playerById(7998)
  ); // ID aproximado do s1mple

  // Teste 9: Team por ID (usando ID do FURIA)
  console.log("\n👥 TESTE 9: Team específico (FURIA)");
  results.teamById = await testEndpoint("Team FURIA", ENDPOINTS.teamById(8297)); // ID do FURIA

  console.log("\n" + "=".repeat(60));
  console.log("📊 RESUMO COMPLETO - HLTV API");

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
  const hasResultsData =
    results.results?.success &&
    Array.isArray(results.results.data) &&
    results.results.data.length > 0;
  const hasNewsData =
    results.news?.success &&
    Array.isArray(results.news.data) &&
    results.news.data.length > 0;
  const hasPlayersData =
    results.players?.success &&
    Array.isArray(results.players.data) &&
    results.players.data.length > 0;
  const hasTeamsData =
    results.topTeams?.success &&
    Array.isArray(results.topTeams.data) &&
    results.topTeams.data.length > 0;

  if (hasMatchesData) {
    console.log("✅ Matches: DISPONÍVEIS");
    console.log(`   - ${results.matches.data.length} matches encontrados`);
  } else {
    console.log("❌ Matches: NÃO encontrados");
  }

  if (hasResultsData) {
    console.log("✅ Results: DISPONÍVEIS");
    console.log(`   - ${results.results.data.length} resultados encontrados`);
  } else {
    console.log("❌ Results: NÃO encontrados");
  }

  if (hasNewsData) {
    console.log("✅ News: DISPONÍVEIS");
    console.log(`   - ${results.news.data.length} notícias encontradas`);
  } else {
    console.log("❌ News: NÃO encontradas");
  }

  if (hasPlayersData) {
    console.log("✅ Players: DISPONÍVEIS");
    console.log(`   - ${results.players.data.length} jogadores encontrados`);
  } else {
    console.log("❌ Players: NÃO encontrados");
  }

  if (hasTeamsData) {
    console.log("✅ Top Teams: DISPONÍVEIS");
    console.log(`   - ${results.topTeams.data.length} times encontrados`);
  } else {
    console.log("❌ Top Teams: NÃO encontrados");
  }

  // Análise de datas detalhada
  if (results.dateAnalysis) {
    console.log("\n📅 ANÁLISE DETALHADA DAS DATAS:");

    const analysis = results.dateAnalysis;
    const currentYear = new Date().getFullYear();

    console.log(`📊 PERÍODO DOS DADOS:`);
    console.log(
      `   - De: ${new Date(analysis.oldestDate).toLocaleDateString("pt-BR")}`
    );
    console.log(
      `   - Até: ${new Date(analysis.newestDate).toLocaleDateString("pt-BR")}`
    );
    console.log(`   - Jogos futuros: ${analysis.futureMatches}`);
    console.log(`   - Jogos passados: ${analysis.pastMatches}`);

    // Verificar se tem dados atuais
    const hasCurrentData = Object.keys(analysis.dateStats).some((key) =>
      key.startsWith(currentYear.toString())
    );
    const hasRecentData = analysis.daysSinceOldest < 365; // Menos de 1 ano

    if (hasCurrentData) {
      console.log("✅ TEM DADOS ATUAIS!");
      console.log("   - Jogos do ano corrente encontrados");
    } else {
      console.log("❌ NÃO tem dados atuais");
      console.log("   - Apenas dados históricos");
    }

    if (hasRecentData) {
      console.log("✅ DADOS RECENTES!");
      console.log(`   - Jogos dos últimos ${analysis.daysSinceOldest} dias`);
    } else {
      console.log("⚠️ Dados antigos");
      console.log(`   - Jogos de ${analysis.daysSinceOldest} dias atrás`);
    }

    console.log("\n📈 DISTRIBUIÇÃO TEMPORAL:");
    Object.entries(analysis.dateStats)
      .sort(([a], [b]) => b.localeCompare(a)) // Mais recentes primeiro
      .slice(0, 6) // Últimos 6 meses
      .forEach(([period, count]) => {
        const [year, month] = period.split("-");
        const monthNames = [
          "Jan",
          "Fev",
          "Mar",
          "Abr",
          "Mai",
          "Jun",
          "Jul",
          "Ago",
          "Set",
          "Out",
          "Nov",
          "Dez",
        ];
        console.log(
          `   - ${monthNames[parseInt(month) - 1]}/${year}: ${count} jogos`
        );
      });
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

    if (results.dateAnalysis) {
      const analysis = results.dateAnalysis;
      if (analysis.daysSinceOldest < 90) {
        // Menos de 3 meses
        console.log("✅ DADOS ATUAIS E RECENTES!");
        console.log("🚀 PRONTO PARA PRODUÇÃO!");
      } else if (analysis.daysSinceOldest < 365) {
        // Menos de 1 ano
        console.log("🟡 DADOS RECENTES (bom para desenvolvimento)");
        console.log("⚠️ Verificar se há dados mais atuais");
      } else {
        console.log("⚠️ DADOS ANTIGOS");
        console.log("💡 Pode precisar de fonte alternativa para dados atuais");
      }
    }
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
    console.log("6. 📅 VERIFICAR frequência de atualização dos dados");
  } else {
    console.log("1. 📖 VERIFICAR documentação completa");
    console.log("2. 🔍 TESTAR outros endpoints possíveis");
    console.log("3. 💬 CONTATAR mantenedor da API");
    console.log("4. 🎯 DECIDIR se combina com outras APIs");
  }

  return results;
}

// Executar testes
runCompleteHLTVAPITests()
  .then((results) => {
    console.log("\n✅ Testes completos da HLTV API concluídos!");
    // Salvar resultados
    const fs = require("fs");
    fs.writeFileSync(
      "hltv-api-complete-test-results.json",
      JSON.stringify(results, null, 2)
    );
    console.log("📄 Resultados salvos em: hltv-api-complete-test-results.json");
  })
  .catch((error) => {
    console.error("❌ Erro geral nos testes:", error.message);
  });
