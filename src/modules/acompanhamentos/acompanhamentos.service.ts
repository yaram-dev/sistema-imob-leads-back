import { prisma } from "../../database/prisma";

import {
  createAcompanhamentoSchema,
  updateAcompanhamentoSchema,
} from "./acompanhamentos.schema";

export async function criarAcompanhamento(data: unknown) {
  const dados = createAcompanhamentoSchema.parse(data);

  const lead = await prisma.lead.findUnique({
    where: {
      id: dados.leadId,
    },
  });

  if (!lead) {
    throw new Error("Lead não encontrado.");
  }

  return prisma.acompanhamento.create({
    data: {
      leadId: dados.leadId,
      tipo: dados.tipo,
      data: dados.data,
      titulo: dados.titulo,
      descricao: dados.descricao || null,
      status: dados.status ?? "PENDENTE",
    },
  });
}

export async function listarAcompanhamentosPorLead(leadId: string) {
  return prisma.acompanhamento.findMany({
    where: {
      leadId,
    },
    orderBy: {
      data: "asc",
    },
  });
}

export async function listarProximosAcompanhamentos() {
  return prisma.acompanhamento.findMany({
    where: {
      status: "PENDENTE",
    },
    include: {
      lead: {
        select: {
          id: true,
          nome: true,
          whatsapp: true,
          email: true,
        },
      },
    },
    orderBy: {
      data: "asc",
    },
  });
}

export async function buscarAcompanhamento(id: string) {
  return prisma.acompanhamento.findUnique({
    where: {
      id,
    },
    include: {
      lead: {
        select: {
          id: true,
          nome: true,
          whatsapp: true,
          email: true,
        },
      },
    },
  });
}

export async function atualizarAcompanhamento(id: string, data: unknown) {
  const dados = updateAcompanhamentoSchema.parse(data);

  const acompanhamento = await prisma.acompanhamento.findUnique({
    where: {
      id,
    },
  });

  if (!acompanhamento) {
    throw new Error("Acompanhamento não encontrado.");
  }

  return prisma.acompanhamento.update({
    where: {
      id,
    },
    data: {
      ...(dados.tipo !== undefined && {
        tipo: dados.tipo,
      }),

      ...(dados.data !== undefined && {
        data: dados.data,
      }),

      ...(dados.titulo !== undefined && {
        titulo: dados.titulo,
      }),

      ...(dados.descricao !== undefined && {
        descricao: dados.descricao || null,
      }),

      ...(dados.status !== undefined && {
        status: dados.status,
      }),
    },
  });
}

export async function excluirAcompanhamento(id: string) {
  const acompanhamento = await prisma.acompanhamento.findUnique({
    where: {
      id,
    },
  });

  if (!acompanhamento) {
    throw new Error("Acompanhamento não encontrado.");
  }

  return prisma.acompanhamento.delete({
    where: {
      id,
    },
  });
}
