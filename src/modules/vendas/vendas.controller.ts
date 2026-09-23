import { Request, Response } from "express";

import { getAll, getById, create, update, remove } from "./vendas.service";

import { criarVendaSchema, atualizarVendaSchema } from "./vendas.schema";

import {
  uploadContrato,
  deleteContrato,
} from "../../services/cloudinary.service";

import { AppError } from "../../errors/AppError";

function obterIdParam(req: Request): string | null {
  const id = req.params.id;

  if (typeof id !== "string") {
    return null;
  }

  return id;
}

function prepararDadosVenda(body: Request["body"]) {
  return {
    ...body,

    empreendimentoId: body.empreendimentoId || null,

    dataVenda: body.dataVenda,

    valorTabela: Number(body.valorTabela),

    valorVenda: Number(body.valorVenda),

    tipoVenda: body.tipoVenda,

    observacao: body.observacao || null,

    status: body.status || "ATIVA",
  };
}

export async function listarVendas(_req: Request, res: Response) {
  try {
    const vendas = await getAll();

    return res.json(vendas);
  } catch (error) {
    console.error("ERRO AO LISTAR VENDAS:", error);

    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Erro ao listar vendas.",
    });
  }
}

export async function buscarVenda(req: Request, res: Response) {
  const id = obterIdParam(req);

  if (!id) {
    return res.status(400).json({
      message: "ID da venda inválido.",
    });
  }

  try {
    const venda = await getById(id);

    if (!venda) {
      return res.status(404).json({
        message: "Venda não encontrada.",
      });
    }

    return res.json(venda);
  } catch (error) {
    console.error("ERRO AO BUSCAR VENDA:", error);

    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Erro ao buscar venda.",
    });
  }
}

export async function criarVenda(req: Request, res: Response) {
  let contratoNovoUrl: string | null = null;

  try {
    const arquivo = req.file;

    if (arquivo) {
      if (arquivo.mimetype !== "application/pdf") {
        return res.status(400).json({
          message: "O contrato deve ser enviado em formato PDF.",
        });
      }

      const limiteBytes = 10 * 1024 * 1024;

      if (arquivo.size > limiteBytes) {
        return res.status(400).json({
          message: "O contrato deve ter no máximo 10 MB.",
        });
      }
    }

    const dados = {
      ...prepararDadosVenda(req.body),

      leadId: req.body.leadId,

      contratoNome: arquivo?.originalname ?? null,

      contratoUrl: null,
    };

    const validacao = criarVendaSchema.safeParse(dados);

    if (!validacao.success) {
      return res.status(400).json({
        message: "Dados inválidos.",
        errors: validacao.error.flatten().fieldErrors,
      });
    }

    if (arquivo) {
      contratoNovoUrl = await uploadContrato(arquivo);
    }

    const dadosFinais = {
      ...validacao.data,

      contratoNome: arquivo?.originalname ?? null,

      contratoUrl: contratoNovoUrl,
    };

    const venda = await create(dadosFinais);

    contratoNovoUrl = null;

    return res.status(201).json(venda);
  } catch (error) {
    console.error("ERRO AO CRIAR VENDA:", error);

    if (contratoNovoUrl) {
      try {
        await deleteContrato(contratoNovoUrl);
      } catch (erroCloudinary) {
        console.error(
          "ERRO AO REMOVER CONTRATO ÓRFÃO DO CLOUDINARY:",
          erroCloudinary,
        );
      }
    }

    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: error instanceof Error ? error.message : "Erro ao criar venda.",
    });
  }
}

export async function atualizarVenda(req: Request, res: Response) {
  const id = obterIdParam(req);

  if (!id) {
    return res.status(400).json({
      message: "ID da venda inválido.",
    });
  }

  let contratoNovoUrl: string | null = null;

  try {
    const vendaExistente = await getById(id);

    if (!vendaExistente) {
      return res.status(404).json({
        message: "Venda não encontrada.",
      });
    }

    const arquivo = req.file;

    if (arquivo) {
      if (arquivo.mimetype !== "application/pdf") {
        return res.status(400).json({
          message: "O contrato deve ser enviado em formato PDF.",
        });
      }

      const limiteBytes = 10 * 1024 * 1024;

      if (arquivo.size > limiteBytes) {
        return res.status(400).json({
          message: "O contrato deve ter no máximo 10 MB.",
        });
      }
    }

    const removerContrato = req.body.removerContrato === "true";

    const contratoAnteriorUrl = vendaExistente.contratoUrl ?? null;

    let contratoNome = vendaExistente.contratoNome ?? null;

    let contratoUrl = vendaExistente.contratoUrl ?? null;

    if (arquivo) {
      contratoNome = arquivo.originalname;

      contratoUrl = null;
    } else if (removerContrato) {
      contratoNome = null;
      contratoUrl = null;
    }

    const dadosBase = prepararDadosVenda(req.body);

    const dados = {
      ...dadosBase,

      leadId: undefined,

      contratoNome,

      contratoUrl,
    };

    delete (dados as Record<string, unknown>).removerContrato;

    delete (dados as Record<string, unknown>).contrato;

    const validacao = atualizarVendaSchema.safeParse(dados);

    if (!validacao.success) {
      return res.status(400).json({
        message: "Dados inválidos.",
        errors: validacao.error.flatten().fieldErrors,
      });
    }

    if (arquivo) {
      contratoNovoUrl = await uploadContrato(arquivo);

      contratoUrl = contratoNovoUrl;
    }

    const dadosFinais = {
      ...validacao.data,

      contratoNome,

      contratoUrl,
    };

    const vendaAtualizada = await update(id, dadosFinais);

    contratoNovoUrl = null;

    const contratoFoiSubstituido = Boolean(
      arquivo && contratoAnteriorUrl && contratoAnteriorUrl !== contratoUrl,
    );

    const contratoFoiRemovido = Boolean(removerContrato && contratoAnteriorUrl);

    if (contratoFoiSubstituido || contratoFoiRemovido) {
      try {
        await deleteContrato(contratoAnteriorUrl!);
      } catch (erroCloudinary) {
        console.error(
          "ERRO AO REMOVER CONTRATO ANTIGO DO CLOUDINARY:",
          erroCloudinary,
        );
      }
    }

    return res.json(vendaAtualizada);
  } catch (error) {
    console.error("ERRO AO ATUALIZAR VENDA:", error);

    if (contratoNovoUrl) {
      try {
        await deleteContrato(contratoNovoUrl);
      } catch (erroCloudinary) {
        console.error(
          "ERRO AO REMOVER NOVO CONTRATO ÓRFÃO DO CLOUDINARY:",
          erroCloudinary,
        );
      }
    }

    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message:
        error instanceof Error ? error.message : "Erro ao atualizar venda.",
    });
  }
}

export async function removerVenda(req: Request, res: Response) {
  const id = obterIdParam(req);

  if (!id) {
    return res.status(400).json({
      message: "ID da venda inválido.",
    });
  }

  try {
    const venda = await getById(id);

    if (!venda) {
      return res.status(404).json({
        message: "Venda não encontrada.",
      });
    }

    const contratoUrl = venda.contratoUrl ?? null;

    await remove(id);

    if (contratoUrl) {
      try {
        await deleteContrato(contratoUrl);
      } catch (erroCloudinary) {
        console.error(
          "ERRO AO REMOVER CONTRATO DO CLOUDINARY APÓS EXCLUSÃO DA VENDA:",
          erroCloudinary,
        );
      }
    }

    return res.json({
      message: "Venda removida com sucesso.",
    });
  } catch (error) {
    console.error("ERRO AO REMOVER VENDA:", error);

    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message:
        error instanceof Error ? error.message : "Erro ao remover venda.",
    });
  }
}
