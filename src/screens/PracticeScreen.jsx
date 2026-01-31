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
    const [activeSubject, setActiveSubject] = useState('Physics');
    const containerRef = useRef(null);
    const observerTarget = useRef(null);
    const [activeQuestionId, setActiveQuestionId] = useState(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [initialLoad, setInitialLoad] = useState(true);
    const [showHeader, setShowHeader] = useState(true);
    const [lastScrollTop, setLastScrollTop] = useState(0);
    const [stats, setStats] = useState(getStats());
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState(getFilters());

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

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    useEffect(() => {
        if (filters.subject !== 'Mix') {
            setActiveSubject(filters.subject);
        }
    }, [filters.subject]); // Fixed dependency

    useEffect(() => {
        loadMoreQuestions(true);
    }, []);

    useEffect(() => {
        if (!loading) {
            setQuestions([]);
            loadMoreQuestions(true);
            if (containerRef.current) containerRef.current.scrollTop = 0;
            setShowHeader(true);
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
- "type": "ai"`;

            const result = await callGeminiAPI(prompt);
            let newQuestions = [];

            if (result && Array.isArray(result)) {
                newQuestions = result;
            } else if (typeof result === 'string') {
                try {
                    const cleanedResponse = result.replace(/```json\n?|```\n?/g, '').trim();
                    newQuestions = JSON.parse(cleanedResponse);
                } catch (e) {
                    throw new Error('Parse error');
                }
            } else {
                throw new Error('Invalid response');
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

    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && !loading && questions.length > 0) {
                    loadMoreQuestions(false);
                }
            },
            { threshold: 0.1 }
        );

        if (observerTarget.current) observer.observe(observerTarget.current);
        return () => {
            if (observerTarget.current) observer.unobserve(observerTarget.current);
        };
    }, [loadMoreQuestions, loading, questions.length]);

    const handleScroll = (e) => {
        const container = e.target;
        const scrollTop = container.scrollTop;
        const viewportHeight = container.clientHeight;
        const centerPosition = scrollTop + viewportHeight / 2;

        if (scrollTop > lastScrollTop && scrollTop > 100) {
            setShowHeader(false);
        } else if (scrollTop < lastScrollTop) {
            setShowHeader(true);
        }
        setLastScrollTop(scrollTop);

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
        <div className="relative h-screen w-full overflow-hidden bg-[#0F1117]">
            <div className={`fixed top-0 left-0 right-0 z-[100] px-5 py-3 transition-all duration-500 ease-in-out flex items-center justify-between border-b ${showHeader ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}
                style={{
                    backgroundColor: 'rgba(15, 17, 23, 0.85)',
                    backdropFilter: 'blur(20px)',
                    borderColor: 'rgba(45, 49, 66, 0.3)'
                }}>

                <div className="absolute top-0 left-0 h-0.5 bg-indigo-500/10 w-full">
                    <div
                        className="h-full bg-indigo-500 transition-all duration-700 shadow-[0_0_8px_rgba(99,102,241,0.5)]"
                        style={{ width: `${Math.min(100, (stats.totalAnswered % 10) * 10 || 0)}%` }}
                    />
                </div>

                <div className="flex-1 overflow-x-auto no-scrollbar pr-4 flex gap-2">
                    {subjects.map(subj => (
                        <button
                            key={subj}
                            onClick={() => {
                                setFilters(prev => ({ ...prev, subject: subj }));
                                setActiveSubject(subj);
                            }}
                            className="px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap"
                            style={{
                                backgroundColor: activeSubject === subj && filters.subject !== 'Mix' ? '#6366F1' : 'rgba(255,255,255,0.05)',
                                color: activeSubject === subj && filters.subject !== 'Mix' ? '#FFFFFF' : '#9CA3AF',
                                border: '1px solid rgba(255,255,255,0.05)',
                                fontFamily: 'Nunito'
                            }}
                        >
                            {subj}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-2 shrink-0 ml-2">
                    <button
                        onClick={toggleFullscreen}
                        className="w-9 h-9 rounded-xl flex items-center justify-center transition-all bg-white/5 border border-white/10 hover:bg-white/10 active:scale-90"
                        title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                    >
                        {isFullscreen ? (
                            <Minimize2 className="w-4 h-4 text-indigo-400" />
                        ) : (
                            <Maximize2 className="w-4 h-4 text-indigo-400" />
                        )}
                    </button>

                    <button
                        onClick={() => setShowFilters(true)}
                        className="w-9 h-9 rounded-xl flex items-center justify-center transition-all bg-white/5 border border-white/10 hover:bg-white/10 active:scale-90"
                    >
                        <Sliders className="w-4 h-4 text-indigo-400" />
                    </button>

                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border bg-amber-500/5 border-amber-500/20 shadow-lg shadow-amber-500/5">
                        <Trophy className="w-3.5 h-3.5 text-amber-500" />
                        <span className="text-xs font-bold text-amber-500" style={{ fontFamily: 'Nunito' }}>
                            {stats.questionsCorrect * 10}
                        </span>
                    </div>
                </div>
            </div>

            {initialLoad && (
                <div className="absolute inset-0 z-[150] flex flex-col items-center justify-center bg-[#0F1117]">
                    <div className="relative mb-6">
                        <div className="absolute inset-0 rounded-full bg-indigo-500/20 blur-xl animate-pulse" />
                        <Loader2 className="w-12 h-12 animate-spin relative" style={{ color: '#6366F1' }} />
                    </div>
                    <p className="text-lg font-bold tracking-tight" style={{ color: '#9CA3AF', fontFamily: 'Nunito' }}>
                        Curating Advanced Questions...
                    </p>
                </div>
            )}

            <div
                ref={containerRef}
                className="snap-container text-white h-screen overflow-y-auto"
                onScroll={handleScroll}
            >
                <div className="h-20" />

                {questions.map((q, index) => (
                    <QuestionCard
                        key={`${q.id}-${index}`}
                        question={q}
                        isActive={q.id === activeQuestionId}
                        onAnswered={(isCorrect) => handleCorrectAnswer(q, isCorrect)}
                    />
                ))}

                {!initialLoad && (
                    <div ref={observerTarget} className="snap-item flex flex-col items-center justify-center p-10 h-32 text-slate-500">
                        <Loader2 className="w-8 h-8 animate-spin mb-2" />
                        <p className="text-sm font-medium">Fetching newer challenges...</p>
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
                    setQuestions([]);
                    loadMoreQuestions(true);
                }}
            />
        </div>
    );
};

export default PracticeScreen;
