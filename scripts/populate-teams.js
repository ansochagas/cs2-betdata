const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const teamsData = [
  {
    name: "FaZe Clan",
    logo: "/logos/faze.png",
    country: "US",
  },
  {
    name: "Ninjas in Pyjamas",
    logo: "/logos/navi.png",
    country: "SE",
  },
  {
    name: "Natus Vincere",
    logo: "/logos/navi.png",
    country: "UA",
  },
  {
    name: "G2 Esports",
    logo: "/logos/g2.png",
    country: "DE",
  },
  {
    name: "Made in Brazil",
    logo: "/logos/mibr.png",
    country: "BR",
  },
  {
    name: "FURIA Esports",
    logo: "/logos/furia.png",
    country: "BR",
  },
  {
    name: "Astralis",
    logo: "/logos/navi.png",
    country: "DK",
  },
  {
    name: "Vitality",
    logo: "/logos/vitality.png",
    country: "FR",
  },
  {
    name: "fnatic",
    logo: "/logos/navi.png",
    country: "SE",
  },
  {
    name: "Imperial Esports",
    logo: "/logos/navi.png",
    country: "BR",
  },
  {
    name: "Fluxo",
    logo: "/logos/navi.png",
    country: "BR",
  },
  {
    name: "FlyQuest",
    logo: "/logos/navi.png",
    country: "US",
  },
  {
    name: "GamerLegion",
    logo: "/logos/navi.png",
    country: "DE",
  },
  {
    name: "Rare Atom",
    logo: "/logos/navi.png",
    country: "CN",
  },
  {
    name: "M80",
    logo: "/logos/navi.png",
    country: "CN",
  },
  {
    name: "NRG",
    logo: "/logos/navi.png",
    country: "US",
  },
  {
    name: "The Huns",
    logo: "/logos/navi.png",
    country: "MN",
  },
  {
    name: "Lynn Vision",
    logo: "/logos/navi.png",
    country: "CN",
  },
  {
    name: "BESTIA Academy",
    logo: "/logos/navi.png",
    country: "BR",
  },
  {
    name: "Eternal Fire",
    logo: "/logos/navi.png",
    country: "TR",
  },
  {
    name: "HAVU",
    logo: "/logos/navi.png",
    country: "FI",
  },
  {
    name: "Let Her Cook",
    logo: "/logos/navi.png",
    country: "US",
  },
  {
    name: "BIG EQUIPA",
    logo: "/logos/navi.png",
    country: "DE",
  },
  {
    name: "Sakura",
    logo: "/logos/navi.png",
    country: "CN",
  },
  {
    name: "NIP Impact",
    logo: "/logos/navi.png",
    country: "SE",
  },
  {
    name: "Atrix",
    logo: "/logos/navi.png",
    country: "BR",
  },
];

async function populateTeams() {
  console.log("🏆 Populando tabela de times CS:GO...");

  for (const teamData of teamsData) {
    try {
      await prisma.cSGOTeam.upsert({
        where: { name: teamData.name },
        update: {
          logo: teamData.logo,
          country: teamData.country,
        },
        create: teamData,
      });
      console.log(`✅ ${teamData.name}`);
    } catch (error) {
      console.error(`❌ Erro ao criar ${teamData.name}:`, error.message);
    }
  }

  console.log("🎉 População concluída!");
  await prisma.$disconnect();
}

populateTeams().catch(console.error);
