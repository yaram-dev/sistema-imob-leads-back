import cloudinary from "../config/cloudinary";

export const uploadImage = (file: Express.Multer.File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "empreendimentos",
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result!.secure_url);
        }
      },
    );

    stream.end(file.buffer);
  });
};

export const deleteImage = (imageUrl: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      const url = new URL(imageUrl);

      const caminho = url.pathname;
      const marcador = "/image/upload/";
      const indice = caminho.indexOf(marcador);

      if (indice === -1) {
        reject(
          new Error("Não foi possível identificar a imagem no Cloudinary."),
        );
        return;
      }

      let publicId = caminho.substring(indice + marcador.length);

      publicId = publicId.replace(/^v\d+\//, "");

      publicId = publicId.replace(/\.[^/.]+$/, "");

      cloudinary.uploader.destroy(
        publicId,
        {
          resource_type: "image",
          type: "upload",
        },
        (error, result) => {
          if (error) {
            reject(error);
            return;
          }

          if (result?.result === "not found") {
            resolve();
            return;
          }

          resolve();
        },
      );
    } catch (error) {
      reject(error);
    }
  });
};

export const uploadContrato = (file: Express.Multer.File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const nomeBase = file.originalname
      .replace(/\.pdf$/i, "")
      .replace(/[^a-zA-Z0-9_-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    const publicId = `${nomeBase || "contrato"}-${Date.now()}.pdf`;

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "vendas/contratos",
        resource_type: "raw",
        type: "upload",
        public_id: publicId,
        use_filename: false,
        unique_filename: false,
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result!.secure_url);
        }
      },
    );

    stream.end(file.buffer);
  });
};

export const deleteContrato = (contratoUrl: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      const url = new URL(contratoUrl);

      const caminho = url.pathname;

      const marcador = "/raw/upload/";

      const indice = caminho.indexOf(marcador);

      if (indice === -1) {
        reject(
          new Error("Não foi possível identificar o arquivo no Cloudinary."),
        );
        return;
      }

      let publicId = caminho.substring(indice + marcador.length);

      publicId = publicId.replace(/^v\d+\//, "");

      cloudinary.uploader.destroy(
        publicId,
        {
          resource_type: "raw",
          type: "upload",
        },
        (error) => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        },
      );
    } catch (error) {
      reject(error);
    }
  });
};
