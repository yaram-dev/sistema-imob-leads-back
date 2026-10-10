import { Router } from "express";

import {
  listarVendas,
  buscarVenda,
  criarVenda,
  atualizarVenda,
  removerVenda,
} from "./vendas.controller";

import { autenticar } from "../../middlewares/autenticacao";

import { uploadContrato } from "../../middlewares/upload";

const router = Router();

router.get("/", autenticar, listarVendas);

router.get("/:id", autenticar, buscarVenda);

router.post(
  "/",
  autenticar,
  uploadContrato.array("documentos", 10),
  criarVenda,
);

router.put(
  "/:id",
  autenticar,
  uploadContrato.array("documentos", 10),
  atualizarVenda,
);

router.delete("/:id", autenticar, removerVenda);

export default router;
