import { prisma } from "../database/prisma";

async function preencherFaixas() {
  await prisma.faixaInvestimento.updateMany({
    where: {
      nome: "Até R$ 50.000",
    },
    data: {
      valorMaximo: 50000,
    },
  });

  await prisma.faixaInvestimento.updateMany({
    where: {
      nome: "Até R$ 100.000",
    },
    data: {
      valorMaximo: 100000,
    },
  });

  await prisma.faixaInvestimento.updateMany({
    where: {
      nome: "Até R$ 150.000",
    },
    data: {
      valorMaximo: 150000,
    },
  });

  await prisma.faixaInvestimento.updateMany({
    where: {
      nome: "Até R$ 250.000",
    },
    data: {
      valorMaximo: 250000,
    },
  });

  await prisma.faixaInvestimento.updateMany({
    where: {
      nome: "Até R$ 500.000",
    },
    data: {
      valorMaximo: 500000,
    },
  });

  await prisma.faixaInvestimento.updateMany({
    where: {
      nome: "Até R$ 1.000.000",
    },
    data: {
      valorMaximo: 1000000,
    },
  });

  await prisma.faixaInvestimento.updateMany({
    where: {
      nome: "Acima de R$ 1.000.000",
    },
    data: {
      valorMaximo: null,
    },
  });

  console.log("Faixas atualizadas com sucesso!");

  await prisma.$disconnect();
}

preencherFaixas().catch(async (erro) => {
  console.error("Erro ao preencher faixas:", erro);
  await prisma.$disconnect();
  process.exit(1);
});
