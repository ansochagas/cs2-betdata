require("dotenv").config({ path: ".env.local" });
const { SproAgencyAPI } = require("./src/lib/api/sproAgencyAPI");

async function testarWebSocketCSGO() {
  console.log("🎮 TESTE - WebSocket Client Spro Agency (CS:GO)");
  console.log("📋 Testando conexão WebSocket em tempo real");
  console.log("============================================================\n");

  // Obter API key do .env
  const apiKey = process.env.SPRO_API_KEY;

  if (!apiKey || apiKey === "your-spro-api-key-here") {
    console.error("❌ API key não configurada!");
    console.log("Configure SPRO_API_KEY no arquivo .env.local");
    return;
  }

  // Criar instância da API
  const sproAPI = new SproAgencyAPI(apiKey);

  // Configurar event listeners
  sproAPI.on("connected", () => {
    console.log("🎯 Conectado! Enviando subscription para CS:GO...");
    sproAPI.subscribeToCSGO().catch((error) => {
      console.error("❌ Erro na subscription:", error);
    });
  });

  sproAPI.on("initialState", (data) => {
    console.log("📊 Estado inicial recebido!");
    console.log(`🏆 Esporte: ${data.sport}`);
    console.log(`🏦 Sportsbook: ${data.sportsbook}`);
    console.log(`🎮 Jogo: ${data.game}`);
    console.log(`📈 Outcomes: ${Object.keys(data.outcomes).length}`);
  });

  sproAPI.on("gameUpdate", (data) => {
    console.log(`🔄 Jogo atualizado: ${data.game}`);
    console.log(`   Time A: ${data.home_team} vs Time B: ${data.away_team}`);
    console.log(`   Outcomes: ${Object.keys(data.outcomes).length}`);
  });

  sproAPI.on("lineUpdate", (data) => {
    console.log(`📈 Linha atualizada: ${data.game}`);
  });

  sproAPI.on("gameRemoved", (data) => {
    console.log(`🗑️ Jogo removido: ${data.game}`);
  });

  sproAPI.on("error", (message) => {
    console.error("❌ Erro da API:", message);
  });

  sproAPI.on("maxReconnectAttemptsReached", () => {
    console.error("❌ Máximo de tentativas de reconexão atingido");
    process.exit(1);
  });

  try {
    // Conectar ao WebSocket
    await sproAPI.connect();

    // Manter conexão por 2 minutos para receber dados
    console.log("⏰ Mantendo conexão por 2 minutos para receber dados...");
    console.log("Pressione Ctrl+C para parar");

    // Timeout de 2 minutos
    setTimeout(() => {
      console.log("⏰ Tempo limite atingido. Desconectando...");
      sproAPI.disconnect();
      process.exit(0);
    }, 2 * 60 * 1000); // 2 minutos
  } catch (error) {
    console.error("❌ Erro na conexão:", error.message);
    process.exit(1);
  }

  // Graceful shutdown
  process.on("SIGINT", () => {
    console.log("\n🔌 Recebido SIGINT. Desconectando...");
    sproAPI.disconnect();
    process.exit(0);
  });
}

testarWebSocketCSGO();
