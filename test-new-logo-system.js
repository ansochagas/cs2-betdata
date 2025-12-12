// Teste do novo sistema de logos de times
async function testNewLogoSystem() {
  console.log("🎨 Testando novo sistema de logos de times...\n");

  try {
    // 1. Testar busca de logos para times conhecidos
    const testTeams = [
      "FURIA",
      "Imperial",
      "MIBR",
      "Natus Vincere",
      "FaZe Clan",
      "Astralis",
      "Time que não existe",
      "Outro time inventado",
    ];

    console.log("1️⃣ Testando busca de logos...");
    const response = await fetch("http://localhost:3000/api/teams/logos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ teamNames: testTeams }),
    });

    const data = await response.json();
    console.log("Resposta da API:", JSON.stringify(data, null, 2));

    if (data.success && data.logos) {
      console.log("\n📊 Resultados detalhados:");

      Object.entries(data.logos).forEach(([teamName, logoUrl]) => {
        const isLocal = logoUrl && logoUrl.startsWith("/logos/");
        const isFallback = logoUrl === "/icons/counterstrike.svg";
        const status = isLocal
          ? "✅ LOCAL"
          : isFallback
          ? "⚠️ FALLBACK"
          : "🔄 PANDASCORE";

        console.log(`${status} ${teamName}: ${logoUrl || "NÃO ENCONTRADO"}`);
      });

      console.log(
        `\n📈 Estatísticas: ${data.stats.found}/${data.stats.total} logos encontradas`
      );
      console.log(`🏠 Logos locais: ${data.stats.local}`);
      console.log(
        `🔄 Logos PandaScore: ${data.stats.found - data.stats.local}`
      );
      console.log(`⚠️ Fallbacks: ${data.stats.fallback}`);
    }

    // 2. Testar função individual de busca de logo
    console.log("\n2️⃣ Testando busca individual...");
    const { getTeamLogo } = await import("./src/lib/team-logos.ts");

    const testTeam = "FURIA";
    const logoInfo = getTeamLogo(testTeam);
    console.log(`Logo de ${testTeam}:`, logoInfo);
  } catch (error) {
    console.error("❌ Erro:", error.message);
  }
}

testNewLogoSystem();
