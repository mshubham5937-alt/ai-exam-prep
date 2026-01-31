import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Bookmark, Sparkles, Brain, Zap, Droplet, Hash, Heart, Info, ChevronRight, Trophy } from 'lucide-react';
import SolutionModal from './SolutionModal';
import AITutorModal from './AITutorModal';
import { isBookmarked as checkBookmark, addBookmark, removeBookmark, saveMistake } from '../services/storage';

const QuestionCard = ({ question, isActive, onAnswered }) => {
    const [selectedOption, setSelectedOption] = useState(null);
    const [showSolution, setShowSolution] = useState(false);
    const [isTutorOpen, setIsTutorOpen] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(checkBookmark(question.id));

    useEffect(() => {
        setIsBookmarked(checkBookmark(question.id));
    }, [question.id]);

    if (!question) return null;

    const handleOptionClick = (index) => {
        if (selectedOption !== null) return;
        setSelectedOption(index);

        const isCorrect = index === question.correct;
        if (onAnswered) onAnswered(isCorrect);

        if (!isCorrect) {
            saveMistake(question, index);
        }
    };

    const handleSubmit = () => {
        if (selectedOption === null) return;
        setTimeout(() => setShowSolution(true), 300);
    };

    const toggleBookmark = () => {
        if (isBookmarked) {
            removeBookmark(question.id);
            setIsBookmarked(false);
        } else {
            addBookmark(question);
            setIsBookmarked(true);
        }
    };

    const isCorrect = selectedOption === question.correct;

    const getSubjectIcon = (subject) => {
        const lowerSub = subject.toLowerCase();
        if (lowerSub.includes('physics')) return Zap;
        if (lowerSub.includes('chemistry')) return Droplet;
        if (lowerSub.includes('maths') || lowerSub.includes('mathematics')) return Hash;
        if (lowerSub.includes('biology')) return Heart;
        return Info;
    };

    const SubjectIcon = getSubjectIcon(question.subject);

    const subjectColors = {
        Physics: '#A855F7',
        Chemistry: '#F59E0B',
        Maths: '#3B82F6',
        Biology: '#10B981'
    };
    const subjectColor = subjectColors[question.subject] || '#6366F1';

    return (
        <>
            <div className={`snap-item min-h-screen p-6 relative transition-opacity duration-500 flex flex-col justify-center ${isActive ? 'opacity-100' : 'opacity-40'}`}
                style={{ backgroundColor: '#0F1117' }}>

                {/* Decorative background blob */}
                <div
                    className="absolute -top-20 -right-20 w-80 h-80 rounded-full pointer-events-none transition-all duration-1000"
                    style={{
                        backgroundColor: subjectColor,
                        opacity: isActive ? 0.08 : 0.03,
                        filter: 'blur(80px)',
                        transform: isActive ? 'scale(1.1)' : 'scale(1)'
                    }}
                />

                <div className="relative z-10 w-full max-w-lg mx-auto space-y-8 transition-all duration-500"
                    style={{ transform: isActive ? 'translateY(0)' : 'translateY(20px)' }}>

                    {/* Header Chips */}
                    <div className="flex justify-between items-center">
                        <div className="flex gap-2">
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-lg backdrop-blur-md"
                                style={{
                                    backgroundColor: `${subjectColor}15`,
                                    borderColor: `${subjectColor}30`,
                                    color: subjectColor
                                }}>
                                <SubjectIcon className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ fontFamily: 'Nunito' }}>
                                    {question.subject}
                                </span>
                            </div>

                            {/* AI badge */}
                            {question.type === 'ai' && (
                                <span className="px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border flex items-center gap-1 backdrop-blur-md"
                                    style={{
                                        backgroundColor: 'rgba(99, 102, 241, 0.15)',
                                        borderColor: 'rgba(99, 102, 241, 0.3)',
                                        color: '#6366F1'
                                    }}>
                                    <Sparkles className="w-2.5 h-2.5" />
                                    Advanced AI
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Bookmark */}
                            <button onClick={toggleBookmark} className="p-1 transition-transform active:scale-90">
                                <Bookmark
                                    className="w-5 h-5"
                                    style={{ color: isBookmarked ? '#F59E0B' : '#9CA3AF' }}
                                    fill={isBookmarked ? '#F59E0B' : 'none'}
                                />
                            </button>
                            {/* Difficulty dots */}
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((level) => (
                                    <div
                                        key={level}
                                        className="w-1.5 h-1.5 rounded-full"
                                        style={{
                                            backgroundColor: level <= (question.level || 1) ? '#F59E0B' : '#252836'
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Question Content */}
                    <div className="space-y-6">
                        <h2 className="text-[22px] font-bold leading-relaxed text-slate-100" style={{ fontFamily: 'Nunito' }}>
                            {question.text}
                        </h2>

                        {/* Options */}
                        <div className="grid grid-cols-1 gap-3.5">
                            {question.options.map((option, idx) => {
                                let backgroundColor = 'rgba(255, 255, 255, 0.03)';
                                let borderColor = 'rgba(255, 255, 255, 0.08)';
                                let textColor = '#9CA3AF';

                                if (selectedOption !== null) {
                                    if (idx === question.correct) {
                                        backgroundColor = 'rgba(16, 185, 129, 0.15)';
                                        borderColor = '#10B981';
                                        textColor = '#10B981';
                                    } else if (idx === selectedOption && !isCorrect) {
                                        backgroundColor = 'rgba(239, 68, 68, 0.15)';
                                        borderColor = '#EF4444';
                                        textColor = '#EF4444';
                                    }
                                }

                                return (
                                    <button
                                        key={idx}
                                        onClick={() => handleOptionClick(idx)}
                                        disabled={selectedOption !== null}
                                        className="w-full p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between text-left group hover:scale-[0.99] active:scale-[0.98] backdrop-blur-sm"
                                        style={{
                                            backgroundColor,
                                            borderColor,
                                            color: textColor,
                                            fontFamily: 'Nunito'
                                        }}
                                    >
                                        <span className="flex-1 font-semibold text-base leading-snug pr-4">
                                            {option}
                                        </span>
                                        {selectedOption !== null && idx === question.correct && (
                                            <CheckCircle2 className="w-5 h-5 shrink-0 ml-2 animate-scale-in" style={{ color: '#10B981' }} />
                                        )}
                                        {selectedOption !== null && idx === selectedOption && idx !== question.correct && (
                                            <XCircle className="w-5 h-5 shrink-0 ml-2 animate-scale-in" style={{ color: '#EF4444' }} />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Control Actions */}
                    {selectedOption !== null && !showSolution && (
                        <div className="flex flex-col items-center gap-6 animate-slide-up pt-4">
                            <div className="px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 animate-bounce-subtle">
                                <Trophy className="w-3.5 h-3.5" />
                                {isCorrect ? "+10 XP Earned" : "Learn from this!"}
                            </div>

                            <button
                                onClick={handleSubmit}
                                className="w-full py-4 rounded-2xl font-extrabold text-white text-[17px] transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/20"
                                style={{
                                    backgroundColor: '#6366F1',
                                }}
                            >
                                Continue to Solution
                                <ChevronRight className="w-5 h-5" />
                            </button>

                            <button
                                onClick={() => setIsTutorOpen(true)}
                                className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-all hover:text-indigo-300 text-slate-400"
                            >
                                <Brain className="w-4 h-4" />
                                Deep Dive with AI Tutor
                            </button>
                        </div>
                    )}

                    {selectedOption === null && (
                        <div className="flex items-center justify-center pt-8 border-t border-white/5 opacity-50">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                <Info className="w-3 h-3" />
                                Select an option to proceed
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <SolutionModal
                isOpen={showSolution}
                onClose={() => setShowSolution(false)}
                solution={question.solution}
                isCorrect={isCorrect}
            />

            <AITutorModal
                isOpen={isTutorOpen}
                onClose={() => setIsTutorOpen(false)}
                question={question}
            />
        </>
    );
};

export default QuestionCard;
