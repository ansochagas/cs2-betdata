const axios = require("axios");

const PANDASCORE_BASE_URL = "https://api.pandascore.co";
const API_TOKEN = "YpNRtsc43jMD6EH_JdXmbjyOorxQGuOMDlkuRmlGYALserFw0OM";

const apiClient = axios.create({
  baseURL: PANDASCORE_BASE_URL,
  headers: {
    Authorization: `Bearer ${API_TOKEN}`,
    Accept: "application/json",
  },
});

async function findTeamIds() {
  console.log("🔍 BUSCANDO IDs CORRETOS DOS TIMES NO PANDASCORE");
  console.log("=".repeat(60));

  const teamsToFind = [
    "Furia",
    "Fluxo",
    "Natus Vincere",
    "FaZe Clan",
    "G2 Esports",
  ];

  for (const teamName of teamsToFind) {
    console.log(`\n🏆 Procurando: ${teamName}`);

    try {
      const response = await apiClient.get(`/csgo/teams`, {
        params: {
          "search[name]": teamName,
          per_page: 5,
        },
      });

      if (response.data && response.data.length > 0) {
        console.log(`✅ Encontrado!`);
        response.data.forEach((team, index) => {
          console.log(`   ${index + 1}. ${team.name} (ID: ${team.id})`);
          console.log(`      País: ${team.country?.name || "N/A"}`);
          console.log(`      Jogadores: ${team.players?.length || 0}`);
        });

        // Usar o primeiro resultado
        const foundTeam = response.data[0];
        console.log(`🎯 ID para usar: ${foundTeam.id} (${foundTeam.name})`);
      } else {
        console.log(`❌ Nenhum time encontrado`);
      }
    } catch (error) {
      console.log(`❌ Erro: ${error.response?.status || error.code}`);
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

findTeamIds().catch(console.error);
