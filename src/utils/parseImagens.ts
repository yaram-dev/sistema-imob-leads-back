  export function parseImagens(imagem: unknown): string[] {
    if (!imagem) return [];

    if (Array.isArray(imagem)) {
      return imagem as string[];
    }

    if (typeof imagem === "string") {
      try {
        return JSON.parse(imagem);
      } catch {
        return [];
      }
    }

    return [];
  }
