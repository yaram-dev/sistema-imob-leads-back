import { Request, Response } from "express";

import {
  getById,
  getByVendaId,
  create,
  update,
  remove,
} from "./comissoes.service";

import {
  criarComissaoSchema,
  atualizarComissaoSchema,
} from "./comissoes.schema";


function obterIdParam(req: Request): string | null {
  const id = req.params.id;

  if (typeof id !== "string") {
    return null;
  }

  return id;
}

export async function buscarComissao(req: Request, res: Response) {
  const id = obterIdParam(req);

  if (!id) {
    return res.status(400).json({
      message: "ID da comissão inválido.",
    });
  }

  const comissao = await getById(id);

  if (!comissao) {
    return res.status(404).json({
      message: "Comissão não encontrada.",
    });
  }

  return res.json(comissao);
}

export async function buscarComissaoPorVenda(req: Request, res: Response) {
  const vendaId = req.params.vendaId;

  if (typeof vendaId !== "string") {
    return res.status(400).json({
      message: "ID da venda inválido.",
    });
  }

  const comissao = await getByVendaId(vendaId);

  if (!comissao) {
    return res.status(404).json({
      message: "Esta venda ainda não possui uma comissão cadastrada.",
    });
  }

  return res.json(comissao);
}


export async function criarComissao(req: Request, res: Response) {
  const validacao = criarComissaoSchema.safeParse(req.body);

  if (!validacao.success) {
    return res.status(400).json({
      message: "Dados inválidos.",
      errors: validacao.error.flatten().fieldErrors,
    });
  }

  const novaComissao = await create(validacao.data);

  return res.status(201).json(novaComissao);
}

export async function atualizarComissao(req: Request, res: Response) {
  const id = obterIdParam(req);

  if (!id) {
    return res.status(400).json({
      message: "ID da comissão inválido.",
    });
  }

  const validacao = atualizarComissaoSchema.safeParse(req.body);

  if (!validacao.success) {
    return res.status(400).json({
      message: "Dados inválidos.",
      errors: validacao.error.flatten().fieldErrors,
    });
  }

  const comissao = await getById(id);

  if (!comissao) {
    return res.status(404).json({
      message: "Comissão não encontrada.",
    });
  }

  const comissaoAtualizada = await update(id, validacao.data);

  return res.json(comissaoAtualizada);
}

/**
 * DELETE /comissoes/:id
 *
 * Remove uma comissão.
 */
export async function removerComissao(req: Request, res: Response) {
  const id = obterIdParam(req);

  if (!id) {
    return res.status(400).json({
      message: "ID da comissão inválido.",
    });
  }

  const comissao = await getById(id);

  if (!comissao) {
    return res.status(404).json({
      message: "Comissão não encontrada.",
    });
  }

  await remove(id);

  return res.json({
    message: "Comissão removida com sucesso.",
  });
}
