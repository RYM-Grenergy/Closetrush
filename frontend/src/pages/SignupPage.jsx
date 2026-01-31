import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";

export default function SignupPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: ""
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleSignup = (e) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            localStorage.setItem("user", "true");
            navigate("/explore");
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-pink-600/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px]" />
            </div>

            <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 shadow-2xl rounded-3xl overflow-hidden border border-white/5 relative z-10 bg-[#0f0f11]/60 backdrop-blur-xl">

                {/* Right Side - Visual (Swapped for variety) */}
                <div className="hidden md:flex flex-col justify-center items-center p-12 bg-gradient-to-br from-pink-900 to-rose-900 relative overflow-hidden order-last">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')] bg-cover bg-center opacity-40 mix-blend-overlay" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                    <div className="relative z-10 text-center max-w-md">
                        <div className="w-20 h-20 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl mx-auto mb-8 flex items-center justify-center shadow-2xl -rotate-3">
                            <span className="text-4xl">✨</span>
                        </div>
                        <h2 className="text-3xl font-bold mb-4">Start your fashion journey.</h2>
                        <p className="text-gray-300 text-lg leading-relaxed">
                            Access exclusive drops, rent premium looks, and earn from your wardrobe.
                        </p>

                        <div className="mt-10">
                            <div className="inline-flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                <span className="text-sm font-medium">500+ New items today</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Left Side - Form */}
                <div className="p-10 md:p-16 flex flex-col justify-center">
                    <div className="mb-8">
                        <Link to="/" className="inline-flex items-center gap-2 mb-8 group">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-pink-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform">
                                C
                            </div>
                            <span className="text-xl font-bold tracking-tight text-white group-hover:text-cyan-300 transition-colors">ClosetRush</span>
                        </Link>
                        <h1 className="text-4xl font-bold mb-3">Create an account</h1>
                        <p className="text-gray-400">Join the community in seconds.</p>
                    </div>

                    <form onSubmit={handleSignup} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
                            <input
                                type="text"
                                required
                                className="w-full bg-[#1a1a1d] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all placeholder:text-gray-600"
                                placeholder="e.g. Alex Smith"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                            <input
                                type="email"
                                required
                                className="w-full bg-[#1a1a1d] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all placeholder:text-gray-600"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
                            <input
                                type="password"
                                required
                                className="w-full bg-[#1a1a1d] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all placeholder:text-gray-600"
                                placeholder="Create a password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-400 mt-2">
                            <input type="checkbox" required className="rounded border-gray-600 bg-[#1a1a1d] text-pink-500 focus:ring-pink-500" />
                            <span>I agree to the <a href="#" className="text-white underline decoration-white/30 hover:decoration-white">Terms</a> & <a href="#" className="text-white underline decoration-white/30 hover:decoration-white">Privacy Policy</a></span>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full mt-4 bg-white text-black font-bold py-3.5 rounded-xl hover:bg-pink-50 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                            ) : (
                                "Create Account"
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-white/10 text-center">
                        <p className="text-gray-400 text-sm">
                            Already have an account? <Link to="/login" className="text-white font-bold hover:text-pink-400 transition-colors">Log in</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
