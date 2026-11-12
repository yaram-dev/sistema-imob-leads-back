import { Request, Response } from "express";
import * as service from "./empreendimentos.service";
import {
  createEmpreendimentoSchema,
  updateEmpreendimentoSchema,
} from "./empreendimentos.schema";
import { parseDescricao } from "../../utils/parseDescricao";
import {
  deleteImage,
  deleteVideo,
  uploadVideo,
} from "../../services/cloudinary.service";
import { uploadImages } from "../../utils/uploadImagens";
import { createSlug } from "../../utils/createSlug";

const safeSlug = (slug: string | string[]) =>
  Array.isArray(slug) ? slug[0] : slug;

type ArquivosEmpreendimento = {
  imagens: Express.Multer.File[];
  video?: Express.Multer.File;
};

function obterArquivos(req: Request): ArquivosEmpreendimento {
  const arquivos = req.files;

  // Compatibilidade temporária com o formato antigo do Multer.
  if (Array.isArray(arquivos)) {
    return {
      imagens: arquivos,
    };
  }

  const arquivosPorCampo = arquivos as
    | { [fieldname: string]: Express.Multer.File[] }
    | undefined;

  return {
    imagens: arquivosPorCampo?.imagens ?? [],
    video: arquivosPorCampo?.video?.[0],
  };
}

function videoMp4Valido(file?: Express.Multer.File): boolean {
  if (!file) return true;

  return file.mimetype === "video/mp4" && /\.mp4$/i.test(file.originalname);
}

function parseImagensExistentes(valor: unknown): string[] {
  if (!valor) return [];

  if (Array.isArray(valor)) {
    return valor.filter(
      (imagem): imagem is string => typeof imagem === "string",
    );
  }

  if (typeof valor !== "string") {
    throw new Error("As imagens existentes possuem formato inválido.");
  }

  try {
    const imagens = JSON.parse(valor);

    if (!Array.isArray(imagens)) {
      throw new Error("As imagens existentes possuem formato inválido.");
    }

    if (!imagens.every((imagem) => typeof imagem === "string")) {
      throw new Error("As imagens existentes possuem formato inválido.");
    }

    return imagens;
  } catch {
    throw new Error("As imagens existentes possuem formato inválido.");
  }
}

export const getAll = async (_req: Request, res: Response) => {
  const empreendimentos = await service.getAll();

  return res.json(empreendimentos);
};

export const getBySlug = async (req: Request, res: Response) => {
  const item = await service.getBySlug(safeSlug(req.params.slug));

  if (!item) {
    return res.status(404).json({
      message: "Não encontrado",
    });
  }

  return res.json(item);
};

export const create = async (req: Request, res: Response) => {
  const arquivos = obterArquivos(req);

  if (!videoMp4Valido(arquivos.video)) {
    return res.status(400).json({
      message: "O vídeo deve estar no formato MP4.",
    });
  }

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

  let imagem: string[] = [];
  let video: string | null = null;

  try {
    imagem = await uploadImages(arquivos.imagens);

    if (arquivos.video) {
      video = await uploadVideo(arquivos.video);
    }

    const slug = createSlug(validacao.data.nome);

    const newItem = await service.create({
      ...validacao.data,
      slug,
      imagem,
      imagemCapa: req.body.imagemCapa,
      video,
    });

    return res.status(201).json(newItem);
  } catch (error) {
    if (imagem.length > 0) {
      await Promise.all(
        imagem.map(async (url) => {
          try {
            await deleteImage(url);
          } catch (deleteError) {
            console.error(
              "Erro ao remover imagem órfã do Cloudinary:",
              deleteError,
            );
          }
        }),
      );
    }

    if (video) {
      try {
        await deleteVideo(video);
      } catch (deleteError) {
        console.error(
          "Erro ao remover vídeo órfão do Cloudinary:",
          deleteError,
        );
      }
    }

    throw error;
  }
};

export const update = async (req: Request, res: Response) => {
  let imagensExistentes: string[];

  try {
    imagensExistentes = parseImagensExistentes(req.body.imagem);
  } catch (error) {
    return res.status(400).json({
      message:
        error instanceof Error
          ? error.message
          : "As imagens existentes possuem formato inválido.",
    });
  }

  const arquivos = obterArquivos(req);

  if (!videoMp4Valido(arquivos.video)) {
    return res.status(400).json({
      message: "O vídeo deve estar no formato MP4.",
    });
  }

  const descricao = parseDescricao(req.body.descricao);

  const validacao = updateEmpreendimentoSchema.safeParse({
    nome: req.body.nome,
    tipoId: req.body.tipoId,
    localizacaoId: req.body.localizacaoId,
    preco: req.body.preco,
    descricao,
    imagem: imagensExistentes,
    imagemCapa: req.body.imagemCapa,
  });

  if (!validacao.success) {
    return res.status(400).json({
      message: "Dados inválidos.",
      errors: validacao.error.flatten().fieldErrors,
    });
  }

  const slug = safeSlug(req.params.slug);

  const itemAtual = await service.getBySlug(slug);

  if (!itemAtual) {
    return res.status(404).json({
      message: "Empreendimento não encontrado.",
    });
  }

  const imagensAntigas: string[] = Array.isArray(itemAtual.imagem)
    ? itemAtual.imagem.filter(
        (imagem): imagem is string => typeof imagem === "string",
      )
    : [];

  const videoAntigo = itemAtual.video;

  let novasImagens: string[] = [];
  let novoVideo: string | null = null;

  try {
    novasImagens = await uploadImages(arquivos.imagens);

    if (arquivos.video) {
      novoVideo = await uploadVideo(arquivos.video);
    }

    const imagensFinal = [...imagensExistentes, ...novasImagens];

    // Se nenhum vídeo novo for enviado, mantém o vídeo atual.
    const videoFinal = novoVideo ?? videoAntigo;

    const item = await service.update(slug, {
      ...validacao.data,
      imagem: imagensFinal,
      video: videoFinal,
    });

    const imagensRemovidas = imagensAntigas.filter(
      (url) => !imagensFinal.includes(url),
    );

    if (imagensRemovidas.length > 0) {
      await Promise.all(
        imagensRemovidas.map(async (url) => {
          try {
            await deleteImage(url);
          } catch (error) {
            console.error(
              "Erro ao remover imagem antiga do Cloudinary:",
              error,
            );
          }
        }),
      );
    }

    // O vídeo antigo só é excluído depois que o novo foi salvo no banco.
    if (novoVideo && videoAntigo) {
      try {
        await deleteVideo(videoAntigo);
      } catch (error) {
        console.error("Erro ao remover vídeo antigo do Cloudinary:", error);
      }
    }

    return res.json(item);
  } catch (error) {
    if (novasImagens.length > 0) {
      await Promise.all(
        novasImagens.map(async (url) => {
          try {
            await deleteImage(url);
          } catch (deleteError) {
            console.error(
              "Erro ao remover nova imagem órfã do Cloudinary:",
              deleteError,
            );
          }
        }),
      );
    }

    if (novoVideo) {
      try {
        await deleteVideo(novoVideo);
      } catch (deleteError) {
        console.error(
          "Erro ao remover novo vídeo órfão do Cloudinary:",
          deleteError,
        );
      }
    }

    throw error;
  }
};

export const remove = async (req: Request, res: Response) => {
  const slug = safeSlug(req.params.slug);

  const item = await service.getBySlug(slug);

  if (!item) {
    return res.status(404).json({
      message: "Empreendimento não encontrado.",
    });
  }

  const imagens: string[] = Array.isArray(item.imagem)
    ? item.imagem.filter(
        (imagem): imagem is string => typeof imagem === "string",
      )
    : [];

  const video = item.video;

  await service.remove(slug);

  if (imagens.length > 0) {
    await Promise.all(
      imagens.map(async (url) => {
        try {
          await deleteImage(url);
        } catch (error) {
          console.error(
            "Erro ao remover imagem do empreendimento do Cloudinary:",
            error,
          );
        }
      }),
    );
  }

  if (video) {
    try {
      await deleteVideo(video);
    } catch (error) {
      console.error(
        "Erro ao remover vídeo do empreendimento do Cloudinary:",
        error,
      );
    }
  }

  return res.json({
    message: "Removido com sucesso",
  });
};
