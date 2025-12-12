// Teste do cache atual para ver que jogos estão sendo retornados
async function testCacheEndpoint() {
  console.log("🔍 Testando endpoint /api/cache/csgo-matches...\n");

  try {
    const response = await fetch(
      "http://localhost:3000/api/cache/csgo-matches"
    );
    const data = await response.json();

    console.log("📥 Resposta recebida:");
    console.log("Status:", response.status);
    console.log("Success:", data.success);
    console.log("Total jogos:", data.data?.length || 0);

    if (data.data && data.data.length > 0) {
      console.log("\n📋 Primeiros 5 jogos:");
      data.data.slice(0, 5).forEach((match, index) => {
        console.log(`${index + 1}. ${match.homeTeam} vs ${match.awayTeam}`);
        console.log(
          `   Data: ${new Date(match.startTime).toLocaleString("pt-BR")}`
        );
        console.log(`   Liga: ${match.league}`);
        console.log(`   Odds: ${match.odds?.moneyline ? "Sim" : "Não"}`);
        console.log("");
      });

      // Verificar se há jogos futuros
      const now = new Date();
      const futureMatches = data.data.filter(
        (match) => new Date(match.startTime) > now
      );
      console.log(`🎯 Jogos futuros: ${futureMatches.length}`);

      if (futureMatches.length > 0) {
        console.log("📅 Próximos jogos:");
        futureMatches.slice(0, 3).forEach((match) => {
          console.log(
            `  - ${match.homeTeam} vs ${match.awayTeam} (${new Date(
              match.startTime
            ).toLocaleString("pt-BR")})`
          );
        });
      }
    }
  } catch (error) {
    console.error("❌ Erro no teste:", error.message);
  }
}

testCacheEndpoint();
