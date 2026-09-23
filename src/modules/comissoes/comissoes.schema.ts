import { z } from "zod";

const percentualSchema = z.coerce
  .number()
  .finite("O percentual deve ser um número válido.")
  .min(0, "O percentual não pode ser negativo.")
  .max(100, "O percentual não pode ser maior que 100.");

export const criarComissaoSchema = z.object({
  vendaId: z.string().uuid("Venda inválida."),

  percentualImobiliaria: percentualSchema.nullable().optional(),

  percentualCorretora: percentualSchema.nullable().optional(),

  observacao: z
    .string()
    .trim()
    .max(5000, "A observação é muito longa.")
    .nullable()
    .optional(),
});

export const atualizarComissaoSchema = z.object({
  percentualImobiliaria: percentualSchema.nullable().optional(),

  percentualCorretora: percentualSchema.nullable().optional(),

  observacao: z
    .string()
    .trim()
    .max(5000, "A observação é muito longa.")
    .nullable()
    .optional(),
});

export type CriarComissaoInput = z.infer<typeof criarComissaoSchema>;

export type AtualizarComissaoInput = z.infer<typeof atualizarComissaoSchema>;
