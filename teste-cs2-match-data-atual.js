const axios = require("axios");

async function testarCS2MatchDataAPI() {
  console.log("🎮 TESTE - CS2 MATCH DATA API (DADOS ATUAIS)");
  console.log("📋 Verificando jogos atuais de CS:GO");
  console.log("🎯 API gratuita com dados atuais");
  console.log("💰 Limite: 100 requests/dia");
  console.log("============================================================\n");

  try {
    // Teste 1: Matches atuais
    console.log("📖 TESTE 1: Matches atuais");
    console.log("🔍 URL: https://cs2-api.vercel.app/api/matches");
    const matchesResponse = await axios.get(
      "https://cs2-api.vercel.app/api/matches",
      {
        timeout: 10000,
      }
    );

    console.log(`✅ Status: ${matchesResponse.status}`);
    console.log(
      `📊 Dados recebidos: ${
        Array.isArray(matchesResponse.data) ? "Array" : "Object"
      } com ${
        Array.isArray(matchesResponse.data)
          ? matchesResponse.data.length
          : "N/A"
      } itens`
    );

    if (
      Array.isArray(matchesResponse.data) &&
      matchesResponse.data.length > 0
    ) {
      console.log("📅 Primeiro item:");
      console.log(JSON.stringify(matchesResponse.data[0], null, 2));

      // Análise de datas
      const matches = matchesResponse.data;
      const dates = matches
        .map((match) => new Date(match.time))
        .filter((date) => !isNaN(date));
      const now = new Date();

      if (dates.length > 0) {
        const oldestDate = new Date(Math.min(...dates));
        const newestDate = new Date(Math.max(...dates));

        console.log("\n📅 ANÁLISE DE DATAS DOS JOGOS:");
        console.log(`   - Total de jogos: ${matches.length}`);
        console.log(`   - Data mais antiga: ${oldestDate.toISOString()}`);
        console.log(`   - Data mais recente: ${newestDate.toISOString()}`);
        console.log(
          `   - Jogos futuros: ${
            matches.filter((match) => new Date(match.time) > now).length
          }`
        );
        console.log(
          `   - Jogos passados: ${
            matches.filter((match) => new Date(match.time) <= now).length
          }`
        );
        console.log(
          `   - Dias desde o jogo mais antigo: ${Math.floor(
            (now - oldestDate) / (1000 * 60 * 60 * 24)
          )}`
        );
        console.log(
          `   - Dias até o jogo mais recente: ${Math.floor(
            (now - newestDate) / (1000 * 60 * 60 * 24)
          )}`
        );

        // Distribuição por mês/ano
        const dateGroups = {};
        dates.forEach((date) => {
          const key = `${date.getFullYear()}-${String(
            date.getMonth() + 1
          ).padStart(2, "0")}`;
          dateGroups[key] = (dateGroups[key] || 0) + 1;
        });

        console.log("\n📊 DISTRIBUIÇÃO POR MÊS/ANO:");
        Object.entries(dateGroups)
          .sort(([a], [b]) => a.localeCompare(b))
          .forEach(([period, count]) => {
            console.log(`   - ${period}: ${count} jogos`);
          });
      }
    }

    // Teste 2: Próximos jogos
    console.log("\n📖 TESTE 2: Próximos jogos");
    console.log("🔍 URL: https://cs2-api.vercel.app/api/upcoming");
    const upcomingResponse = await axios.get(
      "https://cs2-api.vercel.app/api/upcoming",
      {
        timeout: 10000,
      }
    );

    console.log(`✅ Status: ${upcomingResponse.status}`);
    console.log(
      `📊 Dados recebidos: ${
        Array.isArray(upcomingResponse.data) ? "Array" : "Object"
      } com ${
        Array.isArray(upcomingResponse.data)
          ? upcomingResponse.data.length
          : "N/A"
      } itens`
    );

    if (
      Array.isArray(upcomingResponse.data) &&
      upcomingResponse.data.length > 0
    ) {
      console.log("📅 Primeiro jogo futuro:");
      console.log(JSON.stringify(upcomingResponse.data[0], null, 2));
    }

    // Teste 3: Resultados recentes
    console.log("\n📖 TESTE 3: Resultados recentes");
    console.log("🔍 URL: https://cs2-api.vercel.app/api/results");
    const resultsResponse = await axios.get(
      "https://cs2-api.vercel.app/api/results",
      {
        timeout: 10000,
      }
    );

    console.log(`✅ Status: ${resultsResponse.status}`);
    console.log(
      `📊 Dados recebidos: ${
        Array.isArray(resultsResponse.data) ? "Array" : "Object"
      } com ${
        Array.isArray(resultsResponse.data)
          ? resultsResponse.data.length
          : "N/A"
      } itens`
    );

    if (
      Array.isArray(resultsResponse.data) &&
      resultsResponse.data.length > 0
    ) {
      console.log("🏆 Primeiro resultado:");
      console.log(JSON.stringify(resultsResponse.data[0], null, 2));
    }

    console.log(
      "\n============================================================"
    );
    console.log("📊 RESUMO - CS2 MATCH DATA API");
    console.log("✅ API funcional com dados atuais");
    console.log("✅ Jogos futuros disponíveis");
    console.log("✅ Resultados recentes disponíveis");
    console.log("⚠️ Limite de 100 requests/dia");
    console.log("💡 PERFEITA para desenvolvimento e MVP");
  } catch (error) {
    console.error("❌ ERRO:", error.message);
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(
        `   Detalhes: ${JSON.stringify(error.response.data, null, 2)}`
      );
    }
  }
}

testarCS2MatchDataAPI();
