import { Router } from "express";
import {
  buscarComissao,
  buscarComissaoPorVenda,
  criarComissao,
  atualizarComissao,
  removerComissao,
} from "./comissoes.controller";
import { autenticar } from "../../middlewares/autenticacao";

const router = Router();

router.get("/venda/:vendaId", autenticar, buscarComissaoPorVenda);

router.get("/:id", autenticar, buscarComissao);

router.post("/", autenticar, criarComissao);

router.put("/:id", autenticar, atualizarComissao);

router.delete("/:id", autenticar, removerComissao);

export default router;
