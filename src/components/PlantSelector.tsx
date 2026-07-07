import React, { useState } from "react";
import { PRELOADED_PLANTS } from "../data";
import { Plant, UserPlant } from "../types";
import { Search, Compass, Sun, Droplets, Gauge, Calendar, BookmarkPlus, Sparkles, Check } from "lucide-react";

interface PlantSelectorProps {
  onAddPlant: (plant: Plant, nickname: string) => void;
  gardenPlantIds: string[];
}

export default function PlantSelector({ onAddPlant, gardenPlantIds }: PlantSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeDetailsId, setActiveDetailsId] = useState<string | null>("tomato");
  const [nicknameMap, setNicknameMap] = useState<Record<string, string>>({});
  const [plantingSuccess, setPlantingSuccess] = useState<Record<string, boolean>>({});

  const filteredPlants = PRELOADED_PLANTS.filter((plant) => {
    const matchesCategory = selectedCategory === "all" || plant.category === selectedCategory;
    const matchesSearch =
      plant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plant.scientificName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plant.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handlePlantIt = (plant: Plant) => {
    const nickname = nicknameMap[plant.id]?.trim() || `My ${plant.name}`;
    onAddPlant(plant, nickname);
    
    // Show quick visual feedback
    setPlantingSuccess((prev) => ({ ...prev, [plant.id]: true }));
    setNicknameMap((prev) => ({ ...prev, [plant.id]: "" }));

    setTimeout(() => {
      setPlantingSuccess((prev) => ({ ...prev, [plant.id]: false }));
    }, 2000);
  };

  const activePlant = PRELOADED_PLANTS.find((p) => p.id === activeDetailsId) || PRELOADED_PLANTS[0];

  return (
    <div id="plant-selector-wrapper" className="space-y-6">
      {/* Search and Filters Header */}
      <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold font-serif text-stone-800 flex items-center gap-2">
            <Compass className="text-emerald-600 w-6 h-6" />
            Plant Encyclopedia & Selector
          </h2>
          <p className="text-sm text-stone-500">Choose vegetables, fruits, and herbs to start growing in your home garden.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 max-w-lg w-full">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              id="plant-search-input"
              type="text"
              placeholder="Search tomatoes, mint, basil..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-stone-50/50 text-stone-800"
            />
          </div>
          <div className="flex gap-1 bg-stone-100 p-1 rounded-xl">
            {["all", "vegetable", "fruit", "herb"].map((cat) => (
              <button
                key={cat}
                id={`cat-filter-${cat}`}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                  selectedCategory === cat
                    ? "bg-emerald-700 text-stone-50 shadow-sm"
                    : "text-stone-500 hover:text-stone-800"
                }`}
              >
                {cat === "all" ? "All" : `${cat}s`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Catalog List (Left) and Detailed Care Guide (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Plant List (5 Columns on Large screens) */}
        <div id="plant-list-column" className="lg:col-span-5 space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
          {filteredPlants.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-stone-100 text-stone-400">
              <Compass className="w-8 h-8 mx-auto text-stone-300 mb-2" />
              <p className="text-sm">No plants found matching your search.</p>
            </div>
          ) : (
            filteredPlants.map((plant) => {
              const isSelected = plant.id === activeDetailsId;
              const alreadyPlanted = gardenPlantIds.includes(plant.id);

              return (
                <div
                  key={plant.id}
                  id={`plant-card-${plant.id}`}
                  onClick={() => setActiveDetailsId(plant.id)}
                  className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer flex gap-4 ${
                    isSelected
                      ? "bg-emerald-50/40 border-emerald-300 shadow-sm"
                      : "bg-white border-stone-100 hover:border-stone-200 hover:shadow-sm"
                  }`}
                >
                  <img
                    src={plant.image || "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&q=80&w=300"}
                    alt={plant.name}
                    referrerPolicy="no-referrer"
                    className="w-20 h-20 rounded-lg object-cover bg-stone-100 border border-stone-100 flex-shrink-0"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 font-mono bg-emerald-50 px-2 py-0.5 rounded">
                          {plant.category}
                        </span>
                        {alreadyPlanted && (
                          <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-100 px-1.5 py-0.5 rounded font-medium flex items-center gap-1">
                            <Check className="w-3 h-3" /> Growing
                          </span>
                        )}
                      </div>
                      <h3 className="font-serif font-bold text-stone-800 text-base mt-1">{plant.name}</h3>
                      <p className="text-xs italic text-stone-500 font-sans">{plant.scientificName}</p>
                    </div>

                    <div className="flex gap-3 text-[10px] text-stone-500 mt-2 font-mono">
                      <span className="flex items-center gap-1">
                        <Sun className="w-3 h-3 text-amber-500" /> {plant.sunlight} Sun
                      </span>
                      <span className="flex items-center gap-1">
                        <Droplets className="w-3 h-3 text-blue-500" /> {plant.water} Water
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Plant Details & Planting Workspace (7 Columns) */}
        <div id="plant-details-column" className="lg:col-span-7">
          {activePlant ? (
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden flex flex-col h-full justify-between">
              {/* Header Image with Info Overlay */}
              <div className="relative h-48 sm:h-60 bg-stone-100 overflow-hidden">
                <img
                  src={activePlant.image}
                  alt={activePlant.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-stone-900/40 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4 text-stone-100">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs bg-emerald-600 px-2.5 py-0.5 rounded-full font-semibold uppercase text-stone-50">
                      {activePlant.category}
                    </span>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold uppercase ${
                      activePlant.difficulty === "Easy" ? "bg-emerald-500/80 text-stone-50" :
                      activePlant.difficulty === "Medium" ? "bg-amber-500/80 text-stone-50" : "bg-red-500/80 text-stone-50"
                    }`}>
                      {activePlant.difficulty} Care
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold font-serif tracking-tight text-white">{activePlant.name}</h2>
                  <p className="text-xs sm:text-sm italic text-stone-300">{activePlant.scientificName}</p>
                </div>
              </div>

              {/* Content Body */}
              <div className="p-6 space-y-6 flex-1">
                {/* Description */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 font-mono mb-1">Overview</h4>
                  <p className="text-stone-600 text-sm leading-relaxed">{activePlant.description}</p>
                </div>

                {/* Key Attributes */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-stone-50 rounded-xl border border-stone-100">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-stone-400 uppercase font-mono">Sunlight Needs</span>
                    <div className="flex items-center gap-1.5 text-stone-800 font-semibold text-sm">
                      <Sun className="w-4 h-4 text-amber-500" />
                      <span>{activePlant.sunlight} Sunlight</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-stone-400 uppercase font-mono">Water Frequency</span>
                    <div className="flex items-center gap-1.5 text-stone-800 font-semibold text-sm">
                      <Droplets className="w-4 h-4 text-blue-500" />
                      <span>{activePlant.water} Moisture</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-stone-400 uppercase font-mono">Growing Difficulty</span>
                    <div className="flex items-center gap-1.5 text-stone-800 font-semibold text-sm">
                      <Gauge className="w-4 h-4 text-emerald-600" />
                      <span>{activePlant.difficulty}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-stone-400 uppercase font-mono">Recommended Soil</span>
                    <div className="text-stone-700 font-semibold text-xs leading-snug line-clamp-2">
                      {activePlant.soil.split(" ")[0]} {activePlant.soil.split(" ")[1] || "Well-draining"}
                    </div>
                  </div>
                </div>

                {/* Grow Instructions */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 font-mono">Step-by-Step Growing Guide</h4>
                  <div className="space-y-2">
                    {activePlant.instructions.map((step, idx) => (
                      <div key={idx} className="flex gap-3 text-sm text-stone-600 items-start">
                        <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold font-mono text-xs mt-0.5 shrink-0">
                          {idx + 1}
                        </span>
                        <p className="leading-relaxed">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Trivia Box */}
                <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100 flex gap-3">
                  <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-amber-900 uppercase font-mono mb-1">Did You Know?</h5>
                    <p className="text-xs text-amber-800 leading-relaxed">{activePlant.funFact}</p>
                  </div>
                </div>
              </div>

              {/* Plant It Interaction Drawer */}
              <div className="border-t border-stone-100 p-6 bg-stone-50/50 flex flex-col sm:flex-row items-center gap-4">
                <div className="flex-1 w-full space-y-1">
                  <label className="text-[11px] font-bold text-stone-500 uppercase font-mono" htmlFor={`nickname-${activePlant.id}`}>
                    Give it a personal nickname (optional)
                  </label>
                  <input
                    id={`nickname-${activePlant.id}`}
                    type="text"
                    placeholder={`e.g. Patty the ${activePlant.name}`}
                    value={nicknameMap[activePlant.id] || ""}
                    onChange={(e) => setNicknameMap({ ...nicknameMap, [activePlant.id]: e.target.value })}
                    className="w-full px-4 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white text-stone-800"
                  />
                </div>
                <button
                  id={`btn-add-garden-${activePlant.id}`}
                  onClick={() => handlePlantIt(activePlant)}
                  className={`w-full sm:w-auto px-6 py-3 font-semibold rounded-xl text-sm shadow-sm transition-all flex items-center justify-center gap-2 shrink-0 ${
                    plantingSuccess[activePlant.id]
                      ? "bg-emerald-600 text-stone-50 scale-95"
                      : "bg-emerald-700 text-stone-50 hover:bg-emerald-800 active:bg-emerald-900"
                  }`}
                >
                  {plantingSuccess[activePlant.id] ? (
                    <>
                      <Check className="w-4 h-4 animate-bounce" />
                      Planted Successfully!
                    </>
                  ) : (
                    <>
                      <BookmarkPlus className="w-4 h-4" />
                      Plant in My Garden
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-stone-100 p-12 text-center text-stone-400 shadow-sm flex flex-col justify-center items-center h-full">
              <Compass className="w-12 h-12 text-stone-300 animate-spin mb-3" />
              <p>Select a plant from the catalog to inspect detailed home agricultural guidelines and manage its growing loop.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
