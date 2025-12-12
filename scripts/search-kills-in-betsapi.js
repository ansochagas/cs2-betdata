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

function searchForKills(data, path = "") {
  const findings = [];

  if (!data) return findings;

  // Se for string, procurar por "kill"
  if (typeof data === "string") {
    if (data.toLowerCase().includes("kill")) {
      findings.push({
        path: path,
        type: "string",
        value: data,
        context: data.substring(
          Math.max(0, data.toLowerCase().indexOf("kill") - 20),
          data.toLowerCase().indexOf("kill") + 40
        ),
      });
    }
    return findings;
  }

  // Se for array, procurar em cada item
  if (Array.isArray(data)) {
    data.forEach((item, index) => {
      findings.push(...searchForKills(item, `${path}[${index}]`));
    });
    return findings;
  }

  // Se for objeto, procurar em cada propriedade
  if (typeof data === "object") {
    Object.keys(data).forEach((key) => {
      const value = data[key];

      // Verificar se a chave contém "kill"
      if (key.toLowerCase().includes("kill")) {
        findings.push({
          path: `${path}.${key}`,
          type: "key",
          key: key,
          value: value,
        });
      }

      // Procurar recursivamente no valor
      findings.push(...searchForKills(value, `${path}.${key}`));
    });
  }

  return findings;
}

async function comprehensiveKillSearch() {
  console.log("🔍 BUSCA ESPECÍFICA POR 'KILL' NA BETSAPI");
  console.log("=".repeat(60));

  const allFindings = [];

  // 1. Buscar jogos atuais e procurar por "kill"
  console.log("📅 1. ANALISANDO JOGOS ATUAIS...");
  const currentGames = await makeRequest("/bet365/upcoming", { sport_id: 151 });

  if (currentGames.success && currentGames.data?.results) {
    console.log(`   Analisando ${currentGames.data.results.length} jogos...`);
    const findings = searchForKills(currentGames.data, "current_games");
    allFindings.push(...findings);
    console.log(`   Encontradas ${findings.length} menções a "kill"`);
  }

  // 2. Testar /event/history que funcionou
  console.log("\n📊 2. ANALISANDO /event/history...");
  const currentGames2 = await makeRequest("/bet365/upcoming", {
    sport_id: 151,
  });

  if (currentGames2.success && currentGames2.data?.results) {
    const sampleGame = currentGames2.data.results[0];
    const history = await makeRequest("/event/history", {
      event_id: sampleGame.our_event_id,
    });

    if (history.success && history.data) {
      console.log("   Analisando dados de histórico...");
      const findings = searchForKills(history.data, "event_history");
      allFindings.push(...findings);
      console.log(`   Encontradas ${findings.length} menções a "kill"`);
    }
  }

  // 3. Testar /event/stats_trend
  console.log("\n📈 3. ANALISANDO /event/stats_trend...");
  if (currentGames2.success && currentGames2.data?.results) {
    const sampleGame = currentGames2.data.results[0];
    const statsTrend = await makeRequest("/event/stats_trend", {
      event_id: sampleGame.our_event_id,
    });

    if (statsTrend.success && statsTrend.data) {
      console.log("   Analisando dados de stats trend...");
      const findings = searchForKills(statsTrend.data, "stats_trend");
      allFindings.push(...findings);
      console.log(`   Encontradas ${findings.length} menções a "kill"`);
    }
  }

  // 4. Testar outros endpoints que possam existir
  console.log("\n🔍 4. TESTANDO OUTROS ENDPOINTS POSSÍVEIS...");

  const otherEndpoints = [
    {
      name: "Event View",
      endpoint: "/event/view",
      params: { event_id: "11046445" },
    },
    {
      name: "Event Details",
      endpoint: "/event/details",
      params: { event_id: "11046445" },
    },
    {
      name: "Event Info",
      endpoint: "/event/info",
      params: { event_id: "11046445" },
    },
    {
      name: "Match Stats",
      endpoint: "/match/stats",
      params: { match_id: "11046445" },
    },
    {
      name: "Game Stats",
      endpoint: "/game/stats",
      params: { game_id: "11046445" },
    },
  ];

  for (const test of otherEndpoints) {
    console.log(`   Testando ${test.name}...`);
    const result = await makeRequest(test.endpoint, test.params);

    if (result.success && result.data) {
      const findings = searchForKills(result.data, test.endpoint);
      allFindings.push(...findings);
      if (findings.length > 0) {
        console.log(
          `   ✅ Encontradas ${findings.length} menções a "kill" em ${test.name}!`
        );
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  // 5. Análise final
  console.log("\n" + "=".repeat(60));
  console.log("📊 RESULTADO FINAL - BUSCA POR 'KILL'");
  console.log("=".repeat(60));

  if (allFindings.length === 0) {
    console.log("❌ NENHUMA menção a 'kill' encontrada em nenhum endpoint!");
    console.log("💡 Conclusão: BETSAPI não fornece dados de kills");
    console.log("🔄 Continuar com Pandascore para dados de kills");
  } else {
    console.log(`🎯 ENCONTRADAS ${allFindings.length} MENÇÕES A 'KILL'!`);
    console.log("\n📋 DETALHES:");

    allFindings.forEach((finding, index) => {
      console.log(
        `\n${index + 1}. ${finding.type.toUpperCase()}: ${finding.path}`
      );
      if (finding.type === "key") {
        console.log(`   Chave: ${finding.key}`);
        console.log(`   Valor: ${JSON.stringify(finding.value)}`);
      } else {
        console.log(`   Contexto: "${finding.context}"`);
      }
    });
  }

  console.log("\n🔍 ENDPOINTS ANALISADOS:");
  console.log("   ✅ /bet365/upcoming (jogos atuais)");
  console.log("   ✅ /event/history (histórico)");
  console.log("   ✅ /event/stats_trend (tendências)");
  console.log("   ✅ /event/view, /event/details, /event/info");
  console.log("   ✅ /match/stats, /game/stats");

  return allFindings;
}

async function main() {
  const findings = await comprehensiveKillSearch();

  console.log("\n💡 CONCLUSÃO EXECUTIVA:");
  if (findings.length === 0) {
    console.log("🚫 BETSAPI = NENHUM dado de kills");
    console.log("✅ PANDASCORE = Fonte principal para kills");
  } else {
    console.log("🎉 BETSAPI = TEM dados de kills!");
    console.log("🔄 Análise necessária para integração");
  }
}

main().catch(console.error);
