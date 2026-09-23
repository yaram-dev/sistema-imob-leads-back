import { prisma } from "../../database/prisma";
import { AppError } from "../../errors/AppError";

export const getAll = () => {
  return prisma.prazoCompra.findMany({
    orderBy: {
      ordem: "asc",
    },
  });
};

export const getById = (id: string) => {
  return prisma.prazoCompra.findUnique({
    where: {
      id,
    },
  });
};

export const create = async (data: { nome: string; ordem: number }) => {
  const prazoExistente = await prisma.prazoCompra.findUnique({
    where: {
      nome: data.nome,
    },
  });

  if (prazoExistente) {
    throw new AppError("Já existe um prazo de compra com este nome.", 409);
  }

  return prisma.prazoCompra.create({
    data,
  });
};

export const update = async (
  id: string,
  data: {
    nome: string;
    ordem: number;
  },
) => {
  const prazo = await prisma.prazoCompra.findUnique({
    where: {
      id,
    },
  });

  if (!prazo) {
    throw new AppError("Prazo de compra não encontrado.", 404);
  }

  const prazoExistente = await prisma.prazoCompra.findFirst({
    where: {
      nome: data.nome,
      NOT: {
        id,
      },
    },
  });

  if (prazoExistente) {
    throw new AppError("Já existe um prazo de compra com este nome.", 409);
  }

  return prisma.prazoCompra.update({
    where: {
      id,
    },
    data,
  });
};

export const remove = async (id: string) => {
  const prazo = await prisma.prazoCompra.findUnique({
    where: {
      id,
    },
  });

  if (!prazo) {
    throw new AppError("Prazo de compra não encontrado.", 404);
  }

  await prisma.prazoCompra.delete({
    where: {
      id,
    },
  });

  return true;
};
