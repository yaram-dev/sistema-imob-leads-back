import { prisma } from "../../database/prisma";

import type {
  CriarComissaoInput,
  AtualizarComissaoInput,
} from "./comissoes.schema";

import { AppError } from "../../errors/AppError";

import { Prisma } from "../../generated/prisma";

function calcularResumo(
  valorCorretora: unknown,
  recebimentos: Array<{
    valor: unknown;
    status: string;
  }>,
) {
  const total = new Prisma.Decimal(Number(valorCorretora ?? 0));

  const recebido = recebimentos
    .filter((recebimento) => recebimento.status === "PAGA")
    .reduce(
      (soma, recebimento) =>
        soma.add(new Prisma.Decimal(Number(recebimento.valor))),
      new Prisma.Decimal(0),
    );

  const aReceber = Prisma.Decimal.max(
    total.sub(recebido),
    new Prisma.Decimal(0),
  );

  return {
    recebido: recebido.toNumber(),
    aReceber: aReceber.toNumber(),
  };
}

function montarComissaoComResumo<
  T extends {
    valorCorretora: unknown;
    recebimentos: Array<{
      valor: unknown;
      status: string;
    }>;
  },
>(comissao: T) {
  return {
    ...comissao,
    resumo: calcularResumo(comissao.valorCorretora, comissao.recebimentos),
  };
}

function calcularValorComissao(
  valorVenda: Prisma.Decimal,
  percentual: number | null | undefined,
): Prisma.Decimal {
  if (percentual === null || percentual === undefined) {
    return new Prisma.Decimal(0);
  }

  return valorVenda.mul(percentual).div(100).toDecimalPlaces(2);
}

function calcularComissao(
  valorVenda: Prisma.Decimal,
  tipoVenda: "IMOBILIARIA" | "AVULSA",
  percentualImobiliaria: number | null,
  percentualCorretora: number | null,
) {
  let valorImobiliaria: Prisma.Decimal | null = null;
  let valorCorretora: Prisma.Decimal | null = null;

  let valorTotal = new Prisma.Decimal(0);

  if (tipoVenda === "IMOBILIARIA") {
    if (percentualImobiliaria === null && percentualCorretora === null) {
      throw new AppError("Informe pelo menos um percentual de comissão.", 400);
    }

    if (percentualImobiliaria !== null) {
      valorImobiliaria = calcularValorComissao(
        valorVenda,
        percentualImobiliaria,
      );
    }

    if (percentualCorretora !== null) {
      valorCorretora = calcularValorComissao(valorVenda, percentualCorretora);
    }

    valorTotal = (valorImobiliaria ?? new Prisma.Decimal(0)).add(
      valorCorretora ?? new Prisma.Decimal(0),
    );
  } else {
    if (percentualCorretora === null) {
      throw new AppError(
        "Informe o percentual da corretora para uma venda avulsa.",
        400,
      );
    }

    valorCorretora = calcularValorComissao(valorVenda, percentualCorretora);

    valorTotal = valorCorretora;
  }

  if (valorTotal.lessThanOrEqualTo(0)) {
    throw new AppError(
      "O valor total da comissão deve ser maior que zero.",
      400,
    );
  }

  return {
    valorImobiliaria,
    valorCorretora,
    valorTotal,
  };
}

export const getById = async (id: string) => {
  const comissao = await prisma.comissao.findUnique({
    where: { id },
    include: {
      venda: {
        include: {
          lead: true,
          empreendimento: true,
        },
      },
      recebimentos: {
        orderBy: {
          numero: "asc",
        },
      },
    },
  });

  if (!comissao) {
    return null;
  }

  return montarComissaoComResumo(comissao);
};

export const getByVendaId = async (vendaId: string) => {
  const comissao = await prisma.comissao.findUnique({
    where: { vendaId },
    include: {
      venda: {
        include: {
          lead: true,
          empreendimento: true,
        },
      },
      recebimentos: {
        orderBy: {
          numero: "asc",
        },
      },
    },
  });

  if (!comissao) {
    return null;
  }

  return montarComissaoComResumo(comissao);
};

export const create = async (data: CriarComissaoInput) => {
  const venda = await prisma.venda.findUnique({
    where: {
      id: data.vendaId,
    },
  });

  if (!venda) {
    throw new AppError("Venda não encontrada.", 404);
  }

  if (venda.status === "CANCELADA") {
    throw new AppError(
      "Não é possível registrar uma comissão para uma venda cancelada.",
      409,
    );
  }

  const comissaoExistente = await prisma.comissao.findUnique({
    where: {
      vendaId: data.vendaId,
    },
  });

  if (comissaoExistente) {
    throw new AppError("Esta venda já possui uma comissão registrada.", 409);
  }

  const valorVenda = new Prisma.Decimal(venda.valorVenda);

  const percentualImobiliaria = data.percentualImobiliaria ?? null;

  const percentualCorretora = data.percentualCorretora ?? null;

  const valores = calcularComissao(
    valorVenda,
    venda.tipoVenda,
    percentualImobiliaria,
    percentualCorretora,
  );

  const comissao = await prisma.comissao.create({
    data: {
      vendaId: data.vendaId,
      percentualImobiliaria,
      valorImobiliaria: valores.valorImobiliaria,
      percentualCorretora,
      valorCorretora: valores.valorCorretora,
      valorTotal: valores.valorTotal,
      observacao: data.observacao ?? null,
    },
    include: {
      venda: {
        include: {
          lead: true,
          empreendimento: true,
        },
      },
      recebimentos: {
        orderBy: {
          numero: "asc",
        },
      },
    },
  });

  return montarComissaoComResumo(comissao);
};

export const update = async (id: string, data: AtualizarComissaoInput) => {
  const comissao = await prisma.comissao.findUnique({
    where: { id },
    include: {
      venda: true,
      recebimentos: true,
    },
  });

  if (!comissao) {
    throw new AppError("Comissão não encontrada.", 404);
  }

  const venda = comissao.venda;

  if (venda.status === "CANCELADA") {
    throw new AppError(
      "A comissão de uma venda cancelada não pode ser alterada.",
      409,
    );
  }

  const possuiRecebimentoAtivo = comissao.recebimentos.some(
    (recebimento) => recebimento.status !== "CANCELADA",
  );

  const estaAlterandoParteFinanceira =
    data.percentualImobiliaria !== undefined ||
    data.percentualCorretora !== undefined;

  if (possuiRecebimentoAtivo && estaAlterandoParteFinanceira) {
    throw new AppError(
      "Esta comissão possui recebimentos registrados e seus percentuais não podem mais ser alterados.",
      409,
    );
  }

  const percentualImobiliaria =
    data.percentualImobiliaria !== undefined
      ? data.percentualImobiliaria
      : comissao.percentualImobiliaria !== null
        ? Number(comissao.percentualImobiliaria)
        : null;

  const percentualCorretora =
    data.percentualCorretora !== undefined
      ? data.percentualCorretora
      : comissao.percentualCorretora !== null
        ? Number(comissao.percentualCorretora)
        : null;

  const valorVenda = new Prisma.Decimal(venda.valorVenda);

  const valores = calcularComissao(
    valorVenda,
    venda.tipoVenda,
    percentualImobiliaria,
    percentualCorretora,
  );

  const totalComprometido = comissao.recebimentos
    .filter((recebimento) => recebimento.status !== "CANCELADA")
    .reduce(
      (soma, recebimento) =>
        soma.add(new Prisma.Decimal(Number(recebimento.valor))),
      new Prisma.Decimal(0),
    );

  const novoValorCorretora = valores.valorCorretora ?? new Prisma.Decimal(0);

  if (totalComprometido.greaterThan(novoValorCorretora)) {
    throw new AppError(
      `A nova comissão da corretora não pode ser inferior ao total dos recebimentos registrados de R$ ${totalComprometido.toFixed(2)}.`,
      409,
    );
  }

  const comissaoAtualizada = await prisma.comissao.update({
    where: { id },
    data: {
      percentualImobiliaria,
      valorImobiliaria: valores.valorImobiliaria,
      percentualCorretora,
      valorCorretora: valores.valorCorretora,
      valorTotal: valores.valorTotal,

      ...(data.observacao !== undefined && {
        observacao: data.observacao,
      }),
    },
    include: {
      venda: {
        include: {
          lead: true,
          empreendimento: true,
        },
      },
      recebimentos: {
        orderBy: {
          numero: "asc",
        },
      },
    },
  });

  return montarComissaoComResumo(comissaoAtualizada);
};

export const remove = async (id: string) => {
  const comissao = await prisma.comissao.findUnique({
    where: { id },
    include: {
      recebimentos: true,
    },
  });

  if (!comissao) {
    throw new AppError("Comissão não encontrada.", 404);
  }

  if (comissao.recebimentos.length > 0) {
    throw new AppError(
      "Esta comissão possui recebimentos registrados e não pode ser excluída. Para preservar o histórico financeiro, mantenha a comissão registrada.",
      409,
    );
  }

  return prisma.comissao.delete({
    where: { id },
  });
};
