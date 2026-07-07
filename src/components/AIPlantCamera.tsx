import React, { useState, useRef, useEffect } from "react";
import { Camera, Upload, RefreshCw, Check, Sparkles, AlertCircle, BookmarkPlus, Sun, Droplets, Info } from "lucide-react";
import { Plant } from "../types";

interface AIPlantCameraProps {
  onAddCustomPlant: (plant: Plant, nickname: string) => void;
}

export default function AIPlantCamera({ onAddCustomPlant }: AIPlantCameraProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<Plant | null>(null);
  const [aiError, setAiError] = useState<string>("");
  
  // Custom nickname for adding identified plant
  const [nickname, setNickname] = useState<string>("");
  const [isAdded, setIsAdded] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Initialize and clean up WebRTC Camera stream
  const startCamera = async () => {
    setCameraError("");
    setCameraActive(true);
    setAnalysisResult(null);
    setAiError("");
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }, // prefer rear camera
        audio: false
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch(err => console.error("Video play failed:", err));
      }
    } catch (err: any) {
      console.warn("Camera access failed, falling back to upload:", err);
      setCameraError("Unable to access local camera device. Please use file upload below instead!");
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  };

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // Capture image from video frame
  const capturePhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg");
        setSelectedImage(dataUrl);
        stopCamera();
      }
    }
  };

  // Handle Drag & Drop / File Uploads
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      convertToBase64(file);
    }
  };

  const convertToBase64 = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result as string);
      setAnalysisResult(null);
      setAiError("");
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      convertToBase64(file);
    }
  };

  // Submit base64 image to server backend
  const identifyPlantWithAI = async () => {
    if (!selectedImage) return;

    setAnalyzing(true);
    setAiError("");
    setAnalysisResult(null);
    setIsAdded(false);

    try {
      const response = await fetch("/api/identify-plant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ image: selectedImage })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to classify plant. Please try again.");
      }

      if (data.error) {
        setAiError(data.error);
      } else {
        // Build custom unique ID
        const customPlant: Plant = {
          id: `custom-${Date.now()}`,
          name: data.name,
          scientificName: data.scientificName || "Unknown species",
          description: data.description || "Identified vegetable/plant.",
          sunlight: data.sunlight || "Medium",
          water: data.water || "Medium",
          difficulty: data.difficulty || "Easy",
          soil: data.soil || "Well-draining garden soil",
          instructions: data.instructions || [
            "Provide balanced watering once soil dries out.",
            "Keep in a sunny or partially shaded windowsill.",
            "Check regularly for standard pest or moisture issues."
          ],
          funFact: data.funFact || "A newly added custom specimen to your growing garden diary.",
          category: "vegetable", // Default category
          image: selectedImage // Use captured photo as visual representation
        };
        setAnalysisResult(customPlant);
        setNickname(`My ${customPlant.name}`);
      }
    } catch (err: any) {
      console.error("AI plant identification error:", err);
      setAiError(err.message || "An error occurred during plant identification. Please check your network or GEMINI_API_KEY settings.");
    } finally {
      setAnalyzing(false);
    }
  };

  // Save identified plant in Personal Garden
  const handleAddToMyGarden = () => {
    if (analysisResult) {
      const finalNickname = nickname.trim() || `My ${analysisResult.name}`;
      onAddCustomPlant(analysisResult, finalNickname);
      setIsAdded(true);
    }
  };

  const resetScanner = () => {
    setSelectedImage(null);
    setAnalysisResult(null);
    setAiError("");
    setIsAdded(false);
    setNickname("");
  };

  return (
    <div id="ai-camera-wrapper" className="space-y-6">
      {/* Overview Block */}
      <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm">
        <h2 className="text-2xl font-extrabold font-serif text-stone-800 flex items-center gap-2">
          <Camera className="text-emerald-600 w-6 h-6" />
          AI Plant Scan & Diagnostic Camera
        </h2>
        <p className="text-sm text-stone-500">
          Unsure what crop you have or need immediate care advice? Capture a snapshot of any home plant, vegetable, or herb, and our Gemini-powered AI buddy will identify its species and generate custom agricultural care plans.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive Camera & Upload Workspace (5 Columns) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-stone-100 shadow-sm flex flex-col items-center">
            
            {/* Live Camera Feed Screen */}
            {cameraActive && (
              <div className="relative w-full aspect-video sm:aspect-square bg-stone-900 rounded-xl overflow-hidden mb-4">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover scale-x-[-1]"
                  playsInline
                  muted
                />
                <div className="absolute inset-0 border-2 border-emerald-500/30 rounded-xl pointer-events-none"></div>
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 px-4">
                  <button
                    id="btn-capture-photo"
                    onClick={capturePhoto}
                    className="px-4 py-2 bg-emerald-600 text-stone-50 font-semibold rounded-lg text-xs shadow hover:bg-emerald-700 transition"
                  >
                    Capture Photo
                  </button>
                  <button
                    id="btn-stop-camera"
                    onClick={stopCamera}
                    className="px-4 py-2 bg-stone-800 text-stone-300 font-semibold rounded-lg text-xs hover:bg-stone-700 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Selected Image Preview with Laser Scanner effect */}
            {selectedImage && !cameraActive && (
              <div className="relative w-full aspect-square bg-stone-100 rounded-xl overflow-hidden mb-4 border border-stone-200">
                <img
                  src={selectedImage}
                  alt="Captured plant preview"
                  className="w-full h-full object-cover"
                />
                
                {/* Laser Analysis Scanner Line */}
                {analyzing && (
                  <div className="absolute inset-0 bg-emerald-500/10 pointer-events-none">
                    <div className="w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_10px_#10b981] animate-[scan_2s_ease-in-out_infinite]"></div>
                  </div>
                )}

                <div className="absolute bottom-4 right-4 flex gap-2">
                  <button
                    id="btn-reset-preview"
                    onClick={resetScanner}
                    className="p-2 bg-stone-900/80 hover:bg-stone-900 text-stone-200 rounded-full shadow-lg transition"
                    title="Remove Photo"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Default Upload & Camera Selection Placeholder */}
            {!cameraActive && !selectedImage && (
              <div
                id="drop-area"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-square border-2 border-dashed border-stone-200 hover:border-emerald-500 rounded-xl flex flex-col items-center justify-center p-6 text-center cursor-pointer transition bg-stone-50/50 hover:bg-emerald-50/10 mb-4 group"
              >
                <div className="p-4 bg-emerald-50 rounded-full text-emerald-700 group-hover:scale-110 transition mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <h4 className="font-semibold text-stone-700 text-sm">Drag & Drop Plant Photo Here</h4>
                <p className="text-xs text-stone-400 max-w-xs mt-1">Accepts JPEG, PNG from your desktop, or click to pick files manually</p>
                
                <input
                  ref={fileInputRef}
                  id="plant-file-input"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            )}

            {/* Error banners */}
            {cameraError && (
              <div className="w-full p-3 bg-amber-50 text-amber-800 text-xs rounded-lg border border-amber-100 flex items-center gap-2 mb-4">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{cameraError}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="w-full flex flex-col gap-2">
              {!cameraActive && !selectedImage && (
                <button
                  id="btn-start-camera"
                  onClick={startCamera}
                  className="w-full py-2.5 bg-emerald-700 text-stone-50 font-semibold rounded-xl text-xs hover:bg-emerald-800 transition flex items-center justify-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  Use Device Camera
                </button>
              )}

              {selectedImage && !analyzing && !analysisResult && (
                <button
                  id="btn-analyze-image"
                  onClick={identifyPlantWithAI}
                  className="w-full py-2.5 bg-emerald-700 text-stone-50 font-semibold rounded-xl text-xs hover:bg-emerald-800 transition flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Identify Plant Species
                </button>
              )}

              {analyzing && (
                <button
                  id="btn-analyzing-loader"
                  disabled
                  className="w-full py-2.5 bg-emerald-700/50 text-stone-100 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 cursor-not-allowed"
                >
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Analyzing features...
                </button>
              )}
            </div>
          </div>
        </div>

        {/* AI Results & Diagnoses (7 Columns) */}
        <div id="ai-results-column" className="lg:col-span-7">
          {analysisResult ? (
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden flex flex-col justify-between h-full">
              {/* Result Title */}
              <div className="p-6 border-b border-stone-100 bg-emerald-50/20">
                <div className="flex items-center gap-2 mb-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-700 animate-bounce" />
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 font-mono">
                    AI Diagnosis Successful
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold font-serif text-stone-800 leading-tight">{analysisResult.name}</h3>
                <p className="text-xs italic text-stone-500">{analysisResult.scientificName}</p>
              </div>

              {/* Result Details */}
              <div className="p-6 space-y-6 flex-1">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 font-mono mb-1">AI Botanical Description</h4>
                  <p className="text-stone-600 text-sm leading-relaxed">{analysisResult.description}</p>
                </div>

                {/* Attributes */}
                <div className="grid grid-cols-3 gap-4 p-4 bg-stone-50 rounded-xl border border-stone-100">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-stone-400 uppercase font-mono">Sunlight</span>
                    <div className="flex items-center gap-1 text-stone-800 font-semibold text-xs">
                      <Sun className="w-3.5 h-3.5 text-amber-500" />
                      <span>{analysisResult.sunlight} Sun</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-stone-400 uppercase font-mono">Watering</span>
                    <div className="flex items-center gap-1 text-stone-800 font-semibold text-xs">
                      <Droplets className="w-3.5 h-3.5 text-blue-500" />
                      <span>{analysisResult.water} Water</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-stone-400 uppercase font-mono">Difficulty</span>
                    <div className="flex items-center gap-1 text-stone-800 font-semibold text-xs capitalize">
                      <Info className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{analysisResult.difficulty}</span>
                    </div>
                  </div>
                </div>

                {/* Soil advice */}
                <div className="p-3 bg-emerald-50/20 border border-emerald-100 rounded-xl text-xs text-stone-700 leading-relaxed">
                  <strong className="text-emerald-900 font-bold block mb-0.5 font-mono uppercase text-[10px]">Recommended Soil Complex:</strong>
                  {analysisResult.soil}
                </div>

                {/* Grow Steps */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 font-mono mb-1">Tailored Planting Guidelines</h4>
                  <div className="space-y-2">
                    {analysisResult.instructions.map((step, idx) => (
                      <div key={idx} className="flex gap-2 text-xs text-stone-600 items-start">
                        <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold font-mono text-[10px] mt-0.5 shrink-0">
                          {idx + 1}
                        </span>
                        <p className="leading-normal">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Fun Fact */}
                <div className="bg-amber-50/50 p-3.5 rounded-xl border border-amber-100">
                  <h5 className="text-[10px] font-bold text-amber-900 uppercase font-mono mb-0.5">Fascinating Fact</h5>
                  <p className="text-xs text-amber-800 leading-normal">{analysisResult.funFact}</p>
                </div>
              </div>

              {/* Add to Garden controls */}
              <div className="border-t border-stone-100 p-6 bg-stone-50/50 flex flex-col sm:flex-row items-center gap-4">
                <div className="flex-1 w-full space-y-1">
                  <label className="text-[10px] font-bold text-stone-500 uppercase font-mono" htmlFor="custom-nickname-input">
                    Give this specimen a nickname
                  </label>
                  <input
                    id="custom-nickname-input"
                    type="text"
                    placeholder={`e.g. Charlie the ${analysisResult.name}`}
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    disabled={isAdded}
                    className="w-full px-4 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white text-stone-800 disabled:bg-stone-100 disabled:text-stone-400"
                  />
                </div>
                <button
                  id="btn-add-custom-garden"
                  onClick={handleAddToMyGarden}
                  disabled={isAdded}
                  className={`w-full sm:w-auto px-5 py-2.5 font-semibold rounded-xl text-xs shadow-sm transition flex items-center justify-center gap-1.5 ${
                    isAdded
                      ? "bg-emerald-600 text-stone-50 cursor-default"
                      : "bg-emerald-700 text-stone-50 hover:bg-emerald-800"
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-4 h-4" /> Added to Garden
                    </>
                  ) : (
                    <>
                      <BookmarkPlus className="w-4 h-4" /> Add to My Garden
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : aiError ? (
            <div className="bg-white rounded-2xl border border-red-100 p-8 text-center text-red-800 shadow-sm flex flex-col justify-center items-center h-full">
              <AlertCircle className="w-12 h-12 text-red-400 mb-3" />
              <h4 className="font-bold text-base mb-1">AI Scan Issue</h4>
              <p className="text-xs text-stone-500 max-w-sm mb-4 leading-relaxed">{aiError}</p>
              <button
                id="btn-ai-try-again"
                onClick={resetScanner}
                className="px-4 py-1.5 bg-stone-100 text-stone-700 rounded-lg text-xs font-semibold hover:bg-stone-200 transition"
              >
                Reset & Try Another Photo
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-stone-100 p-12 text-center text-stone-400 shadow-sm flex flex-col justify-center items-center h-full min-h-[300px]">
              <div className="p-4 bg-stone-50 rounded-full mb-3 text-stone-300">
                <Sparkles className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-stone-700 text-sm mb-1">Diagnostic Ready</h4>
              <p className="text-xs text-stone-400 max-w-sm leading-relaxed">
                Snapshot a live plant or drag an image into the scanner slot. Once analyzed, full soil specifications, watering ratios, and custom botanical guides will appear here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
