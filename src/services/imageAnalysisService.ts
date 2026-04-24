/**
 * Image Analysis Service
 * 
 * Integrates with OpenAI GPT-4 Vision for automatic screenshot analysis
 * 
 * PRD Requirements:
 * - Extract text: Brand, Model, Reputation, Price
 * - Identify part rarity by border color/visual indicators
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
 * Analyze screenshot using OpenAI GPT-4 Vision
 * 
 * @param imageDataUrl - Base64 data URL of the screenshot
 * @returns Extracted data with confidence score
 */
export async function analyzeScreenshot(imageDataUrl: string): Promise<ImageAnalysisResult> {
  try {
    const response = await fetch('/api/analyze-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: imageDataUrl }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', response.status, errorText);
      throw new Error(`Analysis API request failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    
    if (!result.success || !result.data) {
      console.error('Analysis failed:', result.error);
      throw new Error(result.error || 'Analysis failed');
    }

    return result.data as ImageAnalysisResult;
  } catch (error) {
    console.error('Screenshot analysis error:', error);
    // Return empty structure on error for manual input fallback
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
}

/**
 * Extract car type from color detection
 * Maps visual color badges to car rarity types
 */
export function detectCarTypeFromColor(dominantColor: string): CarType | null {
  const colorMap: Record<string, CarType> = {
    'blue': 'Rare',
    'green': 'Singulière',
    'purple': 'Épique',
    'yellow': 'Légendaire',
    'red': 'Secrète',
  };
  
  return colorMap[dominantColor.toLowerCase()] || null;
}

/**
 * Extract part rarity from visual indicators
 * Maps border colors and visual cues to rarity levels
 */
export function detectPartRarityFromColor(borderColor: string): PartRarity {
  const rarityMap: Record<string, PartRarity> = {
    'gray': 'Gris',
    'green': 'Singulière',
    'blue': 'Rare',
    'purple': 'Épique',
    'yellow': 'Légendaire',
    'red': 'Secrète',
  };
  
  return rarityMap[borderColor.toLowerCase()] || 'Stock';
}