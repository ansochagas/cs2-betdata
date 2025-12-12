const axios = require("axios");

async function testarSportAPIRealTime() {
  console.log("🎮 TESTANDO SPORT API REAL TIME - RAPIDAPI");
  console.log("📋 Testando dados de e-sports em tempo real");
  console.log("🎯 API paga via RapidAPI");
  console.log("============================================================\n");

  const config = {
    headers: {
      "x-rapidapi-host": "sport-api-real-time.p.rapidapi.com",
      "x-rapidapi-key": "d5da2b13a6msh434479d753d8387p12bae1jsn117c3b0f7da9",
    },
    timeout: 10000,
  };

  try {
    // Teste 1: Busca de jogo específico de e-sports
    console.log("📖 TESTE 1: Jogo específico de e-sports (ID: 9744554)");
    console.log(
      "🔍 URL: https://sport-api-real-time.p.rapidapi.com/matches/esport-games?matchId=9744554"
    );

    const response = await axios.get(
      "https://sport-api-real-time.p.rapidapi.com/matches/esport-games?matchId=9744554",
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
          const isEsports =
            firstMatch.sport === "esports" ||
            firstMatch.game === "csgo" ||
            firstMatch.game === "cs2";

          console.log("\n🔍 ANÁLISE DO PRIMEIRO JOGO:");
          console.log(`✅ Times identificados: ${hasTeams ? "SIM" : "NÃO"}`);
          console.log(`✅ Placares disponíveis: ${hasScores ? "SIM" : "NÃO"}`);
          console.log(`✅ Data/horário: ${hasDate ? "SIM" : "NÃO"}`);
          console.log(`✅ Status do jogo: ${hasStatus ? "SIM" : "NÃO"}`);
          console.log(
            `✅ Torneio identificado: ${hasTournament ? "SIM" : "NÃO"}`
          );
          console.log(`🎮 É jogo de e-sports: ${isEsports ? "SIM" : "NÃO"}`);

          // Verificar se é CS:GO especificamente
          if (
            isEsports &&
            (firstMatch.game === "csgo" ||
              firstMatch.game === "cs2" ||
              firstMatch.tournament?.toLowerCase().includes("cs") ||
              firstMatch.event?.toLowerCase().includes("cs"))
          ) {
            console.log("🎯 É JOGO DE CS:GO/CS2!");

            if (hasTeams && hasScores && hasDate) {
              console.log("🎉 API PERFEITA PARA CS:GO SCOUT!");
              console.log("✅ Dados históricos disponíveis");
              console.log("✅ Informações completas de jogos");
              console.log("💰 Pronta para integração");
            }
          }
        }
      } else if (typeof response.data === "object") {
        console.log("📊 Objeto único recebido");
        const keys = Object.keys(response.data);
        console.log(`🔑 Chaves disponíveis: ${keys.join(", ")}`);

        if (response.data.match || response.data.game) {
          console.log("📄 Dados de jogo único:");
          console.log(JSON.stringify(response.data, null, 2));
        }
      }
    }

    console.log(
      "\n============================================================"
    );
    console.log("📊 ANÁLISE DA SPORT API REAL TIME:");

    if (
      response.data &&
      (Array.isArray(response.data) ||
        response.data.match ||
        response.data.game)
    ) {
      const matches = Array.isArray(response.data)
        ? response.data
        : [response.data];
      console.log(`✅ Jogos/dados encontrados: ${matches.length}`);

      if (matches.length > 0) {
        const firstMatch = matches[0];
        const hasTeams = firstMatch.homeTeam && firstMatch.awayTeam;
        const hasScores =
          firstMatch.homeScore !== undefined &&
          firstMatch.awayScore !== undefined;
        const hasDate =
          firstMatch.startTime || firstMatch.date || firstMatch.scheduledAt;
        const isEsports =
          firstMatch.sport === "esports" ||
          firstMatch.game === "csgo" ||
          firstMatch.game === "cs2";

        console.log(`✅ Times identificados: ${hasTeams ? "SIM" : "NÃO"}`);
        console.log(`✅ Placares disponíveis: ${hasScores ? "SIM" : "NÃO"}`);
        console.log(`✅ Datas disponíveis: ${hasDate ? "SIM" : "NÃO"}`);
        console.log(`🎮 É e-sports: ${isEsports ? "SIM" : "NÃO"}`);

        if (hasTeams && hasScores && hasDate && isEsports) {
          console.log("🎉 API FUNCIONAL PARA E-SPORTS!");
          console.log("🔍 Verificando se é CS:GO...");

          if (
            firstMatch.game === "csgo" ||
            firstMatch.game === "cs2" ||
            firstMatch.tournament?.toLowerCase().includes("cs") ||
            firstMatch.event?.toLowerCase().includes("cs")
          ) {
            console.log("🎯 CONFIRMADO: DADOS DE CS:GO DISPONÍVEIS!");
            console.log("💰 Esta pode ser a API que procurávamos!");
          } else {
            console.log("⚠️ É e-sports, mas não CS:GO especificamente");
          }
        } else {
          console.log("❌ Dados incompletos para e-sports");
        }
      } else {
        console.log("❌ Nenhum jogo encontrado");
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

testarSportAPIRealTime();
