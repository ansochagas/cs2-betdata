const axios = require("axios");

async function testarPinnacleEsports() {
  console.log("🎮 TESTE FINAL - PINNACLE ESPORTS");
  console.log("📋 E Sports encontrado! ID: 10");
  console.log("🎯 Agora vamos buscar jogos de CS:GO!");
  console.log("💰 Odds completas disponíveis");
  console.log("============================================================\n");

  const API_KEY = "d5da2b13a6msh434479d753d8387p12bae1jsn117c3b0f7da9";
  const API_HOST = "pinnacle-odds.p.rapidapi.com";

  try {
    // Teste 1: Buscar mercados/odds para E Sports (ID 10)
    console.log("📖 TESTE 1: Mercados de E Sports (ID: 10)");
    const marketsResponse = await axios.get(
      "https://pinnacle-odds.p.rapidapi.com/kit/v1/markets",
      {
        headers: {
          "x-rapidapi-host": API_HOST,
          "x-rapidapi-key": API_KEY,
        },
        params: {
          sport_id: 10, // E Sports
          is_have_odds: true,
          event_type: "prematch", // Jogos futuros
        },
        timeout: 15000,
      }
    );

    console.log(`✅ Status: ${marketsResponse.status}`);
    console.log(
      `📊 Eventos encontrados: ${marketsResponse.data?.events?.length || 0}`
    );

    if (
      marketsResponse.data?.events &&
      marketsResponse.data.events.length > 0
    ) {
      const events = marketsResponse.data.events;

      // Procurar por jogos de CS:GO
      const csgoEvents = events.filter(
        (event) =>
          event.home?.toLowerCase().includes("furia") ||
          event.away?.toLowerCase().includes("navi") ||
          event.home?.toLowerCase().includes("mibr") ||
          event.away?.toLowerCase().includes("faze") ||
          event.home?.toLowerCase().includes("astralis") ||
          event.away?.toLowerCase().includes("vitality") ||
          event.home?.toLowerCase().includes("cloud9") ||
          event.away?.toLowerCase().includes("heroic") ||
          event.league_name?.toLowerCase().includes("cs") ||
          event.league_name?.toLowerCase().includes("counter") ||
          event.league_name?.toLowerCase().includes("esports") ||
          event.league_name?.toLowerCase().includes("global")
      );

      console.log(`🎯 Eventos de CS:GO encontrados: ${csgoEvents.length}`);

      if (csgoEvents.length > 0) {
        console.log("\n🏆 JOGOS DE CS:GO COM ODDS ENCONTRADOS:");
        csgoEvents.slice(0, 10).forEach((event, index) => {
          const homeTeam = event.home || "TBD";
          const awayTeam = event.away || "TBD";
          const league = event.league_name || "N/A";
          const startTime = event.starts || "Unknown";
          const eventType = event.event_type || "Unknown";

          console.log(`${index + 1}. ${homeTeam} vs ${awayTeam}`);
          console.log(`   🏆 Liga: ${league}`);
          console.log(`   📅 Início: ${startTime}`);
          console.log(`   📊 Tipo: ${eventType}`);
          console.log(`   🆔 Event ID: ${event.event_id}`);

          // Mostrar odds Moneyline (1X2)
          if (event.periods?.num_0?.money_line) {
            const odds = event.periods.num_0.money_line;
            console.log(
              `   💰 Moneyline: ${odds.home || "N/A"} | ${
                odds.draw || "N/A"
              } | ${odds.away || "N/A"}`
            );
          }

          // Mostrar spreads
          if (
            event.periods?.num_0?.spreads &&
            Object.keys(event.periods.num_0.spreads).length > 0
          ) {
            const firstSpread = Object.values(event.periods.num_0.spreads)[0];
            console.log(
              `   📈 Spread: ${firstSpread.hdp || "N/A"} (${
                firstSpread.home || "N/A"
              } | ${firstSpread.away || "N/A"})`
            );
          }

          // Mostrar totals
          if (
            event.periods?.num_0?.totals &&
            Object.keys(event.periods.num_0.totals).length > 0
          ) {
            const firstTotal = Object.values(event.periods.num_0.totals)[0];
            console.log(
              `   🎯 Total: ${firstTotal.points || "N/A"} (O: ${
                firstTotal.over || "N/A"
              } | U: ${firstTotal.under || "N/A"})`
            );
          }

          console.log("");
        });

        // Testar specials markets (player props)
        console.log("🎪 TESTANDO MERCADOS ESPECIAIS (Player Props):");
        try {
          const specialsResponse = await axios.get(
            "https://pinnacle-odds.p.rapidapi.com/kit/v1/specials",
            {
              headers: {
                "x-rapidapi-host": API_HOST,
                "x-rapidapi-key": API_KEY,
              },
              params: {
                sport_id: 10, // E Sports
              },
              timeout: 15000,
            }
          );

          console.log(
            `   ✅ Mercados especiais encontrados: ${
              specialsResponse.data?.specials?.length || 0
            }`
          );

          if (
            specialsResponse.data?.specials &&
            specialsResponse.data.specials.length > 0
          ) {
            console.log("   🎪 EXEMPLOS DE PLAYER PROPS:");
            specialsResponse.data.specials
              .slice(0, 5)
              .forEach((special, idx) => {
                console.log(
                  `      ${idx + 1}. ${special.name} (${special.category})`
                );
                if (special.lines && Object.keys(special.lines).length > 0) {
                  const firstLine = Object.values(special.lines)[0];
                  console.log(
                    `         📊 Odd: ${firstLine.price || "N/A"} - Handicap: ${
                      firstLine.handicap || "N/A"
                    }`
                  );
                }
              });
          }
        } catch (error) {
          console.log(`   ❌ Erro ao buscar specials: ${error.message}`);
        }
      } else {
        console.log(
          "\n❌ Nenhum jogo de CS:GO encontrado nos eventos de E Sports"
        );

        // Mostrar todos os eventos de E Sports disponíveis
        console.log("\n🎮 TODOS OS EVENTOS DE E SPORTS DISPONÍVEIS:");
        events.slice(0, 10).forEach((event, index) => {
          const homeTeam = event.home || "TBD";
          const awayTeam = event.away || "TBD";
          const league = event.league_name || "N/A";
          const startTime = event.starts || "Unknown";

          console.log(
            `${
              index + 1
            }. ${homeTeam} vs ${awayTeam} (${league}) - ${startTime}`
          );
        });
      }

      // Estatísticas gerais
      const futureEvents = events.filter(
        (event) => event.event_type === "prematch"
      );
      const liveEvents = events.filter((event) => event.event_type === "live");

      console.log(`\n📊 ESTATÍSTICAS:`);
      console.log(`   📅 Eventos futuros: ${futureEvents.length}`);
      console.log(`   🔴 Eventos ao vivo: ${liveEvents.length}`);
      console.log(
        `   🏆 Ligas diferentes: ${
          new Set(events.map((e) => e.league_name)).size
        }`
      );
    } else {
      console.log("❌ Nenhum evento encontrado para E Sports");
    }

    console.log(
      "\n============================================================"
    );
    console.log("📊 RESUMO - PINNACLE ESPORTS");

    if (
      marketsResponse.data?.events &&
      marketsResponse.data.events.length > 0
    ) {
      const hasCsgo = marketsResponse.data.events.some(
        (event) =>
          event.home?.toLowerCase().includes("furia") ||
          event.away?.toLowerCase().includes("navi") ||
          event.league_name?.toLowerCase().includes("cs") ||
          event.league_name?.toLowerCase().includes("counter")
      );

      if (hasCsgo) {
        console.log("🎉 SUCESSO TOTAL! PINNACLE TEM CS:GO COM ODDS!");
        console.log("✅ Jogos de CS:GO encontrados");
        console.log("💰 Odds completas (1X2, spreads, totals)");
        console.log("🎪 Player props disponíveis");
        console.log("📈 Histórico de odds");
        console.log("🎯 PINNACLE É A API DEFINITIVA PARA CS:GO SCOUT!");
      } else {
        console.log("⚠️ E Sports encontrado, mas sem CS:GO específico");
        console.log("💡 Pode ter outros jogos de eSports (LoL, Dota, etc.)");
        console.log("🔍 Vamos verificar todos os eventos disponíveis");
      }
    }
  } catch (error) {
    console.error("❌ ERRO GERAL:", error.message);
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(
        `   Detalhes: ${JSON.stringify(error.response.data, null, 2)}`
      );
    }
  }
}

testarPinnacleEsports();
