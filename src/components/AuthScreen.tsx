import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Sprout, LogIn, UserPlus, Leaf, Sparkles, Trophy } from "lucide-react";
import { User } from "../types";

interface AuthScreenProps {
  onLoginSuccess: (user: User) => void;
}

export default function AuthScreen({ onLoginSuccess }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [displayName, setDisplayName] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dbStatus, setDbStatus] = useState<{ mongoConfigured: boolean; message?: string; error?: string } | null>(null);

  useEffect(() => {
    fetch("/api/auth/status")
      .then((res) => res.json())
      .then((data) => setDbStatus(data))
      .catch((err) => {
        console.error("Failed to check auth db status:", err);
        setDbStatus({ mongoConfigured: false, error: "Unable to contact auth server" });
      });
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!username.trim() || !password.trim()) {
      setError("Please fill in all credentials.");
      return;
    }

    const cleanUsername = username.trim().toLowerCase();
    setIsLoading(true);

    try {
      // If MongoDB is configured, use the MongoDB endpoints
      if (dbStatus?.mongoConfigured) {
        if (isLogin) {
          const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: cleanUsername, password }),
          });
          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.error || "Login failed");
          }
          setSuccess("Welcome back! Logged in with MongoDB.");
          setTimeout(() => {
            onLoginSuccess(data.profile);
          }, 1000);
        } else {
          if (!displayName.trim()) {
            setError("Please enter a display name.");
            setIsLoading(false);
            return;
          }
          const response = await fetch("/api/auth/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: cleanUsername, password, displayName: displayName.trim() }),
          });
          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.error || "Sign up failed");
          }
          setSuccess("Account created successfully with MongoDB! Logging you in...");
          setTimeout(() => {
            onLoginSuccess(data.profile);
          }, 1000);
        }
      } else {
        // Fallback to local storage
        const usersJson = localStorage.getItem("gardening_buddy_users");
        const users: Record<string, { passwordHash: string; profile: User }> = usersJson
          ? JSON.parse(usersJson)
          : {};

        if (isLogin) {
          const userRecord = users[cleanUsername];
          if (!userRecord || userRecord.passwordHash !== password) {
            setError("Invalid username or password. If you are new, try signing up!");
            setIsLoading(false);
            return;
          }
          setSuccess("Welcome back! Logging in offline...");
          setTimeout(() => {
            onLoginSuccess(userRecord.profile);
          }, 1000);
        } else {
          if (!displayName.trim()) {
            setError("Please enter a display name.");
            setIsLoading(false);
            return;
          }
          if (users[cleanUsername]) {
            setError("Username already exists. Please choose another one.");
            setIsLoading(false);
            return;
          }

          const newProfile: User = {
            username: cleanUsername,
            displayName: displayName.trim(),
            gardeningPoints: 0,
            quizHighScore: 0,
            myGarden: [],
            badges: ["Seed Sower"]
          };

          users[cleanUsername] = {
            passwordHash: password,
            profile: newProfile
          };

          localStorage.setItem("gardening_buddy_users", JSON.stringify(users));
          setSuccess("Account created successfully (offline)! Logging you in...");
          setTimeout(() => {
            onLoginSuccess(newProfile);
          }, 1000);
        }
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsGuest = () => {
    const guestProfile: User = {
      username: "guest",
      displayName: "Guest Gardener",
      gardeningPoints: 10,
      quizHighScore: 0,
      myGarden: [
        {
          id: "guest-mint",
          plantId: "mint",
          nickname: "My Desk Mint",
          plantedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          lastWateredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          lastCheckedAt: new Date().toISOString(),
          status: "Healthy",
          notes: ["Planted inside a nice terracotta pot.", "Placed near the kitchen window for mild sunlight."]
        }
      ],
      badges: ["Seed Sower"]
    };
    onLoginSuccess(guestProfile);
  };

  return (
    <div id="auth-screen-container" className="flex flex-col lg:flex-row min-h-[85vh] bg-stone-50 rounded-3xl overflow-hidden shadow-md border border-stone-200">
      {/* Brand & Theme Panel */}
      <div id="auth-banner" className="lg:w-1/2 bg-emerald-800 text-stone-100 p-8 lg:p-16 flex flex-col justify-between relative overflow-hidden">
        {/* Background Decorative Circles */}
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-emerald-700/40 blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-amber-700/20 blur-3xl pointer-events-none"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-emerald-100 rounded-xl text-emerald-800 shadow-sm">
              <Sprout className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight font-serif text-stone-50">Gardening Buddy</span>
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-extrabold font-serif text-stone-50 tracking-tight leading-tight mb-6">
            Grow your own <br />
            <span className="text-emerald-300">fresh food</span> at home.
          </h1>
          <p className="text-stone-200/90 text-sm sm:text-base leading-relaxed max-w-md mb-8 font-sans">
            Your personal digital garden companion. Identify plants using AI, learn watering schedules, challenge your knowledge with interactive soil quizzes, and track your harvest progress step-by-step.
          </p>
        </div>

        <div className="relative z-10 space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-1.5 bg-emerald-700/80 rounded-lg mt-1 shrink-0">
              <Leaf className="w-4 h-4 text-emerald-100" />
            </div>
            <div>
              <p className="font-bold text-sm text-stone-100 font-sans">Smart AI Plant Identifier</p>
              <p className="text-xs text-stone-300">Snapshot leaves or stems to immediately extract professional agricultural care guidelines.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-1.5 bg-emerald-700/80 rounded-lg mt-1 shrink-0">
              <Trophy className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <p className="font-bold text-sm text-stone-100 font-sans">Educational Quiz & Progression</p>
              <p className="text-xs text-stone-300">Earn certificates, accumulate garden points, unlock gardening achievements, and level up.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Login / Sign Up Form Panel */}
      <div id="auth-form-panel" className="lg:w-1/2 p-8 lg:p-16 flex flex-col justify-center bg-white">
        <div className="max-w-md mx-auto w-full">
          {dbStatus && (
            <div className={`mb-6 p-3.5 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-all ${
              dbStatus.mongoConfigured 
                ? "bg-emerald-50/50 border-emerald-100 text-emerald-800" 
                : "bg-amber-50/50 border-amber-200/60 text-amber-900"
            }`}>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full shrink-0 ${dbStatus.mongoConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
                <div>
                  <p className="font-bold">
                    {dbStatus.mongoConfigured ? "MongoDB Cloud Connected" : "Local Database Mode"}
                  </p>
                  <p className="text-[10px] text-stone-500 mt-0.5">
                    {dbStatus.mongoConfigured 
                      ? "Your garden is safe in the cloud." 
                      : "Please set MONGODB_URI in secrets to enable cloud sync."}
                  </p>
                </div>
              </div>
              <span className="text-[9px] px-2 py-0.5 rounded bg-white/80 border border-stone-200/50 text-stone-500 font-mono self-start sm:self-center">
                {dbStatus.mongoConfigured ? "LIVE SYNC" : "OFFLINE PERSISTENCE"}
              </span>
            </div>
          )}

          <div className="flex gap-4 border-b border-stone-200 pb-4 mb-8">
            <button
              id="auth-tab-login"
              onClick={() => {
                setIsLogin(true);
                setError("");
                setSuccess("");
              }}
              className={`pb-2 text-lg font-semibold relative transition-colors ${
                isLogin ? "text-emerald-800" : "text-stone-400 hover:text-stone-600"
              }`}
            >
              Log In
              {isLogin && (
                <motion.div
                  layoutId="auth-tab-underline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600"
                />
              )}
            </button>
            <button
              id="auth-tab-signup"
              onClick={() => {
                setIsLogin(false);
                setError("");
                setSuccess("");
              }}
              className={`pb-2 text-lg font-semibold relative transition-colors ${
                !isLogin ? "text-emerald-800" : "text-stone-400 hover:text-stone-600"
              }`}
            >
              Sign Up
              {!isLogin && (
                <motion.div
                  layoutId="auth-tab-underline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600"
                />
              )}
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-sm font-medium text-stone-600" htmlFor="displayName">
                  Your Full Name / Nickname
                </label>
                <input
                  id="displayName"
                  type="text"
                  placeholder="e.g. Grandma Shirley"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-stone-800 transition-all bg-stone-50/50"
                  required={!isLogin}
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-sm font-medium text-stone-600" htmlFor="username">
                Username
              </label>
              <input
                id="username"
                type="text"
                placeholder="Enter a unique handle"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-stone-800 transition-all bg-stone-50/50"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-stone-600" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-stone-800 transition-all bg-stone-50/50"
                required
              />
            </div>

            {error && (
              <div id="auth-error-msg" className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0"></span>
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div id="auth-success-msg" className="p-3 bg-emerald-50 text-emerald-700 text-sm rounded-lg border border-emerald-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <button
              id="auth-submit-btn"
              type="submit"
              className="w-full py-3 bg-emerald-700 text-stone-50 font-semibold rounded-xl shadow-sm hover:bg-emerald-800 active:bg-emerald-900 transition-colors flex items-center justify-center gap-2 mt-2"
            >
              {isLogin ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
              {isLogin ? "Sign In to Garden" : "Create My Garden Account"}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-stone-400">Or want to try it out first?</span>
            </div>
          </div>

          <button
            id="auth-guest-btn"
            onClick={loginAsGuest}
            className="w-full py-3 border border-stone-200 text-stone-600 font-medium rounded-xl hover:bg-stone-50 transition-colors flex items-center justify-center gap-2"
          >
            <Leaf className="w-4 h-4 text-stone-500" />
            Continue as Guest (Offline)
          </button>
        </div>
      </div>
    </div>
  );
}
