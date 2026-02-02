import React from 'react';

export default function Financials() {
    return (
        <div className="bg-[#0f0f11] rounded-3xl border border-white/5 p-8">
            <h2 className="text-xl font-bold mb-6 text-white">Financial Overview</h2>
            <div className="p-10 text-center border-2 border-dashed border-white/10 rounded-2xl text-gray-500">
                <span className="block text-4xl mb-2">💸</span>
                <p className="uppercase tracking-widest text-xs font-bold">No financial data available</p>
                <p className="text-xs mt-2 text-gray-600">Transactions will appear here once the payment gateway is live.</p>
            </div>
        </div>
    );
}
