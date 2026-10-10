import { z } from "zod";
import {
  VendaStatus,
  VendaTipo,
  VendaDocumentoTipo,
} from "../../generated/prisma";

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

  observacao: z
    .string()
    .trim()
    .max(5000, "A observação é muito longa.")
    .nullable()
    .optional(),

  status: z.nativeEnum(VendaStatus).optional(),
});

export const atualizarVendaSchema = criarVendaSchema.partial();

export const tipoDocumentoVendaSchema = z.nativeEnum(VendaDocumentoTipo);

export type CriarVendaInput = z.infer<typeof criarVendaSchema>;

export type AtualizarVendaInput = z.infer<typeof atualizarVendaSchema>;

export type TipoDocumentoVenda = z.infer<typeof tipoDocumentoVendaSchema>;
