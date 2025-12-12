const API_KEY = "POciMXi8fwRIbuW3qEWvPVqGTv_Yfv55T-_mwp8DzpYOR-1mYjo";
const BASE_URL = "https://api.pandascore.co";

async function testAPIStatus() {
  console.log("🔍 Testando status da PandaScore API...\n");

  try {
    const response = await fetch(
      `${BASE_URL}/csgo/teams?search[name]=FURIA&page[size]=1`,
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          Accept: "application/json",
        },
      }
    );

    console.log(`📊 Status Code: ${response.status}`);
    console.log(`📊 Status Text: ${response.statusText}`);

    if (response.ok) {
      const data = await response.json();
      console.log(`✅ API funcionando! Encontrados ${data.length} times`);
      if (data.length > 0) {
        console.log(`📋 Primeiro time: ${data[0].name} (ID: ${data[0].id})`);
      }
    } else {
      const errorText = await response.text();
      console.log(`❌ API com erro: ${errorText}`);
    }
  } catch (error) {
    console.log(`❌ Erro de conexão: ${error.message}`);
  }
}

testAPIStatus();
