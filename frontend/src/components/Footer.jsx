import React from "react";

export default function Footer() {
  return (
    <footer className="py-12 border-t border-white/10 bg-[#050110] relative z-20">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-center md:text-left">
          <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-cyan-400">
            ClosetRush
          </div>
          <p className="text-gray-500 text-sm mt-2">
            © 2026 ClosetRush Inc. Fashion for Everyone.
          </p>
        </div>

        <div className="flex gap-8 text-sm text-gray-400">
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
          <a href="#" className="hover:text-white transition-colors">Terms</a>
          <a href="#" className="hover:text-white transition-colors">Instagram</a>
          <a href="#" className="hover:text-white transition-colors">Twitter</a>
        </div>
      </div>
    </footer>
  );
}
