import { Router } from "express";

import * as controller from "./empreendimentos.controller";
import { uploadEmpreendimento } from "../../middlewares/upload";
import { autenticar } from "../../middlewares/autenticacao";

const router = Router();

const uploadArquivosEmpreendimento = uploadEmpreendimento.fields([
  { name: "imagens" },
  { name: "video", maxCount: 1 },
]);

router.get("/", controller.getAll);

router.get("/:slug", controller.getBySlug);

router.post("/", autenticar, uploadArquivosEmpreendimento, controller.create);

router.put(
  "/:slug",
  autenticar,
  uploadArquivosEmpreendimento,
  controller.update,
);

router.delete("/:slug", autenticar, controller.remove);

export default router;
