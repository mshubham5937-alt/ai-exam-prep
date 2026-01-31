import React, { useState } from 'react';
import { X, Sliders, Zap, Droplet, Hash, Heart, Shuffle } from 'lucide-react';

const FiltersModal = ({ isOpen, onClose, filters, onApply }) => {
    const [localFilters, setLocalFilters] = useState(filters);

    if (!isOpen) return null;

    const examTypes = ['JEE', 'NEET'];
    const subjects = {
        JEE: ['Mix', 'Physics', 'Chemistry', 'Maths'],
        NEET: ['Mix', 'Physics', 'Chemistry', 'Biology']
    };

    const getSubjectIcon = (subject) => {
        const icons = {
            Mix: Shuffle,
            Physics: Zap,
            Chemistry: Droplet,
            Maths: Hash,
            Biology: Heart
        };
        return icons[subject] || Shuffle;
    };

    const handleExamChange = (exam) => {
        setLocalFilters({ ...localFilters, exam, subject: 'Mix' });
    };

    const handleApply = () => {
        onApply(localFilters);
        onClose();
    };

    const validSubjects = subjects[localFilters.exam] || subjects.JEE;

    return (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div
                className="relative w-full sm:w-[600px] max-h-[90vh] rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden animate-scale-in"
                style={{ backgroundColor: '#0F1117' }}
            >
                {/* Header */}
                <div
                    className="flex justify-between items-center px-5 py-4 border-b"
                    style={{ borderColor: '#2D3142' }}
                >
                    <div className="flex items-center gap-3">
                        <Sliders className="w-5 h-5" style={{ color: '#F9FAFB' }} />
                        <h2 className="text-lg font-bold" style={{ color: '#F9FAFB', fontFamily: 'Nunito' }}>
                            Preferences
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                        style={{ color: '#9CA3AF' }}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-5 space-y-6">
                    {/* Target Exam */}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider mb-3"
                            style={{ color: '#9CA3AF', fontFamily: 'Nunito' }}>
                            Target Exam
                        </label>
                        <div className="flex gap-3">
                            {examTypes.map(exam => (
                                <button
                                    key={exam}
                                    onClick={() => handleExamChange(exam)}
                                    className="flex-1 py-3 rounded-2xl border-2 font-bold text-base transition-all"
                                    style={{
                                        backgroundColor: localFilters.exam === exam ? '#F9FAFB' : '#1A1D2E',
                                        borderColor: localFilters.exam === exam ? '#F9FAFB' : '#2D3142',
                                        color: localFilters.exam === exam ? '#0F1117' : '#F9FAFB',
                                        fontFamily: 'Nunito'
                                    }}
                                >
                                    {exam}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Subject */}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider mb-3"
                            style={{ color: '#9CA3AF', fontFamily: 'Nunito' }}>
                            Subject
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {validSubjects.map(subject => {
                                const Icon = getSubjectIcon(subject);
                                return (
                                    <button
                                        key={subject}
                                        onClick={() => setLocalFilters({ ...localFilters, subject })}
                                        className="flex items-center gap-2 px-4 py-2 rounded-xl border transition-all font-semibold text-sm"
                                        style={{
                                            backgroundColor: localFilters.subject === subject ? '#6366F1' : '#1A1D2E',
                                            borderColor: localFilters.subject === subject ? '#6366F1' : '#2D3142',
                                            color: localFilters.subject === subject ? '#FFFFFF' : '#F9FAFB',
                                            fontFamily: 'Nunito'
                                        }}
                                    >
                                        <Icon className="w-3.5 h-3.5" />
                                        {subject === 'Mix' ? 'Mix All' : subject}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Difficulty */}
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <label className="text-xs font-semibold uppercase tracking-wider"
                                style={{ color: '#9CA3AF', fontFamily: 'Nunito' }}>
                                Difficulty
                            </label>
                            <span className="text-sm font-bold" style={{ color: '#6366F1', fontFamily: 'Nunito' }}>
                                Level {localFilters.difficulty}
                            </span>
                        </div>
                        <div
                            className="relative flex rounded-2xl p-1"
                            style={{ backgroundColor: '#1A1D2E', height: '48px' }}
                        >
                            {/* Indicator */}
                            <div
                                className="absolute top-1 bottom-1 rounded-xl transition-all duration-300"
                                style={{
                                    backgroundColor: '#6366F1',
                                    left: `${(localFilters.difficulty - 1) * 20}%`,
                                    width: '20%'
                                }}
                            />
                            {/* Buttons */}
                            {[1, 2, 3, 4, 5].map(level => (
                                <button
                                    key={level}
                                    onClick={() => setLocalFilters({ ...localFilters, difficulty: level })}
                                    className="flex-1 relative z-10 font-bold text-sm transition-colors"
                                    style={{
                                        color: localFilters.difficulty === level ? '#FFFFFF' : '#9CA3AF',
                                        fontFamily: 'Nunito'
                                    }}
                                >
                                    {level}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Language (simplified) */}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider mb-3"
                            style={{ color: '#9CA3AF', fontFamily: 'Nunito' }}>
                            Language
                        </label>
                        <button
                            className="px-4 py-2 rounded-xl border"
                            style={{
                                backgroundColor: '#6366F1',
                                borderColor: '#6366F1',
                                color: '#FFFFFF',
                                fontFamily: 'Nunito',
                                fontSize: '13px',
                                fontWeight: '500'
                            }}
                        >
                            English
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div
                    className="p-5 border-t"
                    style={{ borderColor: '#2D3142' }}
                >
                    <button
                        onClick={handleApply}
                        className="w-full py-4 rounded-2xl font-bold text-base transition-all hover:scale-[1.02] active:scale-[0.98]"
                        style={{
                            backgroundColor: '#F9FAFB',
                            color: '#0F1117',
                            fontFamily: 'Nunito'
                        }}
                    >
                        Apply Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FiltersModal;
