import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Limit body size to allow base64 uploads up to 15MB
  app.use(express.json({ limit: "15mb" }));
  app.use(express.urlencoded({ limit: "15mb", extended: true }));

  // API Route to identify plant
  app.post("/api/identify-plant", async (req: any, res: any) => {
    try {
      const { image } = req.body;
      if (!image) {
        return res.status(400).json({ error: "No image data provided" });
      }

      // Check if GEMINI_API_KEY is available
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          error: "GEMINI_API_KEY is not configured in your environment secrets. Please set it in AI Studio."
        });
      }

      // Extract base64 and mimeType
      let mimeType = "image/jpeg";
      let base64Data = image;

      if (image.startsWith("data:")) {
        const parts = image.split(";base64,");
        mimeType = parts[0].replace("data:", "");
        base64Data = parts[1];
      }

      // Initialize the Gemini API client lazily
      const ai = new GoogleGenAI({ apiKey });

      const prompt = `Identify this plant. Provide the following information in strict JSON format. If it is NOT a plant, return an error message.
JSON structure:
{
  "name": "Common Name of the Plant",
  "scientificName": "Scientific Name of the Plant",
  "description": "A rich description of the plant (2-3 sentences), its origins, and home-growing appeal.",
  "sunlight": "High" | "Medium" | "Low",
  "water": "High" | "Medium" | "Low",
  "difficulty": "Easy" | "Medium" | "Hard",
  "soil": "Brief soil recommendation (e.g. Well-draining, rich loamy soil)",
  "instructions": [
    "Step 1: planting or initial potting guide.",
    "Step 2: light, position, and watering care.",
    "Step 3: pruning, nourishment, or general growth maintenance.",
    "Step 4: harvesting or what to watch out for."
  ],
  "funFact": "An interesting, engaging trivia or historical fact about the plant."
}

If the image does not show a recognizable plant, vegetable, herb, or fruit, return:
{
  "error": "The image uploaded does not seem to contain a plant we can recognize. Please take a clear, well-lit photo of the plant leaves or stems."
}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  mimeType: mimeType,
                  data: base64Data
                }
              },
              {
                text: prompt
              }
            ]
          }
        ],
        config: {
          responseMimeType: "application/json"
        }
      });

      const responseText = response.text;
      if (!responseText) {
        return res.status(500).json({ error: "Empty response from Gemini API" });
      }

      const parsedData = JSON.parse(responseText);
      return res.json(parsedData);

    } catch (error: any) {
      console.error("Error identifying plant:", error);
      return res.status(500).json({
        error: error.message || "An error occurred while processing the image with AI."
      });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
