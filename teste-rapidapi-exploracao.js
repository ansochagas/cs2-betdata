const axios = require("axios");

async function explorarRapidAPI() {
  console.log("🔍 EXPLORANDO RAPIDAPI - BUSCANDO CS:GO APIs");
  console.log("📋 Procurando APIs ativas de CS:GO/eSports");
  console.log("============================================================\n");

  const config = {
    headers: {
      "x-rapidapi-host": "cs2-esports-api.p.rapidapi.com",
      "x-rapidapi-key": "d5da2b13a6msh434479d753d8387p12bae1jsn117c3b0f7da9",
    },
    timeout: 5000,
  };

  // Testes de diferentes endpoints possíveis
  const endpoints = [
    "https://cs2-esports-api.p.rapidapi.com/api/matches",
    "https://cs2-esports-api.p.rapidapi.com/api/teams",
    "https://cs2-esports-api.p.rapidapi.com/api/events",
    "https://cs2-esports-api.p.rapidapi.com/api/players",
    "https://cs2-esports-api.p.rapidapi.com/api/rankings",
    "https://cs2-esports-api.p.rapidapi.com/api/tournaments",
    "https://cs2-esports-api.p.rapidapi.com/api/live",
    "https://cs2-esports-api.p.rapidapi.com/api/upcoming",
  ];

  console.log("🔄 Testando múltiplos endpoints...\n");

  for (const endpoint of endpoints) {
    try {
      console.log(
        `📡 Testando: ${endpoint.replace(
          "https://cs2-esports-api.p.rapidapi.com/api/",
          ""
        )}`
      );

      const response = await axios.get(endpoint, config);

      if (response.status === 200 && response.data) {
        console.log(`   ✅ FUNCIONA! Status: ${response.status}`);

        if (Array.isArray(response.data)) {
          console.log(`   📊 Array com ${response.data.length} itens`);
          if (response.data.length > 0) {
            console.log(
              `   🏆 Primeiro item: ${JSON.stringify(
                response.data[0]
              ).substring(0, 100)}...`
            );
          }
        } else if (typeof response.data === "object") {
          const keys = Object.keys(response.data);
          console.log(`   🔑 Chaves: ${keys.join(", ")}`);
        }

        console.log(`   🎉 ENCONTRAMOS UMA API FUNCIONAL: ${endpoint}\n`);
        return endpoint; // Retorna o primeiro que funciona
      } else {
        console.log(
          `   ⚠️ Status ${response.status} - não é erro 404, mas sem dados úteis`
        );
      }
    } catch (error) {
      if (error.response?.status === 404) {
        console.log(`   ❌ 404 - Endpoint não existe`);
      } else if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        console.log(
          `   ❌ ${error.response.status} - Problema de autenticação`
        );
      } else if (error.response?.status === 429) {
        console.log(`   ❌ 429 - Rate limit excedido`);
      } else {
        console.log(`   ❌ Erro: ${error.message}`);
      }
    }

    // Pequena pausa entre requests
    await sleep(500);
  }

  console.log("\n============================================================");
  console.log("❌ NENHUM ENDPOINT FUNCIONOU");
  console.log("💡 Possíveis causas:");
  console.log("   - API foi descontinuada");
  console.log("   - Host mudou");
  console.log("   - Chave expirou");
  console.log("   - Endpoint mudou");

  console.log("\n🔄 ALTERNATIVAS:");
  console.log("   1. Dados simulados (recomendado)");
  console.log("   2. Outra API comercial");
  console.log("   3. Web scraping controlado");
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

explorarRapidAPI();
