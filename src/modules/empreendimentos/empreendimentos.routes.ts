import { Router } from "express";

import * as controller from "./empreendimentos.controller";
import { upload } from "../../middlewares/upload";
import { autenticar } from "../../middlewares/autenticacao";

const router = Router();

router.get("/", controller.getAll);

router.get("/:slug", controller.getBySlug);

router.post("/", autenticar, upload.array("imagens"), controller.create);

router.put("/:slug", autenticar, upload.array("imagens"), controller.update);

router.delete("/:slug", autenticar, controller.remove);

export default router;
