// Teste completo da API PandaScore com plano pago
// Chave API: POciMXi8fwRIbuW3qEWvPVqGTv_Yfv55T-_mwp8DzpYOR-1mYjo

const API_KEY = "POciMXi8fwRIbuW3qEWvPVqGTv_Yfv55T-_mwp8DzpYOR-1mYjo";
const BASE_URL = "https://api.pandascore.co";

async function makeRequest(endpoint, params = {}) {
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.set("token", API_KEY);

  // Adicionar parâmetros
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, value);
    }
  });

  console.log(`🔍 Fazendo request para: ${url.toString()}`);

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

async function testAllEndpoints() {
  console.log("🚀 Iniciando teste completo da API PandaScore...\n");

  // 1. Testar leagues (ligas)
  console.log("🏆 1. TESTANDO LEAGUES (LIGAS)");
  const leagues = await makeRequest("/csgo/leagues", { page: 1, per_page: 10 });
  if (leagues) {
    console.log(`✅ Encontradas ${leagues.length} leagues`);
    if (leagues.length > 0) {
      console.log("📋 Primeira league:", {
        id: leagues[0].id,
        name: leagues[0].name,
        slug: leagues[0].slug,
        image_url: leagues[0].image_url,
      });
    }
  }

  // 2. Testar series
  console.log("\n🎯 2. TESTANDO SERIES");
  const series = await makeRequest("/csgo/series", { page: 1, per_page: 10 });
  if (series) {
    console.log(`✅ Encontradas ${series.length} series`);
    if (series.length > 0) {
      console.log("📋 Primeira serie:", {
        id: series[0].id,
        name: series[0].name,
        league_id: series[0].league_id,
        year: series[0].year,
      });
    }
  }

  // 3. Testar tournaments
  console.log("\n🏟️ 3. TESTANDO TOURNAMENTS");
  const tournaments = await makeRequest("/csgo/tournaments", {
    page: 1,
    per_page: 10,
  });
  if (tournaments) {
    console.log(`✅ Encontrados ${tournaments.length} tournaments`);
    if (tournaments.length > 0) {
      console.log("📋 Primeiro tournament:", {
        id: tournaments[0].id,
        name: tournaments[0].name,
        slug: tournaments[0].slug,
        league_id: tournaments[0].league_id,
        serie_id: tournaments[0].serie_id,
        begin_at: tournaments[0].begin_at,
        end_at: tournaments[0].end_at,
      });
    }
  }

  // 4. Testar matches (jogos)
  console.log("\n⚔️ 4. TESTANDO MATCHES (JOGOS)");
  const matches = await makeRequest("/csgo/matches", {
    page: 1,
    per_page: 20,
    "filter[status]": "running,not_started",
  });
  if (matches) {
    console.log(`✅ Encontrados ${matches.length} matches`);
    if (matches.length > 0) {
      const match = matches[0];
      console.log("📋 Primeiro match:", {
        id: match.id,
        name: match.name,
        status: match.status,
        begin_at: match.begin_at,
        end_at: match.end_at,
        tournament_id: match.tournament_id,
        league_id: match.league_id,
        opponents: match.opponents?.map((opp) => ({
          id: opp.opponent.id,
          name: opp.opponent.name,
          acronym: opp.opponent.acronym,
          image_url: opp.opponent.image_url,
        })),
      });

      // Testar detalhes de um match específico
      if (match.id) {
        console.log(`\n🔍 Detalhes do match ${match.id}:`);
        const matchDetails = await makeRequest(`/csgo/matches/${match.id}`);
        if (matchDetails) {
          console.log("📊 Dados detalhados:", {
            id: matchDetails.id,
            status: matchDetails.status,
            number_of_games: matchDetails.number_of_games,
            games: matchDetails.games?.map((game) => ({
              id: game.id,
              status: game.status,
              map: game.map,
              score: game.score,
            })),
          });
        }
      }
    }
  }

  // 5. Testar teams
  console.log("\n👥 5. TESTANDO TEAMS");
  const teams = await makeRequest("/csgo/teams", { page: 1, per_page: 20 });
  if (teams) {
    console.log(`✅ Encontrados ${teams.length} teams`);
    if (teams.length > 0) {
      const team = teams[0];
      console.log("📋 Primeiro team:", {
        id: team.id,
        name: team.name,
        acronym: team.acronym,
        slug: team.slug,
        image_url: team.image_url,
        location: team.location,
        players: team.players?.slice(0, 3).map((player) => ({
          id: player.id,
          name: player.name,
          nickname: player.nickname,
          slug: player.slug,
        })),
      });

      // Testar detalhes de um time específico
      if (team.id) {
        console.log(`\n🔍 Detalhes do time ${team.name} (${team.id}):`);
        const teamDetails = await makeRequest(`/csgo/teams/${team.id}`);
        if (teamDetails) {
          console.log("📊 Estatísticas do time:", {
            id: teamDetails.id,
            name: teamDetails.name,
            players_count: teamDetails.players?.length || 0,
            recent_matches: teamDetails.last_matches
              ?.slice(0, 3)
              .map((match) => ({
                id: match.id,
                name: match.name,
                status: match.status,
                begin_at: match.begin_at,
              })),
          });
        }
      }
    }
  }

  // 6. Testar players
  console.log("\n🎮 6. TESTANDO PLAYERS");
  const players = await makeRequest("/csgo/players", { page: 1, per_page: 20 });
  if (players) {
    console.log(`✅ Encontrados ${players.length} players`);
    if (players.length > 0) {
      const player = players[0];
      console.log("📋 Primeiro player:", {
        id: player.id,
        name: player.name,
        nickname: player.nickname,
        slug: player.slug,
        nationality: player.nationality,
        image_url: player.image_url,
        role: player.role,
        team: player.team
          ? {
              id: player.team.id,
              name: player.team.name,
              acronym: player.team.acronym,
            }
          : null,
      });

      // Testar detalhes de um player específico
      if (player.id) {
        console.log(`\n🔍 Detalhes do player ${player.name} (${player.id}):`);
        const playerDetails = await makeRequest(`/csgo/players/${player.id}`);
        if (playerDetails) {
          console.log("📊 Estatísticas do player:", {
            id: playerDetails.id,
            name: playerDetails.name,
            statistics: playerDetails.statistics
              ? {
                  total_kills: playerDetails.statistics.total_kills,
                  total_deaths: playerDetails.statistics.total_deaths,
                  total_assists: playerDetails.statistics.total_assists,
                  total_kd: playerDetails.statistics.total_kd,
                  total_rating: playerDetails.statistics.total_rating,
                }
              : "N/A",
          });
        }
      }
    }
  }

  // 7. Testar standings (classificações)
  console.log("\n📊 7. TESTANDO STANDINGS");
  // Primeiro pegar um tournament ativo
  const activeTournaments = await makeRequest("/csgo/tournaments", {
    "filter[status]": "running",
    page: 1,
    per_page: 5,
  });
  if (activeTournaments && activeTournaments.length > 0) {
    const tournamentId = activeTournaments[0].id;
    console.log(`🏆 Testando standings do tournament ${tournamentId}:`);
    const standings = await makeRequest(
      `/csgo/tournaments/${tournamentId}/standings`
    );
    if (standings) {
      console.log(`✅ Standings encontradas: ${standings.length}`);
      if (standings.length > 0) {
        console.log("📋 Primeira posição:", standings[0]);
      }
    }
  }

  // 8. Testar vídeos/highlights
  console.log("\n🎥 8. TESTANDO VÍDEOS/HIGHLIGHTS");
  const videos = await makeRequest("/csgo/videos", { page: 1, per_page: 10 });
  if (videos) {
    console.log(`✅ Vídeos encontrados: ${videos.length}`);
    if (videos.length > 0) {
      console.log("📋 Primeiro vídeo:", {
        id: videos[0].id,
        name: videos[0].name,
        description: videos[0].description,
        url: videos[0].url,
        published_at: videos[0].published_at,
      });
    }
  }

  console.log("\n🎉 Teste completo da API PandaScore finalizado!");
}

// Executar teste
testAllEndpoints().catch(console.error);
