const axios = require("axios");

async function testarTimeEspecifico() {
  console.log("🎯 Testando busca de time específico...");

  try {
    // Testar com MIBR (sem "Academy")
    const teamName = "MIBR";
    console.log(`📊 Procurando jogos de: ${teamName}`);

    let foundMatches = [];
    let page = 1;
    const maxPages = 10;

    while (foundMatches.length < 5 && page <= maxPages) {
      try {
        console.log(`🔍 Página ${page}...`);

        const response = await axios.get(
          `https://cs2-api.vercel.app/api/matches?page=${page}&limit=10`,
          {
            timeout: 5000,
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            },
          }
        );

        if (response.data && response.data.data) {
          const matches = response.data.data;

          // Filtrar jogos do time
          const teamMatches = matches.filter(
            (match) =>
              match.team_won.title === teamName ||
              match.team_lose.title === teamName
          );

          console.log(
            `   📊 Encontrados ${teamMatches.length} jogos de ${teamName} nesta página`
          );

          if (teamMatches.length > 0) {
            teamMatches.forEach((match) => {
              console.log(
                `   🏆 ${match.team_won.title} ${match.score_won}-${match.score_lose} ${match.team_lose.title} (${match.played_at})`
              );
            });
          }

          foundMatches.push(...teamMatches);

          if (foundMatches.length >= 5) break;
        }

        page++;
        await sleep(500); // Pausa entre requests
      } catch (error) {
        if (error.response?.status === 429) {
          console.log("⏳ Rate limit atingido, aguardando...");
          await sleep(2000);
        } else {
          console.error(`Erro na página ${page}:`, error.message);
          break;
        }
      }
    }

    console.log(`\n✅ RESULTADO FINAL:`);
    console.log(
      `📊 Total de jogos encontrados para ${teamName}: ${foundMatches.length}`
    );

    if (foundMatches.length > 0) {
      const recentMatches = foundMatches
        .sort((a, b) => new Date(b.played_at) - new Date(a.played_at))
        .slice(0, 5);

      console.log(`🏆 Últimos 5 jogos:`);
      recentMatches.forEach((match) => {
        const result =
          match.team_won.title === teamName
            ? `✅ Venceu ${match.score_won}-${match.score_lose} vs ${match.team_lose.title}`
            : `❌ Perdeu ${match.score_lose}-${match.score_won} vs ${match.team_won.title}`;
        console.log(`   ${result} (${match.played_at})`);
      });

      const wins = recentMatches.filter(
        (m) => m.team_won.title === teamName
      ).length;
      const winRate = wins / recentMatches.length;

      console.log(
        `📈 Win Rate: ${(winRate * 100).toFixed(1)}% (${wins}/${
          recentMatches.length
        })`
      );
    }
  } catch (error) {
    console.error("❌ Erro geral:", error.message);
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

testarTimeEspecifico();
