import { Request, Response } from "express";

import {
  login,
  alterarSenha,
  solicitarRecuperacaoSenha,
  redefinirSenha,
} from "./autenticacao.service";

import {
  loginSchema,
  alterarSenhaSchema,
  solicitarRecuperacaoSenhaSchema,
  redefinirSenhaSchema,
} from "./autenticacao.schema";

import { AppError } from "../../errors/AppError";

export async function entrar(req: Request, res: Response) {
  const validacao = loginSchema.safeParse(req.body);

  if (!validacao.success) {
    return res.status(400).json({
      message: "Dados inválidos.",
      errors: validacao.error.flatten().fieldErrors,
    });
  }

  try {
    const resultado = await login(validacao.data.email, validacao.data.senha);

    res.cookie("admin_token", resultado.token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 8 * 60 * 60 * 1000,
      path: "/",
    });

    return res.json({
      usuario: resultado.usuario,
    });
  } catch (error) {
    console.error("ERRO AO FAZER LOGIN:", error);

    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Erro interno ao realizar o login.",
    });
  }
}

export function sair(req: Request, res: Response) {
  res.clearCookie("admin_token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
  });

  return res.json({
    message: "Logout realizado com sucesso.",
  });
}

export async function alterarSenhaUsuario(req: Request, res: Response) {
  const usuarioId = req.usuario?.id;

  if (!usuarioId) {
    return res.status(401).json({
      message: "Usuário não autenticado.",
    });
  }

  const validacao = alterarSenhaSchema.safeParse(req.body);

  if (!validacao.success) {
    return res.status(400).json({
      message: "Dados inválidos.",
      errors: validacao.error.flatten().fieldErrors,
    });
  }

  try {
    const resultado = await alterarSenha(
      usuarioId,
      validacao.data.senhaAtual,
      validacao.data.novaSenha,
    );

    return res.json(resultado);
  } catch (error) {
    console.error("ERRO AO ALTERAR SENHA:", error);

    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Erro interno ao alterar a senha.",
    });
  }
}

export async function solicitarRecuperacaoSenhaController(
  req: Request,
  res: Response,
) {
  const validacao = solicitarRecuperacaoSenhaSchema.safeParse(req.body);

  if (!validacao.success) {
    return res.status(400).json({
      message: "Dados inválidos.",
      errors: validacao.error.flatten().fieldErrors,
    });
  }

  try {
    const resultado = await solicitarRecuperacaoSenha(validacao.data.email);

    return res.json({
      message: resultado.message,
    });
  } catch (error) {
    console.error("ERRO AO SOLICITAR RECUPERAÇÃO DE SENHA:", error);

    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message:
        "Não foi possível processar a solicitação de recuperação de senha.",
    });
  }
}

export async function redefinirSenhaController(req: Request, res: Response) {
  const validacao = redefinirSenhaSchema.safeParse(req.body);

  if (!validacao.success) {
    return res.status(400).json({
      message: "Dados inválidos.",
      errors: validacao.error.flatten().fieldErrors,
    });
  }

  try {
    const resultado = await redefinirSenha(
      validacao.data.token,
      validacao.data.novaSenha,
    );

    return res.json(resultado);
  } catch (error) {
    console.error("ERRO AO REDEFINIR SENHA:", error);

    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Não foi possível redefinir a senha.",
    });
  }
}
