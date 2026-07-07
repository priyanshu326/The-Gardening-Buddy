import React, { useState } from "react";
import { QUIZ_QUESTIONS } from "../data";
import { User } from "../types";
import { Award, CheckCircle2, XCircle, ArrowRight, RefreshCw, HelpCircle, Trophy, Sparkles } from "lucide-react";

interface GardeningQuizProps {
  user: User;
  onUpdateUser: (updatedUser: User) => void;
}

export default function GardeningQuiz({ user, onUpdateUser }: GardeningQuizProps) {
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answered, setAnswered] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [quizFinished, setQuizFinished] = useState<boolean>(false);
  const [savedToProfile, setSavedToProfile] = useState<boolean>(false);

  const currentQuestion = QUIZ_QUESTIONS[currentIdx];

  const handleOptionClick = (optionIdx: number) => {
    if (answered) return;
    setSelectedOption(optionIdx);
    setAnswered(true);

    if (optionIdx === currentQuestion.correctIndex) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIdx < QUIZ_QUESTIONS.length - 1) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOption(null);
      setAnswered(false);
    } else {
      setQuizFinished(true);
      saveQuizResults();
    }
  };

  const saveQuizResults = () => {
    // Each correct answer gives 15 gardening points
    const pointsEarned = score * 15;
    const isNewHighScore = score > user.quizHighScore;
    const finalHighScore = isNewHighScore ? score : user.quizHighScore;
    const finalPoints = user.gardeningPoints + pointsEarned;
    const updatedBadges = [...user.badges];

    // Award badges based on quiz feats
    if (score === QUIZ_QUESTIONS.length && !updatedBadges.includes("Soil Scientist")) {
      updatedBadges.push("Soil Scientist");
    }
    if (finalPoints >= 100 && !updatedBadges.includes("Sprout Tender")) {
      updatedBadges.push("Sprout Tender");
    }
    if (finalPoints >= 300 && !updatedBadges.includes("Flora Guardian")) {
      updatedBadges.push("Flora Guardian");
    }

    onUpdateUser({
      ...user,
      quizHighScore: finalHighScore,
      gardeningPoints: finalPoints,
      badges: updatedBadges
    });

    setSavedToProfile(true);
  };

  const restartQuiz = () => {
    setCurrentIdx(0);
    setSelectedOption(null);
    setAnswered(false);
    setScore(0);
    setQuizFinished(false);
    setSavedToProfile(false);
  };

  // Progress Bar percentage
  const progressPercent = ((currentIdx + (answered ? 1 : 0)) / QUIZ_QUESTIONS.length) * 100;

  return (
    <div id="gardening-quiz-wrapper" className="max-w-3xl mx-auto space-y-6">
      {/* Quiz Introduction Banner */}
      <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-extrabold font-serif text-stone-800 flex items-center gap-2">
            <HelpCircle className="text-emerald-600 w-6 h-6" />
            Gardening & Soil Diagnostic Quiz
          </h2>
          <p className="text-xs text-stone-500">
            Assess and solidify your knowledge of NPK ratios, optimal soil pH levels, compost hygiene, and plant hydration rules.
          </p>
        </div>
        <div className="bg-amber-50 border border-amber-100 px-4 py-2 rounded-xl text-center font-mono shrink-0">
          <span className="text-[10px] font-bold text-amber-800 uppercase block leading-none mb-1">Your Quiz Highscore</span>
          <strong className="text-lg text-amber-900">{user.quizHighScore} / {QUIZ_QUESTIONS.length}</strong>
        </div>
      </div>

      {/* Main Interactive Quiz Card */}
      {!quizFinished ? (
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden flex flex-col justify-between">
          {/* Progress Header */}
          <div className="bg-stone-50/50 p-4 border-b border-stone-100">
            <div className="flex justify-between items-center text-xs font-semibold text-stone-500 mb-2">
              <span>Question {currentIdx + 1} of {QUIZ_QUESTIONS.length}</span>
              <span className="font-mono">{Math.round(progressPercent)}% complete</span>
            </div>
            <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>

          {/* Question Body */}
          <div className="p-6 space-y-6">
            <h3 className="text-xl font-bold font-serif text-stone-800 leading-snug">
              {currentQuestion.question}
            </h3>

            {/* Answers options layout */}
            <div className="space-y-3">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = idx === currentQuestion.correctIndex;
                
                let optionStyle = "border-stone-200 hover:border-emerald-300 hover:bg-emerald-50/10";
                let icon = null;

                if (answered) {
                  if (isCorrect) {
                    optionStyle = "bg-emerald-50 border-emerald-400 text-emerald-900";
                    icon = <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />;
                  } else if (isSelected) {
                    optionStyle = "bg-red-50 border-red-300 text-red-900";
                    icon = <XCircle className="w-5 h-5 text-red-600 shrink-0" />;
                  } else {
                    optionStyle = "opacity-50 border-stone-200 text-stone-400";
                  }
                } else if (isSelected) {
                  optionStyle = "border-emerald-500 bg-emerald-50/30";
                }

                return (
                  <button
                    key={idx}
                    id={`quiz-option-${idx}`}
                    onClick={() => handleOptionClick(idx)}
                    disabled={answered}
                    className={`w-full p-4 rounded-xl border text-left text-sm font-semibold transition-all flex items-center justify-between gap-4 ${optionStyle} ${
                      !answered ? "cursor-pointer" : "cursor-default"
                    }`}
                  >
                    <span>{option}</span>
                    {icon}
                  </button>
                );
              })}
            </div>

            {/* Explanation box expands on answer submission */}
            {answered && (
              <div id="quiz-explanation-box" className="p-4 bg-emerald-50/20 border border-emerald-100 rounded-xl space-y-1.5 animate-fade-in">
                <span className="text-[10px] font-bold text-emerald-800 uppercase font-mono tracking-wider">
                  Educational Science Insight
                </span>
                <p className="text-xs text-stone-700 leading-relaxed">
                  {currentQuestion.explanation}
                </p>
              </div>
            )}
          </div>

          {/* Footer Navigation */}
          {answered && (
            <div className="border-t border-stone-100 p-4 bg-stone-50/50 flex justify-end">
              <button
                id="btn-quiz-next"
                onClick={handleNext}
                className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-stone-50 text-xs font-semibold rounded-xl shadow-sm transition flex items-center gap-1"
              >
                {currentIdx === QUIZ_QUESTIONS.length - 1 ? "Finish Quiz & View Score" : "Next Question"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        // Celebrating End Screen
        <div id="quiz-finished-card" className="bg-white rounded-2xl border border-stone-100 shadow-sm p-8 text-center space-y-6">
          <div className="p-4 bg-amber-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto text-amber-500 animate-bounce">
            <Trophy className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h3 className="text-3xl font-extrabold font-serif text-stone-800">Knowledge Diagnostic Finished!</h3>
            <p className="text-sm text-stone-500 max-w-sm mx-auto">
              You scored <strong className="text-emerald-700">{score} out of {QUIZ_QUESTIONS.length}</strong> correctly on soil and crop husbandry guidelines.
            </p>
          </div>

          {/* Points display */}
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-100 max-w-md mx-auto grid grid-cols-2 gap-4">
            <div className="text-center space-y-1 border-r border-stone-200">
              <span className="text-[10px] font-bold text-stone-400 uppercase font-mono">Gardening points earned</span>
              <strong className="text-xl text-emerald-700 font-mono">+{score * 15} pts</strong>
            </div>
            <div className="text-center space-y-1">
              <span className="text-[10px] font-bold text-stone-400 uppercase font-mono">Achievements awarded</span>
              <strong className="text-sm text-amber-800 font-sans block mt-1">
                {score === QUIZ_QUESTIONS.length ? "🏆 Soil Scientist" : "None"}
              </strong>
            </div>
          </div>

          {savedToProfile && (
            <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-100 flex items-center justify-center gap-1.5 max-w-xs mx-auto">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Results committed to profile successfully.</span>
            </div>
          )}

          <div className="flex justify-center gap-3 pt-2">
            <button
              id="btn-quiz-retry"
              onClick={restartQuiz}
              className="px-5 py-2.5 border border-stone-200 hover:bg-stone-50 text-stone-600 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition"
            >
              <RefreshCw className="w-4 h-4" />
              Retry Quiz
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
