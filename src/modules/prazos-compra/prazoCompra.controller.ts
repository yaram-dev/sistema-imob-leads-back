import { Request, Response } from "express";
import * as service from "./prazoCompra.service";
import {
  criarPrazoCompraSchema,
  atualizarPrazoCompraSchema,
} from "./prazoCompra.schema";

const safeId = (id: string | string[]) => (Array.isArray(id) ? id[0] : id);

export const getAll = async (_req: Request, res: Response) => {
  const prazos = await service.getAll();

  return res.json(prazos);
};

export const getById = async (req: Request, res: Response) => {
  const prazo = await service.getById(safeId(req.params.id));

  if (!prazo) {
    return res.status(404).json({
      message: "Prazo de compra não encontrado.",
    });
  }

  return res.json(prazo);
};

export const create = async (req: Request, res: Response) => {
  const validacao = criarPrazoCompraSchema.safeParse(req.body);

  if (!validacao.success) {
    return res.status(400).json({
      message: "Dados inválidos.",
      errors: validacao.error.flatten().fieldErrors,
    });
  }

  const prazo = await service.create(validacao.data);

  return res.status(201).json(prazo);
};

export const update = async (req: Request, res: Response) => {
  const validacao = atualizarPrazoCompraSchema.safeParse(req.body);

  if (!validacao.success) {
    return res.status(400).json({
      message: "Dados inválidos.",
      errors: validacao.error.flatten().fieldErrors,
    });
  }

  const prazo = await service.update(safeId(req.params.id), validacao.data);

  return res.json(prazo);
};

export const remove = async (req: Request, res: Response) => {
  await service.remove(safeId(req.params.id));

  return res.json({
    message: "Prazo de compra removido com sucesso.",
  });
};
