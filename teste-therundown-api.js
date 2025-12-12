const axios = require("axios");

async function testarTheRundownAPI() {
  console.log("🎮 TESTE - THE RUNDDOWN API (RapidAPI)");
  console.log("📋 API de apostas esportivas");
  console.log("🎯 Via RapidAPI - dados de apostas");
  console.log("💰 Gratuita com limites");
  console.log("============================================================\n");

  const API_KEY = "d5da2b13a6msh434479d753d8387p12bae1jsn117c3b0f7da9";
  const API_HOST = "therundown-therundown-v1.p.rapidapi.com";

  try {
    // Teste 1: Esportes disponíveis
    console.log("📖 TESTE 1: Esportes disponíveis");
    const sportsResponse = await axios.get(
      "https://therundown-therundown-v1.p.rapidapi.com/sports",
      {
        headers: {
          "x-rapidapi-host": API_HOST,
          "x-rapidapi-key": API_KEY,
        },
        timeout: 10000,
      }
    );

    console.log(`✅ Status: ${sportsResponse.status}`);
    console.log(
      `📊 Esportes encontrados: ${sportsResponse.data?.sports?.length || 0}`
    );

    if (sportsResponse.data?.sports) {
      const sports = sportsResponse.data.sports;

      // Procurar por CS:GO ou esports
      const esports = sports.filter(
        (sport) =>
          sport.name?.toLowerCase().includes("cs") ||
          sport.name?.toLowerCase().includes("counter") ||
          sport.name?.toLowerCase().includes("esports") ||
          sport.name?.toLowerCase().includes("valorant") ||
          sport.name?.toLowerCase().includes("lol") ||
          sport.name?.toLowerCase().includes("dota") ||
          sport.name?.toLowerCase().includes("overwatch") ||
          sport.name?.toLowerCase().includes("rainbow") ||
          sport.league_name?.toLowerCase().includes("cs") ||
          sport.league_name?.toLowerCase().includes("counter") ||
          sport.league_name?.toLowerCase().includes("esports")
      );

      console.log(`🎮 Esportes de eSports encontrados: ${esports.length}`);

      if (esports.length > 0) {
        console.log("\n🏆 ESPORTS DISPONÍVEIS:");
        esports.forEach((sport, index) => {
          console.log(`${index + 1}. ${sport.name} (${sport.id})`);
          console.log(`   Liga: ${sport.league_name || "N/A"}`);
          console.log(`   Ativo: ${sport.active ? "✅" : "❌"}`);
          console.log("");
        });
      } else {
        console.log("\n❌ Nenhum esporte de eSports encontrado");
      }

      // Mostrar todos os esportes disponíveis (primeiros 10)
      console.log("🎯 TODOS OS ESPORTES DISPONÍVEIS (primeiros 10):");
      sports.slice(0, 10).forEach((sport, index) => {
        console.log(
          `${index + 1}. ${sport.name} (${sport.id}) - ${
            sport.active ? "Ativo" : "Inativo"
          }`
        );
      });

      if (sports.length > 10) {
        console.log(`... e mais ${sports.length - 10} esportes`);
      }
    }

    // Teste 2: Verificar eventos de um esporte específico (se houver esports)
    if (sportsResponse.data?.sports) {
      const esports = sportsResponse.data.sports.filter(
        (sport) =>
          sport.name?.toLowerCase().includes("cs") ||
          sport.name?.toLowerCase().includes("counter") ||
          sport.name?.toLowerCase().includes("esports")
      );

      if (esports.length > 0) {
        console.log("\n📖 TESTE 2: Eventos de eSports");
        const firstEsport = esports[0];

        try {
          const eventsResponse = await axios.get(
            `https://therundown-therundown-v1.p.rapidapi.com/sports/${firstEsport.id}/events`,
            {
              headers: {
                "x-rapidapi-host": API_HOST,
                "x-rapidapi-key": API_KEY,
              },
              timeout: 10000,
            }
          );

          console.log(
            `✅ Eventos encontrados: ${
              eventsResponse.data?.events?.length || 0
            }`
          );

          if (eventsResponse.data?.events?.length > 0) {
            console.log("🏆 Primeiros eventos:");
            eventsResponse.data.events.slice(0, 3).forEach((event, index) => {
              console.log(
                `${index + 1}. ${event.home_team} vs ${event.away_team}`
              );
              console.log(`   📅 ${event.event_date}`);
              console.log(`   🏆 ${event.league_name}`);
              console.log("");
            });
          }
        } catch (error) {
          console.log(`⚠️ Erro ao buscar eventos: ${error.message}`);
        }
      }
    }

    console.log(
      "\n============================================================"
    );
    console.log("📊 RESUMO - THE RUNDDOWN API");

    if (sportsResponse.data?.sports) {
      const esportsCount = sportsResponse.data.sports.filter(
        (sport) =>
          sport.name?.toLowerCase().includes("cs") ||
          sport.name?.toLowerCase().includes("counter") ||
          sport.name?.toLowerCase().includes("esports") ||
          sport.name?.toLowerCase().includes("valorant") ||
          sport.name?.toLowerCase().includes("lol") ||
          sport.name?.toLowerCase().includes("dota")
      ).length;

      if (esportsCount > 0) {
        console.log("🎉 ENCONTROU ESPORTS!");
        console.log("✅ POSSÍVEL FONTE DE DADOS DE CS:GO!");
      } else {
        console.log("❌ NENHUM ESPORT ENCONTRADO");
        console.log("💡 FOCADA EM ESPORTES TRADICIONAIS");
      }
    }
  } catch (error) {
    console.error("❌ ERRO GERAL:", error.message);
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(
        `   Detalhes: ${JSON.stringify(error.response.data, null, 2)}`
      );
    }
  }
}

testarTheRundownAPI();
