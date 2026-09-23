import { z } from "zod";

export const criarFaixaInvestimentoSchema = z.object({
  valorMaximo: z.coerce
    .number()
    .finite("O valor máximo deve ser um número válido.")
    .int("O valor máximo deve ser um número inteiro.")
    .positive("O valor máximo deve ser maior que zero."),
});

export const atualizarFaixaInvestimentoSchema = criarFaixaInvestimentoSchema;
