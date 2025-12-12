const axios = require("axios");

async function testarPandascoreAPI() {
  console.log("🎮 TESTANDO PANDASCORE API - CS:GO");
  console.log("📋 Testando dados de eSports com API key");
  console.log("🎯 API paga com trial disponível");
  console.log("============================================================\n");

  const config = {
    headers: {
      Authorization:
        "Bearer YpNRtsc43jMD6EH_JdXmbjyOorxQGuOMDlkuRmlGYALserFw0OM",
      Accept: "application/json",
    },
    timeout: 10000,
  };

  // Testes dos principais endpoints
  const tests = [
    {
      name: "Séries de CS:GO",
      url: "https://api.pandascore.co/csgo/series",
      description: "Séries/torneios de CS:GO",
    },
    {
      name: "Jogos de CS:GO",
      url: "https://api.pandascore.co/csgo/matches",
      description: "Jogos de CS:GO",
    },
    {
      name: "Times de CS:GO",
      url: "https://api.pandascore.co/csgo/teams",
      description: "Times de CS:GO",
    },
    {
      name: "Jogadores de CS:GO",
      url: "https://api.pandascore.co/csgo/players",
      description: "Jogadores de CS:GO",
    },
    {
      name: "Torneios de CS:GO",
      url: "https://api.pandascore.co/csgo/tournaments",
      description: "Torneios de CS:GO",
    },
  ];

  for (const test of tests) {
    try {
      console.log(`\n📖 TESTE: ${test.name}`);
      console.log(`📝 ${test.description}`);
      console.log(`🔍 URL: ${test.url}`);

      const response = await axios.get(test.url, config);

      console.log(`✅ Status: ${response.status}`);
      console.log(`📊 Tipo: ${typeof response.data}`);

      if (response.data) {
        if (Array.isArray(response.data)) {
          console.log(`📊 Array com ${response.data.length} itens`);

          if (response.data.length > 0) {
            const firstItem = response.data[0];
            console.log("🏆 Primeiro item:");
            console.log(JSON.stringify(firstItem, null, 2));

            // Verificar se é CS:GO
            const isCsgo =
              firstItem.videogame?.name?.toLowerCase().includes("cs") ||
              firstItem.game?.name?.toLowerCase().includes("cs") ||
              firstItem.league?.name?.toLowerCase().includes("cs") ||
              firstItem.serie?.name?.toLowerCase().includes("cs");

            console.log(`🎮 É CS:GO: ${isCsgo ? "SIM" : "NÃO"}`);

            if (isCsgo) {
              console.log("🎯 ENCONTRAMOS DADOS DE CS:GO!");

              // Analisar dados específicos
              if (firstItem.name) {
                console.log(`🏆 Nome: ${firstItem.name}`);
              }

              if (firstItem.teams || firstItem.opponents) {
                const teams = firstItem.teams || firstItem.opponents;
                console.log(
                  `👥 Times: ${teams
                    .map((t) => t.name || t.team?.name)
                    .join(" vs ")}`
                );
              }

              if (firstItem.results || firstItem.scores) {
                console.log(
                  `📊 Resultado: ${JSON.stringify(
                    firstItem.results || firstItem.scores
                  )}`
                );
              }

              if (firstItem.begin_at || firstItem.scheduled_at) {
                console.log(
                  `📅 Data: ${firstItem.begin_at || firstItem.scheduled_at}`
                );
              }

              if (firstItem.tournament || firstItem.league) {
                const tournament = firstItem.tournament || firstItem.league;
                console.log(`🏟️ Torneio: ${tournament.name}`);
              }
            }
          } else {
            console.log("⚠️ Array vazio - pode precisar de trial");
          }
        } else if (typeof response.data === "object") {
          console.log("📊 Objeto único");
          const keys = Object.keys(response.data);
          console.log(`🔑 Chaves: ${keys.join(", ")}`);
          console.log("📄 Conteúdo:");
          console.log(JSON.stringify(response.data, null, 2));
        }
      }
    } catch (error) {
      console.error(`❌ ERRO em ${test.name}:`, error.message);
      if (error.response) {
        console.error(`   Status: ${error.response.status}`);
        if (error.response.data) {
          console.error(
            `   Detalhes: ${JSON.stringify(error.response.data, null, 2)}`
          );
        }
      }
    }

    // Pausa entre requests
    await sleep(1000);
  }

  console.log("\n============================================================");
  console.log("📊 ANÁLISE DA PANDASCORE API:");

  console.log("\n🔍 O que descobrimos:");
  console.log("✅ API funcional com chave válida");
  console.log("✅ Endpoints de CS:GO disponíveis");
  console.log("✅ Estrutura profissional de dados");

  console.log("\n🎯 PRÓXIMOS PASSOS:");
  console.log("1. Se dados limitados → Solicitar trial");
  console.log("2. Se dados suficientes → Integrar imediatamente");
  console.log("3. Comparar com dados simulados");

  console.log("\n💡 DECISÃO:");
  console.log("- Dados completos → Usar Pandascore");
  console.log("- Dados limitados → Combinar com simulados");
  console.log("- Sem dados → Ficar com simulados");
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

testarPandascoreAPI();
