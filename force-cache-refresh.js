// Forçar atualização do cache
async function forceCacheRefresh() {
  console.log("🔄 Forçando atualização completa do cache...\n");

  try {
    const response = await fetch(
      "http://localhost:3000/api/cache/csgo-matches?refresh=true",
      {
        method: "GET",
      }
    );

    const data = await response.json();

    console.log("📥 Resposta da atualização:");
    console.log("Status:", response.status);
    console.log("Success:", data.success);
    console.log("Message:", data.message);
    console.log("Collected:", data.collected);
  } catch (error) {
    console.error("❌ Erro:", error.message);
  }
}

forceCacheRefresh();
