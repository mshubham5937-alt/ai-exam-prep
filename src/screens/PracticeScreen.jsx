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

    // Load initial questions
    useEffect(() => {
        loadMoreQuestions(true);
    }, []);

    // Handle filter/subject changes
    const handleFilterChange = (newFilters) => {
        const updatedFilters = { ...filters, ...newFilters };
        setFilters(updatedFilters);
        saveFilters(updatedFilters);
        setQuestions([]);
        setInitialLoad(true);
        loadMoreQuestions(true, updatedFilters);
        if (containerRef.current) containerRef.current.scrollTop = 0;
        setShowHeader(true);
    };

    const handleCorrectAnswer = (question, isCorrect) => {
        const newStats = updateStats(isCorrect, question.subject, question.level);
        setStats(newStats);
    };

    const shuffleQuestionOptions = (q) => {
        const options = [...q.options];
        const correctText = options[q.correct];

        // Fisher-Yates shuffle
        for (let i = options.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [options[i], options[j]] = [options[j], options[i]];
        }

        const newCorrect = options.indexOf(correctText);
        return { ...q, options, correct: newCorrect };
    };

    const loadMoreQuestions = useCallback(async (reset = false, currentFilters = filters) => {
        if (loading && !reset) return;
        setLoading(true);

        try {
            const subjectToFetch = currentFilters.subject === 'Mix'
                ? (currentFilters.exam === 'JEE' ? 'Physics, Chemistry, Maths' : 'Physics, Chemistry, Biology')
                : currentFilters.subject;

            const prompt = `Generate ${BATCH_SIZE} unique and diverse multiple choice questions for ${currentFilters.exam} preparation.
Target Subject(s): ${subjectToFetch}.
Difficulty Level: ${currentFilters.difficulty} (on a scale of 1-5).
Language: ${currentFilters.language}.

CRITICAL REQUIREMENTS:
1. VARIETY: Use different question formats (numerical, conceptual, logic-based). Never use the same theme twice in a batch.
2. RANDOMNESS: Strictly randomize the position of the correct answer index (0-3).
3. NO PATTERNS: Do not repeat previous question types or structures.

Return ONLY a valid JSON array. Each object:
- "id": unique string
- "text": the question
- "options": array of 4 distinct choices
- "correct": index (0-3)
- "solution": step-by-step reasoning
- "subject": "${currentFilters.subject === 'Mix' ? 'Mixed' : currentFilters.subject}"
- "level": ${currentFilters.difficulty}
- "type": "ai"`;

            const result = await callGeminiAPI(prompt);
            let rawQuestions = [];

            if (result && Array.isArray(result)) {
                rawQuestions = result;
            } else if (typeof result === 'string') {
                try {
                    const cleanedResponse = result.replace(/```json\n?|```\n?/g, '').trim();
                    rawQuestions = JSON.parse(cleanedResponse);
                } catch (e) {
                    throw new Error('Parse error');
                }
            } else {
                throw new Error('Invalid response');
            }

            // Client-side shuffle safeguard
            const newQuestions = rawQuestions.map(q => shuffleQuestionOptions(q));

            setQuestions(prev => reset ? newQuestions : [...prev, ...newQuestions]);
            if (reset) {
                setInitialLoad(false);
                if (newQuestions.length > 0) setActiveQuestionId(newQuestions[0].id);
            }
        } catch (error) {
            console.error('Error loading questions:', error);
            const fallbackSubject = currentFilters.subject === 'Mix' ? 'Physics' : currentFilters.subject;
            const fallbackQuestions = Array.from({ length: BATCH_SIZE }, () =>
                generateFallbackQuestion(fallbackSubject)
            ).map(q => shuffleQuestionOptions(q));

            setQuestions(prev => reset ? fallbackQuestions : [...prev, ...fallbackQuestions]);
            if (reset) {
                setInitialLoad(false);
                if (fallbackQuestions.length > 0) setActiveQuestionId(fallbackQuestions[0].id);
            }
        } finally {
            setLoading(false);
        }
    }, [filters, loading]);

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

    const subjects = filters.exam === 'JEE'
        ? ['Mix', 'Physics', 'Chemistry', 'Maths']
        : ['Mix', 'Physics', 'Chemistry', 'Biology'];

    return (
        <div className="relative h-screen w-full overflow-hidden bg-[#0F1117]">
            {/* Premium Floating Header with Tabs */}
            <div className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ease-in-out border-b ${showHeader ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}
                style={{
                    backgroundColor: 'rgba(15, 17, 23, 0.85)',
                    backdropFilter: 'blur(20px)',
                    borderColor: 'rgba(45, 49, 66, 0.3)'
                }}>

                {/* Session Progress Bar */}
                <div className="absolute top-0 left-0 h-0.5 bg-indigo-500/10 w-full">
                    <div
                        className="h-full bg-indigo-500 transition-all duration-700 shadow-[0_0_8px_rgba(99,102,241,0.5)]"
                        style={{ width: `${Math.min(100, (stats.questionsAttempted % 10) * 10 || 0)}%` }}
                    />
                </div>

                <div className="flex flex-col">
                    {/* Top Row: Actions & Stats */}
                    <div className="flex items-center justify-between px-5 pt-4 pb-2">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border bg-amber-500/5 border-amber-500/20 shadow-lg shadow-amber-500/5 animate-bounce-subtle">
                                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                                <span className="text-xs font-bold text-amber-500" style={{ fontFamily: 'Nunito' }}>
                                    {stats.questionsCorrect * 10}
                                </span>
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500" style={{ fontFamily: 'Nunito' }}>
                                {filters.exam} Mode
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={toggleFullscreen}
                                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all bg-white/5 border border-white/10 hover:bg-white/10 active:scale-90"
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
                        </div>
                    </div>

                    {/* Bottom Row: Subject Tabs */}
                    <div className="flex px-4 items-end overflow-x-auto no-scrollbar scroll-smooth">
                        {subjects.map(subj => {
                            const active = filters.subject === subj;
                            return (
                                <button
                                    key={subj}
                                    onClick={() => handleFilterChange({ subject: subj })}
                                    className="relative px-5 py-3 transition-all flex flex-col items-center group"
                                >
                                    <span className={`text-[11px] font-bold uppercase tracking-widest transition-all ${active ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`}
                                        style={{ fontFamily: 'Nunito' }}>
                                        {subj === 'Mix' ? 'Mix All' : subj}
                                    </span>
                                    {/* Active Indicator */}
                                    <div className={`absolute bottom-0 h-0.5 bg-indigo-500 transition-all duration-300 rounded-full ${active ? 'w-6 opacity-100' : 'w-0 opacity-0'}`} />
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Initial Center Loading Overlay */}
            {initialLoad && (
                <div className="absolute inset-0 z-[150] flex flex-col items-center justify-center bg-[#0F1117]">
                    <div className="relative mb-6">
                        <div className="absolute inset-0 rounded-full bg-indigo-500/20 blur-xl animate-pulse" />
                        <Loader2 className="w-12 h-12 animate-spin relative" style={{ color: '#6366F1' }} />
                    </div>
                    <p className="text-lg font-bold tracking-tight" style={{ color: '#9CA3AF', fontFamily: 'Nunito' }}>
                        Preparing {filters.subject === 'Mix' ? 'Mixed' : filters.subject} Challenges...
                    </p>
                </div>
            )}

            <div
                ref={containerRef}
                className="snap-container text-white h-screen overflow-y-auto"
                onScroll={handleScroll}
            >
                <div className="h-28" /> {/* Increased spacer for header with tabs */}

                {questions.map((q, index) => (
                    <QuestionCard
                        key={`${q.id}-${index}`}
                        question={q}
                        isActive={q.id === activeQuestionId}
                        onAnswered={(isCorrect) => handleCorrectAnswer(q, isCorrect)}
                    />
                ))}

                {/* Bottom Loading Indicator */}
                {!initialLoad && (
                    <div ref={observerTarget} className="snap-item flex flex-col items-center justify-center p-10 h-32 text-slate-500">
                        <Loader2 className="w-8 h-8 animate-spin mb-2" />
                        <p className="text-sm font-medium">Fetching more for you...</p>
                    </div>
                )}
            </div>

            <FiltersModal
                isOpen={showFilters}
                onClose={() => setShowFilters(false)}
                filters={filters}
                onApply={handleFilterChange}
            />
        </div>
    );
};

export default PracticeScreen;
