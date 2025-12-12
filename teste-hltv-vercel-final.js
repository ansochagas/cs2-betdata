const axios = require("axios");

async function testarHLTVVercelFinal() {
  console.log("🎮 TESTE FINAL - HLTV-API.VERCEL.APP");
  console.log("📋 API JSON não-oficial do HLTV");
  console.log("🎯 Última tentativa antes de usar CS2 Match Data");
  console.log("============================================================\n");

  try {
    // Teste 1: Matches
    console.log("📖 TESTE 1: Matches");
    const matchesResponse = await axios.get(
      "https://hltv-api.vercel.app/api/matches.json"
    );
    console.log(`✅ Status: ${matchesResponse.status}`);
    console.log(`📊 Matches encontrados: ${matchesResponse.data.length}`);

    if (matchesResponse.data.length > 0) {
      const firstMatch = matchesResponse.data[0];
      console.log("📅 Primeiro match:");
      console.log(`   ID: ${firstMatch.id}`);
      console.log(`   Time: ${firstMatch.time}`);
      console.log(`   Event: ${firstMatch.event?.name}`);
      console.log(
        `   Teams: ${firstMatch.teams?.[0]?.name} vs ${firstMatch.teams?.[1]?.name}`
      );

      // Análise de datas
      const now = new Date();
      const matchDate = new Date(firstMatch.time);
      const daysDiff = Math.floor((now - matchDate) / (1000 * 60 * 60 * 24));

      console.log(`\n📅 ANÁLISE DE DATA:`);
      console.log(`   - Data do jogo: ${matchDate.toISOString()}`);
      console.log(`   - Dias atrás: ${daysDiff}`);

      if (daysDiff > 365) {
        console.log(
          `   ❌ DADOS ANTIGOS (${Math.floor(daysDiff / 365)} anos atrás)`
        );
      } else if (daysDiff > 30) {
        console.log(
          `   ⚠️ DADOS VELHOS (${Math.floor(daysDiff / 30)} meses atrás)`
        );
      } else {
        console.log(`   ✅ DADOS RECENTES`);
      }

      // Verificar jogos futuros
      const futureMatches = matchesResponse.data.filter((match) => {
        const matchTime = new Date(match.time);
        return matchTime > now;
      });

      console.log(`   - Jogos futuros: ${futureMatches.length}`);

      if (futureMatches.length > 0) {
        console.log("🎯 TEM JOGOS FUTUROS!");
        futureMatches.slice(0, 3).forEach((match, index) => {
          console.log(
            `   ${index + 1}. ${match.teams?.[0]?.name} vs ${
              match.teams?.[1]?.name
            } - ${match.time}`
          );
        });
      }
    }

    console.log(
      "\n============================================================"
    );
    console.log("📊 RESUMO FINAL - HLTV-API.VERCEL.APP");

    const futureMatches = matchesResponse.data.filter(
      (match) => new Date(match.time) > new Date()
    );
    if (futureMatches.length > 0) {
      console.log("🎉 ENCONTROU JOGOS FUTUROS!");
      console.log("✅ PODEMOS USAR ESTA API!");
    } else {
      console.log("❌ NENHUM JOGO FUTURO");
      console.log("💡 VAMOS USAR CS2 MATCH DATA API");
    }
  } catch (error) {
    console.error("❌ ERRO:", error.message);
  }
}

testarHLTVVercelFinal();
