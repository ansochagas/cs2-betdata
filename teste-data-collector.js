require("dotenv").config({ path: ".env.local" });
const { CSGODataCollector } = require("./src/lib/services/csgoDataCollector");

async function testarDataCollector() {
  console.log("🎮 TESTE - CSGO Data Collector Service");
  console.log("📋 Testando coleta de dados em tempo real");
  console.log("============================================================\n");

  // Obter API key
  const apiKey = process.env.SPRO_API_KEY;

  if (!apiKey || apiKey === "your-spro-api-key-here") {
    console.error("❌ API key não configurada!");
    console.log("Configure SPRO_API_KEY no arquivo .env.local");
    return;
  }

  // Criar instância do Data Collector
  const dataCollector = new CSGODataCollector(apiKey);

  try {
    // Iniciar coleta de dados
    console.log("🚀 Iniciando coleta de dados...");
    await dataCollector.startCollecting();

    // Aguardar alguns segundos para receber dados
    console.log("⏰ Aguardando dados por 30 segundos...");

    setTimeout(async () => {
      console.log("⏰ Tempo esgotado. Parando coleta...");
      await dataCollector.stopCollecting();

      // Testar busca de jogos futuros
      console.log("\n📅 Testando busca de jogos futuros...");
      const upcomingMatches = await dataCollector.getUpcomingMatches(2);

      console.log(
        `📊 Encontrados ${upcomingMatches.length} jogos nos próximos 2 dias:`
      );

      upcomingMatches.forEach((match, index) => {
        console.log(`${index + 1}. ${match.homeTeam} vs ${match.awayTeam}`);
        console.log(`   📅 ${match.scheduledAt.toISOString()}`);
        console.log(`   🎮 ${match.gameName}`);
        console.log(`   💰 Odds: ${match.odds?.length || 0} sportsbooks`);
        console.log("");
      });

      console.log("✅ Teste do Data Collector concluído!");
      process.exit(0);
    }, 30000); // 30 segundos
  } catch (error) {
    console.error("❌ Erro no teste:", error.message);
    process.exit(1);
  }

  // Graceful shutdown
  process.on("SIGINT", async () => {
    console.log("\n🔌 Recebido SIGINT. Parando coleta...");
    await dataCollector.stopCollecting();
    process.exit(0);
  });
}

testarDataCollector();
