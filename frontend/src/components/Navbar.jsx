import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Check auth status
    const user = localStorage.getItem("user");
    if (user) setIsAuthenticated(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path) => location.pathname === path;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b ${scrolled
        ? "bg-[#020617]/90 backdrop-blur-md border-white/10 py-4"
        : "bg-transparent border-transparent py-6"
        }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group relative z-50">
          <div className="relative">
            <div className="absolute inset-0 bg-cyan-500 blur-lg opacity-0 group-hover:opacity-40 transition-opacity duration-300" />
            <span className="text-2xl md:text-3xl font-black italic tracking-tighter text-white relative z-10 transition-transform group-hover:scale-105 inline-block mix-blend-difference">
              CLOSETRUSH
              <span className="text-cyan-400">.</span>
            </span>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-10">
          {[
            { label: 'Explore Heat', path: '/explore' },
            { label: 'Wishlist', path: '/wishlist' },
          ].map((link, i) => (
            <Link
              key={i}
              to={link.path}
              className={`relative text-[10px] font-mono font-bold uppercase tracking-[0.2em] transition-all hover:text-cyan-400 ${isActive(link.path) || location.pathname.includes(link.path) ? 'text-white' : 'text-gray-400'}`}
            >
              {link.label}
              {/* Underline indicators for hover/active could go here */}
            </Link>
          ))}
        </div>

        {/* Actions + Mobile Toggle */}
        <div className="flex items-center gap-6">
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <Link to="/dashboard" className="hidden sm:flex items-center gap-3 pl-6 border-l border-white/10 group">
                <div className="text-right hidden lg:block">
                  <div className="text-[10px] font-black text-white uppercase tracking-widest group-hover:text-cyan-400 transition-colors">
                    {JSON.parse(localStorage.getItem('user') || '{}').username || 'User'}
                  </div>
                  <div className="text-[8px] text-gray-500 font-mono uppercase bg-white/5 px-1 rounded inline-block">Verified</div>
                </div>
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-stone-800 to-black border border-white/20 group-hover:border-cyan-400/50 transition-colors overflow-hidden flex items-center justify-center text-white font-bold uppercase">
                    {(JSON.parse(localStorage.getItem('user') || '{}').username || 'U').charAt(0)}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-black" />
                </div>
              </Link>
              <button
                onClick={() => {
                  localStorage.removeItem('user');
                  window.location.href = '/login';
                }}
                className="p-2 text-gray-500 hover:text-red-500 transition-colors" title="Logout"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              </button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-4">
              <Link to="/login" className="text-xs font-bold uppercase tracking-widest text-white hover:text-cyan-400 transition-colors">
                Log in
              </Link>
              <Link
                to="/signup"
                className="px-6 py-2.5 bg-white text-black text-xs font-black uppercase tracking-widest hover:bg-cyan-400 hover:scale-105 transition-all clip-path-slant"
                style={{ clipPath: 'polygon(10% 0, 100% 0, 90% 100%, 0% 100%)' }}
              >
                Join Now
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            className="md:hidden relative z-50 p-2 text-white group"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <div className="w-6 flex flex-col items-end gap-1.5">
              <span className={`h-0.5 bg-current transition-all duration-300 ${mobileMenuOpen ? 'w-6 rotate-45 translate-y-2' : 'w-6'}`} />
              <span className={`h-0.5 bg-current transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : 'w-4 group-hover:w-6'}`} />
              <span className={`h-0.5 bg-current transition-all duration-300 ${mobileMenuOpen ? 'w-6 -rotate-45 -translate-y-2' : 'w-2 group-hover:w-6'}`} />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 bg-[#020617] z-40 flex flex-col justify-center px-8 transition-transform duration-500 ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col gap-8">
          {[
            { label: "Explore Heat", path: "/explore" },
            { label: "Wishlist", path: "/wishlist" },
          ].map((link, i) => (
            <Link
              key={i}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className="text-4xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-600 hover:to-cyan-400 transition-all uppercase tracking-tighter"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {!isAuthenticated && (
          <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-8">
            <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="text-xl font-bold text-gray-400 hover:text-white">Log In</Link>
            <Link to="/signup" onClick={() => setMobileMenuOpen(false)} className="px-8 py-4 bg-white text-black text-center font-black uppercase tracking-widest">Sign Up Free</Link>
          </div>
        )}
      </div>
    </nav>
  );
}
