import { prisma } from "../../database/prisma";

export const getAll = () => {
  return prisma.tipo.findMany({
    orderBy: {
      nome: "asc",
    },
  });
};

export const getById = (id: string) => {
  return prisma.tipo.findUnique({
    where: {
      id,
    },
  });
};

export const create = (data: { nome: string }) => {
  return prisma.tipo.create({
    data,
  });
};

export const update = (
  id: string,
  data: {
    nome: string;
  },
) => {
  return prisma.tipo.update({
    where: {
      id,
    },
    data,
  });
};

export const remove = (id: string) => {
  return prisma.tipo.delete({
    where: {
      id,
    },
  });
};
