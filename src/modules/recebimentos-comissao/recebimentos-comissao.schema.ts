import { z } from "zod";

import { RecebimentoComissaoStatus } from "../../generated/prisma";

export const criarRecebimentoSchema = z.object({
  comissaoId: z.string().uuid("Comissão inválida."),

  numero: z.coerce
    .number()
    .finite("O número do recebimento deve ser válido.")
    .int("O número do recebimento deve ser inteiro.")
    .positive("O número do recebimento deve ser maior que zero."),

  valor: z.coerce
    .number()
    .finite("O valor do recebimento deve ser válido.")
    .positive("O valor do recebimento deve ser maior que zero."),

  vencimento: z.string().datetime({
    message: "A data de vencimento deve ser válida.",
  }),

  status: z.nativeEnum(RecebimentoComissaoStatus).optional(),

  dataRecebimento: z
    .string()
    .datetime({
      message: "A data de recebimento deve ser válida.",
    })
    .nullable()
    .optional(),

  observacao: z
    .string()
    .trim()
    .max(5000, "A observação é muito longa.")
    .nullable()
    .optional(),
});

export const atualizarRecebimentoSchema = z.object({
  valor: z.coerce
    .number()
    .finite("O valor do recebimento deve ser válido.")
    .positive("O valor do recebimento deve ser maior que zero.")
    .optional(),

  vencimento: z
    .string()
    .datetime({
      message: "A data de vencimento deve ser válida.",
    })
    .optional(),

  status: z.nativeEnum(RecebimentoComissaoStatus).optional(),

  dataRecebimento: z
    .string()
    .datetime({
      message: "A data de recebimento deve ser válida.",
    })
    .nullable()
    .optional(),

  observacao: z
    .string()
    .trim()
    .max(5000, "A observação é muito longa.")
    .nullable()
    .optional(),
});

export type CriarRecebimentoInput = z.infer<typeof criarRecebimentoSchema>;

export type AtualizarRecebimentoInput = z.infer<
  typeof atualizarRecebimentoSchema
>;
