import { Request, Response } from "express";
import * as service from "./empreendimentos.service";
import {
  createEmpreendimentoSchema,
  updateEmpreendimentoSchema,
} from "./empreendimentos.schema";
import { parseDescricao } from "../../utils/parseDescricao";
import { uploadImages } from "../../utils/uploadImagens";
import { createSlug } from "../../utils/createSlug";

const safeSlug = (slug: string | string[]) =>
  Array.isArray(slug) ? slug[0] : slug;

export const getAll = async (req: Request, res: Response) => {
  const empreendimentos = await service.getAll();

  res.json(empreendimentos);
};

export const getBySlug = async (req: Request, res: Response) => {
  const item = await service.getBySlug(safeSlug(req.params.slug));

  if (!item) {
    return res.status(404).json({
      message: "Não encontrado",
    });
  }

  res.json(item);
};

export const create = async (req: Request, res: Response) => {
  const descricao = parseDescricao(req.body.descricao);

  const validacao = createEmpreendimentoSchema.safeParse({
    nome: req.body.nome,

    tipoId: req.body.tipoId,

    localizacaoId: req.body.localizacaoId,

    preco: req.body.preco,

    descricao,

    imagem: [],

    imagemCapa: req.body.imagemCapa,
  });

  if (!validacao.success) {
    return res.status(400).json({
      message: "Dados inválidos.",

      errors: validacao.error.flatten().fieldErrors,
    });
  }

  const files = (req.files as Express.Multer.File[]) || [];

  const imagem = await uploadImages(files);

  const slug = createSlug(validacao.data.nome);

  const newItem = await service.create({
    ...validacao.data,

    slug,

    imagem,

    imagemCapa: req.body.imagemCapa,
  });

  res.status(201).json(newItem);
};

export const update = async (req: Request, res: Response) => {
  const files = (req.files as Express.Multer.File[]) || [];

  const novasImagens = await uploadImages(files);

  const imagensExistentes = JSON.parse(req.body.imagem || "[]");

  const imagensFinal = [...imagensExistentes, ...novasImagens];

  const descricao = parseDescricao(req.body.descricao);

  const validacao = updateEmpreendimentoSchema.safeParse({
    nome: req.body.nome,

    tipoId: req.body.tipoId,

    localizacaoId: req.body.localizacaoId,

    preco: req.body.preco,

    descricao,

    imagem: imagensFinal,

    imagemCapa: req.body.imagemCapa,
  });

  if (!validacao.success) {
    return res.status(400).json({
      message: "Dados inválidos.",

      errors: validacao.error.flatten().fieldErrors,
    });
  }

  const item = await service.update(
    safeSlug(req.params.slug),

    validacao.data,
  );

  res.json(item);
};

export const remove = async (req: Request, res: Response) => {
  await service.remove(safeSlug(req.params.slug));

  res.json({
    message: "Removido com sucesso",
  });
};
