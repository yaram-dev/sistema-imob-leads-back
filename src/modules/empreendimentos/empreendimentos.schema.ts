import { z } from "zod";

export const createEmpreendimentoSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(3, "O nome deve possuir pelo menos 3 caracteres")
    .max(120, "O nome pode ter no máximo 120 caracteres"),

  tipoId: z.string().uuid("Tipo inválido"),

  localizacaoId: z.string().uuid("Localização inválida"),

  preco: z.string().trim().max(80).optional().or(z.literal("")),

  descricao: z.array(z.string()),

  imagem: z.array(z.string()).optional(),

  imagemCapa: z.string().optional().or(z.literal("")),
});

export const updateEmpreendimentoSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(3, "O nome deve possuir pelo menos 3 caracteres")
    .max(120),

  tipoId: z.string().uuid("Tipo inválido"),

  localizacaoId: z.string().uuid("Localização inválida"),

  preco: z.string().trim().max(80).optional().or(z.literal("")),

  descricao: z.array(z.string()),

  imagem: z.array(z.string()).optional(),

  imagemCapa: z.string().optional().or(z.literal("")),
});
