export function parseDescricao(descricao: unknown): string[] {
  if (!descricao) {
    return [];
  }

  if (Array.isArray(descricao)) {
    return descricao;
  }

  if (typeof descricao === "string") {
    try {
      return JSON.parse(descricao);
    } catch {
      return [];
    }
  }

  return [];
}
