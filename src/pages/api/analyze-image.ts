import type { NextApiRequest, NextApiResponse } from "next";

/**
 * API Route for Image Analysis using OpenAI GPT-4 Vision
 * 
 * Requirements from PRD:
 * - OCR text extraction (brand, model, reputation, price)
 * - Color detection for rarity (border colors)
 * - Return structured JSON for validation form
 */

type AnalysisResponse = {
  success: boolean;
  data?: {
    brand: string;
    model: string;
    carType: string | null;
    reputation: number | null;
    priceMin: number | null;
    parts: {
      engine: string;
      clutch: string;
      turbo1: string;
      turbo2: string;
      suspension1: string;
      suspension2: string;
      transmission: string;
      tires: string;
    };
    confidence: number;
  };
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AnalysisResponse>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ success: false, error: "No image provided" });
    }

    // Check if OpenAI API key is configured
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.warn("OpenAI API key not configured - returning manual input mode");
      return res.status(200).json({
        success: true,
        data: {
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
        },
      });
    }

    // Call OpenAI GPT-4 Vision API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this car market screenshot and extract the following data in JSON format:
{
  "brand": "string - Car brand/manufacturer name",
  "model": "string - Car model name",
  "carType": "string - One of: Rare, Singulière, Épique, Légendaire, Secrète (look for purple/blue/yellow badges)",
  "reputation": "number - Total reputation value shown",
  "priceMin": "number - Minimum resale price (Prix Min VM or similar)",
  "parts": {
    "engine": "string - Rarity: Stock, Gris, Singulière, Rare, Épique, Légendaire, Secrète",
    "clutch": "string - Same rarity options",
    "turbo1": "string - Same rarity options",
    "turbo2": "string - Same rarity options",
    "suspension1": "string - Same rarity options",
    "suspension2": "string - Same rarity options",
    "transmission": "string - Same rarity options",
    "tires": "string - Same rarity options"
  }
}

Look for:
- Car name/model at top
- Type badge (ÉPIQUE, LÉGENDAIRE, etc) with color
- Reputation number
- Parts grid on right side - green triangle = upgraded part
- "Vide" = Stock/empty part
- Price at bottom (Prix de vente conseillé or similar)

Return ONLY valid JSON, no other text.`
              },
              {
                type: "image_url",
                image_url: {
                  url: image
                }
              }
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0.1
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API error:", errorData);
      throw new Error("OpenAI API request failed");
    }

    const aiResponse = await response.json();
    const extractedText = aiResponse.choices[0]?.message?.content;

    if (!extractedText) {
      throw new Error("No response from AI");
    }

    // Parse the AI response
    let parsedData;
    try {
      parsedData = JSON.parse(extractedText);
    } catch (parseError) {
      console.error("Failed to parse AI response:", extractedText);
      throw new Error("Invalid AI response format");
    }

    // Calculate confidence based on completeness
    const hasAllFields = !!(
      parsedData.brand &&
      parsedData.model &&
      parsedData.reputation &&
      parsedData.carType
    );
    const confidence = hasAllFields ? 0.85 : 0.4;

    return res.status(200).json({
      success: true,
      data: {
        brand: parsedData.brand || "",
        model: parsedData.model || "",
        carType: parsedData.carType || null,
        reputation: parsedData.reputation || null,
        priceMin: parsedData.priceMin || null,
        parts: parsedData.parts || {
          engine: "Stock",
          clutch: "Stock",
          turbo1: "Stock",
          turbo2: "Stock",
          suspension1: "Stock",
          suspension2: "Stock",
          transmission: "Stock",
          tires: "Stock",
        },
        confidence,
      },
    });
  } catch (error) {
    console.error("Image analysis error:", error);
    return res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to analyze image"
    });
  }
}