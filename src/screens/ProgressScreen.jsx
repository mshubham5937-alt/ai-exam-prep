import React, { useState, useEffect } from 'react';
import { TrendingUp, Target, Flame, Award, Zap, Droplet, Hash, Heart } from 'lucide-react';
import { getStats } from '../services/storage';

const ProgressScreen = () => {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = () => {
        const data = getStats();
        setStats(data);
    };

    if (!stats) {
        return <div className="flex items-center justify-center h-screen" style={{ backgroundColor: '#0F1117' }}>
            <span style={{ color: '#9CA3AF' }}>Loading stats...</span>
        </div>;
    }

    const subjectIcons = {
        Physics: Zap,
        Chemistry: Droplet,
        Maths: Hash,
        Biology: Heart
    };

    const subjectColors = {
        Physics: '#A855F7',
        Chemistry: '#F59E0B',
        Maths: '#3B82F6',
        Biology: '#10B981'
    };

    return (
        <div className="h-screen overflow-y-auto pb-24" style={{ backgroundColor: '#0F1117' }}>
            {/* Header */}
            <div className="px-5 py-6 border-b" style={{ borderColor: '#2D3142' }}>
                <h1 className="text-2xl font-bold" style={{ color: '#F9FAFB', fontFamily: 'Nunito' }}>
                    Your Progress
                </h1>
                <p className="text-sm mt-1" style={{ color: '#9CA3AF', fontFamily: 'Nunito' }}>
                    Track your learning journey
                </p>
            </div>

            <div className="p-5 space-y-6">
                {/* Main Stats Cards */}
                <div className="grid grid-cols-2 gap-3">
                    {/* Questions Attempted */}
                    <div className="p-4 rounded-2xl border" style={{ backgroundColor: '#1A1D2E', borderColor: '#2D3142' }}>
                        <div className="flex items-center justify-between mb-2">
                            <Target className="w-5 h-5" style={{ color: '#6366F1' }} />
                        </div>
                        <div className="text-3xl font-bold mb-1" style={{ color: '#F9FAFB', fontFamily: 'Nunito' }}>
                            {stats.questionsAttempted}
                        </div>
                        <div className="text-xs uppercase tracking-wide" style={{ color: '#9CA3AF', fontFamily: 'Nunito' }}>
                            Attempted
                        </div>
                    </div>

                    {/* Accuracy */}
                    <div className="p-4 rounded-2xl border" style={{ backgroundColor: '#1A1D2E', borderColor: '#2D3142' }}>
                        <div className="flex items-center justify-between mb-2">
                            <TrendingUp className="w-5 h-5" style={{ color: '#10B981' }} />
                        </div>
                        <div className="text-3xl font-bold mb-1" style={{ color: '#F9FAFB', fontFamily: 'Nunito' }}>
                            {stats.accuracy}%
                        </div>
                        <div className="text-xs uppercase tracking-wide" style={{ color: '#9CA3AF', fontFamily: 'Nunito' }}>
                            Accuracy
                        </div>
                    </div>

                    {/* Streak */}
                    <div className="p-4 rounded-2xl border" style={{ backgroundColor: '#1A1D2E', borderColor: '#2D3142' }}>
                        <div className="flex items-center justify-between mb-2">
                            <Flame className="w-5 h-5" style={{ color: '#F59E0B' }} />
                        </div>
                        <div className="text-3xl font-bold mb-1" style={{ color: '#F9FAFB', fontFamily: 'Nunito' }}>
                            {stats.currentStreak}
                        </div>
                        <div className="text-xs uppercase tracking-wide" style={{ color: '#9CA3AF', fontFamily: 'Nunito' }}>
                            Day Streak
                        </div>
                    </div>

                    {/* Correct Answers */}
                    <div className="p-4 rounded-2xl border" style={{ backgroundColor: '#1A1D2E', borderColor: '#2D3142' }}>
                        <div className="flex items-center justify-between mb-2">
                            <Award className="w-5 h-5" style={{ color: '#6366F1' }} />
                        </div>
                        <div className="text-3xl font-bold mb-1" style={{ color: '#F9FAFB', fontFamily: 'Nunito' }}>
                            {stats.questionsCorrect}
                        </div>
                        <div className="text-xs uppercase tracking-wide" style={{ color: '#9CA3AF', fontFamily: 'Nunito' }}>
                            Correct
                        </div>
                    </div>
                </div>

                {/* Subject Breakdown */}
                <div>
                    <h2 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: '#9CA3AF', fontFamily: 'Nunito' }}>
                        Subject Performance
                    </h2>
                    <div className="space-y-3">
                        {Object.entries(stats.subjectStats).map(([subject, data]) => {
                            const Icon = subjectIcons[subject];
                            const color = subjectColors[subject];
                            const accuracy = data.attempted > 0 ? Math.round((data.correct / data.attempted) * 100) : 0;

                            return (
                                <div key={subject} className="p-4 rounded-xl border" style={{ backgroundColor: '#1A1D2E', borderColor: '#2D3142' }}>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <Icon className="w-4 h-4" style={{ color }} />
                                            <span className="font-semibold text-sm" style={{ color: '#F9FAFB', fontFamily: 'Nunito' }}>
                                                {subject}
                                            </span>
                                        </div>
                                        <span className="text-xs font-bold" style={{ color, fontFamily: 'Nunito' }}>
                                            {accuracy}%
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs" style={{ color: '#9CA3AF', fontFamily: 'Nunito' }}>
                                        <span>{data.attempted} attempted</span>
                                        <span>•</span>
                                        <span>{data.correct} correct</span>
                                    </div>
                                    {/* Progress bar */}
                                    <div className="mt-3 h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#252836' }}>
                                        <div
                                            className="h-full rounded-full transition-all duration-300"
                                            style={{
                                                width: `${accuracy}%`,
                                                backgroundColor: color
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Difficulty Distribution */}
                <div>
                    <h2 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: '#9CA3AF', fontFamily: 'Nunito' }}>
                        Difficulty Levels
                    </h2>
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map(level => {
                            const data = stats.difficultyStats[level];
                            const height = data.attempted > 0 ? Math.min((data.attempted / 10) * 100, 100) : 10;

                            return (
                                <div key={level} className="flex-1">
                                    <div className="flex flex-col items-center">
                                        <div className="w-full flex items-end justify-center" style={{ height: '120px' }}>
                                            <div
                                                className="w-full rounded-t-lg transition-all duration-300"
                                                style={{
                                                    height: `${height}%`,
                                                    backgroundColor: '#6366F1',
                                                    minHeight: '20px'
                                                }}
                                            />
                                        </div>
                                        <div className="mt-2 text-center">
                                            <div className="text-xs font-bold" style={{ color: '#F9FAFB', fontFamily: 'Nunito' }}>
                                                L{level}
                                            </div>
                                            <div className="text-[10px]" style={{ color: '#9CA3AF', fontFamily: 'Nunito' }}>
                                                {data.attempted}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Empty state if no data */}
                {stats.questionsAttempted === 0 && (
                    <div className="text-center py-12">
                        <TrendingUp className="w-16 h-16 mb-4 mx-auto" style={{ color: '#2D3142' }} />
                        <h3 className="text-lg font-bold mb-2" style={{ color: '#F9FAFB', fontFamily: 'Nunito' }}>
                            No Stats Yet
                        </h3>
                        <p className="text-sm mb-4" style={{ color: '#9CA3AF', fontFamily: 'Nunito' }}>
                            Start practicing to see your progress here
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProgressScreen;
