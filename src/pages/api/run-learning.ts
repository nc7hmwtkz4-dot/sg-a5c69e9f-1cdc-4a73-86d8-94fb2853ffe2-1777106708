import type { NextApiRequest, NextApiResponse } from "next";
import { runCompleteLearning } from "@/services/learningEngineService";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    console.log("🚀 Starting complete learning algorithm...");
    await runCompleteLearning();
    console.log("✅ Learning completed successfully!");
    
    res.status(200).json({ 
      success: true, 
      message: "Learning algorithm completed successfully" 
    });
  } catch (error) {
    console.error("❌ Learning failed:", error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    });
  }
}