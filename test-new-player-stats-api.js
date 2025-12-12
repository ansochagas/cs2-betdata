// Teste da nova API de estatísticas de jogadores
async function testNewPlayerStatsAPI() {
  console.log("🎯 Testando nova API de estatísticas de jogadores...\n");

  try {
    // 1. Testar busca de jogadores do Imperial
    console.log("1️⃣ Testando busca de jogadores do Imperial...");
    const imperialResponse = await fetch(
      "http://localhost:3000/api/pandascore/player-stats",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ teamName: "Imperial" }),
      }
    );

    const imperialData = await imperialResponse.json();
    console.log("Resposta da API:", JSON.stringify(imperialData, null, 2));

    if (imperialData.success && imperialData.data) {
      console.log(
        `✅ Encontrados ${imperialData.data.length} jogadores do Imperial:`
      );

      imperialData.data.forEach((player, index) => {
        console.log(`${index + 1}. ${player.playerName}`);
        console.log(`   Kills/Match: ${player.stats.killsPerMatch}`);
        console.log(`   Deaths/Match: ${player.stats.deathsPerMatch}`);
        console.log(`   K/D Ratio: ${player.stats.kdRatio}`);
        console.log(`   Rating: ${player.stats.rating}`);
        console.log(`   Matches: ${player.stats.matchesPlayed}`);
        console.log(`   Win Rate: ${player.stats.winRate.toFixed(1)}%`);
        console.log("");
      });
    }

    // 2. Testar busca individual de um jogador
    if (
      imperialData.success &&
      imperialData.data &&
      imperialData.data.length > 0
    ) {
      const firstPlayer = imperialData.data[0];
      console.log(
        `2️⃣ Testando busca individual de ${firstPlayer.playerName}...`
      );

      const playerResponse = await fetch(
        `http://localhost:3000/api/pandascore/player-stats?playerId=${firstPlayer.playerId}`
      );
      const playerData = await playerResponse.json();

      console.log("Dados individuais:", JSON.stringify(playerData, null, 2));
    }
  } catch (error) {
    console.error("❌ Erro:", error.message);
  }
}

testNewPlayerStatsAPI();
