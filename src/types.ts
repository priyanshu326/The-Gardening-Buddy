export interface Plant {
  id: string;
  name: string;
  scientificName: string;
  description: string;
  sunlight: "High" | "Medium" | "Low";
  water: "High" | "Medium" | "Low";
  difficulty: "Easy" | "Medium" | "Hard";
  soil: string;
  instructions: string[];
  funFact: string;
  category: "vegetable" | "fruit" | "herb" | "flower";
  image?: string;
}

export interface UserPlant {
  id: string;
  plantId: string; // references static plant ID, or "custom" for AI identified
  customDetails?: Plant; // populated if plantId is "custom"
  nickname: string;
  plantedAt: string;
  lastWateredAt: string;
  lastCheckedAt: string;
  status: "Healthy" | "Thirsty" | "Needs Attention" | "Harvest Ready";
  notes: string[];
}

export interface User {
  username: string;
  displayName: string;
  gardeningPoints: number;
  quizHighScore: number;
  myGarden: UserPlant[];
  badges: string[];
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}
