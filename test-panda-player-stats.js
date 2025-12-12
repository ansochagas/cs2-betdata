// Teste para buscar estatísticas reais de jogadores da PandaScore
async function testPandaPlayerStats() {
  console.log("🎯 Testando busca de estatísticas reais de jogadores...\n");

  const API_KEY = "POciMXi8fwRIbuW3qEWvPVqGTv_Yfv55T-_mwp8DzpYOR-1mYjo";

  try {
    // 1. Primeiro, vamos buscar alguns jogadores conhecidos
    console.log("1️⃣ Buscando lista de jogadores...");
    const playersResponse = await fetch(
      `https://api.pandascore.co/csgo/players?token=${API_KEY}&per_page=20`
    );
    const players = await playersResponse.json();

    console.log(`Encontrados ${players.length} jogadores:`);
    players.forEach((player, index) => {
      console.log(
        `${index + 1}. ${player.name} (ID: ${player.id}) - ${
          player.team?.name || "Sem time"
        }`
      );
    });

    // 2. Vamos testar buscar stats de um jogador específico (s1mple)
    console.log("\n2️⃣ Testando estatísticas do s1mple...");
    const s1mpleResponse = await fetch(
      `https://api.pandascore.co/csgo/players/s1mple/stats?token=${API_KEY}`
    );
    const s1mpleStats = await s1mpleResponse.json();

    console.log("Resposta da API:", s1mpleStats);

    if (s1mpleStats && !s1mpleStats.error) {
      console.log("✅ Estatísticas encontradas!");
      console.log("Dados:", JSON.stringify(s1mpleStats, null, 2));
    } else {
      console.log(
        "❌ Erro ou dados não disponíveis:",
        s1mpleStats?.error || "Resposta vazia"
      );
    }

    // 3. Testar buscar jogadores de um time específico (Imperial)
    console.log("\n3️⃣ Buscando jogadores do Imperial...");
    const imperialResponse = await fetch(
      `https://api.pandascore.co/csgo/teams?token=${API_KEY}&filter[name]=Imperial`
    );
    const imperialData = await imperialResponse.json();

    console.log("Dados do Imperial:", JSON.stringify(imperialData, null, 2));

    if (imperialData && imperialData.length > 0 && imperialData[0].players) {
      console.log("Jogadores do Imperial:");
      imperialData[0].players.forEach((player, index) => {
        console.log(`${index + 1}. ${player.name} (ID: ${player.id})`);
      });

      // 4. Testar buscar stats de um jogador do Imperial
      if (imperialData[0].players.length > 0) {
        const firstPlayer = imperialData[0].players[0];
        console.log(`\n4️⃣ Testando estatísticas de ${firstPlayer.name}...`);

        const playerStatsResponse = await fetch(
          `https://api.pandascore.co/csgo/players/${firstPlayer.id}/stats?token=${API_KEY}`
        );
        const playerStats = await playerStatsResponse.json();

        console.log(
          "Estatísticas do jogador:",
          JSON.stringify(playerStats, null, 2)
        );
      }
    }
  } catch (error) {
    console.error("❌ Erro:", error.message);
  }
}

testPandaPlayerStats();
