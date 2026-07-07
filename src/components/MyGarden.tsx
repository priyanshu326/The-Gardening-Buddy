import React, { useState } from "react";
import { User, UserPlant, Plant } from "../types";
import { PRELOADED_PLANTS } from "../data";
import { Droplets, Calendar, BookOpen, AlertCircle, Heart, CheckCircle2, Award, ClipboardList, PlusCircle, Trash2 } from "lucide-react";

interface MyGardenProps {
  user: User;
  onUpdateUser: (updatedUser: User) => void;
  onNavigateToCatalog: () => void;
}

export default function MyGarden({ user, onUpdateUser, onNavigateToCatalog }: MyGardenProps) {
  const [activePlantId, setActivePlantId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState<string>("");
  const [showNoteForm, setShowNoteForm] = useState<boolean>(false);

  const getPlantDetails = (userPlant: UserPlant): Plant | undefined => {
    if (userPlant.plantId === "custom") {
      return userPlant.customDetails;
    }
    return PRELOADED_PLANTS.find((p) => p.id === userPlant.plantId);
  };

  // Water plant: resets Thirsty status, adds a log entry, and awards points
  const handleWater = (plantId: string) => {
    const updatedGarden = user.myGarden.map((up) => {
      if (up.id === plantId) {
        const details = getPlantDetails(up);
        const name = up.nickname || details?.name || "Plant";
        const now = new Date().toISOString();
        return {
          ...up,
          lastWateredAt: now,
          lastCheckedAt: now,
          status: "Healthy" as const,
          notes: [`Watered deeply on ${new Date(now).toLocaleDateString()} at ${new Date(now).toLocaleTimeString()}. Soil moisture restored.`, ...up.notes]
        };
      }
      return up;
    });

    // Award +15 points for watering
    const pointsAwarded = 15;
    const newPoints = user.gardeningPoints + pointsAwarded;
    const updatedBadges = [...user.badges];

    // Check for level up milestones
    if (newPoints >= 100 && !updatedBadges.includes("Sprout Tender")) {
      updatedBadges.push("Sprout Tender");
    }
    if (newPoints >= 300 && !updatedBadges.includes("Flora Guardian")) {
      updatedBadges.push("Flora Guardian");
    }
    if (newPoints >= 600 && !updatedBadges.includes("Master Harvester")) {
      updatedBadges.push("Master Harvester");
    }

    onUpdateUser({
      ...user,
      gardeningPoints: newPoints,
      myGarden: updatedGarden,
      badges: updatedBadges
    });
  };

  // Add a personal observation note: awards +10 points
  const handleAddNote = (e: React.FormEvent, plantId: string) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    const updatedGarden = user.myGarden.map((up) => {
      if (up.id === plantId) {
        const now = new Date().toISOString();
        return {
          ...up,
          lastCheckedAt: now,
          notes: [`Observation (${new Date(now).toLocaleDateString()}): ${noteText.trim()}`, ...up.notes]
        };
      }
      return up;
    });

    const pointsAwarded = 10;
    const newPoints = user.gardeningPoints + pointsAwarded;
    const updatedBadges = [...user.badges];

    if (newPoints >= 100 && !updatedBadges.includes("Sprout Tender")) {
      updatedBadges.push("Sprout Tender");
    }
    if (newPoints >= 300 && !updatedBadges.includes("Flora Guardian")) {
      updatedBadges.push("Flora Guardian");
    }

    onUpdateUser({
      ...user,
      gardeningPoints: newPoints,
      myGarden: updatedGarden,
      badges: updatedBadges
    });

    setNoteText("");
    setShowNoteForm(false);
  };

  // Harvest plant: logs harvest, awards +100 points, resets status
  const handleHarvest = (plantId: string) => {
    const updatedGarden = user.myGarden.map((up) => {
      if (up.id === plantId) {
        const details = getPlantDetails(up);
        const name = up.nickname || details?.name || "Plant";
        const now = new Date().toISOString();
        return {
          ...up,
          lastCheckedAt: now,
          status: "Healthy" as const, // resets
          notes: [`🏆 HARVEST EVENT on ${new Date(now).toLocaleDateString()}! Enjoyed sweet home-grown fresh produce!`, ...up.notes]
        };
      }
      return up;
    });

    const pointsAwarded = 100;
    const newPoints = user.gardeningPoints + pointsAwarded;
    const updatedBadges = [...user.badges];

    if (!updatedBadges.includes("First Harvest")) {
      updatedBadges.push("First Harvest");
    }
    if (newPoints >= 300 && !updatedBadges.includes("Flora Guardian")) {
      updatedBadges.push("Flora Guardian");
    }
    if (newPoints >= 600 && !updatedBadges.includes("Master Harvester")) {
      updatedBadges.push("Master Harvester");
    }

    onUpdateUser({
      ...user,
      gardeningPoints: newPoints,
      myGarden: updatedGarden,
      badges: updatedBadges
    });
  };

  // Remove plant from garden
  const handleRemovePlant = (plantId: string) => {
    if (confirm("Are you sure you want to remove this plant from your garden roster?")) {
      const updatedGarden = user.myGarden.filter((p) => p.id !== plantId);
      onUpdateUser({
        ...user,
        myGarden: updatedGarden
      });
      if (activePlantId === plantId) {
        setActivePlantId(null);
      }
    }
  };

  // Calculate gardening level
  const getLevelInfo = (points: number) => {
    if (points >= 600) return { level: 4, name: "Master Harvester", next: "Max Level", progress: 100 };
    if (points >= 300) return { level: 3, name: "Flora Guardian", next: "600 pts to Master", progress: Math.min(100, ((points - 300) / 300) * 100) };
    if (points >= 100) return { level: 2, name: "Sprout Tender", next: "300 pts to Guardian", progress: Math.min(100, ((points - 100) / 200) * 100) };
    return { level: 1, name: "Seed Sower", next: "100 pts to Sprout Tender", progress: Math.min(100, (points / 100) * 100) };
  };

  const levelInfo = getLevelInfo(user.gardeningPoints);
  const activePlant = user.myGarden.find((p) => p.id === activePlantId);
  const activePlantDetails = activePlant ? getPlantDetails(activePlant) : undefined;

  return (
    <div id="my-garden-wrapper" className="space-y-6">
      {/* Gamification Badging Ribbon */}
      <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-4 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌱</span>
            <h2 className="text-2xl font-bold font-serif text-stone-800">
              {user.displayName}'s Homestead
            </h2>
          </div>
          <p className="text-xs text-stone-500 font-mono">User Handle: @{user.username}</p>
        </div>

        {/* Gardening Experience Bar */}
        <div className="md:col-span-5 space-y-2">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-emerald-800 flex items-center gap-1">
              <Award className="w-4 h-4" /> Level {levelInfo.level}: {levelInfo.name}
            </span>
            <span className="text-stone-500 font-mono">{user.gardeningPoints} total pts</span>
          </div>
          <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden border border-stone-200 p-0.5">
            <div
              className="h-full bg-emerald-600 rounded-full transition-all duration-500"
              style={{ width: `${levelInfo.progress}%` }}
            ></div>
          </div>
          <p className="text-[10px] text-stone-400 font-mono text-right">{levelInfo.next}</p>
        </div>

        {/* Badges Earned */}
        <div className="md:col-span-3 space-y-1">
          <span className="text-[10px] font-bold text-stone-400 uppercase font-mono block">Achievements unlocked</span>
          <div className="flex flex-wrap gap-1.5">
            {user.badges.map((badge) => (
              <span
                key={badge}
                className="text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1"
              >
                🏆 {badge}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Main Garden Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Growing Plant List (5 Columns) */}
        <div id="garden-list-column" className="lg:col-span-5 space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-stone-100 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-stone-800 text-sm font-mono uppercase tracking-wider">
                My Crops ({user.myGarden.length})
              </h3>
              <button
                id="btn-goto-catalog"
                onClick={onNavigateToCatalog}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                <PlusCircle className="w-4 h-4" /> Plant More
              </button>
            </div>

            {user.myGarden.length === 0 ? (
              <div className="text-center py-12 text-stone-400 space-y-4">
                <span className="text-4xl block">🧺</span>
                <div className="space-y-1">
                  <p className="font-medium text-stone-700 text-sm">Your garden is empty!</p>
                  <p className="text-xs text-stone-400 max-w-xs mx-auto">Click below to browse easy-to-grow vegetables, herbs, and berries, or scan a plant using our AI Camera.</p>
                </div>
                <button
                  id="btn-browse-catalog-empty"
                  onClick={onNavigateToCatalog}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-stone-50 text-xs font-semibold rounded-xl shadow-sm transition"
                >
                  Explore Plant Catalog
                </button>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {user.myGarden.map((up) => {
                  const details = getPlantDetails(up);
                  const isSelected = up.id === activePlantId;
                  
                  // Simple calculation for days growing
                  const daysGrowing = Math.floor(
                    (Date.now() - new Date(up.plantedAt).getTime()) / (1000 * 60 * 60 * 24)
                  );

                  // Compute real thirsty warnings based on lastWateredAt and crop water needs
                  const lastWateredDate = new Date(up.lastWateredAt);
                  const hoursSinceWater = (Date.now() - lastWateredDate.getTime()) / (1000 * 60 * 60);
                  
                  // Let's make "High" water need plants thirsty after 24 hours, "Medium" after 48 hours, and "Low" after 72 hours
                  const thresholdHours = details?.water === "High" ? 24 : details?.water === "Medium" ? 48 : 72;
                  const isThirsty = hoursSinceWater >= thresholdHours;
                  const computedStatus = isThirsty ? "Thirsty" : up.status;

                  return (
                    <div
                      key={up.id}
                      id={`garden-card-${up.id}`}
                      onClick={() => {
                        setActivePlantId(up.id);
                        setShowNoteForm(false);
                      }}
                      className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer flex gap-4 ${
                        isSelected
                          ? "bg-emerald-50/40 border-emerald-300 shadow-sm"
                          : "bg-white border-stone-100 hover:border-stone-200"
                      }`}
                    >
                      <img
                        src={details?.image || "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&q=80&w=300"}
                        alt={details?.name || "Custom plant"}
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 rounded-lg object-cover bg-stone-100 flex-shrink-0"
                      />
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <h4 className="font-serif font-bold text-stone-800 text-sm leading-tight">
                              {up.nickname}
                            </h4>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              computedStatus === "Thirsty"
                                ? "bg-red-50 text-red-700 border border-red-100"
                                : computedStatus === "Harvest Ready"
                                ? "bg-amber-50 text-amber-700 border border-amber-100"
                                : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            }`}>
                              {computedStatus}
                            </span>
                          </div>
                          <p className="text-xs text-stone-500 italic mt-0.5">{details?.name || "AI Species"}</p>
                        </div>

                        <div className="flex justify-between items-center text-[10px] text-stone-400 font-mono mt-2">
                          <span className="flex items-center gap-0.5">
                            <Calendar className="w-3 h-3" /> {daysGrowing === 0 ? "Planted today" : `${daysGrowing} days active`}
                          </span>
                          <span className="flex items-center gap-0.5 text-blue-600">
                            <Droplets className="w-3 h-3" /> Watered {hoursSinceWater < 1 ? "just now" : hoursSinceWater < 24 ? `${Math.floor(hoursSinceWater)}h ago` : `${Math.floor(hoursSinceWater/24)}d ago`}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Selected Crop Workspace (7 Columns) */}
        <div id="garden-details-column" className="lg:col-span-7">
          {activePlant && activePlantDetails ? (
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden flex flex-col justify-between h-full">
              
              {/* Header */}
              <div className="p-6 border-b border-stone-100 flex justify-between items-start bg-stone-50/30">
                <div>
                  <span className="text-[10px] font-bold text-stone-400 uppercase font-mono tracking-wider">Active Workspace</span>
                  <h3 className="text-3xl font-extrabold font-serif text-stone-800">{activePlant.nickname}</h3>
                  <p className="text-xs text-stone-500 italic">{activePlantDetails.name} ({activePlantDetails.scientificName})</p>
                </div>
                <button
                  id={`btn-remove-crop-${activePlant.id}`}
                  onClick={() => handleRemovePlant(activePlant.id)}
                  className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  title="Remove plant"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Workspace Body */}
              <div className="p-6 space-y-6 flex-1">
                {/* Immediate Quick Actions */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 font-mono">Immediate Care Operations</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      id={`btn-water-${activePlant.id}`}
                      onClick={() => handleWater(activePlant.id)}
                      className="p-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 text-emerald-800 rounded-xl flex items-center justify-center gap-2 font-semibold text-xs shadow-sm transition"
                    >
                      <Droplets className="w-4 h-4 text-blue-500" />
                      Water (+15 pts)
                    </button>

                    <button
                      id={`btn-toggle-note-${activePlant.id}`}
                      onClick={() => setShowNoteForm(!showNoteForm)}
                      className="p-3 bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 rounded-xl flex items-center justify-center gap-2 font-semibold text-xs shadow-sm transition"
                    >
                      <ClipboardList className="w-4 h-4 text-stone-500" />
                      Log Diary (+10 pts)
                    </button>

                    <button
                      id={`btn-harvest-${activePlant.id}`}
                      onClick={() => handleHarvest(activePlant.id)}
                      className="p-3 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 rounded-xl flex items-center justify-center gap-2 font-semibold text-xs shadow-sm transition"
                    >
                      <CheckCircle2 className="w-4 h-4 text-amber-600" />
                      Harvest (+100 pts)
                    </button>
                  </div>
                </div>

                {/* Log observation form */}
                {showNoteForm && (
                  <form onSubmit={(e) => handleAddNote(e, activePlant.id)} className="p-4 border border-stone-100 bg-stone-50/50 rounded-xl space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-stone-500 uppercase font-mono" htmlFor="diary-note-input">
                        Observation Note
                      </label>
                      <input
                        id="diary-note-input"
                        type="text"
                        placeholder="e.g. First flower buds emerged today! Soil feels loose and moist."
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        className="w-full px-4 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white text-stone-800"
                        required
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        id="btn-cancel-note"
                        type="button"
                        onClick={() => setShowNoteForm(false)}
                        className="px-3 py-1.5 text-stone-500 hover:text-stone-700 text-xs font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        id="btn-save-note"
                        type="submit"
                        className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-stone-50 text-xs font-semibold rounded-lg shadow-sm"
                      >
                        Save Entry
                      </button>
                    </div>
                  </form>
                )}

                {/* Quick Care Needs specs */}
                <div className="grid grid-cols-3 gap-4 border border-stone-100 p-3 rounded-xl bg-stone-50/30 text-xs text-stone-600">
                  <div>
                    <span className="text-[10px] font-bold text-stone-400 block font-mono">Sun</span>
                    <strong>{activePlantDetails.sunlight} sunlight</strong>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-stone-400 block font-mono">Water</span>
                    <strong>{activePlantDetails.water} moisture</strong>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-stone-400 block font-mono">Difficulty</span>
                    <strong className="capitalize">{activePlantDetails.difficulty}</strong>
                  </div>
                </div>

                {/* Journal logs & Timeline */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 font-mono flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
                    Crop History Log
                  </h4>
                  <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                    {activePlant.notes.length === 0 ? (
                      <p className="text-xs text-stone-400 italic">No operations recorded yet. Water your plant or add a status note to start logging history!</p>
                    ) : (
                      activePlant.notes.map((note, idx) => (
                        <div key={idx} className="text-xs bg-stone-50/60 p-3 rounded-lg border border-stone-100/50 flex items-start gap-2.5">
                          <span className="text-emerald-700 mt-0.5 shrink-0 font-mono">•</span>
                          <p className="text-stone-600 leading-normal">{note}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Instructions hint */}
              <div className="p-4 bg-stone-50 border-t border-stone-100 text-[11px] text-stone-500 leading-relaxed flex gap-2">
                <AlertCircle className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
                <span>
                  Tip: Tomatoes need constant moisture but should never sit in puddle-like water. Check soil moisture daily.
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-stone-100 p-12 text-center text-stone-400 shadow-sm flex flex-col justify-center items-center h-full min-h-[350px]">
              <ClipboardList className="w-12 h-12 text-stone-300 mb-3" />
              <h4 className="font-bold text-stone-700 text-sm mb-1">Select a Crop Workspace</h4>
              <p className="text-xs text-stone-400 max-w-sm leading-relaxed">
                Choose any active crop from your left roster. In the workspace, you can water the soil, log visual growth observations, and trigger harvest events to gain level achievements.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
