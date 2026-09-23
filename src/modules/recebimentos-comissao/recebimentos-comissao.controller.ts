import { Request, Response } from "express";

import {
  getAllByComissaoId,
  getById,
  create,
  update,
  remove,
} from "./recebimentos-comissao.service";

import {
  criarRecebimentoSchema,
  atualizarRecebimentoSchema,
} from "./recebimentos-comissao.schema";

function obterIdParam(req: Request): string | null {
  const id = req.params.id;

  if (typeof id !== "string") {
    return null;
  }

  return id;
}

export async function listarRecebimentosPorComissao(
  req: Request,
  res: Response,
) {
  const comissaoId = req.params.comissaoId;

  if (typeof comissaoId !== "string") {
    return res.status(400).json({
      message: "ID da comissão inválido.",
    });
  }

  const recebimentos = await getAllByComissaoId(comissaoId);

  return res.json(recebimentos);
}

export async function buscarRecebimento(req: Request, res: Response) {
  const id = obterIdParam(req);

  if (!id) {
    return res.status(400).json({
      message: "ID do recebimento inválido.",
    });
  }

  const recebimento = await getById(id);

  if (!recebimento) {
    return res.status(404).json({
      message: "Recebimento não encontrado.",
    });
  }

  return res.json(recebimento);
}

export async function criarRecebimento(req: Request, res: Response) {
  const validacao = criarRecebimentoSchema.safeParse(req.body);

  if (!validacao.success) {
    return res.status(400).json({
      message: "Dados inválidos.",
      errors: validacao.error.flatten().fieldErrors,
    });
  }

  const recebimento = await create(validacao.data);

  return res.status(201).json(recebimento);
}

export async function atualizarRecebimento(req: Request, res: Response) {
  const id = obterIdParam(req);

  if (!id) {
    return res.status(400).json({
      message: "ID do recebimento inválido.",
    });
  }

  const validacao = atualizarRecebimentoSchema.safeParse(req.body);

  if (!validacao.success) {
    return res.status(400).json({
      message: "Dados inválidos.",
      errors: validacao.error.flatten().fieldErrors,
    });
  }

  const recebimento = await getById(id);

  if (!recebimento) {
    return res.status(404).json({
      message: "Recebimento não encontrado.",
    });
  }

  const atualizado = await update(id, validacao.data);

  return res.json(atualizado);
}

export async function removerRecebimento(req: Request, res: Response) {
  const id = obterIdParam(req);

  if (!id) {
    return res.status(400).json({
      message: "ID do recebimento inválido.",
    });
  }

  const recebimento = await getById(id);

  if (!recebimento) {
    return res.status(404).json({
      message: "Recebimento não encontrado.",
    });
  }

  await remove(id);

  return res.json({
    message: "Recebimento removido com sucesso.",
  });
}
