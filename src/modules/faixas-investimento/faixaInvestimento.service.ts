import { prisma } from "../../database/prisma";
import { AppError } from "../../errors/AppError";

export const getAll = async () => {
  const faixas = await prisma.faixaInvestimento.findMany({
    orderBy: {
      ordem: "asc",
    },
  });

  return faixas;
};

export const getById = (id: string) => {
  return prisma.faixaInvestimento.findUnique({
    where: {
      id,
    },
  });
};

const formatarValor = (valor: number): string => {
  return valor.toLocaleString("pt-BR");
};

const gerarNomeFaixa = (valorMaximo: number): string => {
  return `Até R$ ${formatarValor(valorMaximo)}`;
};

const gerarNomeFaixaAcima = (valorMinimo: number): string => {
  return `Acima de R$ ${formatarValor(valorMinimo)}`;
};

export const reorganizarOrdens = async () => {
  const faixas = await prisma.faixaInvestimento.findMany();

  faixas.sort((a, b) => {
    if (a.valorMaximo === null) return 1;
    if (b.valorMaximo === null) return -1;

    return a.valorMaximo - b.valorMaximo;
  });

  for (let i = 0; i < faixas.length; i++) {
    const faixa = faixas[i];

    await prisma.faixaInvestimento.update({
      where: {
        id: faixa.id,
      },
      data: {
        ordem: i + 1,
      },
    });
  }

  const faixasComValor = faixas.filter((faixa) => faixa.valorMaximo !== null);

  const faixaAcima = faixas.find((faixa) => faixa.valorMaximo === null);

  if (faixaAcima && faixasComValor.length > 0) {
    const maiorFaixa = faixasComValor[faixasComValor.length - 1];

    await prisma.faixaInvestimento.update({
      where: {
        id: faixaAcima.id,
      },
      data: {
        nome: gerarNomeFaixaAcima(maiorFaixa.valorMaximo!),
      },
    });
  }

  return getAll();
};

export const create = async (data: { valorMaximo: number }) => {
  const faixaExistente = await prisma.faixaInvestimento.findFirst({
    where: {
      valorMaximo: data.valorMaximo,
    },
  });

  if (faixaExistente) {
    throw new AppError("Já existe uma faixa com este valor.", 409);
  }

  const nome = gerarNomeFaixa(data.valorMaximo);

  const novaFaixa = await prisma.faixaInvestimento.create({
    data: {
      nome,
      valorMaximo: data.valorMaximo,
      ordem: 0,
    },
  });

  await reorganizarOrdens();

  return prisma.faixaInvestimento.findUnique({
    where: {
      id: novaFaixa.id,
    },
  });
};

export const update = async (
  id: string,
  data: {
    valorMaximo: number;
  },
) => {
  const faixa = await prisma.faixaInvestimento.findUnique({
    where: {
      id,
    },
  });

  if (!faixa) {
    throw new AppError("Faixa de investimento não encontrada.", 404);
  }

  if (faixa.valorMaximo === null) {
    throw new AppError(
      "A faixa 'Acima de...' é atualizada automaticamente.",
      409,
    );
  }

  if (faixa.valorMaximo === data.valorMaximo) {
    return prisma.faixaInvestimento.findUnique({
      where: {
        id,
      },
    });
  }

  const faixaExistente = await prisma.faixaInvestimento.findFirst({
    where: {
      valorMaximo: data.valorMaximo,
      NOT: {
        id,
      },
    },
  });

  if (faixaExistente) {
    throw new AppError("Já existe uma faixa com este valor.", 409);
  }

  const valorAntigo = faixa.valorMaximo;

  await prisma.faixaInvestimento.update({
    where: {
      id,
    },
    data: {
      nome: gerarNomeFaixa(data.valorMaximo),
      valorMaximo: data.valorMaximo,
    },
  });

  await prisma.faixaInvestimento.create({
    data: {
      nome: gerarNomeFaixa(valorAntigo),
      valorMaximo: valorAntigo,
      ordem: 0,
    },
  });

  await reorganizarOrdens();

  return prisma.faixaInvestimento.findUnique({
    where: {
      id,
    },
  });
};

export const remove = async (id: string) => {
  const faixa = await prisma.faixaInvestimento.findUnique({
    where: {
      id,
    },
  });

  if (!faixa) {
    throw new AppError("Faixa de investimento não encontrada.", 404);
  }

  if (faixa.valorMaximo === null) {
    throw new AppError("A faixa 'Acima de...' não pode ser excluída.", 409);
  }

  await prisma.faixaInvestimento.delete({
    where: {
      id,
    },
  });

  await reorganizarOrdens();

  return true;
};
