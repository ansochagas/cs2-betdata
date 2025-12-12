const API_KEY = "POciMXi8fwRIbuW3qEWvPVqGTv_Yfv55T-_mwp8DzpYOR-1mYjo";
const BASE_URL = "https://api.pandascore.co";

async function testMatchTeamStats() {
  console.log(
    "🔍 Testando endpoint de estatísticas detalhadas por time em jogo...\n"
  );

  try {
    // Primeiro buscar um jogo finalizado
    const matchesResponse = await fetch(
      `${BASE_URL}/csgo/matches?filter[status]=finished&page[size]=1&sort=-end_at`,
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          Accept: "application/json",
        },
      }
    );

    if (!matchesResponse.ok) {
      console.log(`❌ Erro ao buscar jogos: ${matchesResponse.status}`);
      return;
    }

    const matches = await matchesResponse.json();
    if (matches.length === 0) {
      console.log("❌ Nenhum jogo finalizado encontrado");
      return;
    }

    const match = matches[0];
    console.log(`🎮 Jogo encontrado: ${match.name} (ID: ${match.id})`);
    console.log(
      `⚔️ Times: ${match.opponents
        ?.map((opp) => opp.opponent.name)
        .join(" vs ")}`
    );
    console.log(`📊 Placar: ${match.results?.map((r) => r.score).join("-")}\n`);

    // Testar estatísticas para cada time
    for (const opponent of match.opponents || []) {
      const team = opponent.opponent;
      console.log(
        `📊 Buscando stats do ${team.name} (ID: ${team.id}) no jogo ${match.id}...`
      );

      try {
        const statsResponse = await fetch(
          `${BASE_URL}/csgo/matches/${match.id}/teams/${team.id}/stats`,
          {
            headers: {
              Authorization: `Bearer ${API_KEY}`,
              Accept: "application/json",
            },
          }
        );

        console.log(`📊 Status da resposta: ${statsResponse.status}`);

        if (statsResponse.ok) {
          const stats = await statsResponse.json();
          console.log(`✅ Estatísticas encontradas para ${team.name}:`);
          console.log(JSON.stringify(stats, null, 2));
        } else {
          const errorText = await statsResponse.text();
          console.log(`❌ Erro ao buscar stats: ${errorText}`);
        }
      } catch (error) {
        console.log(`❌ Erro de rede: ${error.message}`);
      }

      console.log("=".repeat(50));
    }
  } catch (error) {
    console.log(`❌ Erro geral: ${error.message}`);
  }
}

testMatchTeamStats();
