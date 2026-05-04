export const RARITY_NORMALIZATION: Record<string, string> = {
  "Singulière": "Singuliere",
  "Épique": "Epique",
  "Légendaire": "Legendaire",
  "Secrète": "Secrete",
};

export function normalizeRarityLabel(rarity: string | null | undefined): string | null {
  if (!rarity) return null;
  return RARITY_NORMALIZATION[rarity] || rarity;
}