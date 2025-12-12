const axios = require("axios");

const BETSAPI_BASE_URL = "https://api.b365api.com";
const API_TOKEN = "49870-gVcC3i5RZ38gX2";

// Lista de endpoints possíveis para testar
const endpointsToTest = [
  "/v1/status",
  "/v2/status",
  "/v3/status",
  "/status",
  "/v1/sports",
  "/v2/sports",
  "/sports",
  "/v1/events",
  "/v2/events",
  "/events",
  "/v1/leagues",
  "/v2/leagues",
  "/leagues",
  "/v1/fixtures",
  "/v2/fixtures",
  "/fixtures",
  "/v1/results",
  "/v2/results",
  "/results",
];

async function testEndpoint(endpoint) {
  try {
    const url = `${BETSAPI_BASE_URL}${endpoint}?token=${API_TOKEN}`;
    console.log(`🔍 Testando: ${endpoint}`);

    const response = await axios.get(url, { timeout: 10000 });

    if (response.data && !response.data.error) {
      console.log(`✅ FUNCIONA: ${endpoint}`);
      console.log(`   Status: ${response.status}`);
      console.log(
        `   Dados:`,
        JSON.stringify(response.data, null, 2).substring(0, 200) + "..."
      );
      return { endpoint, success: true, data: response.data };
    } else {
      console.log(
        `❌ Erro: ${endpoint} - ${response.data?.error || "Resposta vazia"}`
      );
      return { endpoint, success: false, error: response.data?.error };
    }
  } catch (error) {
    console.log(
      `❌ Falha: ${endpoint} - ${error.response?.status || error.code}`
    );
    return { endpoint, success: false, error: error.message };
  }
}

async function main() {
  console.log("🧪 TESTANDO ENDPOINTS DA API BETSAPI\n");
  console.log("=".repeat(50));
  console.log(`🔑 Token: ${API_TOKEN}`);
  console.log(`🌐 URL Base: ${BETSAPI_BASE_URL}`);
  console.log("=".repeat(50));

  const workingEndpoints = [];

  for (const endpoint of endpointsToTest) {
    const result = await testEndpoint(endpoint);
    if (result.success) {
      workingEndpoints.push(result);
    }
    // Pequena pausa entre requests
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  console.log("\n" + "=".repeat(50));
  console.log("📊 RESUMO DOS ENDPOINTS FUNCIONAIS:");
  console.log("=".repeat(50));

  if (workingEndpoints.length === 0) {
    console.log("❌ Nenhum endpoint funcionou. Verificar:");
    console.log("   - Token da API");
    console.log("   - URL base da API");
    console.log("   - Documentação da BETSAPI");
    console.log("   - Plano de assinatura");
  } else {
    workingEndpoints.forEach((endpoint) => {
      console.log(`✅ ${endpoint.endpoint}`);
    });
  }

  console.log("\n🔍 Verificar documentação em: https://betsapi.com/docs");
  console.log(
    "💡 Possível que a API tenha mudado ou precise de autenticação diferente"
  );
}

main().catch(console.error);
