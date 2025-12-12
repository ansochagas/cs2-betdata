const axios = require("axios");

async function investigarAPIDetalhada() {
  console.log("🔬 INVESTIGAÇÃO DETALHADA DA API SPRO AGENCY");
  console.log("===============================================\n");

  try {
    const response = await axios.get(
      "https://spro.agency/api/get_games?key=e63ec008-6a51-4970-bf88-6a527dbd8a79",
      { timeout: 10000 }
    );

    const games = response.data;
    console.log(`📊 Total de jogos: ${Object.keys(games).length}\n`);

    // 1. Mostrar primeiros 10 jogos para entender estrutura
    console.log("🔍 PRIMEIROS 10 JOGOS (estrutura):");
    const first10Keys = Object.keys(games).slice(0, 10);
    first10Keys.forEach((key, index) => {
      const game = games[key];
      console.log(`${index + 1}. Key: ${key}`);
      console.log(`   Sport: ${game.sport}`);
      console.log(`   Game: ${game.game}`);
      console.log(`   When: ${game.when}`);
      console.log("");
    });

    // 2. Buscar por termos relacionados a CS:GO de forma mais ampla
    console.log("🔎 BUSCANDO POR TERMOS RELACIONADOS A CS:GO:");
    const csgoRelated = Object.entries(games).filter(([key, game]) => {
      const searchText = `${key} ${game.sport} ${game.game}`.toLowerCase();
      return (
        searchText.includes("cs") ||
        searchText.includes("counter") ||
        searchText.includes("strike") ||
        searchText.includes("global") ||
        searchText.includes("offensive") ||
        searchText.includes("hltv") ||
        searchText.includes("esports") ||
        searchText.includes("valorant") ||
        searchText.includes("lol") ||
        searchText.includes("dota")
      );
    });

    console.log(
      `Encontrados ${csgoRelated.length} jogos relacionados a esports:`
    );
    csgoRelated.forEach(([key, game], index) => {
      console.log(`${index + 1}. ${game.game}`);
      console.log(`   Sport: ${game.sport}`);
      console.log(`   When: ${game.when}`);
      console.log(`   Key: ${key}`);
      console.log("");
    });

    // 3. Verificar códigos de esporte únicos
    const sportCodes = [
      ...new Set(Object.values(games).map((game) => game.sport)),
    ];
    console.log(`🎯 CÓDIGOS DE ESPORTE ÚNICOS (${sportCodes.length}):`);
    sportCodes.sort().forEach((code) => {
      console.log(`   - ${code}`);
    });

    // 4. Verificar jogos futuros (próximos 7 dias)
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    console.log(
      `\n📅 JOGOS NOS PRÓXIMOS 7 DIAS (${now.toISOString().split("T")[0]} até ${
        sevenDaysFromNow.toISOString().split("T")[0]
      }):`
    );

    const upcomingGames = Object.entries(games).filter(([key, game]) => {
      try {
        const gameDate = new Date(game.when);
        return gameDate >= now && gameDate <= sevenDaysFromNow;
      } catch (e) {
        return false;
      }
    });

    console.log(`Encontrados ${upcomingGames.length} jogos futuros:`);
    upcomingGames.slice(0, 20).forEach(([key, game], index) => {
      console.log(`${index + 1}. ${game.game}`);
      console.log(`   Sport: ${game.sport}`);
      console.log(`   When: ${game.when}`);
      console.log("");
    });

    // 5. Verificar se há algum jogo com data específica do dia 28
    console.log("🎯 VERIFICANDO JOGOS NO DIA 28 DE NOVEMBRO:");
    const nov28Games = Object.entries(games).filter(([key, game]) => {
      return game.when && game.when.includes("2025-11-28");
    });

    console.log(`Encontrados ${nov28Games.length} jogos no dia 28:`);
    nov28Games.forEach(([key, game], index) => {
      console.log(`${index + 1}. ${game.game}`);
      console.log(`   Sport: ${game.sport}`);
      console.log(`   When: ${game.when}`);
      console.log("");
    });
  } catch (error) {
    console.error("❌ Erro:", error.message);
  }
}

investigarAPIDetalhada();
