const axios = require("axios");

async function testarCS2EsportsAPI() {
  console.log("🎮 TESTANDO CS2 ESPORTS API - RAPIDAPI");
  console.log("📋 Testando dados históricos de CS:GO via HLTV Scraper");
  console.log("🎯 API paga via RapidAPI");
  console.log("============================================================\n");

  const config = {
    headers: {
      "x-rapidapi-host": "cs2-esports-api.p.rapidapi.com",
      "x-rapidapi-key": "d5da2b13a6msh434479d753d8387p12bae1jsn117c3b0f7da9",
    },
    timeout: 10000,
  };

  try {
    // Teste 1: Matches de um evento específico
    console.log("📖 TESTE 1: Matches do evento 7906");
    console.log(
      "🔍 URL: https://cs2-esports-api.p.rapidapi.com/api/events/matches?event_id=7906"
    );

    const response = await axios.get(
      "https://cs2-esports-api.p.rapidapi.com/api/events/matches?event_id=7906",
      config
    );

    console.log(`✅ Status: ${response.status}`);
    console.log(`📊 Tipo: ${typeof response.data}`);

    if (response.data) {
      console.log("📄 Dados recebidos:");
      console.log(JSON.stringify(response.data, null, 2));

      // Analisar estrutura dos dados
      if (Array.isArray(response.data)) {
        console.log(`📊 Array com ${response.data.length} jogos`);

        if (response.data.length > 0) {
          const firstMatch = response.data[0];
          console.log("🏆 Primeiro jogo:");
          console.log(JSON.stringify(firstMatch, null, 2));

          // Verificar dados importantes
          const hasTeams = firstMatch.homeTeam && firstMatch.awayTeam;
          const hasScores =
            firstMatch.homeScore !== undefined &&
            firstMatch.awayScore !== undefined;
          const hasDate =
            firstMatch.startTime || firstMatch.date || firstMatch.scheduledAt;
          const hasStatus = firstMatch.status;
          const hasTournament = firstMatch.tournament || firstMatch.event;

          console.log("\n🔍 ANÁLISE DO PRIMEIRO JOGO:");
          console.log(`✅ Times identificados: ${hasTeams ? "SIM" : "NÃO"}`);
          console.log(`✅ Placares disponíveis: ${hasScores ? "SIM" : "NÃO"}`);
          console.log(`✅ Data/horário: ${hasDate ? "SIM" : "NÃO"}`);
          console.log(`✅ Status do jogo: ${hasStatus ? "SIM" : "NÃO"}`);
          console.log(
            `✅ Torneio identificado: ${hasTournament ? "SIM" : "NÃO"}`
          );

          // Verificar se tem dados de mapas/resultados
          if (firstMatch.maps || firstMatch.results) {
            console.log("✅ TEM DADOS DETALHADOS DE MAPAS!");
          }

          // Verificar se tem estatísticas
          if (firstMatch.stats || firstMatch.playerStats) {
            console.log("✅ TEM ESTATÍSTICAS DE JOGADORES!");
          }

          // Verificar se tem stars rating
          if (firstMatch.stars !== undefined) {
            console.log(`✅ TEM AVALIAÇÃO DE ESTRELAS: ${firstMatch.stars}⭐`);
          }
        }
      } else if (typeof response.data === "object") {
        console.log("📊 Objeto único recebido");
        const keys = Object.keys(response.data);
        console.log(`🔑 Chaves disponíveis: ${keys.join(", ")}`);

        if (response.data.matches && Array.isArray(response.data.matches)) {
          console.log(
            `📄 Jogos dentro de 'matches': ${response.data.matches.length} itens`
          );
          if (response.data.matches.length > 0) {
            console.log("🏆 Primeiro jogo em matches:");
            console.log(JSON.stringify(response.data.matches[0], null, 2));
          }
        }
      }
    }

    console.log(
      "\n============================================================"
    );
    console.log("📊 ANÁLISE DA CS2 ESPORTS API:");

    if (
      response.data &&
      (Array.isArray(response.data) || response.data.matches)
    ) {
      const matches = Array.isArray(response.data)
        ? response.data
        : response.data.matches || [];
      console.log(`✅ Jogos encontrados: ${matches.length}`);

      if (matches.length > 0) {
        const firstMatch = matches[0];
        const hasTeams = firstMatch.homeTeam && firstMatch.awayTeam;
        const hasScores =
          firstMatch.homeScore !== undefined &&
          firstMatch.awayScore !== undefined;
        const hasDate =
          firstMatch.startTime || firstMatch.date || firstMatch.scheduledAt;
        const hasTournament = firstMatch.tournament || firstMatch.event;

        console.log(`✅ Times identificados: ${hasTeams ? "SIM" : "NÃO"}`);
        console.log(`✅ Placares disponíveis: ${hasScores ? "SIM" : "NÃO"}`);
        console.log(`✅ Datas disponíveis: ${hasDate ? "SIM" : "NÃO"}`);
        console.log(
          `✅ Torneios identificados: ${hasTournament ? "SIM" : "NÃO"}`
        );

        if (hasTeams && hasScores && hasDate && hasTournament) {
          console.log("🎉 API PERFEITA PARA CS:GO SCOUT!");
          console.log("💰 Pronta para integração imediata");
          console.log("📊 Dados históricos disponíveis");
          console.log("🏆 Informações completas de jogos");
        } else {
          console.log("⚠️ API incompleta - faltam dados essenciais");
        }
      } else {
        console.log("❌ Nenhum jogo encontrado neste evento");
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

testarCS2EsportsAPI();
