import { Router } from "express";

import * as controller from "./leads.controller";
import { autenticar } from "../../middlewares/autenticacao";

const router = Router();

/* Público */
router.post("/", controller.create);

/* Administrativo */
router.get("/", autenticar, controller.getAll);
router.get("/:id", autenticar, controller.getById);
router.put("/:id", autenticar, controller.update);
router.delete("/:id", autenticar, controller.remove);

export default router;
