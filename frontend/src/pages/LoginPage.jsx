import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import config from '../config';

export default function LoginPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await fetch(`${config.API_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();

            if (res.ok) {
                localStorage.setItem("user", JSON.stringify(data));
                if (data.role === 'admin') {
                    navigate("/super-admin");
                } else {
                    navigate("/dashboard");
                }
            } else {
                alert(data || "Login failed");
            }
        } catch (err) {
            console.error(err);
            alert("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-600/20 rounded-full blur-[120px]" />
            </div>

            <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 shadow-2xl rounded-3xl overflow-hidden border border-white/5 relative z-10 bg-[#0f0f11]/60 backdrop-blur-xl">

                {/* Left Side - Form */}
                <div className="p-10 md:p-16 flex flex-col justify-center">
                    <div className="mb-8">
                        <Link to="/" className="inline-flex items-center gap-2 mb-8 group">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-pink-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform">
                                C
                            </div>
                            <span className="text-xl font-bold tracking-tight text-white group-hover:text-cyan-300 transition-colors">ClosetRush</span>
                        </Link>
                        <h1 className="text-4xl font-bold mb-3">Welcome back</h1>
                        <p className="text-gray-400">Please enter your details to sign in.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                            <input
                                type="email"
                                required
                                className="w-full bg-[#1a1a1d] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-gray-600"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
                            <input
                                type="password"
                                required
                                className="w-full bg-[#1a1a1d] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-gray-600"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 cursor-pointer text-gray-400 hover:text-white transition-colors">
                                <input type="checkbox" className="rounded border-gray-600 bg-[#1a1a1d] text-cyan-500 focus:ring-cyan-500" />
                                Remember me
                            </label>
                            <a href="#" className="text-cyan-400 hover:text-cyan-300 transition-colors">Forgot password?</a>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-white text-black font-bold py-3.5 rounded-xl hover:bg-cyan-50 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                            ) : (
                                "Sign in"
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-white/10 text-center">
                        <p className="text-gray-400 text-sm">
                            Don't have an account? <Link to="/signup" className="text-white font-bold hover:text-cyan-400 transition-colors">Sign up for free</Link>
                        </p>
                    </div>
                </div>

                {/* Right Side - Visual */}
                <div className="hidden md:flex flex-col justify-center items-center p-12 bg-gradient-to-br from-indigo-900 to-purple-900 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523381210434-271e8be1f52b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')] bg-cover bg-center opacity-40 mix-blend-overlay" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                    <div className="relative z-10 text-center max-w-md">
                        <div className="w-20 h-20 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl mx-auto mb-8 flex items-center justify-center shadow-2xl rotate-3">
                            <span className="text-4xl">🛍️</span>
                        </div>
                        <h2 className="text-3xl font-bold mb-4">Turn your closet into cash.</h2>
                        <p className="text-gray-300 text-lg leading-relaxed">
                            Join thousands of trendsetters buying, renting, and selling unique fashion pieces every day.
                        </p>

                        {/* Mini testimonial or stats */}
                        <div className="mt-10 flex gap-4 justify-center">
                            <div className="bg-black/30 backdrop-blur px-4 py-2 rounded-lg border border-white/10 text-sm">
                                <span className="block font-bold text-cyan-400">12K+</span> Users
                            </div>
                            <div className="bg-black/30 backdrop-blur px-4 py-2 rounded-lg border border-white/10 text-sm">
                                <span className="block font-bold text-pink-400">$45K+</span> Revenue
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
