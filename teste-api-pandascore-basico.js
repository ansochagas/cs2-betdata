// Teste básico da API PandaScore - apenas endpoints que funcionam
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

  console.log(`🔍 ${endpoint}`);

  try {
    const response = await fetch(url.toString());
    const data = await response.json();

    if (!response.ok) {
      console.error(`❌ Erro ${response.status}:`, data.message || data);
      return null;
    }

    return data;
  } catch (error) {
    console.error("❌ Erro de rede:", error.message);
    return null;
  }
}

async function testBasicEndpoints() {
  console.log("🚀 Teste básico da API PandaScore CS:GO\n");

  // 1. Matches - todos os status
  console.log("⚔️ MATCHES (todos os status)");
  const allMatches = await makeRequest("/csgo/matches", {
    page: 1,
    per_page: 10,
  });

  if (allMatches) {
    console.log(`✅ ${allMatches.length} matches encontrados`);
    allMatches.forEach((match) => {
      console.log(
        `  - ${match.name} (${match.status}) - ${new Date(
          match.begin_at
        ).toLocaleString("pt-BR")}`
      );
    });
  }

  // 2. Matches - apenas running
  console.log("\n🎮 MATCHES AO VIVO");
  const liveMatches = await makeRequest("/csgo/matches", {
    "filter[status]": "running",
    page: 1,
    per_page: 5,
  });

  if (liveMatches) {
    console.log(`✅ ${liveMatches.length} matches ao vivo`);
    liveMatches.forEach((match) => {
      console.log(`  - ${match.name}`);
      console.log(`    Status: ${match.status}`);
      console.log(
        `    Início: ${new Date(match.begin_at).toLocaleString("pt-BR")}`
      );
      console.log(
        `    Times: ${match.opponents
          ?.map((o) => o.opponent.name)
          .join(" vs ")}`
      );
    });
  }

  // 3. Teams
  console.log("\n👥 TEAMS");
  const teams = await makeRequest("/csgo/teams", {
    page: 1,
    per_page: 20,
  });

  if (teams) {
    console.log(`✅ ${teams.length} teams encontrados`);
    teams.slice(0, 5).forEach((team) => {
      console.log(`  - ${team.name} (${team.acronym || "N/A"})`);
      console.log(`    Localização: ${team.location || "N/A"}`);
      console.log(`    Logo: ${team.image_url || "N/A"}`);
      console.log(`    Players: ${team.players?.length || 0}`);
    });
  }

  // 4. Players
  console.log("\n🎯 PLAYERS");
  const players = await makeRequest("/csgo/players", {
    page: 1,
    per_page: 20,
  });

  if (players) {
    console.log(`✅ ${players.length} players encontrados`);
    players.slice(0, 5).forEach((player) => {
      console.log(`  - ${player.name} (${player.nationality || "N/A"})`);
      console.log(`    Nickname: ${player.nickname || "N/A"}`);
      console.log(`    Time: ${player.team?.name || "N/A"}`);
      console.log(`    Slug: ${player.slug}`);
    });
  }

  // 5. Tournaments
  console.log("\n🏆 TOURNAMENTS");
  const tournaments = await makeRequest("/csgo/tournaments", {
    page: 1,
    per_page: 10,
  });

  if (tournaments) {
    console.log(`✅ ${tournaments.length} tournaments encontrados`);
    tournaments.slice(0, 3).forEach((tournament) => {
      console.log(`  - ${tournament.name}`);
      console.log(`    ID: ${tournament.id}`);
      console.log(
        `    Início: ${new Date(tournament.begin_at).toLocaleString("pt-BR")}`
      );
      console.log(
        `    Fim: ${new Date(tournament.end_at).toLocaleString("pt-BR")}`
      );
    });
  }

  // 6. Leagues
  console.log("\n🏆 LEAGUES");
  const leagues = await makeRequest("/csgo/leagues", {
    page: 1,
    per_page: 10,
  });

  if (leagues) {
    console.log(`✅ ${leagues.length} leagues encontradas`);
    leagues.slice(0, 3).forEach((league) => {
      console.log(`  - ${league.name} (ID: ${league.id})`);
      console.log(`    Slug: ${league.slug}`);
    });
  }

  console.log("\n🎉 Teste básico finalizado!");
}

// Executar teste
testBasicEndpoints().catch(console.error);
