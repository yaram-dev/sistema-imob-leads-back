import { prisma } from "../../database/prisma";

import type { CriarVendaInput, AtualizarVendaInput } from "./vendas.schema";

import { AppError } from "../../errors/AppError";

export const getAll = () => {
  return prisma.venda.findMany({
    include: {
      lead: true,
      empreendimento: true,
      comissao: {
        include: {
          recebimentos: {
            orderBy: {
              numero: "asc",
            },
          },
        },
      },
    },
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
    include: {
      lead: true,
      empreendimento: true,
      comissao: {
        include: {
          recebimentos: {
            orderBy: {
              numero: "asc",
            },
          },
        },
      },
    },
  });
};

export const create = async (data: CriarVendaInput) => {
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

        contratoNome: data.contratoNome ?? null,

        contratoUrl: data.contratoUrl ?? null,

        observacao: data.observacao ?? null,

        status: data.status ?? "ATIVA",
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
      include: {
        lead: true,
        empreendimento: true,
        comissao: {
          include: {
            recebimentos: {
              orderBy: {
                numero: "asc",
              },
            },
          },
        },
      },
    });

    return vendaCompleta;
  });
};

export const update = async (id: string, data: AtualizarVendaInput) => {
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
    const camposPermitidos = ["observacao", "contratoNome", "contratoUrl"];

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

  const vendaAtualizada = await prisma.venda.update({
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

      ...(data.contratoNome !== undefined && {
        contratoNome: data.contratoNome,
      }),

      ...(data.contratoUrl !== undefined && {
        contratoUrl: data.contratoUrl,
      }),

      ...(data.observacao !== undefined && {
        observacao: data.observacao,
      }),

      ...(data.status !== undefined && {
        status: data.status,
      }),
    },

    include: {
      lead: true,
      empreendimento: true,
      comissao: {
        include: {
          recebimentos: {
            orderBy: {
              numero: "asc",
            },
          },
        },
      },
    },
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
