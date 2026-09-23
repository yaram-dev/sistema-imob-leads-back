import { Router } from "express";

import empreendimentosRoutes from "../modules/empreendimentos/empreendimentos.routes";
import tiposRoutes from "../modules/tipos/tipo.routes";
import localizacoesRoutes from "../modules/localizacoes/localizacao.routes";
import faixasInvestimentoRoutes from "../modules/faixas-investimento/faixaInvestimento.routes";
import prazosCompraRoutes from "../modules/prazos-compra/prazoCompra.routes";
import leadsRoutes from "../modules/leads/leads.routes";
import acompanhamentosRoutes from "../modules/acompanhamentos/acompanhamentos.routes";
import autenticacaoRoutes from "../modules/autenticacao/autenticacao.routes";
import vendasRoutes from "../modules/vendas/vendas.routes";
import comissoesRoutes from "../modules/comissoes/comissoes.routes";
import recebimentosComissaoRoutes from "../modules/recebimentos-comissao/recebimentos-comissao.routes";

const router = Router();

router.use("/empreendimentos", empreendimentosRoutes);

router.use("/tipos", tiposRoutes);

router.use("/localizacoes", localizacoesRoutes);

router.use("/faixas-investimento", faixasInvestimentoRoutes);

router.use("/prazos-compra", prazosCompraRoutes);

router.use("/leads", leadsRoutes);

router.use("/acompanhamentos", acompanhamentosRoutes);

router.use("/autenticacao", autenticacaoRoutes);

router.use("/vendas", vendasRoutes);

router.use("/comissoes", comissoesRoutes);

router.use("/recebimentos-comissao", recebimentosComissaoRoutes);

export default router;
