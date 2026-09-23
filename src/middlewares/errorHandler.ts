import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { Prisma } from "../generated/prisma";
import { AppError } from "../errors/AppError";

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  console.error("ERRO DA API:", error);

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      message: error.message,
    });
  }

  if (error instanceof ZodError) {
    return res.status(400).json({
      message: "Dados inválidos.",
      errors: error.flatten().fieldErrors,
    });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002":
        return res.status(409).json({
          message: "Já existe um registro com esses dados.",
        });

      case "P2003":
        return res.status(409).json({
          message:
            "Não é possível realizar esta operação porque existem registros relacionados.",
        });

      case "P2025":
        return res.status(404).json({
          message: "Registro não encontrado.",
        });

      default:
        return res.status(400).json({
          message: "Não foi possível realizar a operação.",
        });
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({
      message: "Dados inválidos para esta operação.",
    });
  }

  if (error instanceof Error && error.name === "MulterError") {
    return res.status(400).json({
      message: "Não foi possível processar o arquivo enviado.",
    });
  }

  if (error instanceof Error) {
    console.error("ERRO INTERNO:", error);

    return res.status(500).json({
      message: "Erro interno do servidor.",
    });
  }

  return res.status(500).json({
    message: "Erro interno do servidor.",
  });
}
