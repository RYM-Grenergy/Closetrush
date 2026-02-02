import React from 'react';

export default function Settings() {
    return (
        <div className="bg-[#0f0f11] rounded-3xl border border-white/5 p-8">
            <h2 className="text-xl font-bold mb-6 text-white">Platform Settings</h2>
            <div className="space-y-6 max-w-xl">
                <div>
                    <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Platform Name</label>
                    <input type="text" defaultValue="ClosetRush" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white" />
                </div>
                <div>
                    <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Maintenance Mode</label>
                    <div className="flex items-center gap-2">
                        <div className="w-12 h-6 bg-white/10 rounded-full p-1 cursor-pointer">
                            <div className="w-4 h-4 bg-gray-500 rounded-full"></div>
                        </div>
                        <span className="text-sm text-gray-500">Disabled</span>
                    </div>
                </div>
                <button className="px-6 py-2 bg-white text-black font-bold uppercase tracking-widest text-xs rounded hover:bg-cyan-400 transition-colors">
                    Save Changes
                </button>
            </div>
        </div>
    );
}
