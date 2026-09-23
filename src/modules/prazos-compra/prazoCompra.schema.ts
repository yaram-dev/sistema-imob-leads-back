import { z } from "zod";

export const criarPrazoCompraSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(2, "O nome do prazo deve ter pelo menos 2 caracteres.")
    .max(100, "O nome do prazo deve ter no máximo 100 caracteres."),

  ordem: z.coerce
    .number()
    .finite("A ordem deve ser um número válido.")
    .int("A ordem deve ser um número inteiro.")
    .positive("A ordem deve ser maior que zero."),
});

export const atualizarPrazoCompraSchema = criarPrazoCompraSchema;
