const { spawn } = require("child_process");
const path = require("path");

const PROJECT_ROOT = path.join(__dirname, "..");

function spawnProcess(command, args, label) {
  const child = spawn(command, args, {
    stdio: "inherit",
    cwd: PROJECT_ROOT,
    shell: true,
  });

  child.on("close", (code) => {
    console.log(`[start-with-bot] ${label} saiu com code ${code}`);
  });

  return child;
}

function inferNextMode() {
  const lifecycle = String(process.env.npm_lifecycle_event || "");
  if (lifecycle.includes("start")) return "start";
  return "dev";
}

async function main() {
  console.log("[start-with-bot] Iniciando Next.js + Telegram worker...");

  const mode = inferNextMode();
  console.log(`[start-with-bot] Modo Next.js: ${mode}`);

  const nextProcess = spawnProcess("npm", ["run", mode], "next");

  let workerProcess = null;

  const workerStart = setTimeout(() => {
    workerProcess = spawnProcess(
      "node",
      ["scripts/telegram-worker.js"],
      "telegram-worker"
    );
  }, 2500);

  function shutdown(signal) {
    console.log(`[start-with-bot] Recebido ${signal}. Encerrando...`);

    clearTimeout(workerStart);

    if (workerProcess) {
      workerProcess.kill(signal);
    }
    nextProcess.kill(signal);
    process.exit(0);
  }

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

main().catch((error) => {
  console.error("[start-with-bot] Erro fatal:", error);
  process.exit(1);
});
