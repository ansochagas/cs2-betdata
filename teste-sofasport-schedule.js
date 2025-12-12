const axios = require("axios");

async function testarSofaSportSchedule() {
  console.log("🎮 TESTE - SOFASPORT SCHEDULE");
  console.log("📋 Endpoint sugerido pelo usuário");
  console.log("🎯 category_id=26 & data atual");
  console.log("============================================================\n");

  const API_KEY = "d5da2b13a6msh434479d753d8387p12bae1jsn117c3b0f7da9";
  const API_HOST = "sofasport.p.rapidapi.com";

  try {
    // Data atual: 25 de novembro de 2025
    const today = new Date();
    const dateStr = today.toISOString().split("T")[0]; // YYYY-MM-DD
    console.log(`📅 Data atual: ${dateStr}`);

    // Teste 1: Endpoint sugerido com data atual
    console.log("\n📖 TESTE 1: Schedule com category_id=26 (data atual)");
    try {
      const scheduleResponse = await axios.get(
        "https://sofasport.p.rapidapi.com/v1/events/schedule/category",
        {
          headers: {
            "x-rapidapi-host": API_HOST,
            "x-rapidapi-key": API_KEY,
          },
          params: {
            category_id: 26,
            date: dateStr,
          },
          timeout: 10000,
        }
      );

      console.log(`✅ Status: ${scheduleResponse.status}`);
      console.log(
        `📊 Eventos encontrados: ${scheduleResponse.data?.data?.length || 0}`
      );

      if (
        scheduleResponse.data?.data &&
        scheduleResponse.data.data.length > 0
      ) {
        console.log("\n🏆 EVENTOS ENCONTRADOS:");
        scheduleResponse.data.data.slice(0, 10).forEach((event, index) => {
          const homeTeam = event.home_team?.name || "TBD";
          const awayTeam = event.away_team?.name || "TBD";
          const tournament = event.tournament?.name || "N/A";
          const sport = event.sport?.name || "Unknown";
          const startTime = event.start_at
            ? new Date(event.start_at * 1000).toISOString()
            : "Unknown";

          console.log(`${index + 1}. ${homeTeam} vs ${awayTeam}`);
          console.log(`   🏆 Torneio: ${tournament}`);
          console.log(`   🎮 Esporte: ${sport}`);
          console.log(`   📅 Início: ${startTime}`);

          // Verificar se é CS:GO
          const searchText =
            `${homeTeam} ${awayTeam} ${tournament} ${sport}`.toLowerCase();
          if (
            searchText.includes("cs") ||
            searchText.includes("counter") ||
            searchText.includes("furia") ||
            searchText.includes("navi") ||
            searchText.includes("mibr") ||
            searchText.includes("faze")
          ) {
            console.log(`   🎯 POSSÍVEL CS:GO ENCONTRADO!`);
          }
          console.log("");
        });
      }
    } catch (error) {
      console.log(`❌ Erro no schedule category_id=26: ${error.message}`);
    }

    // Teste 2: Descobrir categories disponíveis
    console.log("\n📖 TESTE 2: Descobrindo categories disponíveis");
    try {
      const categoriesResponse = await axios.get(
        "https://sofasport.p.rapidapi.com/v1/categories",
        {
          headers: {
            "x-rapidapi-host": API_HOST,
            "x-rapidapi-key": API_KEY,
          },
          timeout: 10000,
        }
      );

      console.log(
        `✅ Categories encontradas: ${
          categoriesResponse.data?.data?.length || 0
        }`
      );

      if (
        categoriesResponse.data?.data &&
        categoriesResponse.data.data.length > 0
      ) {
        // Procurar por categories relacionadas a CS:GO ou eSports
        const esportsCategories = categoriesResponse.data.data.filter(
          (category) =>
            category.name?.toLowerCase().includes("esports") ||
            category.name?.toLowerCase().includes("cs") ||
            category.name?.toLowerCase().includes("counter") ||
            category.name?.toLowerCase().includes("gaming") ||
            category.name?.toLowerCase().includes("electronic")
        );

        console.log(
          `🎮 Categories de eSports encontradas: ${esportsCategories.length}`
        );

        if (esportsCategories.length > 0) {
          console.log("🏆 CATEGORIES DE ESPORTS:");
          esportsCategories.forEach((category, index) => {
            console.log(`${index + 1}. ${category.name} (ID: ${category.id})`);
          });

          // Testar cada category de eSports
          for (const category of esportsCategories.slice(0, 3)) {
            console.log(
              `\n🔍 Testando category: ${category.name} (ID: ${category.id})`
            );

            try {
              const categoryScheduleResponse = await axios.get(
                "https://sofasport.p.rapidapi.com/v1/events/schedule/category",
                {
                  headers: {
                    "x-rapidapi-host": API_HOST,
                    "x-rapidapi-key": API_KEY,
                  },
                  params: {
                    category_id: category.id,
                    date: dateStr,
                  },
                  timeout: 10000,
                }
              );

              console.log(
                `   ✅ Eventos encontrados: ${
                  categoryScheduleResponse.data?.data?.length || 0
                }`
              );

              if (
                categoryScheduleResponse.data?.data &&
                categoryScheduleResponse.data.data.length > 0
              ) {
                console.log("   🏆 EVENTOS NESTA CATEGORY:");
                categoryScheduleResponse.data.data
                  .slice(0, 3)
                  .forEach((event, index) => {
                    const homeTeam = event.home_team?.name || "TBD";
                    const awayTeam = event.away_team?.name || "TBD";
                    const tournament = event.tournament?.name || "N/A";
                    const startTime = event.start_at
                      ? new Date(event.start_at * 1000).toISOString()
                      : "Unknown";

                    console.log(
                      `      ${
                        index + 1
                      }. ${homeTeam} vs ${awayTeam} (${tournament}) - ${startTime}`
                    );
                  });
              }
            } catch (error) {
              console.log(
                `   ❌ Erro na category ${category.id}: ${error.message}`
              );
            }
          }
        }

        // Mostrar todas as categories (primeiras 10)
        console.log("\n🎯 TODAS AS CATEGORIES DISPONÍVEIS (primeiras 10):");
        categoriesResponse.data.data.slice(0, 10).forEach((category, index) => {
          console.log(`${index + 1}. ${category.name} (ID: ${category.id})`);
        });
      }
    } catch (error) {
      console.log(`❌ Erro ao buscar categories: ${error.message}`);
    }

    // Teste 3: Tentar diferentes category_ids próximos a 26
    console.log("\n📖 TESTE 3: Testando category_ids próximos a 26");
    const testCategoryIds = [20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30];

    for (const categoryId of testCategoryIds) {
      try {
        console.log(`🔍 Testando category_id: ${categoryId}`);
        const response = await axios.get(
          "https://sofasport.p.rapidapi.com/v1/events/schedule/category",
          {
            headers: {
              "x-rapidapi-host": API_HOST,
              "x-rapidapi-key": API_KEY,
            },
            params: {
              category_id: categoryId,
              date: dateStr,
            },
            timeout: 5000,
          }
        );

        if (response.data?.data && response.data.data.length > 0) {
          console.log(
            `   ✅ category_id ${categoryId} - ${response.data.data.length} eventos encontrados!`
          );

          // Mostrar primeiros eventos
          response.data.data.slice(0, 2).forEach((event, index) => {
            const homeTeam = event.home_team?.name || "TBD";
            const awayTeam = event.away_team?.name || "TBD";
            const sport = event.sport?.name || "Unknown";
            console.log(
              `      ${index + 1}. ${homeTeam} vs ${awayTeam} (${sport})`
            );
          });

          // Verificar se tem CS:GO
          const hasCsgo = response.data.data.some((event) => {
            const searchText = `${event.home_team?.name || ""} ${
              event.away_team?.name || ""
            } ${event.sport?.name || ""}`.toLowerCase();
            return (
              searchText.includes("cs") ||
              searchText.includes("counter") ||
              searchText.includes("esports")
            );
          });

          if (hasCsgo) {
            console.log(`   🎯 CATEGORY ${categoryId} TEM CS:GO!`);
          }
        } else {
          console.log(`   ❌ category_id ${categoryId} - nenhum evento`);
        }
      } catch (error) {
        if (error.response?.status === 404) {
          console.log(`   ❌ category_id ${categoryId} não encontrado`);
        } else {
          console.log(`   ⚠️ category_id ${categoryId} erro: ${error.message}`);
        }
      }
    }

    console.log(
      "\n============================================================"
    );
    console.log("📊 RESUMO - SOFASPORT SCHEDULE");
  } catch (error) {
    console.error("❌ ERRO GERAL:", error.message);
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(
        `   Detalhes: ${JSON.stringify(error.response.data, null, 2)}`
      );
    }
  }
}

testarSofaSportSchedule();
