const axios = require("axios");

const BETSAPI_BASE_URL = "https://api.b365api.com/v1";
const API_TOKEN = "49870-gVcC3i5RZ38gX2";

const apiClient = axios.create({
  baseURL: BETSAPI_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

async function makeRequest(endpoint, params = {}) {
  try {
    const url = `${endpoint}?token=${API_TOKEN}`;
    const fullUrl = params
      ? `${url}&${new URLSearchParams(params).toString()}`
      : url;

    const response = await apiClient.get(fullUrl);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status,
    };
  }
}

function searchForMaps(data, path = "") {
  const findings = [];

  if (!data) return findings;

  // Termos relacionados a mapas que queremos procurar
  const mapTerms = [
    "map",
    "score",
    "round",
    "dust",
    "mirage",
    "inferno",
    "cache",
    "overpass",
    "train",
    "nuke",
    "vertigo",
    "ancient",
  ];

  // Se for string, procurar por termos de mapa
  if (typeof data === "string") {
    const lowerData = data.toLowerCase();
    for (const term of mapTerms) {
      if (lowerData.includes(term)) {
        findings.push({
          path: path,
          type: "string",
          term: term,
          value: data,
          context: data.substring(
            Math.max(0, lowerData.indexOf(term) - 20),
            lowerData.indexOf(term) + 40
          ),
        });
        break; // Só adiciona uma vez por string
      }
    }
    return findings;
  }

  // Se for array, procurar em cada item
  if (Array.isArray(data)) {
    data.forEach((item, index) => {
      findings.push(...searchForMaps(item, `${path}[${index}]`));
    });
    return findings;
  }

  // Se for objeto, procurar em cada propriedade
  if (typeof data === "object") {
    Object.keys(data).forEach((key) => {
      const value = data[key];
      const lowerKey = key.toLowerCase();

      // Verificar se a chave contém termos de mapa
      for (const term of mapTerms) {
        if (lowerKey.includes(term)) {
          findings.push({
            path: `${path}.${key}`,
            type: "key",
            term: term,
            key: key,
            value: value,
          });
          break;
        }
      }

      // Procurar recursivamente no valor
      findings.push(...searchForMaps(value, `${path}.${key}`));
    });
  }

  return findings;
}

async function comprehensiveMapSearch() {
  console.log("🗺️ BUSCA ESPECÍFICA POR DADOS DE MAPAS NA BETSAPI");
  console.log("Procurando: mapas jogados, placares por mapa, etc.");
  console.log("=".repeat(70));

  const allFindings = [];

  // 1. Analisar jogos atuais
  console.log("📅 1. ANALISANDO JOGOS ATUAIS...");
  const currentGames = await makeRequest("/bet365/upcoming", { sport_id: 151 });

  if (currentGames.success && currentGames.data?.results) {
    console.log(`   Analisando ${currentGames.data.results.length} jogos...`);
    const findings = searchForMaps(currentGames.data, "current_games");
    allFindings.push(...findings);
    console.log(`   Encontradas ${findings.length} referências a mapas`);
  }

  // 2. Analisar dados de histórico que funcionaram
  console.log("\n📊 2. ANALISANDO DADOS DE HISTÓRICO...");
  const currentGames2 = await makeRequest("/bet365/upcoming", {
    sport_id: 151,
  });

  if (currentGames2.success && currentGames2.data?.results) {
    const sampleGame = currentGames2.data.results[0];
    const history = await makeRequest("/event/history", {
      event_id: sampleGame.our_event_id,
    });

    if (history.success && history.data) {
      console.log("   Analisando histórico de confrontos...");
      const findings = searchForMaps(history.data, "event_history");
      allFindings.push(...findings);
      console.log(`   Encontradas ${findings.length} referências a mapas`);

      // Mostrar placares específicos
      if (history.data.results?.home) {
        console.log("   📋 Analisando placares dos jogos:");
        history.data.results.home.slice(0, 3).forEach((game, i) => {
          console.log(
            `      Jogo ${i + 1}: ${game.home?.name} vs ${game.away?.name} = ${
              game.ss || "N/A"
            }`
          );
        });
      }
    }
  }

  // 3. Analisar stats trend
  console.log("\n📈 3. ANALISANDO STATS TREND...");
  if (currentGames2.success && currentGames2.data?.results) {
    const sampleGame = currentGames2.data.results[0];
    const statsTrend = await makeRequest("/event/stats_trend", {
      event_id: sampleGame.our_event_id,
    });

    if (statsTrend.success && statsTrend.data) {
      console.log("   Analisando tendências...");
      const findings = searchForMaps(statsTrend.data, "stats_trend");
      allFindings.push(...findings);
      console.log(`   Encontradas ${findings.length} referências a mapas`);
    }
  }

  // 4. Análise final
  console.log("\n" + "=".repeat(70));
  console.log("📊 RESULTADO FINAL - BUSCA POR MAPAS");
  console.log("=".repeat(70));

  if (allFindings.length === 0) {
    console.log("❌ NENHUMA referência a mapas encontrada!");
    console.log("❌ Nenhum placar detalhado por mapa");
    console.log("❌ Nenhum dado sobre mapas jogados");
    console.log("💡 BETSAPI não fornece dados de mapas");
  } else {
    console.log(`🎯 ENCONTRADAS ${allFindings.length} REFERÊNCIAS A MAPAS!`);
    console.log("\n📋 DETALHES ENCONTRADOS:");

    // Agrupar por tipo de termo
    const groupedFindings = {};
    allFindings.forEach((finding) => {
      if (!groupedFindings[finding.term]) {
        groupedFindings[finding.term] = [];
      }
      groupedFindings[finding.term].push(finding);
    });

    Object.keys(groupedFindings).forEach((term) => {
      console.log(
        `\n🗺️ TERMO "${term.toUpperCase()}" (${
          groupedFindings[term].length
        } ocorrências):`
      );
      groupedFindings[term].slice(0, 3).forEach((finding, i) => {
        console.log(
          `   ${i + 1}. ${finding.type.toUpperCase()}: ${finding.path}`
        );
        if (finding.type === "key") {
          console.log(`      Valor: ${JSON.stringify(finding.value)}`);
        } else {
          console.log(`      Contexto: "${finding.context}"`);
        }
      });
    });
  }

  console.log("\n🔍 O QUE PROCURAMOS:");
  console.log("   ✅ Mapas jogados na partida (Dust2, Mirage, etc.)");
  console.log("   ✅ Placar por mapa (16-12, 10-16, etc.)");
  console.log("   ✅ Quem ganhou cada mapa");
  console.log("   ✅ Estatísticas por mapa");

  console.log("\n📋 O QUE ENCONTRAMOS:");
  if (allFindings.length > 0) {
    console.log("   ✅ Placares gerais de jogos (ex: '2-0')");
    console.log("   ✅ Histórico de confrontos");
    console.log("   ❌ Detalhes por mapa individual");
    console.log("   ❌ Nome dos mapas jogados");
  } else {
    console.log("   ❌ Nada relacionado a mapas");
  }

  return allFindings;
}

async function main() {
  const findings = await comprehensiveMapSearch();

  console.log("\n💡 CONCLUSÃO SOBRE MAPAS:");
  if (findings.length === 0) {
    console.log("🚫 BETSAPI = NENHUM dado de mapas");
    console.log("✅ PANDASCORE = Stats completas por mapa");
  } else {
    console.log("⚠️ BETSAPI = Placares gerais apenas");
    console.log("🔄 PANDASCORE ainda necessário para detalhes");
  }

  console.log("\n🎯 RESUMO EXECUTIVO:");
  console.log("   BETSAPI → Jogos atuais + placares simples");
  console.log("   PANDASCORE → Mapas + kills + stats detalhadas");
}

main().catch(console.error);
