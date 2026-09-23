import { NextFunction, Request, Response } from "express";

import { jwtVerify } from "jose";

declare module "express-serve-static-core" {
  interface Request {
    usuario?: {
      id: string;
      email: string;
      nome: string;
    };
  }
}

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET não foi configurado no arquivo .env.");
}

if (JWT_SECRET.length < 32) {
  throw new Error("JWT_SECRET deve possuir pelo menos 32 caracteres.");
}

const secret = new TextEncoder().encode(JWT_SECRET);

function obterToken(req: Request): string | null {
  /**
   * Primeiro tenta pegar o JWT pelo cookie HttpOnly.
   */
  const cookieHeader = req.headers.cookie;

  if (cookieHeader) {
    const match = cookieHeader.match(/(?:^|;\s*)admin_token=([^;]+)/);

    if (match?.[1]) {
      return decodeURIComponent(match[1]);
    }
  }

  const authorization = req.headers.authorization;

  if (authorization) {
    const partes = authorization.trim().split(/\s+/);

    const tipo = partes[0];
    const token = partes[1];

    if (tipo === "Bearer" && token) {
      return token;
    }
  }

  return null;
}

export async function autenticar(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const token = obterToken(req);

    if (!token) {
      return res.status(401).json({
        message: "Token de autenticação não informado.",
      });
    }
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
    });

    if (
      typeof payload.sub !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.nome !== "string"
    ) {
      return res.status(401).json({
        message: "Token inválido.",
      });
    }

    req.usuario = {
      id: payload.sub,
      email: payload.email,
      nome: payload.nome,
    };

    return next();
  } catch (error) {
    console.error("ERRO AO VALIDAR TOKEN:", error);

    return res.status(401).json({
      message: "Token inválido ou expirado.",
    });
  }
}
