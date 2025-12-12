// Verificar jogos recentes do Imperial
async function checkImperialGames() {
  console.log("🔍 Verificando jogos recentes do Imperial...\n");

  try {
    // 1. Buscar jogos atuais
    const cacheResponse = await fetch(
      "http://localhost:3000/api/cache/csgo-matches"
    );
    const cacheData = await cacheResponse.json();

    console.log("📅 Jogos atuais encontrados:");
    cacheData.data.forEach((match, index) => {
      const date = new Date(match.startTime).toLocaleDateString("pt-BR");
      const time = new Date(match.startTime).toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });
      console.log(
        `${index + 1}. ${match.homeTeam} vs ${match.awayTeam} - ${date} ${time}`
      );
    });

    // 2. Verificar dados do Imperial na API de análise
    console.log("\n📊 Verificando dados de análise do Imperial...");

    const analysisResponse = await fetch(
      "http://localhost:3000/api/matches/with-history"
    );
    const analysisData = await analysisResponse.json();

    console.log(`Encontrados ${analysisData.data.length} jogos com análise`);

    // Procurar jogos do Imperial
    const imperialGames = analysisData.data.filter(
      (match) =>
        match.homeTeam.toLowerCase().includes("imperial") ||
        match.awayTeam.toLowerCase().includes("imperial")
    );

    console.log(`\n🏆 Jogos do Imperial encontrados: ${imperialGames.length}`);

    if (imperialGames.length > 0) {
      console.log("\n📋 Detalhes dos jogos do Imperial:");
      imperialGames.slice(0, 6).forEach((match, index) => {
        const date = new Date(match.startTime).toLocaleDateString("pt-BR");
        console.log(
          `${index + 1}. ${match.homeTeam} vs ${match.awayTeam} - ${date}`
        );
        if (match.pandascoreAnalysis) {
          console.log(`   ✅ Tem análise Pandascore`);
        } else {
          console.log(`   ❌ Sem análise Pandascore`);
        }
      });
    }

    // 3. Verificar se temos dados reais do HLTV ou apenas mockados
    console.log("\n🎮 Verificando fonte dos dados dos jogadores...");

    // Simular busca por dados reais do Imperial
    const API_KEY = "POciMXi8fwRIbuW3qEWvPVqGTv_Yfv55T-_mwp8DzpYOR-1mYjo";
    const imperialResponse = await fetch(
      `https://api.pandascore.co/csgo/teams?token=${API_KEY}&filter[name]=Imperial`
    );
    const imperialData = await imperialResponse.json();

    console.log(
      `Dados do Imperial na PandaScore: ${imperialData.length} resultados`
    );

    if (imperialData.length > 0) {
      const imperial = imperialData[0];
      console.log(`Nome: ${imperial.name}`);
      console.log(
        `Jogadores: ${imperial.players ? imperial.players.length : 0}`
      );

      if (imperial.players) {
        console.log("Jogadores atuais:");
        imperial.players.forEach((player, index) => {
          console.log(
            `  ${index + 1}. ${player.name} (${player.role || "N/A"})`
          );
        });
      }
    }
  } catch (error) {
    console.error("❌ Erro:", error.message);
  }
}

checkImperialGames();
