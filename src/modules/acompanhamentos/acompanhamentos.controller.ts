import { Request, Response } from "express";

import {
  criarAcompanhamento,
  listarAcompanhamentosPorLead,
  listarProximosAcompanhamentos,
  buscarAcompanhamento,
  atualizarAcompanhamento,
  excluirAcompanhamento,
} from "./acompanhamentos.service";

export async function criar(req: Request, res: Response) {
  const acompanhamento = await criarAcompanhamento(req.body);

  return res.status(201).json(acompanhamento);
}

export async function listarPorLead(req: Request, res: Response) {
  const leadId = String(req.params.leadId);

  const acompanhamentos = await listarAcompanhamentosPorLead(leadId);

  return res.json(acompanhamentos);
}

export async function listarProximos(req: Request, res: Response) {
  const acompanhamentos = await listarProximosAcompanhamentos();

  return res.json(acompanhamentos);
}

export async function buscar(req: Request, res: Response) {
  const id = String(req.params.id);

  const acompanhamento = await buscarAcompanhamento(id);

  if (!acompanhamento) {
    return res.status(404).json({
      message: "Acompanhamento não encontrado.",
    });
  }

  return res.json(acompanhamento);
}

export async function atualizar(req: Request, res: Response) {
  const id = String(req.params.id);

  const acompanhamento = await atualizarAcompanhamento(id, req.body);

  return res.json(acompanhamento);
}

export async function excluir(req: Request, res: Response) {
  const id = String(req.params.id);

  await excluirAcompanhamento(id);

  return res.status(204).send();
}
