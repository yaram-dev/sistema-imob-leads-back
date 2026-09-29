import { Request, Response } from "express";

import * as service from "./faixaInvestimento.service";

import {
  criarFaixaInvestimentoSchema,
  atualizarFaixaInvestimentoSchema,
} from "./faixaInvestimento.schema";

const safeId = (id: string | string[]) => (Array.isArray(id) ? id[0] : id);

export const getAll = async (_req: Request, res: Response) => {
  const faixas = await service.getAll();

  return res.json(faixas);
};

export const getById = async (req: Request, res: Response) => {
  const faixa = await service.getById(safeId(req.params.id));

  if (!faixa) {
    return res.status(404).json({
      message: "Faixa de investimento não encontrada.",
    });
  }

  return res.json(faixa);
};

export const create = async (req: Request, res: Response) => {
  const validacao = criarFaixaInvestimentoSchema.safeParse(req.body);

  if (!validacao.success) {
    return res.status(400).json({
      message: "Dados inválidos.",
      errors: validacao.error.flatten().fieldErrors,
    });
  }

  const faixa = await service.create(validacao.data);

  return res.status(201).json(faixa);
};

export const update = async (req: Request, res: Response) => {
  const validacao = atualizarFaixaInvestimentoSchema.safeParse(req.body);

  if (!validacao.success) {
    return res.status(400).json({
      message: "Dados inválidos.",
      errors: validacao.error.flatten().fieldErrors,
    });
  }

  const faixa = await service.update(safeId(req.params.id), validacao.data);

  return res.json(faixa);
};

export const remove = async (req: Request, res: Response) => {
  await service.remove(safeId(req.params.id));

  return res.json({
    message: "Faixa de investimento removida com sucesso.",
  });
};

export const reorganizarOrdens = async (_req: Request, res: Response) => {
  const faixas = await service.reorganizarOrdens();

  return res.json(faixas);
};
