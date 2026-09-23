import { z } from "zod";

export const createAcompanhamentoSchema = z.object({
  leadId: z.string().uuid("Lead inválido"),

  tipo: z.enum([
    "LIGACAO",
    "WHATSAPP",
    "VISITA",
    "REUNIAO",
    "PROPOSTA",
    "FOLLOW_UP",
    "OUTRO",
  ]),

  data: z.coerce.date({
    message: "Data e horário inválidos",
  }),

  titulo: z
    .string()
    .trim()
    .min(1, "O título é obrigatório")
    .max(200, "O título pode ter no máximo 200 caracteres"),

  descricao: z
    .string()
    .trim()
    .max(1000, "A descrição pode ter no máximo 1000 caracteres")
    .optional()
    .or(z.literal("")),

  status: z.enum(["PENDENTE", "CONCLUIDO", "CANCELADO"]).optional(),
});

export const updateAcompanhamentoSchema = z.object({
  tipo: z
    .enum([
      "LIGACAO",
      "WHATSAPP",
      "VISITA",
      "REUNIAO",
      "PROPOSTA",
      "FOLLOW_UP",
      "OUTRO",
    ])
    .optional(),

  data: z.coerce
    .date({
      message: "Data e horário inválidos",
    })
    .optional(),

  titulo: z
    .string()
    .trim()
    .min(1, "O título é obrigatório")
    .max(200, "O título pode ter no máximo 200 caracteres")
    .optional(),

  descricao: z
    .string()
    .trim()
    .max(1000, "A descrição pode ter no máximo 1000 caracteres")
    .optional()
    .or(z.literal("")),

  status: z.enum(["PENDENTE", "CONCLUIDO", "CANCELADO"]).optional(),
});
