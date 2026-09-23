import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("E-mail inválido"),
  senha: z.string().min(1, "A senha é obrigatória"),
});

export const alterarSenhaSchema = z
  .object({
    senhaAtual: z.string().min(1, "A senha atual é obrigatória."),
    novaSenha: z
      .string()
      .min(8, "A nova senha deve possuir pelo menos 8 caracteres.")
      .max(100, "A nova senha deve possuir no máximo 100 caracteres."),
    confirmarNovaSenha: z
      .string()
      .min(1, "A confirmação da nova senha é obrigatória."),
  })
  .refine((dados) => dados.novaSenha === dados.confirmarNovaSenha, {
    message: "A confirmação da nova senha não confere.",
    path: ["confirmarNovaSenha"],
  })
  .refine((dados) => dados.senhaAtual !== dados.novaSenha, {
    message: "A nova senha deve ser diferente da senha atual.",
    path: ["novaSenha"],
  });

export const solicitarRecuperacaoSenhaSchema = z.object({
  email: z.string().trim().email("E-mail inválido"),
});

export const redefinirSenhaSchema = z
  .object({
    token: z.string().trim().min(1, "Token de recuperação inválido."),

    novaSenha: z
      .string()
      .min(8, "A nova senha deve possuir pelo menos 8 caracteres.")
      .max(100, "A nova senha deve possuir no máximo 100 caracteres."),

    confirmarNovaSenha: z
      .string()
      .min(1, "A confirmação da nova senha é obrigatória."),
  })
  .refine((dados) => dados.novaSenha === dados.confirmarNovaSenha, {
    message: "A confirmação da nova senha não confere.",
    path: ["confirmarNovaSenha"],
  });

export type AlterarSenhaInput = z.infer<typeof alterarSenhaSchema>;
export type SolicitarRecuperacaoSenhaInput = z.infer<
  typeof solicitarRecuperacaoSenhaSchema
>;
export type RedefinirSenhaInput = z.infer<typeof redefinirSenhaSchema>;
