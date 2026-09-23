import { Router } from "express";

import {
  criar,
  listarPorLead,
  listarProximos,
  buscar,
  atualizar,
  excluir,
} from "./acompanhamentos.controller";

import { autenticar } from "../../middlewares/autenticacao";

const router = Router();

router.post("/", autenticar, criar);

router.get("/lead/:leadId", autenticar, listarPorLead);

router.get("/proximos", autenticar, listarProximos);

router.get("/:id", autenticar, buscar);

router.put("/:id", autenticar, atualizar);

router.delete("/:id", autenticar, excluir);

export default router;
