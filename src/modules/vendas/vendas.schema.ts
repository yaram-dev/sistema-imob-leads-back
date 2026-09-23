import { z } from "zod";
import { VendaStatus, VendaTipo } from "../../generated/prisma";

export const criarVendaSchema = z.object({
  leadId: z.string().uuid("Lead inválido."),

  empreendimentoId: z
    .string()
    .uuid("Empreendimento inválido.")
    .nullable()
    .optional(),

  dataVenda: z.string().datetime({
    message: "A data da venda deve ser válida.",
  }),

  valorTabela: z
    .number()
    .positive("O valor de tabela deve ser maior que zero."),

  valorVenda: z.number().positive("O valor da venda deve ser maior que zero."),

  tipoVenda: z.nativeEnum(VendaTipo),

  contratoNome: z
    .string()
    .trim()
    .max(255, "O nome do contrato é muito longo.")
    .nullable()
    .optional(),

  contratoUrl: z
    .string()
    .trim()
    .max(1000, "A URL do contrato é muito longa.")
    .nullable()
    .optional(),

  observacao: z
    .string()
    .trim()
    .max(5000, "A observação é muito longa.")
    .nullable()
    .optional(),

  status: z.nativeEnum(VendaStatus).optional(),
});

export const atualizarVendaSchema = criarVendaSchema.partial();

export type CriarVendaInput = z.infer<typeof criarVendaSchema>;

export type AtualizarVendaInput = z.infer<typeof atualizarVendaSchema>;
