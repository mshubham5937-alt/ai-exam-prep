// Enhanced Storage System for PrepStream Features

const STORAGE_KEYS = {
    STATS: 'exam_prep_stats',
    BOOKMARKS: 'exam_prep_bookmarks',
    NOTES: 'exam_prep_notes',
    MISTAKES: 'exam_prep_mistakes',
    PREFERENCES: 'exam_prep_preferences',
    FILTERS: 'exam_prep_filters'
};

// Stats Management
export const getStats = () => {
    const stats = localStorage.getItem(STORAGE_KEYS.STATS);
    return stats ? JSON.parse(stats) : {
        questionsAttempted: 0,
        questionsCorrect: 0,
        accuracy: 0,
        currentStreak: 0,
        lastAttemptDate: null,
        subjectStats: {
            Physics: { attempted: 0, correct: 0 },
            Chemistry: { attempted: 0, correct: 0 },
            Maths: { attempted: 0, correct: 0 },
            Biology: { attempted: 0, correct: 0 }
        },
        weeklyActivity: Array(7).fill(0), // Last 7 days
        difficultyStats: {
            1: { attempted: 0, correct: 0 },
            2: { attempted: 0, correct: 0 },
            3: { attempted: 0, correct: 0 },
            4: { attempted: 0, correct: 0 },
            5: { attempted: 0, correct: 0 }
        }
    };
};

export const updateStats = (isCorrect, subject, difficulty = 3) => {
    const stats = getStats();

    stats.questionsAttempted++;
    if (isCorrect) stats.questionsCorrect++;
    stats.accuracy = Math.round((stats.questionsCorrect / stats.questionsAttempted) * 100);

    // Update streak
    const today = new Date().toDateString();
    if (stats.lastAttemptDate === today) {
        // Same day, don't change streak
    } else {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (stats.lastAttemptDate === yesterday.toDateString()) {
            stats.currentStreak++;
        } else {
            stats.currentStreak = 1;
        }
        stats.lastAttemptDate = today;
    }

    // Subject stats
    if (stats.subjectStats[subject]) {
        stats.subjectStats[subject].attempted++;
        if (isCorrect) stats.subjectStats[subject].correct++;
    }

    // Difficulty stats
    if (stats.difficultyStats[difficulty]) {
        stats.difficultyStats[difficulty].attempted++;
        if (isCorrect) stats.difficultyStats[difficulty].correct++;
    }

    // Weekly activity (today)
    stats.weeklyActivity[6]++;

    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
    return stats;
};

export const resetStats = () => {
    localStorage.removeItem(STORAGE_KEYS.STATS);
    return getStats();
};

// Bookmarks Management
export const getBookmarks = () => {
    const bookmarks = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
    return bookmarks ? JSON.parse(bookmarks) : [];
};

export const addBookmark = (question) => {
    const bookmarks = getBookmarks();
    const bookmark = {
        id: `bookmark_${Date.now()}`,
        questionId: question.id,
        question,
        timestamp: Date.now()
    };
    bookmarks.unshift(bookmark);
    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
    return bookmarks;
};

export const removeBookmark = (idOrQuestionId) => {
    const bookmarks = getBookmarks();
    const filtered = bookmarks.filter(b => b.id !== idOrQuestionId && b.questionId !== idOrQuestionId);
    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(filtered));
    return filtered;
};

export const isBookmarked = (questionId) => {
    const bookmarks = getBookmarks();
    return bookmarks.some(b => b.questionId === questionId);
};

// Notes Management
export const getNotes = () => {
    const notes = localStorage.getItem(STORAGE_KEYS.NOTES);
    return notes ? JSON.parse(notes) : [];
};

export const saveNote = (questionId, noteText, question) => {
    const notes = getNotes();
    const existingIndex = notes.findIndex(n => n.questionId === questionId);

    const note = {
        id: existingIndex >= 0 ? notes[existingIndex].id : `note_${Date.now()}`,
        questionId,
        question,
        noteText,
        timestamp: Date.now()
    };

    if (existingIndex >= 0) {
        notes[existingIndex] = note;
    } else {
        notes.unshift(note);
    }

    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
    return notes;
};

export const removeNote = (id) => {
    const notes = getNotes();
    const filtered = notes.filter(n => n.id !== id);
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(filtered));
    return filtered;
};

// Mistakes Management
export const getMistakes = () => {
    const mistakes = localStorage.getItem(STORAGE_KEYS.MISTAKES);
    return mistakes ? JSON.parse(mistakes) : [];
};

export const saveMistake = (question, selectedAnswer) => {
    const mistakes = getMistakes();
    const mistake = {
        id: `mistake_${Date.now()}`,
        questionId: question.id,
        question,
        selectedAnswer,
        correctAnswer: question.correct,
        timestamp: Date.now()
    };
    mistakes.unshift(mistake);
    localStorage.setItem(STORAGE_KEYS.MISTAKES, JSON.stringify(mistakes));
    return mistakes;
};

export const removeMistake = (id) => {
    const mistakes = getMistakes();
    const filtered = mistakes.filter(m => m.id !== id);
    localStorage.setItem(STORAGE_KEYS.MISTAKES, JSON.stringify(filtered));
    return filtered;
};

// User Preferences
export const getPreferences = () => {
    const prefs = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
    return prefs ? JSON.parse(prefs) : {
        userName: 'Student',
        theme: 'dark',
        language: 'English',
        notifications: true
    };
};

export const savePreferences = (preferences) => {
    localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(preferences));
    return preferences;
};

// Filters
export const getFilters = () => {
    const filters = localStorage.getItem(STORAGE_KEYS.FILTERS);
    return filters ? JSON.parse(filters) : {
        exam: 'JEE',
        subject: 'Mix',
        difficulty: 3,
        language: 'English'
    };
};

export const saveFilters = (filters) => {
    localStorage.setItem(STORAGE_KEYS.FILTERS, JSON.stringify(filters));
    return filters;
};

// Clear all data
export const clearAllData = () => {
    Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
    });
};

export const exportData = () => {
    const data = {
        stats: getStats(),
        bookmarks: getBookmarks(),
        notes: getNotes(),
        mistakes: getMistakes(),
        preferences: getPreferences(),
        filters: getFilters(),
        exportDate: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
};

export const importData = (jsonString) => {
    try {
        const data = JSON.parse(jsonString);
        if (data.stats) localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(data.stats));
        if (data.bookmarks) localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(data.bookmarks));
        if (data.notes) localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(data.notes));
        if (data.mistakes) localStorage.setItem(STORAGE_KEYS.MISTAKES, JSON.stringify(data.mistakes));
        if (data.preferences) localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(data.preferences));
        if (data.filters) localStorage.setItem(STORAGE_KEYS.FILTERS, JSON.stringify(data.filters));
        return true;
    } catch (error) {
        console.error('Failed to import data:', error);
        return false;
    }
};
