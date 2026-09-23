import { prisma } from "../../database/prisma";
import { LeadOrigem, LeadStatus } from "../../generated/prisma";
import { AppError } from "../../errors/AppError";

export const getAll = () => {
  return prisma.lead.findMany({
    include: {
      empreendimento: true,

      vendas: {
        include: {
          empreendimento: true,
        },
        orderBy: {
          dataVenda: "desc",
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getById = (id: string) => {
  return prisma.lead.findUnique({
    where: {
      id,
    },

    include: {
      empreendimento: true,

      vendas: {
        include: {
          empreendimento: true,
        },
        orderBy: {
          dataVenda: "desc",
        },
      },
    },
  });
};

export const create = (data: {
  nome: string;
  whatsapp: string;
  email?: string;
  cidade?: string;
  regiao?: string;
  tipoImovel?: string;
  faixaInvestimento?: string;
  prazo?: string;
  mensagem?: string;
  empreendimentoId?: string;
  outroEmpreendimento?: string;
  origem?:
    | "HOME_FORMULARIO"
    | "HOME_BOTAO"
    | "EMPREENDIMENTO"
    | "CADASTRO_MANUAL"
    | "INDICACAO"
    | "WHATSAPP"
    | "INSTAGRAM"
    | "OUTRO";
}) => {
  return prisma.lead.create({
    data: {
      nome: data.nome,
      whatsapp: data.whatsapp,
      email: data.email,
      cidade: data.cidade,
      regiao: data.regiao,
      tipoImovel: data.tipoImovel,
      faixaInvestimento: data.faixaInvestimento,
      prazo: data.prazo,
      mensagem: data.mensagem,

      empreendimentoId: data.empreendimentoId || null,

      outroEmpreendimento: data.outroEmpreendimento,

      origem: data.origem ? (data.origem as LeadOrigem) : "HOME_FORMULARIO",
    },

    include: {
      empreendimento: true,
    },
  });
};

export const update = async (
  id: string,
  data: {
    nome?: string;
    whatsapp?: string;
    email?: string;
    cidade?: string;
    regiao?: string;
    tipoImovel?: string;
    faixaInvestimento?: string;
    prazo?: string;
    mensagem?: string;
    empreendimentoId?: string | null;
    outroEmpreendimento?: string;
    status?: LeadStatus;
    origem?: LeadOrigem;
  },
) => {
  if (data.status === "ADQUIRIDO") {
    throw new AppError(
      "O status ADQUIRIDO só pode ser definido após o registro de uma venda.",
      409,
    );
  }

  const dadosAtualizacao = {
    ...(data.nome !== undefined && {
      nome: data.nome,
    }),

    ...(data.whatsapp !== undefined && {
      whatsapp: data.whatsapp,
    }),

    ...(data.email !== undefined && {
      email: data.email,
    }),

    ...(data.cidade !== undefined && {
      cidade: data.cidade,
    }),

    ...(data.regiao !== undefined && {
      regiao: data.regiao,
    }),

    ...(data.tipoImovel !== undefined && {
      tipoImovel: data.tipoImovel,
    }),

    ...(data.faixaInvestimento !== undefined && {
      faixaInvestimento: data.faixaInvestimento,
    }),

    ...(data.prazo !== undefined && {
      prazo: data.prazo,
    }),

    ...(data.mensagem !== undefined && {
      mensagem: data.mensagem,
    }),

    ...(data.outroEmpreendimento !== undefined && {
      outroEmpreendimento: data.outroEmpreendimento,
    }),

    ...(data.status !== undefined && {
      status: data.status,
    }),

    ...(data.origem !== undefined && {
      origem: data.origem,
    }),

    ...(data.empreendimentoId !== undefined && {
      empreendimentoId: data.empreendimentoId || null,
    }),
  };

  return prisma.lead.update({
    where: {
      id,
    },

    data: dadosAtualizacao,

    include: {
      empreendimento: true,

      vendas: {
        include: {
          empreendimento: true,
        },

        orderBy: {
          dataVenda: "desc",
        },
      },
    },
  });
};

export const remove = (id: string) => {
  return prisma.lead.delete({
    where: {
      id,
    },
  });
};
