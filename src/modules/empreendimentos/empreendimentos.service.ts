import { prisma } from "../../database/prisma";

export const getAll = () => {
  return prisma.empreendimento.findMany({
    include: {
      tipo: true,
      localizacao: true,
    },
  });
};

export const getBySlug = (slug: string) => {
  return prisma.empreendimento.findUnique({
    where: {
      slug,
    },
    include: {
      tipo: true,
      localizacao: true,
    },
  });
};

export const create = (data: {
  slug: string;
  nome: string;
  tipoId: string;
  localizacaoId: string;
  preco?: string | null;
  descricao: string[];
  imagem: string[];
  imagemCapa?: string;
  video?: string | null;
}) => {
  return prisma.empreendimento.create({
    data: {
      slug: data.slug,
      nome: data.nome,
      tipoId: data.tipoId,
      localizacaoId: data.localizacaoId,
      preco: data.preco,
      descricao: data.descricao,
      imagem: data.imagem,
      imagemCapa: data.imagemCapa,
      video: data.video,
    },
    include: {
      tipo: true,
      localizacao: true,
    },
  });
};

export const update = (
  slug: string,
  data: Partial<{
    nome: string;
    tipoId: string;
    localizacaoId: string;
    preco: string | null;
    descricao: string[];
    imagem: string[];
    imagemCapa?: string;
    video?: string | null;
  }>,
) => {
  return prisma.empreendimento.update({
    where: {
      slug,
    },
    data,
    include: {
      tipo: true,
      localizacao: true,
    },
  });
};

export const remove = (slug: string) => {
  return prisma.empreendimento.delete({
    where: {
      slug,
    },
  });
};
