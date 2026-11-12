import multer from "multer";

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
});

export const uploadContrato = multer({
  storage,
});

export const uploadEmpreendimento = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024,
  },
});