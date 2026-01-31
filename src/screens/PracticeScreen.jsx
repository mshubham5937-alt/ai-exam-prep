import React, { useState, useEffect, useRef, useCallback } from 'react';
import QuestionCard from '../components/QuestionCard';
import FiltersModal from '../components/FiltersModal';
import { generateFallbackQuestion } from '../services/generators';
import { callGeminiAPI } from '../services/api';
import { Loader2, Trophy, Sliders, Maximize2, Minimize2 } from 'lucide-react';
import { getStats, updateStats, getFilters, saveFilters } from '../services/storage';

const BATCH_SIZE = 6;

const PracticeScreen = () => {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeSubject, setActiveSubject] = useState('Physics'); // Default
    const containerRef = useRef(null);
    const observerTarget = useRef(null);
    const [activeQuestionId, setActiveQuestionId] = useState(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [initialLoad, setInitialLoad] = useState(true);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(e => {
                console.error(`Error attempting to enable full-screen mode: ${e.message}`);
            });
            setIsFullscreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                setIsFullscreen(false);
            }
        }
    };

    // Listen for fullscreen changes (e.g. Esc key)
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    // Filters State
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState(getFilters());

    // Stats State for UI (score only here, rest in storage)
    const [stats, setStats] = useState(getStats());

    // Sync subject with filters
    useEffect(() => {
        if (filters.subject !== 'Mix') {
            setActiveSubject(filters.subject);
        }
    }, [filters]);

    // Load initial questions
    useEffect(() => {
        loadMoreQuestions(true);
    }, []); // Initial load

    // Reset when subject changes (if not in Mix mode)
    useEffect(() => {
        if (!loading) {
            setQuestions([]);
            loadMoreQuestions(true);
            if (containerRef.current) containerRef.current.scrollTop = 0;
        }
    }, [activeSubject]);

    const handleCorrectAnswer = (question, isCorrect) => {
        const newStats = updateStats(isCorrect, question.subject, question.level);
        setStats(newStats);
    };

    const loadMoreQuestions = useCallback(async (reset = false) => {
        if (loading && !reset) return;

        setLoading(true);

        try {
            const subjectToFetch = filters.subject === 'Mix' ? 'Physics, Chemistry, Maths, Biology' : activeSubject;

            // content prompt for Gemini
            const prompt = `Generate ${BATCH_SIZE} multiple choice questions for ${filters.exam} preparation.
Target Subject(s): ${subjectToFetch}.
Difficulty Level: ${filters.difficulty} (on a scale of 1-5).
Language: ${filters.language}.

Return ONLY a valid JSON array with NO extra text, code blocks, or markdown. Each question object must have:
- "id": unique string
- "text": the question
- "options": array of 4 answer choices
- "correct": index (0-3) of correct answer
- "solution": detailed explanation
- "subject": "${filters.subject === 'Mix' ? 'Mixed' : activeSubject}"
- "level": ${filters.difficulty}
- "type": "ai"

Example format:
[{"id":"${Date.now()}","text":"Question here?","options":["A","B","C","D"],"correct":0,"solution":"Explanation","subject":"${activeSubject}","level":${filters.difficulty},"type":"ai"}]`;

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
            if (reset) setInitialLoad(false);
        } catch (error) {
            console.error('Error loading questions:', error);
            const fallbackQuestions = Array.from({ length: BATCH_SIZE }, () =>
                generateFallbackQuestion(activeSubject)
            );
            setQuestions(prev => reset ? fallbackQuestions : [...prev, ...fallbackQuestions]);
            if (reset) setInitialLoad(false);
        } finally {
            setLoading(false);
        }
    }, [activeSubject, filters, loading]);

    // Intersection observer for infinite scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && !loading) {
                    loadMoreQuestions(false);
                }
            },
            { threshold: 0.1 }
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
    const handleScroll = (e) => {
        const container = e.target;
        const scrollTop = container.scrollTop;
        const viewportHeight = container.clientHeight;
        const centerPosition = scrollTop + viewportHeight / 2;

        const questionElements = container.querySelectorAll('.snap-item');
        questionElements.forEach((element, index) => {
            const elementTop = element.offsetTop;
            const elementBottom = elementTop + element.offsetHeight;

            if (centerPosition >= elementTop && centerPosition <= elementBottom) {
                if (questions[index] && activeQuestionId !== questions[index].id) {
                    setActiveQuestionId(questions[index].id);
                }
            }
        });
    };

    const subjects = ['Physics', 'Chemistry', 'Maths', 'Biology'];

    return (
        <div className="relative h-screen w-full">
            {/* Header - PrepStream style */}
            <div className="fixed top-0 left-0 right-0 z-50 px-5 py-3 flex justify-between items-center border-b"
                style={{
                    backgroundColor: '#0F1117',
                    borderColor: '#2D3142'
                }}>
                <div className="flex gap-2 overflow-x-auto no-scrollbar pr-4">
                    {subjects.map(subj => (
                        <button
                            key={subj}
                            onClick={() => {
                                setFilters(prev => ({ ...prev, subject: subj }));
                                setActiveSubject(subj);
                            }}
                            className="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide transition-all whitespace-nowrap hover:scale-105"
                            style={{
                                backgroundColor: activeSubject === subj && filters.subject !== 'Mix' ? '#6366F1' : '#252836',
                                color: activeSubject === subj && filters.subject !== 'Mix' ? '#FFFFFF' : '#9CA3AF',
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
                        onClick={toggleFullscreen}
                        className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-white/10"
                        style={{ backgroundColor: '#252836' }}
                        title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                    >
                        {isFullscreen ? (
                            <Minimize2 className="w-4 h-4" style={{ color: '#6366F1' }} />
                        ) : (
                            <Maximize2 className="w-4 h-4" style={{ color: '#6366F1' }} />
                        )}
                    </button>

                    <button
                        onClick={() => setShowFilters(true)}
                        className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-white/10"
                        style={{ backgroundColor: '#252836' }}
                    >
                        <Sliders className="w-4 h-4" style={{ color: '#6366F1' }} />
                    </button>

                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border"
                        style={{
                            backgroundColor: 'rgba(245, 158, 11, 0.1)',
                            borderColor: 'rgba(245, 158, 11, 0.3)'
                        }}>
                        <Trophy className="w-3.5 h-3.5" style={{ color: '#F59E0B' }} />
                        <span className="text-xs font-bold" style={{ color: '#F59E0B' }}>
                            {stats.questionsCorrect * 10}
                        </span>
                    </div>
                </div>
            </div>

            {/* Initial Center Loading Overlay */}
            {initialLoad && (
                <div className="absolute inset-0 z-[60] flex flex-col items-center justify-center bg-[#0F1117]">
                    <Loader2 className="w-12 h-12 animate-spin mb-4" style={{ color: '#6366F1' }} />
                    <p className="text-lg font-bold" style={{ color: '#9CA3AF', fontFamily: 'Nunito' }}>
                        Preparing your feed...
                    </p>
                </div>
            )}

            <div
                ref={containerRef}
                className="snap-container text-white h-screen"
                onScroll={handleScroll}
            >
                {questions.map((q, index) => (
                    <QuestionCard
                        key={`${q.id}-${index}`}
                        question={q}
                        isActive={q.id === activeQuestionId}
                        onAnswered={(isCorrect) => handleCorrectAnswer(q, isCorrect)}
                    />
                ))}

                {/* Bottom Loading Indicator - only show if not initial load */}
                {!initialLoad && (
                    <div ref={observerTarget} className="snap-item flex flex-col items-center justify-center p-10 h-32 text-slate-500">
                        <Loader2 className="w-8 h-8 animate-spin mb-2" />
                        <p className="text-sm">Loading more challenges...</p>
                    </div>
                )}
            </div>

            <FiltersModal
                isOpen={showFilters}
                onClose={() => setShowFilters(false)}
                filters={filters}
                onApply={(newFilters) => {
                    setFilters(newFilters);
                    saveFilters(newFilters);
                    if (newFilters.subject !== 'Mix') {
                        setActiveSubject(newFilters.subject);
                    }
                    // Trigger reload by clearing questions
                    setQuestions([]);
                    loadMoreQuestions(true);
                }}
            />
        </div>
    );
};

export default PracticeScreen;
