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

  await prisma.usuario.update({
    where: {
      id: usuarioId,
    },
    data: {
      senhaHash: novaSenhaHash,
    },
  });

  return {
    message: "Senha alterada com sucesso.",
  };
}

function gerarHashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function solicitarRecuperacaoSenha(email: string) {
  console.log(">>> ENTREI NO SERVICE DE RECUPERAÇÃO");

  const usuario = await prisma.usuario.findFirst({
    where: {
      emailRecuperacao: email,
    },
  });

  if (!usuario) {
    console.log(">>> E-MAIL DE RECUPERAÇÃO NÃO ENCONTRADO");

    return {
      message:
        "Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha.",
    };
  }

  console.log(
    ">>> USUÁRIO ENCONTRADO:",
    usuario.email,
    "| RECUPERAÇÃO:",
    usuario.emailRecuperacao,
  );

  await prisma.passwordResetToken.deleteMany({
    where: {
      usuarioId: usuario.id,
      usedAt: null,
    },
  });

  console.log(">>> TOKENS ANTERIORES REMOVIDOS");

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

  console.log(">>> TOKEN DE RECUPERAÇÃO CRIADO NO BANCO");

  try {
    if (!usuario.emailRecuperacao) {
      throw new AppError(
        "O usuário não possui um e-mail de recuperação cadastrado.",
        400,
      );
    }

    console.log(
      ">>> ANTES DE CHAMAR O EMAIL SERVICE:",
      usuario.emailRecuperacao,
    );

    const resultadoEmail = await enviarEmailRecuperacaoSenha(
      usuario.emailRecuperacao,
      token,
    );

    console.log(">>> DEPOIS DE CHAMAR O EMAIL SERVICE");
    console.log(">>> RESULTADO DO EMAIL:", resultadoEmail);
  } catch (error) {
    console.error(">>> ERRO NO ENVIO DO EMAIL:", error);

    await prisma.passwordResetToken.deleteMany({
      where: {
        usuarioId: usuario.id,
        tokenHash,
      },
    });

    throw error;
  }

  console.log(">>> SERVICE DE RECUPERAÇÃO TERMINOU");

  return {
    message:
      "Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha.",
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
