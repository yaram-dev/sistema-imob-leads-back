import "dotenv/config";

import bcrypt from "bcryptjs";

import { prisma } from "../database/prisma";

async function criarUsuario() {
  const nome = process.env.ADMIN_NOME;
  const email = process.env.ADMIN_EMAIL;
  const senha = process.env.ADMIN_SENHA;

  if (!nome || !email || !senha) {
    throw new Error(
      "ADMIN_NOME, ADMIN_EMAIL e ADMIN_SENHA precisam estar configurados no .env.",
    );
  }

  if (senha.length < 8) {
    throw new Error("ADMIN_SENHA deve possuir pelo menos 8 caracteres.");
  }

  try {
    const usuarioExistente = await prisma.usuario.findUnique({
      where: {
        email,
      },
    });

    if (usuarioExistente) {
      console.log("Usuário já existe com este e-mail.");
      return;
    }

    const senhaHash = await bcrypt.hash(senha, 12);

    const usuario = await prisma.usuario.create({
      data: {
        nome,
        email,
        senhaHash,
      },
    });

    console.log("Usuário criado com sucesso!");

    console.log({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
    });
  } catch (error) {
    console.error("Erro ao criar usuário:", error);

    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

criarUsuario();
