import { Request, Response } from "express";
import * as service from "./leads.service";
import { createLeadSchema, updateLeadSchema } from "./leads.schema";

const safeId = (id: string | string[]) => (Array.isArray(id) ? id[0] : id);

export const getAll = async (_req: Request, res: Response) => {
  const leads = await service.getAll();

  return res.json(leads);
};

export const getById = async (req: Request, res: Response) => {
  const lead = await service.getById(safeId(req.params.id));

  if (!lead) {
    return res.status(404).json({
      message: "Lead não encontrado.",
    });
  }

  return res.json(lead);
};

export const create = async (req: Request, res: Response) => {
  const validacao = createLeadSchema.safeParse({
    nome: req.body.nome,
    whatsapp: req.body.whatsapp,
    email: req.body.email,
    cidade: req.body.cidade,
    regiao: req.body.regiao,
    tipoImovel: req.body.tipoImovel,
    faixaInvestimento: req.body.faixaInvestimento,
    prazo: req.body.prazo,
    mensagem: req.body.mensagem,
    empreendimentoId: req.body.empreendimentoId,
    outroEmpreendimento: req.body.outroEmpreendimento,
    origem: req.body.origem,
  });

  if (!validacao.success) {
    return res.status(400).json({
      message: "Dados inválidos.",
      errors: validacao.error.flatten().fieldErrors,
    });
  }

  const lead = await service.create(validacao.data);

  return res.status(201).json(lead);
};

export const update = async (req: Request, res: Response) => {
  const validacao = updateLeadSchema.safeParse({
    nome: req.body.nome,
    whatsapp: req.body.whatsapp,
    email: req.body.email,
    cidade: req.body.cidade,
    regiao: req.body.regiao,
    tipoImovel: req.body.tipoImovel,
    faixaInvestimento: req.body.faixaInvestimento,
    prazo: req.body.prazo,
    mensagem: req.body.mensagem,
    empreendimentoId: req.body.empreendimentoId,
    outroEmpreendimento: req.body.outroEmpreendimento,
    status: req.body.status,
    origem: req.body.origem,
  });

  if (!validacao.success) {
    return res.status(400).json({
      message: "Dados inválidos.",
      errors: validacao.error.flatten().fieldErrors,
    });
  }

  const lead = await service.update(safeId(req.params.id), validacao.data);

  return res.json(lead);
};

export const remove = async (req: Request, res: Response) => {
  await service.remove(safeId(req.params.id));

  return res.json({
    message: "Lead removido com sucesso.",
  });
};
