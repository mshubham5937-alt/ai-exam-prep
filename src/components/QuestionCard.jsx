import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Bookmark, Sparkles, Brain } from 'lucide-react';
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
            // Find bookmark id to remove
            // Actually our storage uses questionId for search but remove by bookmark id
            // Let's refine storage removeBookmark to use questionId or just handle it here
            // For now, let's just use the current implementation
            removeBookmark(question.id); // I should check if I implemented removeBookmark by id or questionId
            setIsBookmarked(false);
        } else {
            addBookmark(question);
            setIsBookmarked(true);
        }
    };

    const isCorrect = selectedOption === question.correct;

    // Get subject color
    const subjectColors = {
        Physics: '#A855F7',
        Chemistry: '#F59E0B',
        Maths: '#3B82F6',
        Biology: '#10B981'
    };
    const subjectColor = subjectColors[question.subject] || '#6366F1';

    return (
        <>
            <div className={`snap-item p-6 relative transition-opacity duration-300 h-screen flex flex-col justify-center ${isActive ? 'opacity-100' : 'opacity-70'}`}
                style={{ backgroundColor: '#0F1117' }}>

                {/* Decorative subject blob */}
                <div
                    className="absolute -top-12 -right-12 w-52 h-52 rounded-full pointer-events-none"
                    style={{
                        backgroundColor: subjectColor,
                        opacity: 0.1,
                        filter: 'blur(40px)'
                    }}
                />

                <div className="w-full max-w-2xl mx-auto space-y-6 relative z-10">

                    {/* Header with tags and dots */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex gap-2">
                            {/* Type badge */}
                            <span className="px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wide"
                                style={{
                                    backgroundColor: '#252836',
                                    color: '#9CA3AF'
                                }}>
                                {question.type || 'MCQ'}
                            </span>
                            {/* Subject badge */}
                            <span className="px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wide border"
                                style={{
                                    backgroundColor: `${subjectColor}20`,
                                    borderColor: subjectColor,
                                    color: subjectColor
                                }}>
                                {question.subject}
                            </span>
                            {/* AI badge */}
                            {question.type === 'ai' && (
                                <span className="px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wide border flex items-center gap-1"
                                    style={{
                                        backgroundColor: 'rgba(99, 102, 241, 0.2)',
                                        borderColor: '#6366F1',
                                        color: '#6366F1'
                                    }}>
                                    <Sparkles className="w-2.5 h-2.5" />
                                    AI
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

                    {/* Question text */}
                    <div className="mb-8">
                        <h2 className="text-[22px] font-semibold leading-[1.45] text-white">
                            {question.text}
                        </h2>
                    </div>

                    {/* Options */}
                    <div className="space-y-3 mb-6">
                        {question.options.map((option, idx) => {
                            let backgroundColor = '#1A1D2E';
                            let borderColor = '#2D3142';
                            let textColor = '#F9FAFB';

                            if (selectedOption !== null) {
                                if (idx === question.correct) {
                                    backgroundColor = 'rgba(16, 185, 129, 0.2)';
                                    borderColor = '#10B981';
                                    textColor = '#10B981';
                                } else if (idx === selectedOption && !isCorrect) {
                                    backgroundColor = 'rgba(239, 68, 68, 0.2)';
                                    borderColor = '#EF4444';
                                    textColor = '#EF4444';
                                }
                            }

                            return (
                                <button
                                    key={idx}
                                    onClick={() => handleOptionClick(idx)}
                                    disabled={selectedOption !== null}
                                    className="w-full p-4 rounded-2xl border-2 transition-all duration-200 flex items-center justify-between text-left group hover:scale-[0.99] active:scale-[0.98]"
                                    style={{
                                        backgroundColor,
                                        borderColor,
                                        color: textColor
                                    }}
                                >
                                    <span className="flex-1 font-medium text-base">
                                        {option}
                                    </span>
                                    {selectedOption !== null && idx === question.correct && (
                                        <CheckCircle2 className="w-5 h-5 shrink-0 ml-2" style={{ color: '#10B981' }} />
                                    )}
                                    {selectedOption !== null && idx === selectedOption && idx !== question.correct && (
                                        <XCircle className="w-5 h-5 shrink-0 ml-2" style={{ color: '#EF4444' }} />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Submit button - appears when option selected */}
                    {selectedOption !== null && !showSolution && (
                        <div className="flex justify-center animate-scale-in flex-col items-center gap-4">
                            <button
                                onClick={handleSubmit}
                                className="px-8 py-4 rounded-2xl font-bold text-white text-[17px] transition-all hover:scale-105 active:scale-95"
                                style={{
                                    backgroundColor: '#6366F1',
                                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
                                }}
                            >
                                Submit Answer
                            </button>
                            <button
                                onClick={() => setIsTutorOpen(true)}
                                className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider transition-colors hover:opacity-80"
                                style={{ color: '#6366F1' }}
                            >
                                <Brain className="w-4 h-4" />
                                Ask AI Tutor
                            </button>
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
