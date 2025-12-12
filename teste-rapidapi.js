const axios = require("axios");

async function testarRapidAPI() {
  console.log("🎮 TESTANDO RAPIDAPI - ESPORT API");
  console.log("📋 Testando dados históricos de times");
  console.log("🎯 API paga via RapidAPI");
  console.log("============================================================\n");

  try {
    // Teste 1: Jogos anteriores do time ID 459469
    console.log("📖 TESTE 1: Jogos anteriores do time 459469");
    console.log(
      "🔍 URL: https://esportapi1.p.rapidapi.com/api/esport/team/459469/matches/previous/1"
    );

    const response = await axios.get(
      "https://esportapi1.p.rapidapi.com/api/esport/team/459469/matches/previous/1",
      {
        headers: {
          "x-rapidapi-host": "esportapi1.p.rapidapi.com",
          "x-rapidapi-key":
            "d5da2b13a6msh434479d753d8387p12bae1jsn117c3b0f7da9",
        },
        timeout: 10000,
      }
    );

    console.log(`✅ Status: ${response.status}`);
    console.log(`📊 Tipo de resposta: ${typeof response.data}`);

    if (response.data) {
      console.log("📄 Dados recebidos:");
      console.log(JSON.stringify(response.data, null, 2));

      // Analisar estrutura dos dados
      if (Array.isArray(response.data)) {
        console.log(`📊 Array com ${response.data.length} itens`);

        if (response.data.length > 0) {
          console.log("🏆 Primeiro jogo:");
          console.log(JSON.stringify(response.data[0], null, 2));

          // Verificar se tem dados de placar, times, etc.
          const firstMatch = response.data[0];
          if (firstMatch.homeTeam && firstMatch.awayTeam) {
            console.log("✅ TEM DADOS DE JOGOS!");
            console.log(
              `🏠 Time casa: ${firstMatch.homeTeam.name || firstMatch.homeTeam}`
            );
            console.log(
              `✈️ Time visitante: ${
                firstMatch.awayTeam.name || firstMatch.awayTeam
              }`
            );
          }

          if (
            firstMatch.homeScore !== undefined &&
            firstMatch.awayScore !== undefined
          ) {
            console.log("✅ TEM PLACARES!");
            console.log(
              `📊 Placar: ${firstMatch.homeScore} - ${firstMatch.awayScore}`
            );
          }

          if (firstMatch.startTime || firstMatch.date) {
            console.log("✅ TEM DATAS!");
            console.log(`📅 Data: ${firstMatch.startTime || firstMatch.date}`);
          }
        }
      } else if (typeof response.data === "object") {
        console.log("📊 Objeto recebido");
        const keys = Object.keys(response.data);
        console.log(`🔑 Chaves disponíveis: ${keys.join(", ")}`);

        // Verificar se é uma estrutura de paginação
        if (response.data.data && Array.isArray(response.data.data)) {
          console.log(
            `📄 Dados dentro de 'data': ${response.data.data.length} itens`
          );
          if (response.data.data.length > 0) {
            console.log("🏆 Primeiro jogo em data:");
            console.log(JSON.stringify(response.data.data[0], null, 2));
          }
        }
      }
    }

    console.log(
      "\n============================================================"
    );
    console.log("📊 ANÁLISE DA RAPIDAPI:");

    if (response.data && (Array.isArray(response.data) || response.data.data)) {
      const matches = Array.isArray(response.data)
        ? response.data
        : response.data.data || [];
      console.log(`✅ Jogos encontrados: ${matches.length}`);

      if (matches.length > 0) {
        const firstMatch = matches[0];
        const hasTeams = firstMatch.homeTeam && firstMatch.awayTeam;
        const hasScores =
          firstMatch.homeScore !== undefined &&
          firstMatch.awayScore !== undefined;
        const hasDate = firstMatch.startTime || firstMatch.date;

        console.log(`✅ Times identificados: ${hasTeams ? "SIM" : "NÃO"}`);
        console.log(`✅ Placares disponíveis: ${hasScores ? "SIM" : "NÃO"}`);
        console.log(`✅ Datas disponíveis: ${hasDate ? "SIM" : "NÃO"}`);

        if (hasTeams && hasScores && hasDate) {
          console.log("🎉 API PERFEITA PARA NOSSAS NECESSIDADES!");
          console.log("💰 Pronta para integração no CS:GO SCOUT");
        } else {
          console.log("⚠️ API incompleta - faltam dados essenciais");
        }
      }
    } else {
      console.log("❌ Estrutura de dados não reconhecida");
    }
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

testarRapidAPI();
