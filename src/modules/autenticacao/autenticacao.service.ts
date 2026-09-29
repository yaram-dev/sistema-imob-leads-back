import { prisma } from "../../database/prisma";

import { jwtVerify, SignJWT } from "jose";

import bcrypt from "bcryptjs";

import { randomBytes, createHash } from "crypto";

import { AppError } from "../../errors/AppError";

import { enviarEmailRecuperacaoSenha } from "../../services/email/email.service";

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  throw new Error("JWT_SECRET não foi configurado no arquivo .env.");
}

if (jwtSecret.length < 32) {
  throw new Error("JWT_SECRET deve possuir pelo menos 32 caracteres.");
}

const secret = new TextEncoder().encode(jwtSecret);

const MENSAGEM_RECUPERACAO =
  "Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha.";

export async function login(email: string, senha: string) {
  const usuario = await prisma.usuario.findUnique({
    where: {
      email,
    },
  });

  if (!usuario) {
    throw new AppError("E-mail ou senha inválidos.", 401);
  }

  const senhaValida = await bcrypt.compare(senha, usuario.senhaHash);

  if (!senhaValida) {
    throw new AppError("E-mail ou senha inválidos.", 401);
  }

  const token = await new SignJWT({
    email: usuario.email,
    nome: usuario.nome,
  })
    .setProtectedHeader({
      alg: "HS256",
    })
    .setSubject(usuario.id)
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secret);

  return {
    token,
    usuario: {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
    },
  };
}

export async function verificarToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
    });

    return payload;
  } catch {
    throw new AppError("Token inválido ou expirado.", 401);
  }
}

export async function alterarSenha(
  usuarioId: string,
  senhaAtual: string,
  novaSenha: string,
) {
  const usuario = await prisma.usuario.findUnique({
    where: {
      id: usuarioId,
    },
  });

  if (!usuario) {
    throw new AppError("Usuário não encontrado.", 404);
  }

  const senhaAtualValida = await bcrypt.compare(senhaAtual, usuario.senhaHash);

  if (!senhaAtualValida) {
    throw new AppError("A senha atual está incorreta.", 401);
  }

  const novaSenhaHash = await bcrypt.hash(novaSenha, 12);

  await prisma.$transaction([
    prisma.usuario.update({
      where: {
        id: usuarioId,
      },
      data: {
        senhaHash: novaSenhaHash,
      },
    }),

    prisma.passwordResetToken.deleteMany({
      where: {
        usuarioId,
        usedAt: null,
      },
    }),
  ]);

  return {
    message: "Senha alterada com sucesso.",
  };
}

function gerarHashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function solicitarRecuperacaoSenha(email: string) {
  const usuario = await prisma.usuario.findFirst({
    where: {
      emailRecuperacao: email,
    },
  });

  if (!usuario) {
    return {
      message: MENSAGEM_RECUPERACAO,
    };
  }

  await prisma.passwordResetToken.deleteMany({
    where: {
      usuarioId: usuario.id,
      usedAt: null,
    },
  });

  const token = randomBytes(32).toString("hex");

  const tokenHash = gerarHashToken(token);

  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await prisma.passwordResetToken.create({
    data: {
      usuarioId: usuario.id,
      tokenHash,
      expiresAt,
    },
  });

  try {
    if (!usuario.emailRecuperacao) {
      throw new AppError(
        "O usuário não possui um e-mail de recuperação cadastrado.",
        400,
      );
    }

    await enviarEmailRecuperacaoSenha(usuario.emailRecuperacao, token);
  } catch (error) {
    console.error("ERRO AO ENVIAR E-MAIL DE RECUPERAÇÃO:", error);

    await prisma.passwordResetToken.deleteMany({
      where: {
        usuarioId: usuario.id,
        tokenHash,
      },
    });

    return {
      message: MENSAGEM_RECUPERACAO,
    };
  }

  return {
    message: MENSAGEM_RECUPERACAO,
  };
}

export async function redefinirSenha(token: string, novaSenha: string) {
  if (!token) {
    throw new AppError("Token de recuperação inválido.", 400);
  }

  const tokenHash = gerarHashToken(token);

  const registro = await prisma.passwordResetToken.findUnique({
    where: {
      tokenHash,
    },
  });

  if (!registro) {
    throw new AppError("O link de recuperação é inválido ou expirou.", 400);
  }

  if (registro.usedAt) {
    throw new AppError("O link de recuperação já foi utilizado.", 400);
  }

  if (registro.expiresAt.getTime() <= Date.now()) {
    throw new AppError(
      "O link de recuperação expirou. Solicite um novo link.",
      400,
    );
  }

  const novaSenhaHash = await bcrypt.hash(novaSenha, 12);

  await prisma.$transaction([
    prisma.usuario.update({
      where: {
        id: registro.usuarioId,
      },
      data: {
        senhaHash: novaSenhaHash,
      },
    }),

    prisma.passwordResetToken.update({
      where: {
        id: registro.id,
      },
      data: {
        usedAt: new Date(),
      },
    }),

    prisma.passwordResetToken.deleteMany({
      where: {
        usuarioId: registro.usuarioId,
        id: {
          not: registro.id,
        },
      },
    }),
  ]);

  return {
    message: "Senha redefinida com sucesso.",
  };
}
