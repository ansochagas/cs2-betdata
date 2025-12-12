const { DataCollectorService } = require("../src/services/data-collector");

async function populateMatches() {
  console.log("🎮 POPULANDO BANCO DE DADOS COM JOGOS CS:GO");
  console.log("📋 Script para popular cache inicial");
  console.log("============================================================\n");

  try {
    const dataCollector = new DataCollectorService();

    console.log("🔄 Buscando jogos da Pinnacle API...");
    const result = await dataCollector.collectAndStoreMatches();

    if (result.success) {
      console.log(
        `✅ SUCESSO: ${result.collected} jogos armazenados no banco!`
      );

      if (result.errors.length > 0) {
        console.log(`⚠️ ${result.errors.length} erros durante o processo:`);
        result.errors.forEach((error, index) => {
          console.log(`   ${index + 1}. ${error}`);
        });
      }

      console.log("\n🎯 BANCO POPULADO COM SUCESSO!");
      console.log(
        "💡 Agora o sistema usará dados do cache em vez de fazer requisições a cada login."
      );
      console.log(
        "🔄 Configure um cron job diário para executar: POST /api/matches/update-cache"
      );
    } else {
      console.error("❌ FALHA: Não foi possível popular o banco");
      result.errors.forEach((error, index) => {
        console.error(`   ${index + 1}. ${error}`);
      });
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ ERRO FATAL:", error.message);
    process.exit(1);
  }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  populateMatches();
}

module.exports = { populateMatches };
