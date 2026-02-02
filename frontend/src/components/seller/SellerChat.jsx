import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import config from '../../config';

const API_URL = config.API_URL;

export default function SellerChat() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        fetchConversations();
        // Poll for new messages every 5 seconds
        const interval = setInterval(fetchConversations, 5000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (selectedConversation) {
            fetchMessages(selectedConversation.rentalId);
        }
    }, [selectedConversation]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchConversations = async () => {
        try {
            if (!user._id) return;
            const res = await fetch(`${API_URL}/messages/conversations/${user._id}`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setConversations(data);
            } else {
                console.warn('Conversations fetch returned non-array:', data);
                setConversations([]);
            }
        } catch (err) {
            console.error('Error fetching conversations:', err);
            setConversations([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (rentalId) => {
        try {
            const res = await fetch(`${API_URL}/messages/rental/${rentalId}?userId=${user._id}`);
            const data = await res.json();
            setMessages(data);
        } catch (err) {
            console.error('Error fetching messages:', err);
        }
    };

    const handleSearch = async (query) => {
        setSearchQuery(query);
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }
        try {
            const res = await fetch(`${API_URL}/messages/search-users?query=${query}&sellerId=${user.username}`);
            const data = await res.json();
            setSearchResults(data);
        } catch (err) {
            console.error('Error searching users:', err);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !selectedConversation) return;

        try {
            const res = await fetch(`${API_URL}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    senderId: user._id,
                    receiverId: selectedConversation.otherUser._id,
                    rentalId: selectedConversation.rentalId,
                    content: newMessage.trim()
                })
            });

            if (res.ok) {
                setNewMessage('');
                fetchMessages(selectedConversation.rentalId);
            }
        } catch (err) {
            console.error('Error sending message:', err);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const startConversation = (result) => {
        setSelectedConversation({
            rentalId: result.rentalId,
            otherUser: result.user,
            rental: { productId: { name: 'Rental Item' } }
        });
        setSearchQuery('');
        setSearchResults([]);
    };

    return (
        <div className="h-[600px] flex bg-[#0f0f11] rounded-xl border border-white/10 overflow-hidden">
            {/* Sidebar */}
            <div className="w-80 border-r border-white/10 flex flex-col bg-black/20">
                <div className="p-4 border-b border-white/10">
                    <h3 className="font-black uppercase italic tracking-wider text-sm mb-3">Messages</h3>
                    <div className="relative">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            placeholder="Search buyers..."
                            className="w-full bg-[#1a1a1d] border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                        />
                        {searchResults.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a1a1d] border border-white/10 rounded-lg overflow-hidden z-10">
                                {searchResults.map((result, i) => (
                                    <button
                                        key={i}
                                        onClick={() => startConversation(result)}
                                        className="w-full px-4 py-3 text-left hover:bg-white/5 border-b border-white/5 last:border-0"
                                    >
                                        <div className="font-bold text-sm">@{result.user.username}</div>
                                        <div className="text-xs text-gray-500">{result.user.fullName}</div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Conversation List */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="p-4 text-center text-gray-500 text-sm">Loading...</div>
                    ) : conversations.length === 0 ? (
                        <div className="p-8 text-center text-gray-600 text-xs uppercase tracking-widest">
                            No conversations yet
                        </div>
                    ) : (
                        conversations.map((conv, i) => (
                            <button
                                key={i}
                                onClick={() => setSelectedConversation(conv)}
                                className={`w-full p-4 text-left border-b border-white/5 hover:bg-white/5 transition-colors ${selectedConversation?.rentalId === conv.rentalId ? 'bg-white/10' : ''
                                    }`}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="font-bold text-sm">@{conv.otherUser?.username}</div>
                                    {conv.unreadCount > 0 && (
                                        <span className="bg-cyan-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full">
                                            {conv.unreadCount}
                                        </span>
                                    )}
                                </div>
                                <div className="text-xs text-gray-500 mt-1 truncate">
                                    {conv.rental?.productId?.name || 'Rental'}
                                </div>
                                <div className="text-xs text-gray-600 mt-1 truncate">
                                    {conv.lastMessage?.content}
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
                {selectedConversation ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-white/10 bg-black/20">
                            <div className="font-bold">@{selectedConversation.otherUser?.username}</div>
                            <div className="text-xs text-gray-500">
                                {selectedConversation.rental?.productId?.name || 'Rental Chat'}
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((msg, i) => {
                                const isOwn = msg.senderId?._id === user._id || msg.senderId === user._id;
                                return (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${isOwn
                                            ? 'bg-cyan-500 text-black'
                                            : 'bg-white/10 text-white'
                                            }`}>
                                            <div className="text-sm">{msg.content}</div>
                                            <div className={`text-[10px] mt-1 ${isOwn ? 'text-black/60' : 'text-gray-500'}`}>
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-white/10">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Type a message..."
                                    className="flex-1 bg-[#1a1a1d] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                                />
                                <button
                                    onClick={sendMessage}
                                    disabled={!newMessage.trim()}
                                    className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl transition-colors disabled:opacity-50"
                                >
                                    Send
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-600 gap-4">
                        <svg className="w-16 h-16 opacity-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <p className="font-mono text-sm uppercase tracking-widest">Select a conversation</p>
                    </div>
                )}
            </div>
        </div>
    );
}
