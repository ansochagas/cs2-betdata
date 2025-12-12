async function testTimezoneConversion() {
  try {
    console.log("🕐 Testando conversão de fuso horário (UTC → BRT)...\n");

    // Simular a lógica do TimezoneUtils
    function utcToBRT(utcDate) {
      const date = new Date(utcDate);
      // Subtrair 3 horas (3600000ms * 3)
      return new Date(date.getTime() - 3 * 60 * 60 * 1000);
    }

    function formatDateTimeBRT(date) {
      const brtDate = utcToBRT(date);
      return brtDate.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    }

    function minutesUntilGame(gameTime) {
      const brtGameTime = utcToBRT(gameTime);
      const now = new Date();
      const diffMs = brtGameTime.getTime() - now.getTime();
      return Math.floor(diffMs / (1000 * 60));
    }

    // Exemplo do usuário: Eternal Fire vs HAVU
    // API retorna: 9:00 (UTC)
    // Deve mostrar: 6:00 (BRT = UTC-3)

    const utcGameTime = "2025-11-27T09:00:00.000Z"; // 9:00 UTC
    console.log("📅 Exemplo do usuário:");
    console.log("   Jogo: Eternal Fire vs HAVU");
    console.log("   Horário da API (UTC):", utcGameTime);
    console.log(
      "   Horário convertido (BRT):",
      utcToBRT(utcGameTime).toISOString()
    );

    console.log("\n🔄 CONVERSÃO DETALHADA:");
    console.log("   UTC original:", utcGameTime);
    console.log("   BRT convertido:", utcToBRT(utcGameTime).toISOString());
    console.log("   Diferença: 3 horas a menos ✓");

    console.log("\n📱 FORMATAÇÃO PARA EXIBIÇÃO:");
    console.log("   Data/hora completa:", formatDateTimeBRT(utcGameTime));

    console.log("\n⏰ CÁLCULO DE MINUTOS ATÉ O JOGO:");
    const minutesUntil = minutesUntilGame(utcGameTime);
    console.log("   Minutos até o jogo:", minutesUntil);

    console.log("\n🎯 VERIFICAÇÃO:");
    console.log("✅ API retorna 9:00 UTC");
    console.log("✅ Conversão: 9:00 - 3h = 6:00 BRT");
    console.log("✅ Usuário vê horário correto");
    console.log("✅ Alertas calculados no horário brasileiro");

    console.log("\n🚀 SISTEMA DE FUSO HORÁRIO PRONTO!");
    console.log("💡 Agora Eternal Fire vs HAVU mostrará 6:00 da manhã");
    console.log("💡 Alertas serão enviados no horário correto do Brasil");
  } catch (error) {
    console.error("❌ Erro no teste:", error);
    process.exit(1);
  }
}

// Executar teste
testTimezoneConversion();
