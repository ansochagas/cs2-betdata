require("dotenv").config({ path: ".env.local" });
const WebSocket = require("ws");
const EventEmitter = require("events");

class SimpleSproAPI extends EventEmitter {
  constructor(apiKey) {
    super();
    this.apiKey = apiKey;
    this.ws = null;
    this.isConnected = false;
  }

  async connect() {
    return new Promise((resolve, reject) => {
      const wsUrl = `wss://spro.agency/api?key=${this.apiKey}`;
      console.log("🔌 Conectando ao Spro Agency WebSocket...");

      this.ws = new WebSocket(wsUrl);

      this.ws.on("open", () => {
        console.log("✅ Conectado ao Spro Agency WebSocket");
        this.isConnected = true;
        resolve();
      });

      this.ws.on("message", (data) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleMessage(message);
        } catch (error) {
          console.error("❌ Erro ao processar mensagem:", error);
        }
      });

      this.ws.on("error", (error) => {
        console.error("❌ Erro no WebSocket:", error);
        this.isConnected = false;
        reject(error);
      });

      this.ws.on("close", (code, reason) => {
        console.log(`🔌 WebSocket fechado: ${code} - ${reason.toString()}`);
        this.isConnected = false;
      });
    });
  }

  handleMessage(message) {
    console.log("📨 Mensagem:", message.action);

    switch (message.action) {
      case "socket_connected":
        console.log("🎯 Conexão autenticada!");
        this.subscribeToCSGO();
        break;

      case "initial_state":
        console.log("📊 Estado inicial - CS:GO encontrado!");
        console.log(`🏆 Esporte: ${message.data.sport}`);
        console.log(`🏦 Sportsbook: ${message.data.sportsbook}`);
        console.log(`🎮 Jogo: ${message.data.game}`);
        console.log(
          `📈 Número de outcomes: ${
            Object.keys(message.data.outcomes || {}).length
          }`
        );
        break;

      case "game_update":
        console.log(`🔄 Jogo atualizado: ${message.data.game}`);
        break;

      case "line_update":
        console.log(`📈 Linha atualizada: ${message.data.game}`);
        break;

      case "subscription_updated":
        console.log("✅ Subscription confirmada!");
        break;

      case "error":
        console.error("❌ Erro da API:", message.message);
        break;

      default:
        // console.log('Mensagem não tratada:', message.action);
        break;
    }
  }

  subscribeToCSGO() {
    if (!this.isConnected || !this.ws) return;

    const subscription = {
      action: "subscribe",
      filters: {
        sports: ["CSL"], // CS:GO
        sportsbooks: ["draftkings", "betmgm"],
        markets: ["Moneyline"],
      },
    };

    console.log("🎯 Enviando subscription para CS:GO...");
    this.ws.send(JSON.stringify(subscription));
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

async function testarCSGO() {
  console.log("🎮 TESTE SIMPLES - CS:GO na Spro Agency API");
  console.log("============================================================\n");

  const apiKey = process.env.SPRO_API_KEY;

  if (!apiKey || apiKey === "your-spro-api-key-here") {
    console.error("❌ API key não configurada!");
    return;
  }

  const api = new SimpleSproAPI(apiKey);

  try {
    await api.connect();

    // Aguardar por dados por 30 segundos
    console.log("⏰ Aguardando dados de CS:GO por 30 segundos...");

    setTimeout(() => {
      console.log("⏰ Tempo esgotado. Desconectando...");
      api.disconnect();
      process.exit(0);
    }, 30000);
  } catch (error) {
    console.error("❌ Erro:", error.message);
  }
}

testarCSGO();
