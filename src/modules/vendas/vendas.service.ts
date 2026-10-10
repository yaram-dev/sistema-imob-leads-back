import { prisma } from "../../database/prisma";

import type { CriarVendaInput, AtualizarVendaInput } from "./vendas.schema";

import { AppError } from "../../errors/AppError";

import { VendaDocumentoTipo } from "../../generated/prisma";

type NovoDocumentoVenda = {
  tipo: VendaDocumentoTipo;
  nome: string;
  url: string;
};

type AtualizacaoDocumentosVenda = {
  adicionar?: NovoDocumentoVenda[];
  removerIds?: string[];
};

const incluirVendaCompleta = {
  lead: true,
  empreendimento: true,
  documentos: {
    orderBy: {
      createdAt: "asc" as const,
    },
  },
  comissao: {
    include: {
      recebimentos: {
        orderBy: {
          numero: "asc" as const,
        },
      },
    },
  },
};

export const getAll = () => {
  return prisma.venda.findMany({
    include: incluirVendaCompleta,
    orderBy: {
      dataVenda: "desc",
    },
  });
};

export const getById = (id: string) => {
  return prisma.venda.findUnique({
    where: {
      id,
    },
    include: incluirVendaCompleta,
  });
};

export const create = async (
  data: CriarVendaInput,
  documentos: NovoDocumentoVenda[] = [],
) => {
  if (data.status === "CANCELADA") {
    throw new AppError(
      "Uma venda não pode ser criada diretamente como CANCELADA. Registre a venda primeiro e, se necessário, cancele-a posteriormente.",
      409,
    );
  }

  return prisma.$transaction(async (tx) => {
    const venda = await tx.venda.create({
      data: {
        leadId: data.leadId,

        empreendimentoId: data.empreendimentoId ?? null,

        dataVenda: new Date(data.dataVenda),

        valorTabela: data.valorTabela,

        valorVenda: data.valorVenda,

        tipoVenda: data.tipoVenda,

        observacao: data.observacao ?? null,

        status: data.status ?? "ATIVA",

        ...(documentos.length > 0 && {
          documentos: {
            create: documentos.map((documento) => ({
              tipo: documento.tipo,
              nome: documento.nome,
              url: documento.url,
            })),
          },
        }),
      },
    });

    await tx.lead.update({
      where: {
        id: data.leadId,
      },
      data: {
        status: "ADQUIRIDO",
      },
    });

    const vendaCompleta = await tx.venda.findUnique({
      where: {
        id: venda.id,
      },
      include: incluirVendaCompleta,
    });

    return vendaCompleta;
  });
};

export const update = async (
  id: string,
  data: AtualizarVendaInput,
  documentos: AtualizacaoDocumentosVenda = {},
) => {
  const vendaExistente = await prisma.venda.findUnique({
    where: {
      id,
    },
    include: {
      comissao: {
        include: {
          recebimentos: true,
        },
      },
      documentos: true,
    },
  });

  if (!vendaExistente) {
    throw new AppError("Venda não encontrada.", 404);
  }

  if (data.status !== undefined && data.status !== vendaExistente.status) {
    const transicoesPermitidas: Record<typeof vendaExistente.status, string[]> =
      {
        ATIVA: ["ATIVA", "CONCLUIDA", "CANCELADA"],
        CONCLUIDA: ["CONCLUIDA", "CANCELADA"],
        CANCELADA: ["CANCELADA"],
      };

    const statusPermitidos = transicoesPermitidas[vendaExistente.status];

    if (!statusPermitidos.includes(data.status)) {
      throw new AppError(
        `Não é possível alterar uma venda de ${vendaExistente.status} para ${data.status}.`,
        409,
      );
    }
  }

  if (
    vendaExistente.comissao &&
    data.valorVenda !== undefined &&
    data.valorVenda !== Number(vendaExistente.valorVenda)
  ) {
    throw new AppError(
      "O valor da venda não pode ser alterado porque já existe uma comissão registrada para esta venda.",
      409,
    );
  }

  if (
    vendaExistente.comissao &&
    data.tipoVenda !== undefined &&
    data.tipoVenda !== vendaExistente.tipoVenda
  ) {
    throw new AppError(
      "O tipo da venda não pode ser alterado porque já existe uma comissão registrada para esta venda.",
      409,
    );
  }

  if (vendaExistente.status === "CANCELADA") {
    const camposPermitidos = ["observacao"];

    const camposAlterados = Object.keys(data).filter(
      (campo) => data[campo as keyof AtualizarVendaInput] !== undefined,
    );

    const possuiCampoNaoPermitido = camposAlterados.some(
      (campo) => !camposPermitidos.includes(campo) && campo !== "status",
    );

    if (possuiCampoNaoPermitido) {
      throw new AppError(
        "Uma venda cancelada não pode ter seus dados comerciais alterados.",
        409,
      );
    }
  }

  const idsParaRemover = documentos.removerIds ?? [];
  const documentosParaAdicionar = documentos.adicionar ?? [];

  const idsExistentes = new Set(
    vendaExistente.documentos.map((documento) => documento.id),
  );

  const idsInvalidos = idsParaRemover.filter(
    (documentoId) => !idsExistentes.has(documentoId),
  );

  if (idsInvalidos.length > 0) {
    throw new AppError(
      "Um ou mais documentos informados para remoção não pertencem a esta venda.",
      400,
    );
  }

  const vendaAtualizada = await prisma.$transaction(async (tx) => {
    if (idsParaRemover.length > 0) {
      await tx.vendaDocumento.deleteMany({
        where: {
          vendaId: id,
          id: {
            in: idsParaRemover,
          },
        },
      });
    }

    if (documentosParaAdicionar.length > 0) {
      await tx.vendaDocumento.createMany({
        data: documentosParaAdicionar.map((documento) => ({
          vendaId: id,
          tipo: documento.tipo,
          nome: documento.nome,
          url: documento.url,
        })),
      });
    }

    return tx.venda.update({
      where: {
        id,
      },

      data: {
        ...(data.empreendimentoId !== undefined && {
          empreendimentoId: data.empreendimentoId,
        }),

        ...(data.dataVenda !== undefined && {
          dataVenda: new Date(data.dataVenda),
        }),

        ...(data.valorTabela !== undefined && {
          valorTabela: data.valorTabela,
        }),

        ...(data.valorVenda !== undefined && {
          valorVenda: data.valorVenda,
        }),

        ...(data.tipoVenda !== undefined && {
          tipoVenda: data.tipoVenda,
        }),

        ...(data.observacao !== undefined && {
          observacao: data.observacao,
        }),

        ...(data.status !== undefined && {
          status: data.status,
        }),
      },

      include: incluirVendaCompleta,
    });
  });

  return vendaAtualizada;
};

export const remove = async (id: string) => {
  const venda = await prisma.venda.findUnique({
    where: {
      id,
    },
    include: {
      comissao: true,
      documentos: true,
    },
  });

  if (!venda) {
    throw new AppError("Venda não encontrada.", 404);
  }

  if (venda.comissao) {
    throw new AppError(
      "Esta venda possui uma comissão registrada e não pode ser excluída. Para preservar o histórico financeiro, altere o status da venda para CANCELADA.",
      409,
    );
  }

  return prisma.venda.delete({
    where: {
      id,
    },
  });
};
