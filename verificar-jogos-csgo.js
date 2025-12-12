const axios = require("axios");

async function verificarJogosCSGO() {
  console.log("🔍 VERIFICANDO JOGOS DE CS:GO NA API");
  console.log("============================================================\n");

  try {
    const response = await axios.get(
      "https://spro.agency/api/get_games?key=e63ec008-6a51-4970-bf88-6a527dbd8a79",
      {
        timeout: 10000,
      }
    );

    const games = response.data;
    console.log(`📊 Total de jogos encontrados: ${Object.keys(games).length}`);

    // Procurar jogos de CS:GO
    const csgoGames = Object.entries(games).filter(([key, game]) => {
      const gameData = game;
      return (
        gameData.sport === "CSL" ||
        gameData.sport === "CS:GO" ||
        gameData.sport === "Counter-Strike" ||
        key.toLowerCase().includes("cs:go") ||
        key.toLowerCase().includes("counter strike") ||
        (gameData.game && gameData.game.toLowerCase().includes("cs:go")) ||
        (gameData.game &&
          gameData.game.toLowerCase().includes("counter strike"))
      );
    });

    console.log(`🎮 Jogos de CS:GO encontrados: ${csgoGames.length}`);

    if (csgoGames.length > 0) {
      console.log("\n🏆 JOGOS DE CS:GO:");
      csgoGames.forEach(([key, game], index) => {
        const gameData = game;
        console.log(`${index + 1}. ${gameData.game}`);
        console.log(`   📅 ${gameData.when}`);
        console.log(`   🏟️ ${gameData.sport}`);
        console.log("");
      });
    } else {
      console.log("\n❌ Nenhum jogo de CS:GO encontrado na API");
      console.log("💡 Possíveis razões:");
      console.log("   - Não há jogos programados no momento");
      console.log("   - O código do esporte pode ser diferente");
      console.log("   - Temporada de CS:GO pode estar parada");
    }

    // Mostrar esportes disponíveis
    const sports = [...new Set(Object.values(games).map((game) => game.sport))];
    console.log(`\n🎯 Esportes disponíveis: ${sports.join(", ")}`);
  } catch (error) {
    console.error("❌ Erro:", error.message);
  }
}

verificarJogosCSGO();
