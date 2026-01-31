import React, { useState } from 'react';
import { X, Sliders, Globe, Zap, Target, BookOpen } from 'lucide-react';

const FiltersModal = ({ isOpen, onClose, filters, onApply }) => {
    const [localFilters, setLocalFilters] = useState(filters);

    if (!isOpen) return null;

    const languages = [
        { id: 'English', label: 'English', flag: '🇬🇧' },
        { id: 'Hindi', label: 'हिंदी (Hindi)', flag: '🇮🇳' },
        { id: 'Marathi', label: 'मराठी (Marathi)', flag: '🇮🇳' },
        { id: 'Gujarati', label: 'ગુજરાતી (Gujarati)', flag: '🇮🇳' }
    ];

    const difficultyLevels = [
        { id: 1, label: 'Beginner', desc: 'Basic concepts' },
        { id: 2, id: 2, label: 'Standard', desc: 'Board level' },
        { id: 3, label: 'Elite', desc: 'JEE Mains / NEET' },
        { id: 4, label: 'Expert', desc: 'JEE Advanced' },
        { id: 5, label: 'Legend', desc: 'Olympiad Ranker' }
    ];

    const exams = ['JEE', 'NEET'];

    const handleApply = () => {
        onApply(localFilters);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4">
            {/* Premium Backdrop */}
            <div
                className="absolute inset-0 bg-[#08090D]/80 backdrop-blur-md transition-opacity duration-300"
                onClick={onClose}
            />

            {/* Modal Container */}
            <div
                className="relative w-full sm:w-[500px] max-h-[90vh] bg-[#0F1117] rounded-t-[32px] sm:rounded-[32px] flex flex-col overflow-hidden border border-white/5 shadow-2xl animate-slide-up"
            >
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-5 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                            <Sliders className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white tracking-tight" style={{ fontFamily: 'Nunito' }}>
                                Paper Settings
                            </h2>
                            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500" style={{ fontFamily: 'Nunito' }}>
                                Configure setter persona
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center text-slate-400 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">

                    {/* Language Selection */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 px-1">
                            <Globe className="w-4 h-4 text-indigo-400" />
                            <label className="text-xs font-bold uppercase tracking-widest text-slate-400" style={{ fontFamily: 'Nunito' }}>
                                Question Language
                            </label>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {languages.map(lang => (
                                <button
                                    key={lang.id}
                                    onClick={() => setLocalFilters({ ...localFilters, language: lang.id })}
                                    className={`p-3.5 rounded-2xl border text-left transition-all duration-300 flex items-center justify-between group ${localFilters.language === lang.id
                                            ? 'bg-indigo-500/10 border-indigo-500/40 text-white'
                                            : 'bg-white/5 border-white/5 text-slate-400 hover:border-white/10'
                                        }`}
                                >
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold" style={{ fontFamily: 'Nunito' }}>{lang.label}</span>
                                    </div>
                                    <span className="text-lg grayscale-0 group-hover:scale-110 transition-transform">{lang.flag}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Difficulty Grid */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 px-1">
                            <Target className="w-4 h-4 text-amber-400" />
                            <label className="text-xs font-bold uppercase tracking-widest text-slate-400" style={{ fontFamily: 'Nunito' }}>
                                Difficulty Level
                            </label>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                            {difficultyLevels.map(level => {
                                const active = localFilters.difficulty === level.id;
                                return (
                                    <button
                                        key={level.id}
                                        onClick={() => setLocalFilters({ ...localFilters, difficulty: level.id })}
                                        className={`p-4 rounded-2xl border transition-all duration-300 flex items-center gap-4 ${active
                                                ? 'bg-amber-500/10 border-amber-500/40'
                                                : 'bg-white/5 border-white/5 hover:border-white/10'
                                            }`}
                                    >
                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm ${active ? 'bg-amber-500 text-charcoal' : 'bg-white/5 text-slate-500'
                                            }`} style={{ fontFamily: 'Nunito' }}>
                                            {level.id}
                                        </div>
                                        <div className="flex flex-col text-left">
                                            <span className={`text-sm font-bold ${active ? 'text-white' : 'text-slate-300'}`} style={{ fontFamily: 'Nunito' }}>
                                                {level.label}
                                            </span>
                                            <span className="text-[10px] text-slate-500 font-medium">
                                                {level.desc}
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Target Exam */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 px-1">
                            <BookOpen className="w-4 h-4 text-emerald-400" />
                            <label className="text-xs font-bold uppercase tracking-widest text-slate-400" style={{ fontFamily: 'Nunito' }}>
                                Exam Context
                            </label>
                        </div>
                        <div className="flex gap-3">
                            {exams.map(exam => (
                                <button
                                    key={exam}
                                    onClick={() => setLocalFilters({ ...localFilters, exam, subject: 'Mix' })}
                                    className={`flex-1 p-4 rounded-2xl border font-black text-sm tracking-wider transition-all duration-300 ${localFilters.exam === exam
                                            ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                                            : 'bg-white/5 border-white/5 text-slate-500 hover:border-white/10'
                                        }`}
                                    style={{ fontFamily: 'Nunito' }}
                                >
                                    {exam}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer Action */}
                <div className="p-6 border-t border-white/5 bg-[#0F1117]/80 backdrop-blur-md">
                    <button
                        onClick={handleApply}
                        className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm tracking-widest uppercase transition-all shadow-xl shadow-indigo-600/20 active:scale-[0.98] flex items-center justify-center gap-2"
                        style={{ fontFamily: 'Nunito' }}
                    >
                        Save & Generate Script
                        <Zap className="w-4 h-4 fill-white" />
                    </button>
                    <p className="text-[9px] text-slate-600 text-center mt-4 font-bold uppercase tracking-widest">
                        AI will recalibrate to these parameters instantly
                    </p>
                </div>
            </div>
        </div>
    );
};

export default FiltersModal;
