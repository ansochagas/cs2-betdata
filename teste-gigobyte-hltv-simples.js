const HLTV = require("hltv");

async function testarGigobyteHLTVSimples() {
  console.log("🎮 TESTE SIMPLES - GIGOBYTE/HLTV API");
  console.log("📋 Verificando métodos disponíveis");
  console.log("============================================================\n");

  try {
    // Verificar métodos disponíveis
    console.log("🔍 MÉTODOS DISPONÍVEIS:");
    console.log(
      Object.getOwnPropertyNames(HLTV).filter(
        (name) => typeof HLTV[name] === "function"
      )
    );

    console.log("\n🔍 PROPRIEDADES DISPONÍVEIS:");
    console.log(Object.getOwnPropertyNames(HLTV));

    // Tentar usar o método correto
    console.log("\n📖 TESTANDO MÉTODO getRecentResults():");
    try {
      const results = await HLTV.getRecentResults();
      console.log(`✅ Resultados encontrados: ${results.length}`);
      if (results.length > 0) {
        console.log("📅 Primeiro resultado:");
        console.log(JSON.stringify(results[0], null, 2));
      }
    } catch (error) {
      console.log(`❌ Erro em getRecentResults: ${error.message}`);
    }

    // Tentar outro método
    console.log("\n📖 TESTANDO MÉTODO getTopTeams():");
    try {
      const topTeams = await HLTV.getTopTeams();
      console.log(`✅ Times encontrados: ${topTeams.length}`);
      if (topTeams.length > 0) {
        console.log("⭐ Primeiro time:");
        console.log(JSON.stringify(topTeams[0], null, 2));
      }
    } catch (error) {
      console.log(`❌ Erro em getTopTeams: ${error.message}`);
    }
  } catch (error) {
    console.error("❌ ERRO GERAL:", error.message);
    console.error("Stack:", error.stack);
  }
}

testarGigobyteHLTVSimples();
