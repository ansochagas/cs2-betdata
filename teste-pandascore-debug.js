const axios = require("axios");

async function debugPandascoreAPI() {
  console.log("🔍 DEBUG PANDASCORE API - Encontrando filtros corretos");
  console.log("============================================================\n");

  const config = {
    headers: {
      Authorization:
        "Bearer YpNRtsc43jMD6EH_JdXmbjyOorxQGuOMDlkuRmlGYALserFw0OM",
      Accept: "application/json",
    },
    timeout: 10000,
  };

  try {
    // 1. Primeiro vamos ver como buscar times
    console.log("1️⃣ Buscando times disponíveis...");
    const teamsResponse = await axios.get(
      "https://api.pandascore.co/csgo/teams?page[size]=10",
      config
    );
    console.log(`✅ Times encontrados: ${teamsResponse.data.length}`);

    if (teamsResponse.data.length > 0) {
      console.log("🏆 Primeiros times:");
      teamsResponse.data.slice(0, 3).forEach((team) => {
        console.log(`   - ${team.name} (ID: ${team.id})`);
      });

      // Procurar FURIA e FaZe
      const furia = teamsResponse.data.find((t) =>
        t.name.toLowerCase().includes("furia")
      );
      const faze = teamsResponse.data.find((t) =>
        t.name.toLowerCase().includes("faze")
      );

      console.log("\n🎯 Times específicos:");
      console.log(`   FURIA: ${furia ? `ID ${furia.id}` : "Não encontrado"}`);
      console.log(`   FaZe: ${faze ? `ID ${faze.id}` : "Não encontrado"}`);
    }

    // 2. Testar busca por nome de time
    console.log("\n2️⃣ Testando busca por nome...");
    try {
      const searchResponse = await axios.get(
        "https://api.pandascore.co/csgo/teams?search[name]=FURIA",
        config
      );
      console.log(
        `✅ Busca por FURIA: ${searchResponse.data.length} resultados`
      );

      if (searchResponse.data.length > 0) {
        const team = searchResponse.data[0];
        console.log(`   Time encontrado: ${team.name} (ID: ${team.id})`);

        // 3. Buscar jogos deste time usando o ID
        console.log("\n3️⃣ Buscando jogos do time...");
        const matchesResponse = await axios.get(
          `https://api.pandascore.co/csgo/teams/${team.id}/matches?page[size]=5`,
          config
        );
        console.log(`✅ Jogos encontrados: ${matchesResponse.data.length}`);

        if (matchesResponse.data.length > 0) {
          console.log("🏆 Jogos recentes:");
          matchesResponse.data.forEach((match) => {
            const opponent = match.opponents.find(
              (opp) => opp.opponent.id !== team.id
            );
            console.log(
              `   - vs ${opponent?.opponent.name || "Unknown"} (${
                match.begin_at?.split("T")[0]
              })`
            );
          });
        }
      }
    } catch (error) {
      console.error(
        `❌ Erro na busca: ${error.response?.status} - ${error.response?.statusText}`
      );
    }

    // 4. Testar filtros alternativos
    console.log("\n4️⃣ Testando filtros alternativos...");
    const filterTests = [
      "https://api.pandascore.co/csgo/matches?filter[opponent_name]=FURIA",
      "https://api.pandascore.co/csgo/matches?search[opponent_name]=FURIA",
      "https://api.pandascore.co/csgo/matches?filter[name]=FURIA",
    ];

    for (const url of filterTests) {
      try {
        console.log(`   Testando: ${url.split("?")[1]}`);
        const response = await axios.get(url, config);
        console.log(`   ✅ ${response.data.length} resultados`);
      } catch (error) {
        console.log(`   ❌ ${error.response?.status || "Erro"}`);
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

debugPandascoreAPI();
