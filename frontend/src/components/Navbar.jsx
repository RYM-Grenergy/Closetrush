import React, { useState, useEffect } from "react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
          ? "bg-[#0b0220]/80 backdrop-blur-xl border-b border-white/10 py-3"
          : "bg-transparent py-5"
        }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2 group z-50 relative">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-pink-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg shadow-[0_0_15px_rgba(236,72,153,0.5)] group-hover:shadow-[0_0_25px_rgba(236,72,153,0.8)] transition-all">
            C
          </div>
          <span className="text-xl font-bold tracking-tight text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-400 transition-all">
            ClosetRush
          </span>
        </a>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
          <a href="#rent" className="hover:text-cyan-400 transition-colors">Rent</a>
          <a href="#buy" className="hover:text-pink-400 transition-colors">Buy</a>
          <a href="#how" className="hover:text-white transition-colors">How it works</a>
          <a href="#benefits" className="hover:text-white transition-colors">Benefits</a>
        </div>

        {/* Actions + Mobile Toggle */}
        <div className="flex items-center gap-4">
          <a href="#login" className="hidden sm:block text-sm font-medium text-white hover:text-cyan-400 transition-colors">
            Log in
          </a>
          <a
            href="#signup"
            className="hidden sm:block px-5 py-2.5 rounded-xl bg-white text-black text-sm font-bold hover:bg-cyan-50 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:shadow-[0_0_25px_rgba(0,0,0,0.2)] hover:scale-105 active:scale-95 duration-300"
          >
            Sign Up
          </a>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden relative z-50 p-2 text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-[#0b0220] z-40 flex flex-col items-center justify-center space-y-8 p-8 md:hidden">
          <a href="#rent" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-bold text-white hover:text-cyan-400">Rent</a>
          <a href="#buy" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-bold text-white hover:text-pink-400">Buy</a>
          <a href="#how" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-bold text-white">How it works</a>
          <a href="#benefits" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-bold text-white">Benefits</a>
          <hr className="w-20 border-white/20" />
          <a href="#login" onClick={() => setMobileMenuOpen(false)} className="text-xl font-medium text-gray-300">Log in</a>
          <a href="#signup" onClick={() => setMobileMenuOpen(false)} className="px-8 py-3 rounded-xl bg-white text-black text-lg font-bold">Sign Up</a>
        </div>
      )}
    </nav>
  );
}
