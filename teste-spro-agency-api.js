require("dotenv").config({ path: ".env.local" });
const axios = require("axios");

// ⚠️ IMPORTANTE: Configure sua API key no .env.local como SPRO_API_KEY
const API_KEY = process.env.SPRO_API_KEY || "YOUR_TOKEN"; // Pega do .env ou usa placeholder

async function testarSproAgencyAPI() {
  console.log("🎮 TESTE - SPRO AGENCY API (BOLT ODDS)");
  console.log("📋 Testando API de apostas esportivas");
  console.log("🎯 WebSocket + REST API para dados de apostas");
  console.log("⚠️ PRECISA DE API KEY REAL");
  console.log("============================================================\n");

  try {
    // Teste 1: Verificar esportes disponíveis
    console.log("📖 TESTE 1: Esportes disponíveis");
    console.log("🔍 URL: https://spro.agency/api/get_info");
    const infoResponse = await axios.get("https://spro.agency/api/get_info", {
      params: { key: API_KEY },
      timeout: 10000,
    });

    console.log(`✅ Status: ${infoResponse.status}`);
    console.log("📊 Estrutura completa dos dados:");
    console.log(JSON.stringify(infoResponse.data, null, 2));

    if (infoResponse.data && infoResponse.data.sports) {
      console.log("\n🏆 ESTRUTURA DOS ESPORTES:");
      console.log("Tipo:", typeof infoResponse.data.sports);
      console.log("Chaves:", Object.keys(infoResponse.data.sports));

      console.log("\n🏆 ESPORTES DISPONÍVEIS:");
      const sports = Object.keys(infoResponse.data.sports);
      sports.forEach((sport) => {
        const sportName = infoResponse.data.sports[sport];
        console.log(`   - ${sport}: ${sportName}`);
      });

      // Verificar se tem CS:GO
      const csgoSports = sports.filter((sport) => {
        const sportName = infoResponse.data.sports[sport];
        return (
          sportName &&
          (sportName.toLowerCase().includes("cs") ||
            sportName.toLowerCase().includes("counter") ||
            sportName.toLowerCase().includes("go") ||
            sportName.toLowerCase().includes("esports"))
        );
      });

      if (csgoSports.length > 0) {
        console.log("\n🎯 CS:GO ENCONTRADO!");
        csgoSports.forEach((sport) => {
          const sportName = infoResponse.data.sports[sport];
          console.log(`   ✅ ${sport}: ${sportName}`);
        });
      } else {
        console.log("\n❌ CS:GO NÃO ENCONTRADO nos esportes");
      }
    }

    if (infoResponse.data && infoResponse.data.sportsbooks) {
      console.log("\n🏦 SPORTSBOOKS DISPONÍVEIS:");
      const books = Object.keys(infoResponse.data.sportsbooks);
      books.slice(0, 10).forEach((book) => {
        const bookName = infoResponse.data.sportsbooks[book];
        console.log(`   - ${book}: ${bookName}`);
      });
      if (books.length > 10) {
        console.log(`   ... e mais ${books.length - 10} sportsbooks`);
      }
    }

    // Teste 2: Verificar jogos disponíveis
    console.log("\n📖 TESTE 2: Jogos disponíveis");
    console.log("🔍 URL: https://spro.agency/api/get_games");
    const gamesResponse = await axios.get("https://spro.agency/api/get_games", {
      params: { key: API_KEY },
      timeout: 10000,
    });

    console.log(`✅ Status: ${gamesResponse.status}`);
    console.log("📊 Estrutura dos jogos:");
    console.log("Tipo:", typeof gamesResponse.data);
    console.log("Dados:", JSON.stringify(gamesResponse.data, null, 2));

    if (gamesResponse.data && Array.isArray(gamesResponse.data)) {
      console.log(`📊 Total de jogos: ${gamesResponse.data.length}`);

      // Filtrar jogos de CS:GO
      const csgoGames = gamesResponse.data.filter(
        (game) =>
          game &&
          (game.toLowerCase().includes("cs") ||
            game.toLowerCase().includes("counter") ||
            game.toLowerCase().includes("go") ||
            game.toLowerCase().includes("esports") ||
            game.toLowerCase().includes("furia") ||
            game.toLowerCase().includes("mibr") ||
            game.toLowerCase().includes("virtus") ||
            game.toLowerCase().includes("pain"))
      );

      if (csgoGames.length > 0) {
        console.log("\n🎯 JOGOS DE CS:GO ENCONTRADOS!");
        csgoGames.slice(0, 5).forEach((game) => console.log(`   ✅ ${game}`));
        if (csgoGames.length > 5) {
          console.log(`   ... e mais ${csgoGames.length - 5} jogos`);
        }
      } else {
        console.log("\n❌ Nenhum jogo de CS:GO encontrado");
      }

      // Mostrar alguns jogos de exemplo
      console.log("\n📅 EXEMPLOS DE JOGOS DISPONÍVEIS:");
      gamesResponse.data.slice(0, 5).forEach((game) => {
        console.log(`   - ${game}`);
      });
    }

    console.log(
      "\n============================================================"
    );
    console.log("📊 RESUMO - SPRO AGENCY API");

    const hasCSGO =
      infoResponse.data?.sports &&
      Object.values(infoResponse.data.sports).some(
        (sport) =>
          sport &&
          (sport.toLowerCase().includes("cs") ||
            sport.toLowerCase().includes("counter") ||
            sport.toLowerCase().includes("go") ||
            sport.toLowerCase().includes("esports"))
      );

    if (hasCSGO) {
      console.log("🎯 CS:GO DISPONÍVEL!");
      console.log("✅ Esporte encontrado");
      console.log("🎯 PERFEITA PARA CS:GO SCOUT!");
      console.log("💰 API de apostas em tempo real");
      console.log("📊 Dados para análise de probabilidades");
    } else {
      console.log("❌ CS:GO NÃO DISPONÍVEL");
      console.log("💡 API focada em esportes tradicionais");
      console.log(
        "📋 Esportes encontrados:",
        Object.values(infoResponse.data?.sports || {}).join(", ")
      );
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

testarSproAgencyAPI();
