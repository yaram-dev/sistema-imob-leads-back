import { Router } from "express";

import * as controller from "./faixaInvestimento.controller";
import { autenticar } from "../../middlewares/autenticacao";

const router = Router();

router.get("/", controller.getAll);
router.get("/:id", controller.getById);

router.put("/reorganizar-ordens", autenticar, controller.reorganizarOrdens);

router.post("/", autenticar, controller.create);
router.put("/:id", autenticar, controller.update);
router.delete("/:id", autenticar, controller.remove);

export default router;
