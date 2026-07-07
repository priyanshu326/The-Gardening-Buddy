import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";

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

  // MongoDB Connection Helper (Lazy Initialized)
  let mongoClient: MongoClient | null = null;
  async function getDb() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error("MONGODB_URI environment variable is not defined. Please configure it in your AI Studio secrets.");
    }
    if (!mongoClient) {
      mongoClient = new MongoClient(uri);
      await mongoClient.connect();
    }
    return mongoClient.db("gardening_buddy");
  }

  // Check auth status & DB connection
  app.get("/api/auth/status", async (req: any, res: any) => {
    try {
      const uri = process.env.MONGODB_URI;
      if (!uri) {
        return res.json({
          mongoConfigured: false,
          message: "MONGODB_URI environment variable is missing. Please add it in your AI Studio Settings/Secrets to connect your live database."
        });
      }
      const db = await getDb();
      // Ping the database
      await db.command({ ping: 1 });
      return res.json({ mongoConfigured: true, message: "Connected to MongoDB successfully." });
    } catch (err: any) {
      console.error("MongoDB Ping error:", err);
      return res.json({
        mongoConfigured: false,
        error: err.message || "Could not connect to MongoDB."
      });
    }
  });

  // User Sign Up
  app.post("/api/auth/signup", async (req: any, res: any) => {
    try {
      const { username, password, displayName } = req.body;
      if (!username || !password || !displayName) {
        return res.status(400).json({ error: "Missing required fields (username, password, displayName)." });
      }

      const cleanUsername = username.trim().toLowerCase();
      const db = await getDb();
      const usersCol = db.collection("users");

      const existingUser = await usersCol.findOne({ username: cleanUsername });
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists. Please choose another one." });
      }

      const newProfile = {
        username: cleanUsername,
        displayName: displayName.trim(),
        gardeningPoints: 0,
        quizHighScore: 0,
        myGarden: [],
        badges: ["Seed Sower"]
      };

      const newUserDoc = {
        username: cleanUsername,
        passwordHash: password,
        profile: newProfile,
        createdAt: new Date().toISOString()
      };

      await usersCol.insertOne(newUserDoc);

      return res.json({
        success: true,
        profile: newProfile
      });
    } catch (error: any) {
      console.error("Sign up error:", error);
      return res.status(500).json({
        error: error.message || "An error occurred during user creation."
      });
    }
  });

  // User Login
  app.post("/api/auth/login", async (req: any, res: any) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: "Please enter username and password." });
      }

      const cleanUsername = username.trim().toLowerCase();
      const db = await getDb();
      const usersCol = db.collection("users");

      const userRecord = await usersCol.findOne({ username: cleanUsername });
      if (!userRecord || userRecord.passwordHash !== password) {
        return res.status(400).json({ error: "Invalid username or password." });
      }

      return res.json({
        success: true,
        profile: userRecord.profile
      });
    } catch (error: any) {
      console.error("Login error:", error);
      return res.status(500).json({
        error: error.message || "An error occurred during user login."
      });
    }
  });

  // Sync user state
  app.post("/api/auth/sync", async (req: any, res: any) => {
    try {
      const { username, profile } = req.body;
      if (!username || !profile) {
        return res.status(400).json({ error: "Missing username or profile data." });
      }

      const cleanUsername = username.trim().toLowerCase();
      const db = await getDb();
      const usersCol = db.collection("users");

      const result = await usersCol.updateOne(
        { username: cleanUsername },
        { $set: { profile: profile, updatedAt: new Date().toISOString() } }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ error: "User not found for sync." });
      }

      return res.json({ success: true });
    } catch (error: any) {
      console.error("Sync error:", error);
      return res.status(500).json({
        error: error.message || "An error occurred during state sync."
      });
    }
  });

  // Get User Profile (MongoDB Cloud Sync)
  app.get("/api/auth/profile", async (req: any, res: any) => {
    try {
      const { username } = req.query;
      if (!username) {
        return res.status(400).json({ error: "Missing username parameter." });
      }

      const cleanUsername = username.trim().toLowerCase();
      const db = await getDb();
      const usersCol = db.collection("users");

      const userRecord = await usersCol.findOne({ username: cleanUsername });
      if (!userRecord) {
        return res.status(404).json({ error: "User not found." });
      }

      return res.json({
        success: true,
        profile: userRecord.profile
      });
    } catch (error: any) {
      console.error("Get profile error:", error);
      return res.status(500).json({
        error: error.message || "An error occurred fetching the profile."
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
