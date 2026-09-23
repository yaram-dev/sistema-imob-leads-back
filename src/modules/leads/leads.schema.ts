import { z } from "zod";

const ORIGENS_LEAD = [
  "HOME_FORMULARIO",
  "HOME_BOTAO",
  "EMPREENDIMENTO",
  "CADASTRO_MANUAL",
  "INDICACAO",
  "WHATSAPP",
  "INSTAGRAM",
  "OUTRO",
] as const;

export const createLeadSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(2, "O nome deve possuir pelo menos 2 caracteres")
    .max(120, "O nome pode ter no máximo 120 caracteres"),

  whatsapp: z
    .string()
    .trim()
    .min(8, "WhatsApp inválido")
    .max(30, "WhatsApp inválido"),

  email: z
    .string()
    .trim()
    .email("E-mail inválido")
    .optional()
    .or(z.literal("")),

  cidade: z.string().trim().max(100).optional().or(z.literal("")),

  regiao: z.string().trim().max(100).optional().or(z.literal("")),

  tipoImovel: z.string().trim().max(100).optional().or(z.literal("")),

  faixaInvestimento: z.string().trim().max(100).optional().or(z.literal("")),

  prazo: z.string().trim().max(100).optional().or(z.literal("")),

  mensagem: z.string().trim().max(1000).optional().or(z.literal("")),

  empreendimentoId: z
    .string()
    .uuid("Empreendimento inválido")
    .optional()
    .or(z.literal("")),

  outroEmpreendimento: z
    .string()
    .trim()
    .max(150, "O nome do empreendimento pode ter no máximo 150 caracteres")
    .optional()
    .or(z.literal("")),

  origem: z.enum(ORIGENS_LEAD).optional(),
});

export const updateLeadSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(2, "O nome deve possuir pelo menos 2 caracteres")
    .max(120, "O nome pode ter no máximo 120 caracteres")
    .optional(),

  whatsapp: z
    .string()
    .trim()
    .min(8, "WhatsApp inválido")
    .max(30, "WhatsApp inválido")
    .optional(),

  email: z
    .string()
    .trim()
    .email("E-mail inválido")
    .optional()
    .or(z.literal("")),

  cidade: z.string().trim().max(100).optional().or(z.literal("")),

  regiao: z.string().trim().max(100).optional().or(z.literal("")),

  tipoImovel: z.string().trim().max(100).optional().or(z.literal("")),

  faixaInvestimento: z.string().trim().max(100).optional().or(z.literal("")),

  prazo: z.string().trim().max(100).optional().or(z.literal("")),

  mensagem: z.string().trim().max(1000).optional().or(z.literal("")),

  empreendimentoId: z
    .string()
    .uuid("Empreendimento inválido")
    .optional()
    .or(z.literal("")),

  outroEmpreendimento: z
    .string()
    .trim()
    .max(150, "O nome do empreendimento pode ter no máximo 150 caracteres")
    .optional()
    .or(z.literal("")),

  status: z.enum(["NOVO", "EM_CONTATO", "NEGOCIANDO", "PERDIDO"]).optional(),

  origem: z.enum(ORIGENS_LEAD).optional(),
});
