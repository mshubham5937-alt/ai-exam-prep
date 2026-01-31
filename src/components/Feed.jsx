import React, { useState, useEffect, useRef, useCallback } from 'react';
import QuestionCard from './QuestionCard';
import FiltersModal from './FiltersModal';
import { generateFallbackQuestion } from '../services/generators';
import { callGeminiAPI } from '../services/api';
import { Loader2, Trophy, Sliders } from 'lucide-react';

const BATCH_SIZE = 3;

const Feed = () => {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeSubject, setActiveSubject] = useState('Physics'); // Default
    const observerTarget = useRef(null);
    const [activeQuestionId, setActiveQuestionId] = useState(null);

    // Filters State
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        exam: 'JEE',
        subject: 'Mix',
        difficulty: 3,
        language: 'English'
    });

    // Gamification State
    const [score, setScore] = useState(() => parseInt(localStorage.getItem('exam_prep_score') || '0'));
    const [answeredIds, setAnsweredIds] = useState(() => JSON.parse(localStorage.getItem('exam_prep_answered_ids') || '[]'));

    // Persist score
    useEffect(() => {
        localStorage.setItem('exam_prep_score', score.toString());
        localStorage.setItem('exam_prep_answered_ids', JSON.stringify(answeredIds));
    }, [score, answeredIds]);

    const handleCorrectAnswer = (id) => {
        if (!answeredIds.includes(id)) {
            setScore(prev => prev + 10);
            setAnsweredIds(prev => [...prev, id]);
        }
    };

    // Load initial questions
    useEffect(() => {
        loadMoreQuestions(true);
    }, []); // Initial load

    // Reset when subject changes
    useEffect(() => {
        setQuestions([]);
        loadMoreQuestions(true);
    }, [activeSubject]);

    const loadMoreQuestions = useCallback(async (reset = false) => {
        if (loading && !reset) return;

        setLoading(true);

        try {
            // content prompt for Gemini
            const prompt = `Generate ${BATCH_SIZE} multiple choice questions for JEE/NEET preparation in ${activeSubject}. 
Each question should be challenging and at an appropriate difficulty level.
Return ONLY a valid JSON array with NO extra text, code blocks, or markdown. Each question object must have:
- "id": unique string
- "text": the question
- "options": array of 4 answer choices
- "correct": index (0-3) of correct answer
- "solution": detailed explanation
- "subject": "${activeSubject}"
- "level": difficulty 1-5
- "type": "ai"

Example format:
[{"id":"q1","text":"Question here?","options":["A","B","C","D"],"correct":0,"solution":"Explanation","subject":"${activeSubject}","level":3,"type":"ai"}]`;

            const result = await callGeminiAPI(prompt);
            let newQuestions = [];

            try {
                // Try parsing the response
                const cleanedResponse = result.replace(/```json\n?|```\n?/g, '').trim();
                newQuestions = JSON.parse(cleanedResponse);
                if (!Array.isArray(newQuestions)) {
                    throw new Error('Response is not an array');
                }
            } catch (parseError) {
                console.warn('Gemini API returned invalid JSON, using fallback generator');
                newQuestions = Array.from({ length: BATCH_SIZE }, () =>
                    generateFallbackQuestion(activeSubject)
                );
            }

            setQuestions(prev => reset ? newQuestions : [...prev, ...newQuestions]);
        } catch (error) {
            console.error('Error loading questions:', error);
            const fallbackQuestions = Array.from({ length: BATCH_SIZE }, () =>
                generateFallbackQuestion(activeSubject)
            );
            setQuestions(prev => reset ? fallbackQuestions : [...prev, ...fallbackQuestions]);
        } finally {
            setLoading(false);
        }
    }, [activeSubject, loading]);

    // Intersection observer for infinite scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && !loading) {
                    loadMoreQuestions(false);
                }
            },
            { threshold: 0.5 }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => {
            if (observerTarget.current) {
                observer.unobserve(observerTarget.current);
            }
        };
    }, [loadMoreQuestions, loading]);

    // Track visible question
    const handleScroll = () => {
        const container = document.querySelector('.snap-container');
        if (!container) return;

        const scrollTop = container.scrollTop;
        const viewportHeight = container.clientHeight;
        const centerPosition = scrollTop + viewportHeight / 2;

        const questionElements = document.querySelectorAll('.snap-item');
        questionElements.forEach((element, index) => {
            const rect = element.getBoundingClientRect();
            const elementTop = element.offsetTop;
            const elementBottom = elementTop + element.offsetHeight;

            if (centerPosition >= elementTop && centerPosition <= elementBottom) {
                if (questions[index]) {
                    setActiveQuestionId(questions[index].id);
                }
            }
        });
    };

    const subjects = ['Physics', 'Chemistry', 'Maths', 'Biology'];

    return (
        <div className="relative h-full w-full">
            {/* Header - PrepStream style */}
            <div className="fixed top-0 left-0 right-0 z-50 px-5 py-3 flex justify-between items-center border-b"
                style={{
                    backgroundColor: '#0F1117',
                    borderColor: '#2D3142'
                }}>
                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                    {subjects.map(subj => (
                        <button
                            key={subj}
                            onClick={() => setActiveSubject(subj)}
                            className="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide transition-all whitespace-nowrap hover:scale-105"
                            style={{
                                backgroundColor: activeSubject === subj ? '#6366F1' : '#252836',
                                color: activeSubject === subj ? '#FFFFFF' : '#9CA3AF',
                                fontFamily: 'Nunito'
                            }}
                        >
                            {subj}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-3">
                    {/* Filters Button */}
                    <button
                        onClick={() => setShowFilters(true)}
                        className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-white/10"
                        style={{ backgroundColor: '#252836' }}
                    >
                        <Sliders className="w-4 h-4" style={{ color: '#6366F1' }} />
                    </button>

                    <div className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: '#252836' }}>
                        <span className="text-xs font-bold" style={{ color: '#6366F1' }}>AI</span>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border"
                        style={{
                            backgroundColor: 'rgba(245, 158, 11, 0.1)',
                            borderColor: 'rgba(245, 158, 11, 0.3)'
                        }}>
                        <Trophy className="w-3.5 h-3.5" style={{ color: '#F59E0B' }} />
                        <span className="text-xs font-bold" style={{ color: '#F59E0B' }}>{score}</span>
                    </div>
                </div>
            </div>

            <div
                className="snap-container text-white"
                onScroll={handleScroll}
            >
                {questions.map((q, index) => (
                    <QuestionCard
                        key={`${q.id}-${index}`}
                        question={q}
                        isActive={q.id === activeQuestionId}
                        onCorrectAnswer={() => handleCorrectAnswer(q.id)}
                    />
                ))}

                {/* Loading Indicator at bottom */}
                <div ref={observerTarget} className="snap-item flex flex-col items-center justify-center p-10 h-64 text-slate-500">
                    <Loader2 className="w-8 h-8 animate-spin mb-2" />
                    <p className="text-sm">Loading more challenges...</p>
                </div>
            </div>

            <FiltersModal
                isOpen={showFilters}
                onClose={() => setShowFilters(false)}
                filters={filters}
                onApply={(newFilters) => {
                    setFilters(newFilters);
                    setActiveSubject(newFilters.subject === 'Mix' ? 'Physics' : newFilters.subject);
                }}
            />
        </div>
    );
};

export default Feed;
