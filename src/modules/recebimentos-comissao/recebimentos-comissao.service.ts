import { prisma } from "../../database/prisma";

import type {
  CriarRecebimentoInput,
  AtualizarRecebimentoInput,
} from "./recebimentos-comissao.schema";

import { AppError } from "../../errors/AppError";

function valorNumerico(valor: unknown): number {
  return Number(valor);
}

async function validarLimiteComissao(
  comissaoId: string,
  novoValor: number,
  recebimentoIdIgnorar?: string,
) {
  const comissao = await prisma.comissao.findUnique({
    where: {
      id: comissaoId,
    },
    include: {
      recebimentos: true,
    },
  });

  if (!comissao) {
    throw new AppError("Comissão não encontrada.", 404);
  }

  const valorComissaoCorretora = valorNumerico(comissao.valorCorretora);

  if (valorComissaoCorretora <= 0) {
    throw new AppError("A comissão da corretora ainda não foi definida.", 409);
  }

  const totalExistente = comissao.recebimentos
    .filter(
      (recebimento) =>
        recebimento.id !== recebimentoIdIgnorar &&
        recebimento.status !== "CANCELADA",
    )
    .reduce((soma, recebimento) => soma + valorNumerico(recebimento.valor), 0);

  const novoTotal = totalExistente + novoValor;

  if (novoTotal > valorComissaoCorretora) {
    throw new AppError(
      `A soma dos recebimentos não pode ultrapassar o valor da comissão da corretora de R$ ${valorComissaoCorretora.toFixed(2)}.`,
      409,
    );
  }

  return comissao;
}

export const getAllByComissaoId = (comissaoId: string) =>
  prisma.recebimentoComissao.findMany({
    where: {
      comissaoId,
    },
    orderBy: {
      numero: "asc",
    },
  });

export const getById = (id: string) =>
  prisma.recebimentoComissao.findUnique({
    where: {
      id,
    },
    include: {
      comissao: {
        include: {
          venda: {
            include: {
              lead: true,
              empreendimento: true,
            },
          },
        },
      },
    },
  });

export const create = async (data: CriarRecebimentoInput) => {
  const comissao = await prisma.comissao.findUnique({
    where: {
      id: data.comissaoId,
    },
    include: {
      venda: true,
    },
  });

  if (!comissao) {
    throw new AppError("Comissão não encontrada.", 404);
  }

  if (comissao.venda.status === "CANCELADA") {
    throw new AppError(
      "Não é possível adicionar recebimentos a uma comissão de uma venda cancelada.",
      409,
    );
  }

  if (data.status === "CANCELADA") {
    throw new AppError(
      "Um novo recebimento não pode ser criado com status CANCELADA.",
      409,
    );
  }

  if (data.status === "PAGA" && !data.dataRecebimento) {
    throw new AppError(
      "Informe a data em que o recebimento foi realizado.",
      400,
    );
  }

  if (data.status !== "PAGA" && data.dataRecebimento) {
    throw new AppError(
      "A data de recebimento só deve ser informada quando o recebimento estiver como PAGA.",
      400,
    );
  }

  await validarLimiteComissao(data.comissaoId, data.valor);

  return prisma.recebimentoComissao.create({
    data: {
      comissaoId: data.comissaoId,
      numero: data.numero,
      valor: data.valor,
      vencimento: new Date(data.vencimento),
      status: data.status,
      dataRecebimento: data.dataRecebimento
        ? new Date(data.dataRecebimento)
        : null,
      observacao: data.observacao ?? null,
    },
    include: {
      comissao: {
        include: {
          venda: {
            include: {
              lead: true,
              empreendimento: true,
            },
          },
        },
      },
    },
  });
};

export const update = async (id: string, data: AtualizarRecebimentoInput) => {
  const recebimento = await prisma.recebimentoComissao.findUnique({
    where: {
      id,
    },
  });

  if (!recebimento) {
    throw new AppError("Recebimento não encontrado.", 404);
  }

  if (
    recebimento.status === "PAGA" &&
    (data.valor !== undefined ||
      data.vencimento !== undefined ||
      data.dataRecebimento !== undefined ||
      (data.status !== undefined && data.status !== "CANCELADA"))
  ) {
    throw new AppError(
      "Um recebimento já pago não pode ter seus dados financeiros alterados. Para corrigir o registro, mantenha o histórico e faça o ajuste adequado.",
      409,
    );
  }

  const novoStatus =
    data.status !== undefined ? data.status : recebimento.status;

  if (data.status !== undefined && data.status !== recebimento.status) {
    const transicoesPermitidas: Record<typeof recebimento.status, string[]> = {
      PENDENTE: ["PENDENTE", "ATRASADA", "PAGA", "CANCELADA"],
      ATRASADA: ["ATRASADA", "PAGA", "CANCELADA"],
      PAGA: ["PAGA", "CANCELADA"],
      CANCELADA: ["CANCELADA"],
    };

    const statusPermitidos = transicoesPermitidas[recebimento.status];

    if (!statusPermitidos.includes(data.status)) {
      throw new AppError(
        `Não é possível alterar um recebimento de ${recebimento.status} para ${data.status}.`,
        409,
      );
    }
  }

  const novaDataRecebimento =
    data.dataRecebimento !== undefined
      ? data.dataRecebimento
      : recebimento.dataRecebimento
        ? recebimento.dataRecebimento.toISOString()
        : null;

  if (novoStatus === "PAGA" && !novaDataRecebimento) {
    throw new AppError(
      "Informe a data em que o recebimento foi realizado.",
      400,
    );
  }

  if (novoStatus !== "PAGA" && novaDataRecebimento) {
    throw new AppError(
      "A data de recebimento só deve ser informada quando o recebimento estiver como PAGA.",
      400,
    );
  }

  if (data.valor !== undefined) {
    await validarLimiteComissao(recebimento.comissaoId, data.valor, id);
  }

  if (recebimento.status === "CANCELADA") {
    const camposAlterados = Object.keys(data).filter(
      (campo) => data[campo as keyof AtualizarRecebimentoInput] !== undefined,
    );

    const camposPermitidos = ["observacao"];

    const possuiCampoNaoPermitido = camposAlterados.some(
      (campo) => !camposPermitidos.includes(campo),
    );

    if (possuiCampoNaoPermitido) {
      throw new AppError(
        "Um recebimento cancelado não pode ter seus dados financeiros alterados.",
        409,
      );
    }
  }

  return prisma.recebimentoComissao.update({
    where: {
      id,
    },
    data: {
      ...(data.valor !== undefined && {
        valor: data.valor,
      }),

      ...(data.vencimento !== undefined && {
        vencimento: new Date(data.vencimento),
      }),

      ...(data.status !== undefined && {
        status: data.status,
      }),

      ...(data.dataRecebimento !== undefined && {
        dataRecebimento: data.dataRecebimento
          ? new Date(data.dataRecebimento)
          : null,
      }),

      ...(data.observacao !== undefined && {
        observacao: data.observacao,
      }),
    },
    include: {
      comissao: {
        include: {
          venda: {
            include: {
              lead: true,
              empreendimento: true,
            },
          },
        },
      },
    },
  });
};

export const remove = async (id: string) => {
  const recebimento = await prisma.recebimentoComissao.findUnique({
    where: {
      id,
    },
  });

  if (!recebimento) {
    throw new AppError("Recebimento não encontrado.", 404);
  }

  if (recebimento.status === "PAGA") {
    throw new AppError(
      "Um recebimento que já foi pago não pode ser excluído. Para preservar o histórico financeiro, mantenha o registro.",
      409,
    );
  }

  if (recebimento.status === "CANCELADA") {
    throw new AppError(
      "Um recebimento cancelado não pode ser excluído. Para preservar o histórico financeiro, mantenha o registro.",
      409,
    );
  }

  return prisma.recebimentoComissao.delete({
    where: {
      id,
    },
  });
};
