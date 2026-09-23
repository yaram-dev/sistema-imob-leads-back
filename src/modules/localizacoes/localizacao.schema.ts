import { z } from "zod";

export const criarLocalizacaoSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(2, "O nome da localização deve ter pelo menos 2 caracteres.")
    .max(150, "O nome da localização deve ter no máximo 150 caracteres."),
});

export const atualizarLocalizacaoSchema = criarLocalizacaoSchema;
