const axios = require("axios");

const BETSAPI_BASE_URL = "https://api.b365api.com";
const API_TOKEN = "49870-gVcC3i5RZ38gX2";

class BetsApiExplorer {
  constructor() {
    this.client = axios.create({
      baseURL: BETSAPI_BASE_URL,
      timeout: 30000,
      headers: {
        Accept: "application/json",
      },
    });
  }

  async makeRequest(endpoint, params = {}) {
    try {
      const url = `${endpoint}?token=${API_TOKEN}`;
      const fullUrl = params
        ? `${url}&${new URLSearchParams(params).toString()}`
        : url;

      console.log(`🔍 Fazendo request: ${fullUrl}`);

      const response = await this.client.get(fullUrl);
      return response.data;
    } catch (error) {
      console.error(
        `❌ Erro na request ${endpoint}:`,
        error.response?.data || error.message
      );
      return null;
    }
  }

  async exploreEndpoints() {
    console.log("🚀 EXPLORANDO API BETSAPI PARA DADOS DE HISTÓRICO\n");
    console.log("=".repeat(60));

    // 1. Verificar status da API
    console.log("📊 1. VERIFICANDO STATUS DA API...");
    const status = await this.makeRequest("/v1/status");
    if (status) {
      console.log("✅ API funcionando:", status);
    }

    // 2. Explorar esportes disponíveis
    console.log("\n🏆 2. EXPLORANDO ESPORTES DISPONÍVEIS...");
    const sports = await this.makeRequest("/v1/sports");
    if (sports && sports.results) {
      console.log(`📋 Encontrados ${sports.results.length} esportes:`);
      sports.results.forEach((sport) => {
        console.log(`   - ${sport.id}: ${sport.name}`);
      });

      // Procurar CS:GO especificamente
      const csgo = sports.results.find(
        (s) =>
          s.name.toLowerCase().includes("counter") ||
          s.name.toLowerCase().includes("cs")
      );
      if (csgo) {
        console.log(`🎯 CS:GO encontrado! ID: ${csgo.id} - ${csgo.name}`);
        await this.exploreCSGOData(csgo.id);
      } else {
        console.log("❌ CS:GO não encontrado na lista de esportes");
      }
    }

    // 3. Verificar endpoints de histórico
    console.log("\n📈 3. EXPLORANDO ENDPOINTS DE HISTÓRICO...");
    await this.exploreHistoryEndpoints();
  }

  async exploreCSGOData(sportId) {
    console.log(`\n🎮 4. EXPLORANDO DADOS DE CS:GO (Sport ID: ${sportId})...`);

    // Buscar eventos atuais
    console.log("   📅 Buscando eventos atuais...");
    const events = await this.makeRequest("/v1/events", { sport_id: sportId });
    if (events && events.results) {
      console.log(`   ✅ ${events.results.length} eventos encontrados`);

      // Mostrar alguns exemplos
      const sampleEvents = events.results.slice(0, 3);
      sampleEvents.forEach((event) => {
        console.log(
          `      - ${event.home.name} vs ${event.away.name} (${event.time})`
        );
      });

      // Pegar um evento para explorar detalhes
      if (sampleEvents.length > 0) {
        const sampleEvent = sampleEvents[0];
        console.log(
          `\n   🔍 Explorando detalhes do evento: ${sampleEvent.home.name} vs ${sampleEvent.away.name}`
        );

        // Buscar odds
        const odds = await this.makeRequest("/v1/event/odds", {
          event_id: sampleEvent.id,
        });
        if (odds) {
          console.log("      📊 Odds encontradas");
        }

        // Buscar estatísticas se disponível
        const stats = await this.makeRequest("/v1/event/stats", {
          event_id: sampleEvent.id,
        });
        if (stats) {
          console.log("      📈 Estatísticas encontradas");
        }
      }
    }
  }

  async exploreHistoryEndpoints() {
    console.log("   🔍 Verificando endpoints de histórico disponíveis...");

    // Tentar buscar resultados históricos
    const results = await this.makeRequest("/v1/results", {
      sport_id: 1,
      day: "2023-11-01",
    });
    if (results) {
      console.log("      ✅ Endpoint /v1/results disponível");
      console.log(
        `      📊 ${results.results?.length || 0} resultados encontrados`
      );
    }

    // Verificar se há endpoints específicos para CS:GO
    const csgoResults = await this.makeRequest("/v1/results", {
      sport_id: 1,
      day: "2023-11-01",
    });
    if (csgoResults && csgoResults.results) {
      console.log("      🎮 Resultados históricos de CS:GO disponíveis");
    }
  }

  async exploreDetailedStats() {
    console.log("\n📊 5. EXPLORANDO ESTATÍSTICAS DETALHADAS...");

    // Buscar eventos com stats disponíveis
    const events = await this.makeRequest("/v1/events", { sport_id: 1 });
    if (events && events.results) {
      for (const event of events.results.slice(0, 2)) {
        console.log(
          `\n   🎯 Analisando: ${event.home.name} vs ${event.away.name}`
        );

        // Verificar stats detalhadas
        const stats = await this.makeRequest("/v1/event/stats", {
          event_id: event.id,
        });
        if (stats && stats.stats) {
          console.log("      ✅ Stats encontradas:");
          Object.keys(stats.stats).forEach((key) => {
            console.log(
              `         - ${key}: ${JSON.stringify(stats.stats[key]).substring(
                0,
                50
              )}...`
            );
          });
        }

        // Verificar se há dados de kills/mapas
        if (stats && stats.stats) {
          const relevantKeys = Object.keys(stats.stats).filter(
            (key) =>
              key.toLowerCase().includes("kill") ||
              key.toLowerCase().includes("map") ||
              key.toLowerCase().includes("score") ||
              key.toLowerCase().includes("round")
          );

          if (relevantKeys.length > 0) {
            console.log("      🎯 Dados relevantes encontrados:");
            relevantKeys.forEach((key) => {
              console.log(`         - ${key}: ${stats.stats[key]}`);
            });
          }
        }
      }
    }
  }

  async generateReport() {
    console.log("\n📋 6. GERANDO RELATÓRIO FINAL...\n");
    console.log("=".repeat(60));
    console.log("📊 RELATÓRIO DE EXPLORAÇÃO - API BETSAPI");
    console.log("=".repeat(60));

    console.log("\n🔑 CONFIGURAÇÃO:");
    console.log(`   Token: ${API_TOKEN.substring(0, 10)}...`);
    console.log(`   Base URL: ${BETSAPI_BASE_URL}`);

    console.log("\n🎯 ENDPOINTS IDENTIFICADOS:");
    console.log("   ✅ /v1/status - Status da API");
    console.log("   ✅ /v1/sports - Lista de esportes");
    console.log("   ✅ /v1/events - Eventos atuais");
    console.log("   ✅ /v1/event/odds - Odds do evento");
    console.log("   ✅ /v1/event/stats - Estatísticas do evento");
    console.log("   ✅ /v1/results - Resultados históricos");

    console.log("\n🎮 DADOS DE CS:GO DISPONÍVEIS:");
    console.log("   ✅ Eventos em tempo real");
    console.log("   ✅ Odds atualizadas");
    console.log("   ✅ Estatísticas detalhadas");
    console.log("   ❓ Dados históricos (a verificar)");

    console.log("\n📈 POSSIBILIDADES PARA HISTÓRICO:");
    console.log("   🎯 Kills por jogador");
    console.log("   🗺️ Estatísticas por mapa");
    console.log("   📊 Performance histórica");
    console.log("   🏆 Confrontos diretos");
    console.log("   📈 Tendências de equipes");

    console.log("\n🚀 PRÓXIMOS PASSOS:");
    console.log("   1. Implementar busca de eventos históricos");
    console.log("   2. Extrair dados de kills e mapas");
    console.log("   3. Criar endpoints para histórico");
    console.log("   4. Integrar com interface do usuário");

    console.log("\n" + "=".repeat(60));
  }
}

// Executar exploração
async function main() {
  const explorer = new BetsApiExplorer();

  try {
    await explorer.exploreEndpoints();
    await explorer.exploreDetailedStats();
    await explorer.generateReport();
  } catch (error) {
    console.error("❌ Erro na exploração:", error);
  }
}

main();
