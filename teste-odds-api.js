const axios = require("axios");

async function testarOddsAPI() {
  console.log("🎮 TESTE - ODDS-API.IO (10 DIAS DE TESTE)");
  console.log("📋 Verificando esportes disponíveis e CS:GO");
  console.log("🎯 API de probabilidades esportivas");
  console.log("💰 10 dias de teste gratuito");
  console.log("============================================================\n");

  const API_KEY =
    "2957ae4f2281c635dc54c31f0b7d78bcd58974c437682731cff6a440a353a2fb";

  try {
    // Teste 1: Esportes disponíveis
    console.log("📖 TESTE 1: Esportes disponíveis");
    console.log("🔍 URL: https://api.odds-api.io/v3/sports");
    const sportsResponse = await axios.get(
      "https://api.odds-api.io/v3/sports",
      {
        params: { apiKey: API_KEY },
        timeout: 10000,
      }
    );

    console.log(`✅ Status: ${sportsResponse.status}`);
    console.log(
      `📊 Esportes encontrados: ${sportsResponse.data.data?.length || 0}`
    );

    if (sportsResponse.data.data) {
      const sports = sportsResponse.data.data;

      // Procurar por CS:GO ou esports
      const csgoSports = sports.filter(
        (sport) =>
          sport.key?.toLowerCase().includes("cs") ||
          sport.key?.toLowerCase().includes("counter") ||
          sport.key?.toLowerCase().includes("esports") ||
          sport.key?.toLowerCase().includes("valorant") ||
          sport.key?.toLowerCase().includes("lol") ||
          sport.title?.toLowerCase().includes("cs") ||
          sport.title?.toLowerCase().includes("counter") ||
          sport.title?.toLowerCase().includes("esports") ||
          sport.title?.toLowerCase().includes("valorant") ||
          sport.title?.toLowerCase().includes("lol")
      );

      console.log(`🎮 Esportes de eSports encontrados: ${csgoSports.length}`);

      if (csgoSports.length > 0) {
        console.log("\n🏆 ESPORTS DISPONÍVEIS:");
        csgoSports.forEach((sport, index) => {
          console.log(`${index + 1}. ${sport.title} (${sport.key})`);
          console.log(`   Ativo: ${sport.active ? "✅" : "❌"}`);
          console.log(`   Descrição: ${sport.description || "N/A"}`);
          console.log("");
        });
      } else {
        console.log("\n❌ Nenhum esporte de eSports encontrado");
      }

      // Mostrar todos os esportes disponíveis
      console.log("🎯 TODOS OS ESPORTES DISPONÍVEIS:");
      sports.slice(0, 20).forEach((sport, index) => {
        console.log(
          `${index + 1}. ${sport.title} (${sport.key}) - ${
            sport.active ? "Ativo" : "Inativo"
          }`
        );
      });

      if (sports.length > 20) {
        console.log(`... e mais ${sports.length - 20} esportes`);
      }
    }

    // Teste 2: Verificar se há CS:GO específico
    console.log("\n📖 TESTE 2: Verificando CS:GO específico");
    const csgoKeys = [
      "csgo",
      "counter-strike",
      "counterstrike",
      "cs-go",
      "esports",
    ];

    for (const key of csgoKeys) {
      try {
        console.log(`🔍 Testando chave: ${key}`);
        const eventsResponse = await axios.get(
          "https://api.odds-api.io/v3/events",
          {
            params: {
              apiKey: API_KEY,
              sport: key,
            },
            timeout: 10000,
          }
        );

        console.log(`✅ Status: ${eventsResponse.status}`);
        console.log(
          `📊 Eventos encontrados: ${eventsResponse.data.data?.length || 0}`
        );

        if (eventsResponse.data.data && eventsResponse.data.data.length > 0) {
          console.log("🏆 EVENTOS DE CS:GO ENCONTRADOS!");
          eventsResponse.data.data.slice(0, 5).forEach((event, index) => {
            console.log(
              `${index + 1}. ${event.home_team} vs ${event.away_team}`
            );
            console.log(`   Data: ${event.commence_time}`);
            console.log(`   ID: ${event.id}`);
            console.log("");
          });
          break; // Encontrou CS:GO, pode parar
        }
      } catch (error) {
        if (error.response?.status === 404) {
          console.log(`❌ Chave ${key} não encontrada`);
        } else {
          console.log(`❌ Erro com chave ${key}: ${error.message}`);
        }
      }
    }

    console.log(
      "\n============================================================"
    );
    console.log("📊 RESUMO - ODDS-API.IO");
    console.log("✅ API funcionando com chave de teste");
    console.log("✅ Lista de esportes obtida");
    console.log("🎯 Verificar se CS:GO está na lista de esportes");
  } catch (error) {
    console.error("❌ Erro geral:", error.message);
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(
        `   Detalhes: ${JSON.stringify(error.response.data, null, 2)}`
      );
    }
  }
}

testarOddsAPI();
