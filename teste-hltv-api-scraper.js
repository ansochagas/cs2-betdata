const HLTV = require("hltv-api").default;

async function testarHLTVScraper() {
  console.log("🎮 TESTE - HLTV-API SCRAPER (BIBLIOTECA)");
  console.log("📋 Testando scraping direto do HLTV.org");
  console.log("🎯 Biblioteca Node.js para dados atuais");
  console.log("⚠️ Pacote deprecated mas pode funcionar");
  console.log("============================================================\n");

  try {
    console.log("🔍 Verificando estrutura da biblioteca:");
    console.log("HLTV object:", typeof HLTV);
    console.log("HLTV keys:", Object.keys(HLTV || {}));

    // Tentar usar HLTV.default se existir
    const actualHLTV = HLTV.default || HLTV;
    console.log("Actual HLTV:", typeof actualHLTV);

    if (typeof actualHLTV.getMatches === "function") {
      console.log("\n📖 TESTE 1: Matches recentes");
      const recentMatches = await actualHLTV.getMatches();
      console.log(`✅ Matches encontrados: ${recentMatches.length}`);

      if (recentMatches.length > 0) {
        console.log("📅 Primeiro match:");
        console.log(JSON.stringify(recentMatches[0], null, 2));
      }
    } else {
      console.log("❌ Biblioteca não tem método getMatches");
      console.log("💡 Voltando para CS2 Match Data API...");
    }
  } catch (error) {
    console.error("❌ ERRO:", error.message);
    console.log(
      "💡 Biblioteca HLTV scraper não funcionou, vamos usar CS2 Match Data API"
    );
  }
}

testarHLTVScraper();
