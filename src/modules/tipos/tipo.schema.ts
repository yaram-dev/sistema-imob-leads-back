import { z } from "zod";

export const criarTipoSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(2, "O nome do tipo deve ter pelo menos 2 caracteres.")
    .max(100, "O nome do tipo deve ter no máximo 100 caracteres."),
});

export const atualizarTipoSchema = criarTipoSchema;
