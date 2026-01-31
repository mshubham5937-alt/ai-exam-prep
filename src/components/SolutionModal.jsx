import React from 'react';
import { X, CheckCircle, AlertCircle, BookOpen } from 'lucide-react';

const SolutionModal = ({ isOpen, onClose, solution, isCorrect }) => {
    if (!isOpen) return null;

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
                        <div
                            className="w-8 h-8 rounded-full flex items-center justify-center"
                            style={{
                                backgroundColor: isCorrect ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'
                            }}
                        >
                            {isCorrect ? (
                                <CheckCircle className="w-4 h-4" style={{ color: '#10B981' }} />
                            ) : (
                                <AlertCircle className="w-4 h-4" style={{ color: '#EF4444' }} />
                            )}
                        </div>
                        <h2 className="text-lg font-bold" style={{ color: '#F9FAFB', fontFamily: 'Nunito' }}>
                            Solution
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
                <div className="flex-1 overflow-y-auto p-5">
                    {/* Result Banner */}
                    <div
                        className="flex items-center gap-4 p-4 rounded-2xl border mb-6"
                        style={{
                            backgroundColor: isCorrect ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            borderColor: isCorrect ? '#10B981' : '#EF4444'
                        }}
                    >
                        {isCorrect ? (
                            <CheckCircle className="w-6 h-6" style={{ color: '#10B981' }} />
                        ) : (
                            <AlertCircle className="w-6 h-6" style={{ color: '#EF4444' }} />
                        )}
                        <span
                            className="text-lg font-bold"
                            style={{
                                color: isCorrect ? '#10B981' : '#EF4444',
                                fontFamily: 'Nunito'
                            }}
                        >
                            {isCorrect ? 'Well done!' : 'Not quite right'}
                        </span>
                    </div>

                    {/* Solution Section */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <BookOpen className="w-4.5 h-4.5" style={{ color: '#F59E0B' }} />
                            <h3 className="text-base font-bold" style={{ color: '#F9FAFB', fontFamily: 'Nunito' }}>
                                Explanation
                            </h3>
                        </div>
                        <p
                            className="text-base leading-relaxed whitespace-pre-wrap"
                            style={{
                                color: '#F9FAFB',
                                fontFamily: 'Nunito',
                                lineHeight: '1.625'
                            }}
                        >
                            {solution}
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div
                    className="p-5 border-t"
                    style={{ borderColor: '#2D3142' }}
                >
                    <button
                        onClick={onClose}
                        className="w-full py-4 rounded-2xl font-bold text-white text-base transition-all hover:scale-[1.02] active:scale-[0.98]"
                        style={{
                            backgroundColor: '#6366F1',
                            fontFamily: 'Nunito'
                        }}
                    >
                        Got it
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SolutionModal;
