export type LeadOrigem =
  | "HOME_FORMULARIO"
  | "HOME_BOTAO"
  | "EMPREENDIMENTO"
  | "CADASTRO_MANUAL"
  | "INDICACAO"
  | "WHATSAPP"
  | "INSTAGRAM"
  | "OUTRO";

export interface CreateLeadData {
  nome: string;
  whatsapp: string;
  email?: string;
  cidade?: string;
  regiao?: string;
  tipoImovel?: string;
  faixaInvestimento?: string;
  prazo?: string;
  mensagem?: string;
  empreendimentoId?: string;
  outroEmpreendimento?: string;
  origem?: LeadOrigem;
}

export interface UpdateLeadData {
  nome?: string;
  whatsapp?: string;
  email?: string;
  cidade?: string;
  regiao?: string;
  tipoImovel?: string;
  faixaInvestimento?: string;
  prazo?: string;
  mensagem?: string;
  empreendimentoId?: string | null;
  outroEmpreendimento?: string;
  status?: string;
  origem?: LeadOrigem;
}
