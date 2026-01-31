import React, { useState, useEffect } from 'react';
import { User, Download, Trash2, RotateCcw } from 'lucide-react';
import { getPreferences, savePreferences, getStats, resetStats, clearAllData, exportData } from '../services/storage';

const ProfileScreen = () => {
    const [preferences, setPreferences] = useState(null);
    const [stats, setStats] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        setPreferences(getPreferences());
        setStats(getStats());
    };

    const handleNameChange = (e) => {
        const newPrefs = { ...preferences, userName: e.target.value };
        setPreferences(newPrefs);
        savePreferences(newPrefs);
    };

    const handleResetStats = () => {
        if (confirm('Are you sure you want to reset all your statistics? This cannot be undone.')) {
            resetStats();
            loadData();
        }
    };

    const handleClearAllData = () => {
        if (confirm('Are you sure you want to clear ALL data including bookmarks and notes? This cannot be undone.')) {
            clearAllData();
            loadData();
        }
    };

    const handleExportData = () => {
        const data = exportData();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `exam-prep-data-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    if (!preferences) {
        return <div className="flex items-center justify-center h-screen" style={{ backgroundColor: '#0F1117' }}>
            <span style={{ color: '#9CA3AF' }}>Loading...</span>
        </div>;
    }

    return (
        <div className="h-screen overflow-y-auto pb-24" style={{ backgroundColor: '#0F1117' }}>
            {/* Header with Avatar */}
            <div className="px-5 py-8 border-b" style={{ borderColor: '#2D3142' }}>
                <div className="flex flex-col items-center">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
                        style={{ backgroundColor: '#6366F1' }}>
                        <User className="w-10 h-10 text-white" />
                    </div>
                    <input
                        type="text"
                        value={preferences.userName}
                        onChange={handleNameChange}
                        className="text-xl font-bold text-center bg-transparent border-none focus:outline-none focus:ring-2 rounded px-2 py-1"
                        style={{ color: '#F9FAFB', fontFamily: 'Nunito' }}
                    />
                </div>
            </div>

            <div className="p-5 space-y-6">
                {/* Stats Summary */}
                <div>
                    <h2 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: '#9CA3AF', fontFamily: 'Nunito' }}>
                        Your Stats
                    </h2>
                    <div className="p-4 rounded-xl border space-y-2" style={{ backgroundColor: '#1A1D2E', borderColor: '#2D3142' }}>
                        <div className="flex justify-between text-sm" style={{ fontFamily: 'Nunito' }}>
                            <span style={{ color: '#9CA3AF' }}>Questions Attempted</span>
                            <span style={{ color: '#F9FAFB', fontWeight: 'bold' }}>{stats?.questionsAttempted || 0}</span>
                        </div>
                        <div className="flex justify-between text-sm" style={{ fontFamily: 'Nunito' }}>
                            <span style={{ color: '#9CA3AF' }}>Accuracy</span>
                            <span style={{ color: '#10B981', fontWeight: 'bold' }}>{stats?.accuracy || 0}%</span>
                        </div>
                        <div className="flex justify-between text-sm" style={{ fontFamily: 'Nunito' }}>
                            <span style={{ color: '#9CA3AF' }}>Current Streak</span>
                            <span style={{ color: '#F59E0B', fontWeight: 'bold' }}>{stats?.currentStreak || 0} days</span>
                        </div>
                    </div>
                </div>

                {/* Preferences */}
                <div>
                    <h2 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: '#9CA3AF', fontFamily: 'Nunito' }}>
                        Preferences
                    </h2>
                    <div className="space-y-3">
                        <div className="p-4 rounded-xl border flex justify-between items-center"
                            style={{ backgroundColor: '#1A1D2E', borderColor: '#2D3142' }}>
                            <span className="text-sm" style={{ color: '#F9FAFB', fontFamily: 'Nunito' }}>
                                Theme
                            </span>
                            <span className="text-sm font-semibold" style={{ color: '#6366F1', fontFamily: 'Nunito' }}>
                                Dark
                            </span>
                        </div>
                        <div className="p-4 rounded-xl border flex justify-between items-center"
                            style={{ backgroundColor: '#1A1D2E', borderColor: '#2D3142' }}>
                            <span className="text-sm" style={{ color: '#F9FAFB', fontFamily: 'Nunito' }}>
                                Language
                            </span>
                            <span className="text-sm font-semibold" style={{ color: '#6366F1', fontFamily: 'Nunito' }}>
                                English
                            </span>
                        </div>
                    </div>
                </div>

                {/* Data Management */}
                <div>
                    <h2 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: '#9CA3AF', fontFamily: 'Nunito' }}>
                        Data Management
                    </h2>
                    <div className="space-y-2">
                        <button
                            onClick={handleExportData}
                            className="w-full p-4 rounded-xl border flex items-center gap-3 hover:bg-white/5 transition-colors"
                            style={{ backgroundColor: '#1A1D2E', borderColor: '#2D3142' }}
                        >
                            <Download className="w-5 h-5" style={{ color: '#6366F1' }} />
                            <span className="text-sm font-semibold" style={{ color: '#F9FAFB', fontFamily: 'Nunito' }}>
                                Export Data
                            </span>
                        </button>
                        <button
                            onClick={handleResetStats}
                            className="w-full p-4 rounded-xl border flex items-center gap-3 hover:bg-white/5 transition-colors"
                            style={{ backgroundColor: '#1A1D2E', borderColor: '#2D3142' }}
                        >
                            <RotateCcw className="w-5 h-5" style={{ color: '#F59E0B' }} />
                            <span className="text-sm font-semibold" style={{ color: '#F9FAFB', fontFamily: 'Nunito' }}>
                                Reset Statistics
                            </span>
                        </button>
                        <button
                            onClick={handleClearAllData}
                            className="w-full p-4 rounded-xl border flex items-center gap-3 hover:bg-white/5 transition-colors"
                            style={{ backgroundColor: '#1A1D2E', borderColor: '#2D3142' }}
                        >
                            <Trash2 className="w-5 h-5" style={{ color: '#EF4444' }} />
                            <span className="text-sm font-semibold" style={{ color: '#F9FAFB', fontFamily: 'Nunito' }}>
                                Clear All Data
                            </span>
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center pt-6" style={{ color: '#9CA3AF', fontSize: '12px', fontFamily: 'Nunito' }}>
                    <p>AI Exam Prep v1.0.0</p>
                    <p className="mt-1">Made for JEE/NEET aspirants</p>
                </div>
            </div>
        </div>
    );
};

export default ProfileScreen;
