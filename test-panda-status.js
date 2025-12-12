// Teste rápido para verificar status da PandaScore API
const PANDASCORE_API_KEY =
  "POciMXi8fwRIbuW3qEWvPVqGTv_Yfv55T-_mwp8DzpYOR-1mYjo";

async function testPandaScore() {
  console.log("🧪 Testando PandaScore API...");

  try {
    const response = await fetch(
      "https://api.pandascore.co/csgo/matches?filter[status]=not_started&range[begin_at]=2025-12-06T00:00:00Z,2025-12-10T00:00:00Z&page[size]=5",
      {
        headers: {
          Authorization: `Bearer ${PANDASCORE_API_KEY}`,
          Accept: "application/json",
        },
      }
    );

    console.log(`📊 Status: ${response.status}`);

    if (response.ok) {
      const data = await response.json();
      console.log(`✅ API funcionando! ${data.length} jogos encontrados`);
      console.log("🎯 Dados reais disponíveis!");
    } else if (response.status === 429) {
      console.log("⏳ Rate limit ainda ativo");
    } else {
      console.log(`❌ Erro na API: ${response.status}`);
    }
  } catch (error) {
    console.error("❌ Erro de conexão:", error.message);
  }
}

testPandaScore();
