/**
 * Image Analysis Service
 * 
 * Phase 1: Manual extraction with structure ready for AI integration
 * Phase 2: Will integrate Google Cloud Vision or OpenAI GPT-4 Vision API
 * 
 * PRD Requirements:
 * - Extract text: Brand, Model, Reputation, Price
 * - Identify part rarity by border color (Gris, Vert, Bleu, Violet, Jaune)
 * - Map car type (Singulière, Rare, Épique, Légendaire, Secrète)
 */

export type PartRarity = "Stock" | "Gris" | "Singulière" | "Rare" | "Épique" | "Légendaire" | "Secrète";
export type CarType = "Rare" | "Singulière" | "Épique" | "Légendaire" | "Secrète";

export interface ImageAnalysisResult {
  brand: string;
  model: string;
  carType: CarType | null;
  reputation: number | null;
  priceMin: number | null;
  parts: {
    engine: PartRarity;
    clutch: PartRarity;
    turbo1: PartRarity;
    turbo2: PartRarity;
    suspension1: PartRarity;
    suspension2: PartRarity;
    transmission: PartRarity;
    tires: PartRarity;
  };
  confidence: number; // 0-1 score
}

/**
 * Analyze screenshot using AI Vision
 * 
 * @param imageDataUrl - Base64 data URL of the screenshot
 * @returns Extracted data with confidence score
 */
export async function analyzeScreenshot(imageDataUrl: string): Promise<ImageAnalysisResult> {
  // Phase 1: Return empty structure for manual input
  // Phase 2: Will call external Vision API here
  
  // TODO: Integrate with Google Cloud Vision or OpenAI GPT-4 Vision
  // Example future implementation:
  // const response = await fetch('/api/analyze-image', {
  //   method: 'POST',
  //   body: JSON.stringify({ image: imageDataUrl }),
  // });
  // const data = await response.json();
  
  // For now, return empty structure
  return {
    brand: "",
    model: "",
    carType: null,
    reputation: null,
    priceMin: null,
    parts: {
      engine: "Stock",
      clutch: "Stock",
      turbo1: "Stock",
      turbo2: "Stock",
      suspension1: "Stock",
      suspension2: "Stock",
      transmission: "Stock",
      tires: "Stock",
    },
    confidence: 0,
  };
}

/**
 * Extract car type from color detection
 * Border colors: Gris, Vert (Singulière), Bleu (Rare), Violet (Épique), Jaune (Légendaire)
 */
export function detectCarTypeFromColor(dominantColor: string): CarType | null {
  // TODO: Implement color detection logic
  // This will use image analysis to detect the border color of the car card
  return null;
}

/**
 * Extract part rarity from border color
 * Same color mapping as car types
 */
export function detectPartRarityFromColor(borderColor: string): PartRarity {
  // TODO: Implement part border color detection
  // Gray border = Gris
  // Green border = Singulière  
  // Blue border = Rare
  // Purple border = Épique
  // Yellow border = Légendaire
  return "Stock";
}