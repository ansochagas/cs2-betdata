// Teste das logos da PandaScore API
const API_KEY = "POciMXi8fwRIbuW3qEWvPVqGTv_Yfv55T-_mwp8DzpYOR-1mYjo";
const BASE_URL = "https://api.pandascore.co";

async function testLogosEndpoint() {
  console.log("🖼️ Testando endpoint de logos com PandaScore...\n");

  // Simular chamada para /api/teams/logos
  const teamNames = ["FURIA", "PARIVISION", "Legacy", "RED Canids Academy"];

  console.log("📤 Enviando teamNames:", teamNames);

  try {
    const response = await fetch("http://localhost:3000/api/teams/logos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ teamNames }),
    });

    const data = await response.json();

    console.log("📥 Resposta recebida:");
    console.log("Status:", response.status);
    console.log("Success:", data.success);
    console.log("Source:", data.source);
    console.log("Logos encontrados:");

    Object.entries(data.logos).forEach(([team, logo]) => {
      console.log(`  ${team}: ${logo || "❌ Não encontrado"}`);
    });
  } catch (error) {
    console.error("❌ Erro no teste:", error.message);
  }
}

testLogosEndpoint();
