import { Router } from "express";

import {
  entrar,
  sair,
  alterarSenhaUsuario,
  solicitarRecuperacaoSenhaController,
  redefinirSenhaController,
} from "./autenticacao.controller";

import { autenticar } from "../../middlewares/autenticacao";

const router = Router();

router.post("/login", entrar);

router.post("/recuperar-senha", solicitarRecuperacaoSenhaController);

router.post("/redefinir-senha", redefinirSenhaController);

router.post("/logout", autenticar, sair);

router.put("/alterar-senha", autenticar, alterarSenhaUsuario);

export default router;
