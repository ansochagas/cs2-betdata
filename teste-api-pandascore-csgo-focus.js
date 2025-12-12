// Teste focado na API PandaScore para dados CS:GO que temos acesso
// Chave API: POciMXi8fwRIbuW3qEWvPVqGTv_Yfv55T-_mwp8DzpYOR-1mYjo

const API_KEY = "POciMXi8fwRIbuW3qEWvPVqGTv_Yfv55T-_mwp8DzpYOR-1mYjo";
const BASE_URL = "https://api.pandascore.co";

async function makeRequest(endpoint, params = {}) {
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.set("token", API_KEY);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, value);
    }
  });

  console.log(`🔍 ${endpoint}: ${url.toString()}`);

  try {
    const response = await fetch(url.toString());
    const data = await response.json();

    if (!response.ok) {
      console.error(`❌ Erro ${response.status}:`, data);
      return null;
    }

    return data;
  } catch (error) {
    console.error("❌ Erro de rede:", error);
    return null;
  }
}

async function exploreCSGOData() {
  console.log("🚀 Explorando dados CS:GO disponíveis na PandaScore API...\n");

  // 1. Jogos futuros (próximos 7 dias)
  console.log("⚔️ 1. JOGOS FUTUROS (PRÓXIMOS 7 DIAS)");
  const futureMatches = await makeRequest("/csgo/matches", {
    "filter[status]": "not_started",
    "filter[begin_at]": `${new Date().toISOString()},${new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    ).toISOString()}`,
    page: 1,
    per_page: 50,
    sort: "begin_at",
  });

  if (futureMatches) {
    console.log(`✅ ${futureMatches.length} jogos futuros encontrados`);

    // Agrupar por data
    const matchesByDate = futureMatches.reduce((acc, match) => {
      const date = new Date(match.begin_at).toISOString().split("T")[0];
      if (!acc[date]) acc[date] = [];
      acc[date].push(match);
      return acc;
    }, {});

    console.log("📅 Distribuição por data:");
    Object.entries(matchesByDate).forEach(([date, matches]) => {
      console.log(`  ${date}: ${matches.length} jogos`);
    });

    // Mostrar detalhes do primeiro jogo
    if (futureMatches.length > 0) {
      const match = futureMatches[0];
      console.log("\n📋 Primeiro jogo futuro:");
      console.log(`  ID: ${match.id}`);
      console.log(`  Nome: ${match.name}`);
      console.log(`  Status: ${match.status}`);
      console.log(
        `  Data: ${new Date(match.begin_at).toLocaleString("pt-BR")}`
      );
      console.log(`  Torneio ID: ${match.tournament_id}`);
      console.log(`  Liga ID: ${match.league_id}`);
      console.log("  Times:");
      match.opponents?.forEach((opp) => {
        console.log(`    - ${opp.opponent.name} (${opp.opponent.acronym})`);
        console.log(`      Logo: ${opp.opponent.image_url}`);
      });
    }
  }

  // 2. Jogos em andamento
  console.log("\n🎮 2. JOGOS EM ANDAMENTO (LIVE)");
  const liveMatches = await makeRequest("/csgo/matches", {
    "filter[status]": "running",
    page: 1,
    per_page: 20,
  });

  if (liveMatches) {
    console.log(`✅ ${liveMatches.length} jogos ao vivo`);

    if (liveMatches.length > 0) {
      const liveMatch = liveMatches[0];
      console.log("\n📋 Primeiro jogo ao vivo:");
      console.log(`  ID: ${liveMatch.id}`);
      console.log(`  Nome: ${liveMatch.name}`);
      console.log(`  Status: ${liveMatch.status}`);
      console.log(
        `  Data início: ${new Date(liveMatch.begin_at).toLocaleString("pt-BR")}`
      );
      console.log("  Times:");
      liveMatch.opponents?.forEach((opp) => {
        console.log(`    - ${opp.opponent.name} (${opp.opponent.acronym})`);
      });

      // Tentar pegar detalhes do jogo ao vivo
      const liveDetails = await makeRequest(`/csgo/matches/${liveMatch.id}`);
      if (liveDetails) {
        console.log("  Detalhes do jogo:");
        console.log(`    Número de mapas: ${liveDetails.number_of_games}`);
        console.log("    Jogos/Mapas:");
        liveDetails.games?.forEach((game, index) => {
          console.log(
            `      Mapa ${index + 1}: ${game.map || "TBD"} - Status: ${
              game.status
            }`
          );
          if (game.score) {
            console.log(`        Placar: ${game.score}`);
          }
        });
      }
    }
  }

  // 3. Times mais ativos
  console.log("\n👥 3. TIMES MAIS ATIVOS");
  const teams = await makeRequest("/csgo/teams", {
    page: 1,
    per_page: 100,
    sort: "-last_match_at", // Times que jogaram mais recentemente
  });

  if (teams) {
    console.log(`✅ ${teams.length} times encontrados`);

    // Filtrar times brasileiros/top
    const brazilianTeams = teams.filter(
      (team) =>
        team.location?.toLowerCase().includes("brazil") ||
        team.name.toLowerCase().includes("furia") ||
        team.name.toLowerCase().includes("mibr") ||
        team.name.toLowerCase().includes("red") ||
        team.name.toLowerCase().includes("fluxo")
    );

    console.log(`🇧🇷 Times brasileiros/envolvidos: ${brazilianTeams.length}`);
    brazilianTeams.slice(0, 10).forEach((team) => {
      console.log(
        `  - ${team.name} (${team.acronym || "N/A"}) - ${
          team.location || "N/A"
        }`
      );
      console.log(`    Logo: ${team.image_url}`);
      console.log(`    Players: ${team.players?.length || 0}`);
    });
  }

  // 4. Jogadores
  console.log("\n🎯 4. JOGADORES");
  const players = await makeRequest("/csgo/players", {
    page: 1,
    per_page: 50,
    sort: "-updated_at",
  });

  if (players) {
    console.log(`✅ ${players.length} jogadores encontrados`);

    // Filtrar jogadores brasileiros
    const brazilianPlayers = players.filter(
      (player) =>
        player.nationality === "BR" ||
        player.name.toLowerCase().includes("fallen") ||
        player.name.toLowerCase().includes("yuurih") ||
        player.name.toLowerCase().includes("kscerato") ||
        player.name.toLowerCase().includes("chelo")
    );

    console.log(`🇧🇷 Jogadores brasileiros: ${brazilianPlayers.length}`);
    brazilianPlayers.slice(0, 10).forEach((player) => {
      console.log(`  - ${player.name} (${player.nationality})`);
      console.log(`    Nickname: ${player.nickname || "N/A"}`);
      console.log(`    Time: ${player.team?.name || "N/A"}`);
      console.log(`    Slug: ${player.slug}`);
    });
  }

  // 5. Torneios ativos
  console.log("\n🏆 5. TORNEIOS ATIVOS");
  const activeTournaments = await makeRequest("/csgo/tournaments", {
    "filter[status]": "running",
    page: 1,
    per_page: 20,
    sort: "-begin_at",
  });

  if (activeTournaments) {
    console.log(`✅ ${activeTournaments.length} torneios ativos`);

    activeTournaments.slice(0, 5).forEach((tournament) => {
      console.log(`  - ${tournament.name}`);
      console.log(`    ID: ${tournament.id}`);
      console.log(`    Liga: ${tournament.league_id}`);
      console.log(`    Série: ${tournament.serie_id}`);
      console.log(
        `    Início: ${new Date(tournament.begin_at).toLocaleString("pt-BR")}`
      );
      console.log(
        `    Fim: ${new Date(tournament.end_at).toLocaleString("pt-BR")}`
      );
    });
  }

  // 6. Testar filtros específicos
  console.log("\n🔍 6. TESTANDO FILTROS ESPECÍFICOS");

  // Jogos do FURIA
  console.log("  Procurando jogos do FURIA...");
  const furiaMatches = await makeRequest("/csgo/matches", {
    "filter[status]": "not_started,running,finished",
    "filter[begin_at]": `${new Date(
      Date.now() - 30 * 24 * 60 * 60 * 1000
    ).toISOString()},${new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000
    ).toISOString()}`,
    page: 1,
    per_page: 20,
  });

  if (furiaMatches) {
    const furiaGames = furiaMatches.filter(
      (match) =>
        match.name.toLowerCase().includes("furia") ||
        match.opponents?.some((opp) =>
          opp.opponent.name.toLowerCase().includes("furia")
        )
    );
    console.log(`  ✅ ${furiaGames.length} jogos envolvendo FURIA encontrados`);
  }

  console.log("\n🎉 Exploração da API PandaScore CS:GO finalizada!");
}

// Executar exploração
exploreCSGOData().catch(console.error);
