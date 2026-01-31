import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Loader2 } from 'lucide-react';
import { callGeminiChat } from '../services/api';

const AITutorModal = ({ isOpen, onClose, question }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            // Initial greeting context
            setMessages([{
                role: 'model',
                text: `Hi! I'm your AI Tutor. I can help you understand this question about **${question.subject}**. What are you stuck on?`
            }]);
        }
    }, [isOpen, question]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMsg = input;
        setInput("");
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setLoading(true);

        // Prepare history for API
        // Contextualize with the question details first
        const contextPrompt = `
        Context:
        Question: "${question.text}"
        Options: ${JSON.stringify(question.options)}
        Correct Answer Index: ${question.correct}
        Solution Explanation: "${question.solution}"
        
        User is asking regarding this question. Be helpful, encouraging, and concise.
        `;

        const history = [
            { role: "user", parts: [{ text: contextPrompt }] },
            { role: "model", parts: [{ text: "Understood. I am ready to help the student with this question." }] },
            ...messages.map(m => ({
                role: m.role,
                parts: [{ text: m.text }]
            }))
        ];

        try {
            const reply = await callGeminiChat(history, userMsg);
            setMessages(prev => [...prev, { role: 'model', text: reply }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'model', text: "Sorry, I lost connection to the matrix. Try again?" }]);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center pointer-events-none">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="w-full sm:w-[500px] h-[80vh] sm:h-[600px] rounded-t-3xl sm:rounded-3xl shadow-2xl border flex flex-col pointer-events-auto transform transition-all animate-in slide-in-from-bottom-5 duration-300"
                style={{
                    backgroundColor: '#1A1D2E',
                    borderColor: '#2D3142'
                }}>

                {/* Header */}
                <div className="p-5 border-b flex justify-between items-center rounded-t-3xl"
                    style={{
                        backgroundColor: '#252836',
                        borderColor: '#2D3142'
                    }}>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                            <Bot className="w-5 h-5 text-indigo-300" />
                        </div>
                        <div>
                            <span className="font-bold text-slate-100 block text-sm">AI Tutor</span>
                            <span className="text-xs text-slate-400 font-medium tracking-wide">Always here to help</span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-transparent custom-scrollbar">
                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                        >
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-lg ${msg.role === 'model'
                                ? 'bg-indigo-600 shadow-indigo-500/20'
                                : 'bg-slate-700 shadow-black/20'
                                }`}>
                                {msg.role === 'model' ? <Bot className="w-5 h-5 text-white" /> : <User className="w-5 h-5 text-white" />}
                            </div>

                            <div className={`p-4 rounded-2xl text-[15px] leading-relaxed max-w-[85%] shadow-sm ${msg.role === 'user'
                                ? 'bg-indigo-600 text-white rounded-tr-sm'
                                : 'bg-white/5 border border-white/5 text-slate-200 rounded-tl-sm backdrop-blur-sm'
                                }`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex gap-4">
                            <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">
                                <Bot className="w-5 h-5 text-white" />
                            </div>
                            <div className="bg-white/5 border border-white/5 p-4 rounded-2xl rounded-tl-sm w-20 flex items-center justify-center backdrop-blur-sm">
                                <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 border-t pb-8 sm:pb-4 rounded-b-3xl"
                    style={{
                        backgroundColor: '#252836',
                        borderColor: '#2D3142'
                    }}>
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Ask a follow-up question..."
                            className="flex-1 rounded-xl px-5 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all shadow-inner"
                            style={{
                                backgroundColor: '#1A1D2E',
                                border: '1px solid #2D3142',
                                fontFamily: 'Nunito'
                            }}
                            autoFocus
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || loading}
                            className="p-3.5 rounded-xl transition-all shadow-lg active:scale-95"
                            style={{
                                backgroundColor: !input.trim() || loading ? '#252836' : '#6366F1',
                                color: '#FFFFFF',
                                cursor: !input.trim() || loading ? 'not-allowed' : 'pointer',
                                opacity: !input.trim() || loading ? 0.5 : 1
                            }}
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AITutorModal;
