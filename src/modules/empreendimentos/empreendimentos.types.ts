export type Empreendimento = {
  id: string;
  slug: string;
  nome: string;

  tipoId: string;

  tipo: {
    id: string;
    nome: string;
  };

  local: string;
  preco: string | null;
  descricao: string[];
  imagem: string[];
};
