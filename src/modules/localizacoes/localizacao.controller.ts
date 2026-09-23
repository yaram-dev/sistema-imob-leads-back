import { Request, Response } from "express";
import * as service from "./localizacao.service";
import {
  criarLocalizacaoSchema,
  atualizarLocalizacaoSchema,
} from "./localizacao.schema";

const safeId = (id: string | string[]) => (Array.isArray(id) ? id[0] : id);

export const getAll = async (_req: Request, res: Response) => {
  const localizacoes = await service.getAll();

  return res.json(localizacoes);
};

export const getById = async (req: Request, res: Response) => {
  const localizacao = await service.getById(safeId(req.params.id));

  if (!localizacao) {
    return res.status(404).json({
      message: "Localização não encontrada.",
    });
  }

  return res.json(localizacao);
};

export const create = async (req: Request, res: Response) => {
  const data = criarLocalizacaoSchema.parse(req.body);

  const localizacao = await service.create(data);

  return res.status(201).json(localizacao);
};

export const update = async (req: Request, res: Response) => {
  const data = atualizarLocalizacaoSchema.parse(req.body);

  const localizacao = await service.update(safeId(req.params.id), data);

  return res.json(localizacao);
};

export const remove = async (req: Request, res: Response) => {
  await service.remove(safeId(req.params.id));

  return res.json({
    message: "Localização removida com sucesso.",
  });
};
