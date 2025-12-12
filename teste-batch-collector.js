const {
  CSGOBatchCollector,
} = require("./src/lib/services/csgoBatchCollector.ts");

async function testarBatchCollector() {
  console.log("🎮 TESTANDO BATCH COLLECTOR");
  console.log("============================================================\n");

  try {
    const apiKey = process.env.SPRO_API_KEY || "demo-key";
    const collector = new CSGOBatchCollector(apiKey);

    console.log("🚀 Executando coleta batch...");
    const result = await collector.collectUpcomingMatches();

    console.log("\n📊 RESULTADO DA COLETA:");
    console.log(`✅ Sucesso: ${result.success}`);
    console.log(`📊 Jogos coletados: ${result.collected}`);
    console.log(`🔄 Jogos atualizados: ${result.updated}`);

    if (result.errors.length > 0) {
      console.log("\n❌ ERROS:");
      result.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    }

    console.log("\n🎯 Testando busca de jogos...");
    const matches = await collector.getUpcomingMatches(2);
    console.log(`📅 Jogos encontrados: ${matches.length}`);

    if (matches.length > 0) {
      console.log("🏆 Primeiro jogo:");
      console.log(`   ${matches[0].homeTeam} vs ${matches[0].awayTeam}`);
      console.log(`   📅 ${matches[0].scheduledAt}`);
      console.log(`   💰 Odds: ${matches[0].odds?.length || 0} disponíveis`);
    }
  } catch (error) {
    console.error("❌ ERRO GERAL:", error.message);
    console.error(error.stack);
  }
}

testarBatchCollector();
