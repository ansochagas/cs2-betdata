const axios = require("axios");

async function testarPinnacleExato() {
  console.log("🎮 TESTE EXATO - PINNACLE ODDS API");
  console.log("📋 Endpoint exato fornecido pelo usuário");
  console.log("🎯 kit/v1/sports");
  console.log("============================================================\n");

  const API_KEY = "d5da2b13a6msh434479d753d8387p12bae1jsn117c3b0f7da9";
  const API_HOST = "pinnacle-odds.p.rapidapi.com";

  try {
    console.log("📖 TESTE: GET /kit/v1/sports");
    const response = await axios.get(
      "https://pinnacle-odds.p.rapidapi.com/kit/v1/sports",
      {
        headers: {
          "x-rapidapi-host": API_HOST,
          "x-rapidapi-key": API_KEY,
        },
        timeout: 15000,
      }
    );

    console.log(`✅ Status: ${response.status}`);
    console.log(`📊 Dados recebidos:`);
    console.log(JSON.stringify(response.data, null, 2));

    if (response.data?.sports && response.data.sports.length > 0) {
      console.log(`\n🏆 ESPORTES ENCONTRADOS: ${response.data.sports.length}`);

      // Procurar por CS:GO
      const csgoSports = response.data.sports.filter(
        (sport) =>
          sport.name?.toLowerCase().includes("counter") ||
          sport.name?.toLowerCase().includes("cs:go") ||
          sport.name?.toLowerCase().includes("csgo") ||
          sport.name?.toLowerCase().includes("cs2") ||
          sport.name?.toLowerCase().includes("esports")
      );

      if (csgoSports.length > 0) {
        console.log("\n🎯 CS:GO ENCONTRADO!");
        csgoSports.forEach((sport, index) => {
          console.log(`${index + 1}. ${sport.name} (ID: ${sport.id})`);
        });
      } else {
        console.log("\n❌ CS:GO não encontrado na lista");
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

testarPinnacleExato();
