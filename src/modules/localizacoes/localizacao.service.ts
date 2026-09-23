import { prisma } from "../../database/prisma";

export const getAll = () => {
  return prisma.localizacao.findMany({
    orderBy: {
      nome: "asc",
    },
  });
};

export const getById = (id: string) => {
  return prisma.localizacao.findUnique({
    where: {
      id,
    },
  });
};

export const create = (data: { nome: string }) => {
  return prisma.localizacao.create({
    data,
  });
};

export const update = (
  id: string,
  data: {
    nome: string;
  },
) => {
  return prisma.localizacao.update({
    where: {
      id,
    },
    data,
  });
};

export const remove = (id: string) => {
  return prisma.localizacao.delete({
    where: {
      id,
    },
  });
};
