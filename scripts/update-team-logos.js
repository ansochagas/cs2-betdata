const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// Mapeamento dos times do banco para os arquivos de logo baixados
const logoMapping = {
  "FaZe Clan": "/logos/faze.png",
  "Ninjas in Pyjamas": "/logos/navi.png", // NIP usa logo NAVI
  "Natus Vincere": "/logos/navi.png",
  "G2 Esports": "/logos/g2.png",
  "Made in Brazil": "/logos/mibr.png",
  "FURIA Esports": "/logos/furia.png",
  Astralis: "/logos/astralis.png",
  Vitality: "/logos/vitality.png",
  fnatic: "/logos/fnatic.png",
  "Imperial Esports": "/logos/imperial.png",
  Fluxo: "/logos/fluxo.png",
  FlyQuest: "/logos/flyquest.png",
  GamerLegion: "/logos/gamerlegion.png",
  "Rare Atom": "/logos/rareatom.png",
  M80: "/logos/m80.png",
  NRG: "/logos/navi.png", // placeholder
  "The Huns": "/logos/thehuns.png",
  "Lynn Vision": "/logos/lynnvision.png",
  "BESTIA Academy": "/logos/navi.png", // placeholder
  "Eternal Fire": "/logos/eternalfire.png",
  HAVU: "/logos/havu.png",
  "Let Her Cook": "/logos/navi.png", // placeholder
  "BIG EQUIPA": "/logos/big.png",
  Sakura: "/logos/navi.png", // placeholder
  "NIP Impact": "/logos/nip.png",
  Atrix: "/logos/navi.png", // placeholder
  "FlyQuest RED": "/logos/flyquest.png",
  "Imperial Valkyries": "/logos/imperial.png",
  "MIBR Academy": "/logos/mibr.png",
  "MIBR Female": "/logos/mibr.png",
};

async function updateTeamLogos() {
  console.log("🎨 Atualizando logos dos times...");

  for (const [teamName, logoPath] of Object.entries(logoMapping)) {
    try {
      await prisma.cSGOTeam.updateMany({
        where: { name: teamName },
        data: { logo: logoPath },
      });
      console.log(`✅ ${teamName} → ${logoPath}`);
    } catch (error) {
      console.error(`❌ Erro ao atualizar ${teamName}:`, error.message);
    }
  }

  console.log("🎉 Atualização concluída!");
  await prisma.$disconnect();
}

updateTeamLogos().catch(console.error);
