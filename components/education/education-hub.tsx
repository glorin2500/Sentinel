"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    BookOpen, Award, Brain, TrendingUp, Star,
    ChevronRight, CheckCircle, Lock
} from "lucide-react";
import {
    EDUCATIONAL_TIPS,
    FRAUD_PATTERNS,
    SAFETY_QUIZ,
    getTipOfTheDay,
    calculateKnowledgeScore
} from "@/lib/education/education-service";
import { useSentinelStore } from "@/lib/store";

export function EducationHub() {
    const [selectedTip, setSelectedTip] = useState<string | null>(null);
    const [currentQuiz, setCurrentQuiz] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [showExplanation, setShowExplanation] = useState(false);
    const { addXP } = useSentinelStore();

    const tipOfDay = getTipOfTheDay();
    const quiz = SAFETY_QUIZ[currentQuiz];

    const handleQuizAnswer = (answerIndex: number) => {
        setSelectedAnswer(answerIndex);
        setShowExplanation(true);

        if (answerIndex === quiz.correctAnswer) {
            addXP(quiz.xpReward);
        }
    };

    const nextQuiz = () => {
        setCurrentQuiz((prev) => (prev + 1) % SAFETY_QUIZ.length);
        setSelectedAnswer(null);
        setShowExplanation(false);
    };

    return (
        <div className="space-y-6">
            {/* Tip of the Day */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10"
            >
                <div className="flex items-center gap-2 mb-4">
                    <Star size={20} className="text-primary fill-primary" />
                    <h3 className="text-lg font-black text-white">Tip of the Day</h3>
                </div>

                <div className="flex items-start gap-4">
                    <span className="text-4xl">{tipOfDay.icon}</span>
                    <div className="flex-1">
                        <h4 className="text-base font-black text-white mb-2">
                            {tipOfDay.title}
                        </h4>
                        <p className="text-sm text-zinc-400 mb-3">
                            {tipOfDay.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-zinc-500">
                            <span>📖 {tipOfDay.readTime} min read</span>
                            <span className={`px-2 py-1 rounded-md ${tipOfDay.priority === 'high'
                                    ? 'bg-destructive/20 text-destructive'
                                    : 'bg-white/10 text-zinc-400'
                                }`}>
                                {tipOfDay.priority} priority
                            </span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Safety Quiz */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-6 rounded-3xl border border-white/10 bg-white/[0.02]"
            >
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Brain size={20} className="text-primary" />
                        <h3 className="text-lg font-black text-white">Safety Quiz</h3>
                    </div>
                    <span className="text-xs font-bold text-zinc-500">
                        {currentQuiz + 1}/{SAFETY_QUIZ.length}
                    </span>
                </div>

                <div className="space-y-4">
                    <p className="text-sm text-white font-medium leading-relaxed">
                        {quiz.question}
                    </p>

                    <div className="space-y-2">
                        {quiz.options.map((option, index) => {
                            const isSelected = selectedAnswer === index;
                            const isCorrect = index === quiz.correctAnswer;
                            const showResult = showExplanation;

                            return (
                                <button
                                    key={index}
                                    onClick={() => !showExplanation && handleQuizAnswer(index)}
                                    disabled={showExplanation}
                                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${showResult && isCorrect
                                            ? 'border-primary bg-primary/10'
                                            : showResult && isSelected && !isCorrect
                                                ? 'border-destructive bg-destructive/10'
                                                : isSelected
                                                    ? 'border-white/30 bg-white/10'
                                                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                                        } ${showExplanation ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-white">{option}</span>
                                        {showResult && isCorrect && (
                                            <CheckCircle size={16} className="text-primary" />
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {showExplanation && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`p-4 rounded-xl border ${selectedAnswer === quiz.correctAnswer
                                    ? 'bg-primary/5 border-primary/20'
                                    : 'bg-destructive/5 border-destructive/20'
                                }`}
                        >
                            <p className="text-sm text-white mb-2">
                                <strong>
                                    {selectedAnswer === quiz.correctAnswer ? '✓ Correct!' : '✗ Incorrect'}
                                </strong>
                            </p>
                            <p className="text-xs text-zinc-400 mb-3">
                                {quiz.explanation}
                            </p>
                            {selectedAnswer === quiz.correctAnswer && (
                                <div className="flex items-center gap-2 text-xs text-primary">
                                    <Award size={14} />
                                    <span>+{quiz.xpReward} XP earned!</span>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {showExplanation && (
                        <button
                            onClick={nextQuiz}
                            className="w-full py-3 rounded-xl bg-primary hover:bg-primary/90 text-background font-black uppercase text-sm tracking-wider transition-colors"
                        >
                            Next Question
                        </button>
                    )}
                </div>
            </motion.div>

            {/* Fraud Patterns */}
            <div className="space-y-3">
                <h3 className="text-lg font-black text-white">Common Scam Patterns</h3>

                {FRAUD_PATTERNS.map((pattern, index) => (
                    <motion.div
                        key={pattern.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + index * 0.1 }}
                        className="p-5 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/5 transition-all cursor-pointer"
                        onClick={() => setSelectedTip(selectedTip === pattern.id ? null : pattern.id)}
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <h4 className="text-sm font-black text-white">
                                        {pattern.name}
                                    </h4>
                                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase ${pattern.severity === 'critical'
                                            ? 'bg-destructive/20 text-destructive'
                                            : pattern.severity === 'high'
                                                ? 'bg-orange-500/20 text-orange-500'
                                                : 'bg-yellow-500/20 text-yellow-500'
                                        }`}>
                                        {pattern.severity}
                                    </span>
                                </div>
                                <p className="text-xs text-zinc-400">
                                    {pattern.description}
                                </p>
                            </div>
                            <ChevronRight
                                size={16}
                                className={`text-zinc-500 transition-transform ${selectedTip === pattern.id ? 'rotate-90' : ''
                                    }`}
                            />
                        </div>

                        {selectedTip === pattern.id && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-3 pt-3 border-t border-white/10"
                            >
                                <div>
                                    <p className="text-xs font-bold text-zinc-400 uppercase mb-2">
                                        How it Works
                                    </p>
                                    <p className="text-xs text-zinc-300 leading-relaxed">
                                        {pattern.howItWorks}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs font-bold text-zinc-400 uppercase mb-2">
                                        Warning Signs
                                    </p>
                                    <ul className="space-y-1">
                                        {pattern.warningSign.map((sign, i) => (
                                            <li key={i} className="text-xs text-zinc-300 flex items-start gap-2">
                                                <span className="text-destructive">•</span>
                                                {sign}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div>
                                    <p className="text-xs font-bold text-zinc-400 uppercase mb-2">
                                        How to Protect Yourself
                                    </p>
                                    <ul className="space-y-1">
                                        {pattern.prevention.map((tip, i) => (
                                            <li key={i} className="text-xs text-zinc-300 flex items-start gap-2">
                                                <span className="text-primary">✓</span>
                                                {tip}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                ))}
            </div>

            {/* All Tips */}
            <div className="space-y-3">
                <h3 className="text-lg font-black text-white">Security Tips</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {EDUCATIONAL_TIPS.map((tip, index) => (
                        <motion.div
                            key={tip.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/5 transition-all"
                        >
                            <div className="flex items-start gap-3">
                                <span className="text-2xl">{tip.icon}</span>
                                <div className="flex-1">
                                    <h4 className="text-sm font-black text-white mb-1">
                                        {tip.title}
                                    </h4>
                                    <p className="text-xs text-zinc-400 mb-2">
                                        {tip.description}
                                    </p>
                                    <span className="text-[10px] text-zinc-500">
                                        📖 {tip.readTime} min read
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
