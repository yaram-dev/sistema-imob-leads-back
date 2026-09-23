import { Router } from "express";

import * as controller from "./localizacao.controller";
import { autenticar } from "../../middlewares/autenticacao";

const router = Router();

/* Público */
router.get("/", controller.getAll);
router.get("/:id", controller.getById);

/* Administrativo */
router.post("/", autenticar, controller.create);
router.put("/:id", autenticar, controller.update);
router.delete("/:id", autenticar, controller.remove);

export default router;
