import { Router } from "express";
import {
  listarRecebimentosPorComissao,
  buscarRecebimento,
  criarRecebimento,
  atualizarRecebimento,
  removerRecebimento,
} from "./recebimentos-comissao.controller";
import { autenticar } from "../../middlewares/autenticacao";

const router = Router();

router.get("/comissao/:comissaoId", autenticar, listarRecebimentosPorComissao);

router.get("/:id", autenticar, buscarRecebimento);

router.post("/", autenticar, criarRecebimento);

router.put("/:id", autenticar, atualizarRecebimento);

router.delete("/:id", autenticar, removerRecebimento);

export default router;
