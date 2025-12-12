const axios = require("axios");

async function investigateKills() {
  try {
    console.log("🔍 Investigando dados de kills na API Pandascore...\n");

    // 1. Buscar análise de FURIA vs Ninjas
    const response = await axios.get(
      "http://localhost:3000/api/pandascore/match-analysis?team1=FURIA&team2=Ninjas%20In%20Pyjamas"
    );

    if (response.data.success) {
      const data = response.data.data;

      console.log("📊 ESTRUTURA DOS DADOS RETORNADOS:");
      console.log("=====================================\n");

      console.log("🔹 TEAM 1 STATS:");
      console.log(JSON.stringify(data.team1Stats, null, 2));
      console.log("\n");

      console.log("🔹 TEAM 2 STATS:");
      console.log(JSON.stringify(data.team2Stats, null, 2));
      console.log("\n");

      console.log("🔹 ÚLTIMAS PARTIDAS (primeira):");
      if (
        data.team1Stats.recentMatches &&
        data.team1Stats.recentMatches.length > 0
      ) {
        console.log(
          "Time 1:",
          JSON.stringify(data.team1Stats.recentMatches[0], null, 2)
        );
      }
      if (
        data.team2Stats.recentMatches &&
        data.team2Stats.recentMatches.length > 0
      ) {
        console.log(
          "Time 2:",
          JSON.stringify(data.team2Stats.recentMatches[0], null, 2)
        );
      }
      console.log("\n");

      console.log("🔹 VERIFICANDO CAMPOS DE KILLS:");
      console.log("=====================================\n");

      // Verificar se há dados de kills
      const checkForKills = (matches, teamName) => {
        console.log(`🔍 Verificando kills em ${teamName}:`);
        if (!matches || matches.length === 0) {
          console.log("  ❌ Nenhuma partida encontrada");
          return;
        }

        matches.forEach((match, index) => {
          console.log(`  📌 Partida ${index + 1}:`);
          console.log(`    - ID: ${match.id}`);
          console.log(`    - Adversário: ${match.opponent}`);
          console.log(`    - Placar: ${match.score}`);
          console.log(`    - Resultado: ${match.result}`);
          console.log(`    - Maps: ${match.mapsPlayed || "N/A"}`);
          console.log(`    - Duração: ${match.matchLength || "N/A"}`);

          // Verificar campos relacionados a kills
          const killFields = Object.keys(match).filter(
            (key) =>
              key.toLowerCase().includes("kill") ||
              key.toLowerCase().includes("score") ||
              key.toLowerCase().includes("stat")
          );

          if (killFields.length > 0) {
            console.log(
              `    ✅ Campos relacionados encontrados: ${killFields.join(", ")}`
            );
            killFields.forEach((field) => {
              console.log(`      ${field}: ${match[field]}`);
            });
          } else {
            console.log(`    ❌ Nenhum campo de kills encontrado`);
          }
          console.log("");
        });
      };

      checkForKills(data.team1Stats.recentMatches, data.team1Stats.teamName);
      checkForKills(data.team2Stats.recentMatches, data.team2Stats.teamName);

      console.log("\n🔹 CONCLUSÃO SOBRE KILLS:");
      console.log("=====================================\n");

      const hasKills =
        (data.team1Stats.recentMatches || []).some((match) =>
          Object.keys(match).some((key) => key.toLowerCase().includes("kill"))
        ) ||
        (data.team2Stats.recentMatches || []).some((match) =>
          Object.keys(match).some((key) => key.toLowerCase().includes("kill"))
        );

      if (hasKills) {
        console.log("✅ A API retorna dados de kills!");
      } else {
        console.log("❌ A API NÃO retorna dados de kills na estrutura atual");
        console.log(
          "💡 Precisamos buscar dados mais detalhados ou usar outra fonte"
        );
      }
    } else {
      console.log("❌ Erro na resposta da API:", response.data.error);
    }
  } catch (error) {
    console.error("❌ Erro ao investigar kills:", error.message);
  }
}

investigateKills();
