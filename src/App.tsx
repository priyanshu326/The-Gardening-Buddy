import { useState, useEffect } from "react";
import { User, Plant } from "./types";
import AuthScreen from "./components/AuthScreen";
import PlantSelector from "./components/PlantSelector";
import AIPlantCamera from "./components/AIPlantCamera";
import MyGarden from "./components/MyGarden";
import GardeningQuiz from "./components/GardeningQuiz";
import { Sprout, LogOut, Compass, Camera, HelpCircle, Leaf, Trophy } from "lucide-react";

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<"my-garden" | "plant-selector" | "ai-camera" | "gardening-quiz">("my-garden");
  const [mongoConnected, setMongoConnected] = useState<boolean>(false);

  // On mount, auto-login active session and sync from MongoDB if available
  useEffect(() => {
    const activeSession = localStorage.getItem("gardening_buddy_session");
    
    fetch("/api/auth/status")
      .then((res) => res.json())
      .then(async (data) => {
        const isMongo = !!data.mongoConfigured;
        setMongoConnected(isMongo);

        if (activeSession) {
          try {
            const parsedUser: User = JSON.parse(activeSession);
            if (parsedUser.username === "guest") {
              setCurrentUser(parsedUser);
              return;
            }

            if (isMongo) {
              // Fetch latest profile from MongoDB
              const response = await fetch(`/api/auth/profile?username=${encodeURIComponent(parsedUser.username)}`);
              const profileData = await response.json();
              if (response.ok && profileData.success) {
                setCurrentUser(profileData.profile);
                localStorage.setItem("gardening_buddy_session", JSON.stringify(profileData.profile));
                return;
              }
            }
            
            // Fallback: Local database registry check
            const usersJson = localStorage.getItem("gardening_buddy_users");
            if (usersJson) {
              const users = JSON.parse(usersJson);
              if (users[parsedUser.username]) {
                setCurrentUser(users[parsedUser.username].profile);
                return;
              }
            }
            setCurrentUser(parsedUser);
          } catch (err) {
            console.error("Session restore failed:", err);
          }
        }
      })
      .catch((err) => {
        console.error("Failed to check MongoDB status in App component:", err);
        if (activeSession) {
          try {
            const parsedUser: User = JSON.parse(activeSession);
            setCurrentUser(parsedUser);
          } catch (err2) {
            console.error("Offline restore failed:", err2);
          }
        }
      });
  }, []);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    // Keep session active
    localStorage.setItem("gardening_buddy_session", JSON.stringify(user));
    // Check MongoDB status again in case we logged in from different state
    fetch("/api/auth/status")
      .then((res) => res.json())
      .then((data) => setMongoConnected(!!data.mongoConfigured))
      .catch((err) => console.error("Error setting mongo connection state:", err));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("gardening_buddy_session");
  };

  // Sync user profile updates to local/MongoDB database
  const handleUpdateUser = async (updatedUser: User) => {
    setCurrentUser(updatedUser);
    
    // Save active session
    localStorage.setItem("gardening_buddy_session", JSON.stringify(updatedUser));

    // Update central database registry
    if (updatedUser.username === "guest") return; // guests don't write to registry

    if (mongoConnected) {
      try {
        const response = await fetch("/api/auth/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: updatedUser.username, profile: updatedUser }),
        });
        if (!response.ok) {
          const data = await response.json();
          console.error("Failed to sync profile to MongoDB:", data.error);
        }
      } catch (err) {
        console.error("Failed to sync user to MongoDB:", err);
      }
    } else {
      const usersJson = localStorage.getItem("gardening_buddy_users");
      if (usersJson) {
        try {
          const users = JSON.parse(usersJson);
          if (users[updatedUser.username]) {
            users[updatedUser.username].profile = updatedUser;
            localStorage.setItem("gardening_buddy_users", JSON.stringify(users));
          }
        } catch (err) {
          console.error("Failed to sync user database registry locally:", err);
        }
      }
    }
  };

  // Plant a standard crop from our encyclopedia
  const handleAddPlant = (plant: Plant, nickname: string) => {
    if (!currentUser) return;

    const newGardenPlant = {
      id: `${plant.id}-${Date.now()}`,
      plantId: plant.id,
      nickname: nickname,
      plantedAt: new Date().toISOString(),
      lastWateredAt: new Date().toISOString(),
      lastCheckedAt: new Date().toISOString(),
      status: "Healthy" as const,
      notes: ["Sowed inside organic garden soil. Placed in warm, aerated spot."]
    };

    const updatedGarden = [...currentUser.myGarden, newGardenPlant];
    const pointsAwarded = 25; // +25 points for planting a crop
    const newPoints = currentUser.gardeningPoints + pointsAwarded;
    const updatedBadges = [...currentUser.badges];

    if (newPoints >= 100 && !updatedBadges.includes("Sprout Tender")) {
      updatedBadges.push("Sprout Tender");
    }

    const updatedProfile: User = {
      ...currentUser,
      gardeningPoints: newPoints,
      myGarden: updatedGarden,
      badges: updatedBadges
    };

    handleUpdateUser(updatedProfile);
    setActiveTab("my-garden");
  };

  // Plant a custom identified plant from AI diagnostic
  const handleAddCustomPlant = (plant: Plant, nickname: string) => {
    if (!currentUser) return;

    const newCustomPlant = {
      id: `${plant.id}-${Date.now()}`,
      plantId: "custom",
      customDetails: plant,
      nickname: nickname,
      plantedAt: new Date().toISOString(),
      lastWateredAt: new Date().toISOString(),
      lastCheckedAt: new Date().toISOString(),
      status: "Healthy" as const,
      notes: ["Identified and analyzed by AI Scanner. Commencing localized care sequence."]
    };

    const updatedGarden = [...currentUser.myGarden, newCustomPlant];
    const pointsAwarded = 50; // +50 points for an AI discovery!
    const newPoints = currentUser.gardeningPoints + pointsAwarded;
    const updatedBadges = [...currentUser.badges];

    if (!updatedBadges.includes("AI Pioneer")) {
      updatedBadges.push("AI Pioneer");
    }
    if (newPoints >= 100 && !updatedBadges.includes("Sprout Tender")) {
      updatedBadges.push("Sprout Tender");
    }

    const updatedProfile: User = {
      ...currentUser,
      gardeningPoints: newPoints,
      myGarden: updatedGarden,
      badges: updatedBadges
    };

    handleUpdateUser(updatedProfile);
    setActiveTab("my-garden");
  };

  // If not logged in, show Auth Screen
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-stone-100/50 p-4 sm:p-6 flex items-center justify-center">
        <div className="w-full max-w-6xl">
          <AuthScreen onLoginSuccess={handleLoginSuccess} />
        </div>
      </div>
    );
  }

  // Garden plant simple ID array for catalog badge display
  const gardenPlantIds = currentUser.myGarden.map((up) => up.plantId);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 flex flex-col font-sans">
      {/* Global Header Bar */}
      <header className="sticky top-0 z-40 bg-stone-50/90 border-b border-stone-200 shadow-xs backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-600 text-stone-50 rounded-xl shadow-xs">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-serif font-extrabold text-lg sm:text-xl text-emerald-800 leading-none">Gardening Buddy</h1>
              <span className="text-[9px] text-emerald-600 font-mono tracking-wider uppercase font-bold">Agricultural Hub</span>
            </div>
          </div>

          {/* Nav Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              id="nav-btn-my-garden"
              onClick={() => setActiveTab("my-garden")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === "my-garden"
                  ? "bg-emerald-50 text-emerald-800"
                  : "text-stone-500 hover:text-stone-800 hover:bg-stone-50"
              }`}
            >
              <Leaf className="w-4 h-4" />
              My Garden
            </button>
            <button
              id="nav-btn-catalog"
              onClick={() => setActiveTab("plant-selector")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === "plant-selector"
                  ? "bg-emerald-50 text-emerald-800"
                  : "text-stone-500 hover:text-stone-800 hover:bg-stone-50"
              }`}
            >
              <Compass className="w-4 h-4" />
              Plant Catalog
            </button>
            <button
              id="nav-btn-ai-camera"
              onClick={() => setActiveTab("ai-camera")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === "ai-camera"
                  ? "bg-emerald-50 text-emerald-800"
                  : "text-stone-500 hover:text-stone-800 hover:bg-stone-50"
              }`}
            >
              <Camera className="w-4 h-4" />
              AI Plant Scanner
            </button>
            <button
              id="nav-btn-quiz"
              onClick={() => setActiveTab("gardening-quiz")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === "gardening-quiz"
                  ? "bg-emerald-50 text-emerald-800"
                  : "text-stone-500 hover:text-stone-800 hover:bg-stone-50"
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              Knowledge Quiz
            </button>
          </nav>

          {/* User Profile Info & Logout */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-bold text-stone-700">{currentUser.displayName}</span>
              <span className="text-[10px] text-amber-600 font-mono font-semibold">🏆 {currentUser.gardeningPoints} XP</span>
            </div>
            
            <button
              id="btn-global-logout"
              onClick={handleLogout}
              className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Body Workspace */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {activeTab === "my-garden" && (
          <MyGarden
            user={currentUser}
            onUpdateUser={handleUpdateUser}
            onNavigateToCatalog={() => setActiveTab("plant-selector")}
          />
        )}

        {activeTab === "plant-selector" && (
          <PlantSelector
            onAddPlant={handleAddPlant}
            gardenPlantIds={gardenPlantIds}
          />
        )}

        {activeTab === "ai-camera" && (
          <AIPlantCamera
            onAddCustomPlant={handleAddCustomPlant}
          />
        )}

        {activeTab === "gardening-quiz" && (
          <GardeningQuiz
            user={currentUser}
            onUpdateUser={handleUpdateUser}
          />
        )}
      </main>

      {/* Mobile Sticky Tab bar (Only visible on screens < 768px) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-stone-200/80 shadow-lg backdrop-blur-md">
        <div className="grid grid-cols-4 h-14">
          <button
            id="mobile-btn-my-garden"
            onClick={() => setActiveTab("my-garden")}
            className={`flex flex-col items-center justify-center text-[10px] font-semibold transition-colors ${
              activeTab === "my-garden" ? "text-emerald-800 bg-emerald-50/20" : "text-stone-400"
            }`}
          >
            <Leaf className="w-5 h-5 mb-0.5" />
            Garden
          </button>
          <button
            id="mobile-btn-catalog"
            onClick={() => setActiveTab("plant-selector")}
            className={`flex flex-col items-center justify-center text-[10px] font-semibold transition-colors ${
              activeTab === "plant-selector" ? "text-emerald-800 bg-emerald-50/20" : "text-stone-400"
            }`}
          >
            <Compass className="w-5 h-5 mb-0.5" />
            Catalog
          </button>
          <button
            id="mobile-btn-ai-camera"
            onClick={() => setActiveTab("ai-camera")}
            className={`flex flex-col items-center justify-center text-[10px] font-semibold transition-colors ${
              activeTab === "ai-camera" ? "text-emerald-800 bg-emerald-50/20" : "text-stone-400"
            }`}
          >
            <Camera className="w-5 h-5 mb-0.5" />
            Scan
          </button>
          <button
            id="mobile-btn-quiz"
            onClick={() => setActiveTab("gardening-quiz")}
            className={`flex flex-col items-center justify-center text-[10px] font-semibold transition-colors ${
              activeTab === "gardening-quiz" ? "text-emerald-800 bg-emerald-50/20" : "text-stone-400"
            }`}
          >
            <HelpCircle className="w-5 h-5 mb-0.5" />
            Quiz
          </button>
        </div>
      </div>
    </div>
  );
}
