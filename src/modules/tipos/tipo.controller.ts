import { Request, Response } from "express";
import * as service from "./tipo.service";
import { criarTipoSchema, atualizarTipoSchema } from "./tipo.schema";

const safeId = (id: string | string[]) => (Array.isArray(id) ? id[0] : id);

export const getAll = async (_req: Request, res: Response) => {
  const tipos = await service.getAll();

  return res.json(tipos);
};

export const getById = async (req: Request, res: Response) => {
  const tipo = await service.getById(safeId(req.params.id));

  if (!tipo) {
    return res.status(404).json({
      message: "Tipo não encontrado.",
    });
  }

  return res.json(tipo);
};

export const create = async (req: Request, res: Response) => {
  const data = criarTipoSchema.parse(req.body);

  const tipo = await service.create(data);

  return res.status(201).json(tipo);
};

export const update = async (req: Request, res: Response) => {
  const data = atualizarTipoSchema.parse(req.body);

  const tipo = await service.update(safeId(req.params.id), data);

  return res.json(tipo);
};

export const remove = async (req: Request, res: Response) => {
  await service.remove(safeId(req.params.id));

  return res.json({
    message: "Tipo removido com sucesso.",
  });
};
