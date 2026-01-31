import React, { useState, useEffect } from 'react';
import { BookmarkIcon, FileText, XCircle, Search } from 'lucide-react';
import { getBookmarks, getNotes, getMistakes, removeBookmark, removeNote, removeMistake } from '../services/storage';

const LibraryScreen = () => {
    const [activeTab, setActiveTab] = useState('bookmarks');
    const [searchQuery, setSearchQuery] = useState('');
    const [bookmarks, setBookmarks] = useState([]);
    const [notes, setNotes] = useState([]);
    const [mistakes, setMistakes] = useState([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        setBookmarks(getBookmarks());
        setNotes(getNotes());
        setMistakes(getMistakes());
    };

    const handleRemove = (id, type) => {
        if (type === 'bookmarks') {
            removeBookmark(id);
            setBookmarks(getBookmarks());
        } else if (type === 'notes') {
            removeNote(id);
            setNotes(getNotes());
        } else if (type === 'mistakes') {
            removeMistake(id);
            setMistakes(getMistakes());
        }
    };

    const tabs = [
        { id: 'bookmarks', label: 'Bookmarks', icon: BookmarkIcon, data: bookmarks },
        { id: 'notes', label: 'Notes', icon: FileText, data: notes },
        { id: 'mistakes', label: 'Mistakes', icon: XCircle, data: mistakes }
    ];

    const activeData = tabs.find(t => t.id === activeTab).data;
    const filteredData = activeData.filter(item =>
        item.question?.text?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="h-screen overflow-y-auto pb-24" style={{ backgroundColor: '#0F1117' }}>
            {/* Header */}
            <div className="px-5 py-6 border-b" style={{ borderColor: '#2D3142' }}>
                <h1 className="text-2xl font-bold mb-4" style={{ color: '#F9FAFB', fontFamily: 'Nunito' }}>
                    Library
                </h1>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#9CA3AF' }} />
                    <input
                        type="text"
                        placeholder="Search saved questions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 transition-all"
                        style={{
                            backgroundColor: '#1A1D2E',
                            border: '1px solid #2D3142',
                            color: '#F9FAFB',
                            fontFamily: 'Nunito'
                        }}
                    />
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b" style={{ borderColor: '#2D3142' }}>
                {tabs.map(tab => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className="flex-1 py-3 flex items-center justify-center gap-2 transition-all relative"
                            style={{
                                color: activeTab === tab.id ? '#6366F1' : '#9CA3AF',
                                fontFamily: 'Nunito'
                            }}
                        >
                            <Icon className="w-4 h-4" />
                            <span className="text-sm font-semibold">{tab.label}</span>
                            {activeTab === tab.id && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: '#6366F1' }} />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Content */}
            <div className="p-5">
                {filteredData.length === 0 ? (
                    <div className="text-center py-16">
                        {tabs.find(t => t.id === activeTab).icon === BookmarkIcon ? (
                            <BookmarkIcon className="w-16 h-16 mb-4 mx-auto" style={{ color: '#2D3142' }} />
                        ) : tabs.find(t => t.id === activeTab).icon === FileText ? (
                            <FileText className="w-16 h-16 mb-4 mx-auto" style={{ color: '#2D3142' }} />
                        ) : (
                            <XCircle className="w-16 h-16 mb-4 mx-auto" style={{ color: '#2D3142' }} />
                        )}
                        <h3 className="text-lg font-bold mb-2" style={{ color: '#F9FAFB', fontFamily: 'Nunito' }}>
                            No {activeTab} yet
                        </h3>
                        <p className="text-sm" style={{ color: '#9CA3AF', fontFamily: 'Nunito' }}>
                            {activeTab === 'bookmarks' && 'Bookmark questions while practicing'}
                            {activeTab === 'notes' && 'Add notes to questions'}
                            {activeTab === 'mistakes' && 'Review questions you got wrong'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredData.map(item => (
                            <div
                                key={item.id}
                                className="p-4 rounded-xl border relative group"
                                style={{ backgroundColor: '#1A1D2E', borderColor: '#2D3142' }}
                            >
                                {/* Remove button */}
                                <button
                                    onClick={() => handleRemove(item.id, activeTab)}
                                    className="absolute top-2 right-2 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                    style={{ backgroundColor: '#252836' }}
                                >
                                    <XCircle className="w-4 h-4" style={{ color: '#EF4444' }} />
                                </button>

                                {/* Question text */}
                                <p className="text-sm font-medium mb-2 pr-8" style={{ color: '#F9FAFB', fontFamily: 'Nunito' }}>
                                    {item.question?.text}
                                </p>

                                {/* Metadata */}
                                <div className="flex items-center gap-3 text-xs" style={{ color: '#9CA3AF', fontFamily: 'Nunito' }}>
                                    <span className="px-2 py-1 rounded" style={{ backgroundColor: '#252836' }}>
                                        {item.question?.subject}
                                    </span>
                                    <span>Level {item.question?.level || 1}</span>
                                    {activeTab === 'notes' && item.noteText && (
                                        <span className="flex-1 truncate">"{item.noteText}"</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LibraryScreen;
