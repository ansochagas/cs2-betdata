require("dotenv").config({ path: "../.env.local" });

const { alertService } = require("../src/lib/alert-service.ts");

async function testAlerts() {
  console.log("🧪 Testando sistema de alertas...");

  try {
    // Testar envio de alerta simulado
    const testMatch = {
      homeTeam: "Fluxo",
      awayTeam: "Ninjas In Pyjamas",
      startTime: new Date(Date.now() + 10 * 60 * 1000), // 10 minutos a partir de agora
      tournament: "ESL Challenger League",
      minutesUntilStart: 10,
    };

    console.log("📤 Enviando alerta de teste...");
    await alertService.sendMatchStartingAlert(testMatch);

    console.log("✅ Teste concluído!");
  } catch (error) {
    console.error("❌ Erro no teste:", error);
  }
}

// Executar teste
testAlerts();
