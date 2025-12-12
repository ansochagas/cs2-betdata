const axios = require("axios");

async function testarSportAPIStatistics() {
  console.log("🎮 TESTANDO SPORT API - ENDPOINT DE ESTATÍSTICAS");
  console.log("📋 Testando dados detalhados de jogos");
  console.log("🎯 Endpoint: /matches/statistics");
  console.log("============================================================\n");

  const config = {
    headers: {
      "x-rapidapi-host": "sport-api-real-time.p.rapidapi.com",
      "x-rapidapi-key": "d5da2b13a6msh434479d753d8387p12bae1jsn117c3b0f7da9",
    },
    timeout: 10000,
  };

  try {
    // Teste 1: Estatísticas de jogo específico
    console.log("📖 TESTE 1: Estatísticas do jogo ID 14253591");
    console.log(
      "🔍 URL: https://sport-api-real-time.p.rapidapi.com/matches/statistics?matchId=14253591"
    );

    const response = await axios.get(
      "https://sport-api-real-time.p.rapidapi.com/matches/statistics?matchId=14253591",
      config
    );

    console.log(`✅ Status: ${response.status}`);
    console.log(`📊 Tipo: ${typeof response.data}`);

    if (response.data) {
      console.log("📄 Dados recebidos:");
      console.log(JSON.stringify(response.data, null, 2));

      // Analisar estrutura dos dados
      if (Array.isArray(response.data)) {
        console.log(`📊 Array com ${response.data.length} itens`);

        if (response.data.length > 0) {
          const firstItem = response.data[0];
          console.log("📈 Primeira estatística:");
          console.log(JSON.stringify(firstItem, null, 2));
        }
      } else if (typeof response.data === "object") {
        const keys = Object.keys(response.data);
        console.log(`🔑 Chaves disponíveis: ${keys.join(", ")}`);

        // Verificar diferentes estruturas possíveis
        if (
          response.data.statistics &&
          Array.isArray(response.data.statistics)
        ) {
          console.log(
            `📊 Estatísticas: ${response.data.statistics.length} itens`
          );
          if (response.data.statistics.length > 0) {
            console.log("📈 Primeira estatística:");
            console.log(JSON.stringify(response.data.statistics[0], null, 2));
          }
        }

        if (response.data.periods && Array.isArray(response.data.periods)) {
          console.log(`⏰ Períodos: ${response.data.periods.length} itens`);
          if (response.data.periods.length > 0) {
            console.log("⏰ Primeiro período:");
            console.log(JSON.stringify(response.data.periods[0], null, 2));
          }
        }

        if (response.data.teams && Array.isArray(response.data.teams)) {
          console.log(`👥 Times: ${response.data.teams.length} times`);
          response.data.teams.forEach((team, index) => {
            console.log(
              `   Time ${index + 1}: ${
                team.name || team.teamName || "Nome não disponível"
              }`
            );
          });
        }

        if (response.data.tournament) {
          console.log(
            `🏆 Torneio: ${
              response.data.tournament.name || response.data.tournament
            }`
          );
        }

        if (response.data.match) {
          console.log("🏆 Dados do jogo:");
          console.log(JSON.stringify(response.data.match, null, 2));
        }
      }
    }

    console.log(
      "\n============================================================"
    );
    console.log("📊 ANÁLISE DO ENDPOINT DE ESTATÍSTICAS:");

    if (response.data) {
      let hasTeams = false;
      let hasTournament = false;
      let hasDetailedStats = false;

      if (typeof response.data === "object") {
        // Verificar times
        if (
          response.data.teams &&
          Array.isArray(response.data.teams) &&
          response.data.teams.length > 0
        ) {
          hasTeams = response.data.teams.some(
            (team) => team.name || team.teamName
          );
        }

        // Verificar torneio
        if (
          response.data.tournament &&
          (response.data.tournament.name ||
            typeof response.data.tournament === "string")
        ) {
          hasTournament = true;
        }

        // Verificar estatísticas detalhadas
        if (
          response.data.statistics &&
          Array.isArray(response.data.statistics) &&
          response.data.statistics.length > 0
        ) {
          hasDetailedStats = true;
        }
      }

      console.log(`✅ Times identificados: ${hasTeams ? "SIM" : "NÃO"}`);
      console.log(`✅ Torneio identificado: ${hasTournament ? "SIM" : "NÃO"}`);
      console.log(
        `✅ Estatísticas detalhadas: ${hasDetailedStats ? "SIM" : "NÃO"}`
      );

      if (hasTeams && hasTournament) {
        console.log("🎉 POSSÍVEL API VIÁVEL PARA CS:GO SCOUT!");
        console.log("💰 Pode fornecer dados históricos necessários");
        console.log("🔍 Vamos testar mais jogos para confirmar");
      } else {
        console.log("⚠️ Ainda faltam dados essenciais (times/torneio)");
        console.log("📝 Mas tem estatísticas detalhadas - útil para analytics");
      }
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

testarSportAPIStatistics();
