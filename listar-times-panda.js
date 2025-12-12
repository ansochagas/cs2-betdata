// Listar todos os times disponíveis na PandaScore
const API_KEY = "POciMXi8fwRIbuW3qEWvPVqGTv_Yfv55T-_mwp8DzpYOR-1mYjo";
const BASE_URL = "https://api.pandascore.co";

async function listarTimesPandaScore() {
  console.log(
    "📋 Listando todos os times CS:GO disponíveis na PandaScore...\n"
  );

  try {
    const response = await fetch(
      `${BASE_URL}/csgo/teams?token=${API_KEY}&page=1&per_page=100`
    );
    const teams = await response.json();

    if (!response.ok) {
      console.error("❌ Erro na API:", response.status, teams);
      return;
    }

    console.log(`✅ Encontrados ${teams.length} times\n`);

    // Times brasileiros/interessantes primeiro
    const brazilianTeams = teams.filter(
      (team) =>
        team.location?.toLowerCase().includes("brazil") ||
        team.name.toLowerCase().includes("furia") ||
        team.name.toLowerCase().includes("mibr") ||
        team.name.toLowerCase().includes("red") ||
        team.name.toLowerCase().includes("fluxo") ||
        team.name.toLowerCase().includes("pain") ||
        team.name.toLowerCase().includes("parivision") ||
        team.name.toLowerCase().includes("legacy")
    );

    console.log("🇧🇷 TIMES BRASILEIROS/ENCONTRADOS:");
    brazilianTeams.forEach((team) => {
      console.log(
        `  - ${team.name} (${team.acronym || "N/A"}) [${
          team.location || "N/A"
        }]`
      );
      console.log(`    Logo: ${team.image_url || "N/A"}`);
      console.log(`    Players: ${team.players?.length || 0}`);
      console.log("");
    });

    // Todos os times com logos
    console.log("🖼️ TODOS OS TIMES COM LOGOS:");
    teams
      .filter((team) => team.image_url)
      .forEach((team) => {
        console.log(
          `  - ${team.name} (${team.acronym || "N/A"}) → ${team.image_url}`
        );
      });

    console.log(`\n📊 RESUMO:`);
    console.log(`  Total de times: ${teams.length}`);
    console.log(`  Com logos: ${teams.filter((t) => t.image_url).length}`);
    console.log(`  Brasileiros: ${brazilianTeams.length}`);
  } catch (error) {
    console.error("❌ Erro:", error.message);
  }
}

listarTimesPandaScore();
