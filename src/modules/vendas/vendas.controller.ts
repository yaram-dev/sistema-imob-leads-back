import { Request, Response } from "express";

import { getAll, getById, create, update, remove } from "./vendas.service";

import {
  criarVendaSchema,
  atualizarVendaSchema,
  tipoDocumentoVendaSchema,
} from "./vendas.schema";

import {
  uploadDocumento,
  deleteDocumento,
} from "../../services/cloudinary.service";

import { AppError } from "../../errors/AppError";

import { VendaDocumentoTipo } from "../../generated/prisma";

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

function obterArquivos(req: Request): Express.Multer.File[] {
  if (!req.files) {
    return [];
  }

  if (Array.isArray(req.files)) {
    return req.files;
  }

  return [];
}

function obterTiposDocumento(body: Request["body"]): string[] {
  const tipos = body.tiposDocumento;

  if (tipos === undefined || tipos === null) {
    return [];
  }

  if (Array.isArray(tipos)) {
    return tipos;
  }

  return [String(tipos)];
}

function obterIdsDocumentosParaRemover(body: Request["body"]): string[] {
  const valor = body.removerDocumentoIds;

  if (valor === undefined || valor === null || valor === "") {
    return [];
  }

  if (Array.isArray(valor)) {
    return valor;
  }

  try {
    const parsed = JSON.parse(valor);

    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch {
    return [String(valor)];
  }

  return [];
}

async function fazerUploadDocumentos(
  arquivos: Express.Multer.File[],
  tipos: string[],
) {
  if (arquivos.length !== tipos.length) {
    throw new AppError(
      "A quantidade de tipos de documento deve corresponder à quantidade de arquivos enviados.",
      400,
    );
  }

  const documentos: {
    tipo: VendaDocumentoTipo;
    nome: string;
    url: string;
  }[] = [];

  const urlsEnviadas: string[] = [];

  try {
    for (let i = 0; i < arquivos.length; i++) {
      const arquivo = arquivos[i];
      const tipo = tipos[i];

      if (!arquivo) {
        throw new AppError("Um dos arquivos enviados é inválido.", 400);
      }

      if (arquivo.mimetype !== "application/pdf") {
        throw new AppError(
          `O arquivo "${arquivo.originalname}" deve ser enviado em formato PDF.`,
          400,
        );
      }

      const limiteBytes = 10 * 1024 * 1024;

      if (arquivo.size > limiteBytes) {
        throw new AppError(
          `O arquivo "${arquivo.originalname}" deve ter no máximo 10 MB.`,
          400,
        );
      }

      const validacaoTipo = tipoDocumentoVendaSchema.safeParse(tipo);

      if (!validacaoTipo.success) {
        throw new AppError(
          `O tipo do documento "${arquivo.originalname}" é inválido.`,
          400,
        );
      }

      const url = await uploadDocumento(arquivo);

      urlsEnviadas.push(url);

      documentos.push({
        tipo: validacaoTipo.data,
        nome: arquivo.originalname,
        url,
      });
    }

    return {
      documentos,
      urlsEnviadas,
    };
  } catch (error) {
    for (const url of urlsEnviadas) {
      try {
        await deleteDocumento(url);
      } catch (erroCloudinary) {
        console.error(
          "ERRO AO REMOVER DOCUMENTO ÓRFÃO DO CLOUDINARY:",
          erroCloudinary,
        );
      }
    }

    throw error;
  }
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
  const arquivos = obterArquivos(req);
  const tipos = obterTiposDocumento(req.body);

  let urlsEnviadas: string[] = [];

  try {
    const dados = {
      ...prepararDadosVenda(req.body),

      leadId: req.body.leadId,
    };

    const validacao = criarVendaSchema.safeParse(dados);

    if (!validacao.success) {
      return res.status(400).json({
        message: "Dados inválidos.",
        errors: validacao.error.flatten().fieldErrors,
      });
    }

    const resultadoUpload = await fazerUploadDocumentos(arquivos, tipos);

    urlsEnviadas = resultadoUpload.urlsEnviadas;

    const venda = await create(validacao.data, resultadoUpload.documentos);

    urlsEnviadas = [];

    return res.status(201).json(venda);
  } catch (error) {
    console.error("ERRO AO CRIAR VENDA:", error);

    for (const url of urlsEnviadas) {
      try {
        await deleteDocumento(url);
      } catch (erroCloudinary) {
        console.error(
          "ERRO AO REMOVER DOCUMENTO ÓRFÃO DO CLOUDINARY:",
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

  const arquivos = obterArquivos(req);
  const tipos = obterTiposDocumento(req.body);
  const idsParaRemover = obterIdsDocumentosParaRemover(req.body);

  let urlsEnviadas: string[] = [];

  try {
    const vendaExistente = await getById(id);

    if (!vendaExistente) {
      return res.status(404).json({
        message: "Venda não encontrada.",
      });
    }

    const dadosBase = prepararDadosVenda(req.body);

    const dados = {
      ...dadosBase,

      leadId: undefined,
    };

    delete (dados as Record<string, unknown>).tiposDocumento;
    delete (dados as Record<string, unknown>).removerDocumentoIds;
    delete (dados as Record<string, unknown>).documentos;

    const validacao = atualizarVendaSchema.safeParse(dados);

    if (!validacao.success) {
      return res.status(400).json({
        message: "Dados inválidos.",
        errors: validacao.error.flatten().fieldErrors,
      });
    }

    const resultadoUpload = await fazerUploadDocumentos(arquivos, tipos);

    urlsEnviadas = resultadoUpload.urlsEnviadas;

    const vendaAtualizada = await update(id, validacao.data, {
      adicionar: resultadoUpload.documentos,
      removerIds: idsParaRemover,
    });

    urlsEnviadas = [];

    const urlsRemovidas = vendaExistente.documentos
      .filter((documento) => idsParaRemover.includes(documento.id))
      .map((documento) => documento.url);

    for (const url of urlsRemovidas) {
      try {
        await deleteDocumento(url);
      } catch (erroCloudinary) {
        console.error(
          "ERRO AO REMOVER DOCUMENTO ANTIGO DO CLOUDINARY:",
          erroCloudinary,
        );
      }
    }

    return res.json(vendaAtualizada);
  } catch (error) {
    console.error("ERRO AO ATUALIZAR VENDA:", error);

    for (const url of urlsEnviadas) {
      try {
        await deleteDocumento(url);
      } catch (erroCloudinary) {
        console.error(
          "ERRO AO REMOVER NOVO DOCUMENTO ÓRFÃO DO CLOUDINARY:",
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

    const documentos = venda.documentos;

    await remove(id);

    for (const documento of documentos) {
      try {
        await deleteDocumento(documento.url);
      } catch (erroCloudinary) {
        console.error(
          "ERRO AO REMOVER DOCUMENTO DO CLOUDINARY APÓS EXCLUSÃO DA VENDA:",
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
