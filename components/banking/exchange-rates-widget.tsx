'use client';

import { useState, useEffect } from 'react';
import { ArrowRightLeft, RefreshCw, TrendingUp, Calculator } from 'lucide-react';

type Rates = {
    [key: string]: number;
};

const SUPPORTED_CURRENCIES = [
    { code: 'EUR', name: 'Euro', flag: '🇪🇺' },
    { code: 'GBP', name: 'British Pound', flag: '🇬🇧' },
    { code: 'USD', name: 'US Dollar', flag: '🇺🇸' },
    { code: 'CHF', name: 'Swiss Franc', flag: '🇨🇭' },
    { code: 'JPY', name: 'Japanese Yen', flag: '🇯🇵' },
];

export function ExchangeRatesWidget() {
    const [rates, setRates] = useState<Rates>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Converter State
    const [amount, setAmount] = useState<string>('1');
    const [fromCurrency, setFromCurrency] = useState('EUR');
    const [toCurrency, setToCurrency] = useState('USD');
    const [convertedAmount, setConvertedAmount] = useState<number | null>(null);

    const fetchRates = async () => {
        setLoading(true);
        try {
            const response = await fetch(`https://api.exchangerate-api.com/v4/latest/GBP`);
            if (!response.ok) throw new Error('Failed to fetch rates');
            const data = await response.json();
            setRates(data.rates);
        } catch (err) {
            setError('Unavailable');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRates();
    }, []);

    // Calculate conversion when inputs change
    useEffect(() => {
        if (rates[fromCurrency] && rates[toCurrency] && amount) {
            const rate = rates[toCurrency] / rates[fromCurrency];
            setConvertedAmount(parseFloat(amount) * rate);
        }
    }, [amount, fromCurrency, toCurrency, rates]);

    if (error) return null;

    return (
        <div className="bg-gradient-card backdrop-blur-xl rounded-2xl border border-slate-700/50 p-4 mb-8 shadow-lg">

            {/* Top: Ticker / Rates Display */}
            <div className="w-full overflow-hidden mb-4 border-b border-slate-700/30 pb-4">
                <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2 text-uhuru-cyan font-bold whitespace-nowrap min-w-fit">
                        <TrendingUp size={16} />
                        <span>Live Rates (Base: GBP)</span>
                    </div>
                    {loading ? (
                        <RefreshCw className="animate-spin text-slate-500" size={14} />
                    ) : (
                        <div className="flex gap-8 overflow-x-auto no-scrollbar mask-linear-fade w-full">
                            {SUPPORTED_CURRENCIES.filter(c => c.code !== 'GBP').map(c => (
                                <div key={c.code} className="flex items-center gap-2 whitespace-nowrap text-slate-300">
                                    <span>{c.flag} {c.code}</span>
                                    <span className="font-mono font-medium text-white">
                                        {rates[c.code]?.toFixed(4)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom: Converter */}
            <div className="flex justify-start">
                <div className="bg-slate-800/50 rounded-xl p-2 border border-slate-700/50 flex items-center gap-3 inline-flex">
                    <div className="flex items-center gap-2 text-slate-400 px-2 border-r border-slate-700/50">
                        <Calculator size={14} />
                        <span className="text-xs font-medium uppercase tracking-wider">Converter</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-24 bg-transparent text-right font-mono text-sm text-white focus:outline-none focus:border-b border-uhuru-cyan/50"
                            placeholder="0"
                        />
                        <select
                            value={fromCurrency}
                            onChange={(e) => setFromCurrency(e.target.value)}
                            className="bg-transparent text-sm text-uhuru-cyan font-bold focus:outline-none cursor-pointer"
                        >
                            {SUPPORTED_CURRENCIES.map(c => <option key={c.code} value={c.code} className="bg-slate-900 text-white">{c.code}</option>)}
                        </select>
                    </div>

                    <ArrowRightLeft size={12} className="text-slate-500" />

                    <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-white min-w-[4rem] text-right">
                            {convertedAmount ? convertedAmount.toFixed(2) : '...'}
                        </span>
                        <select
                            value={toCurrency}
                            onChange={(e) => setToCurrency(e.target.value)}
                            className="bg-transparent text-sm text-white font-bold focus:outline-none cursor-pointer"
                        >
                            {SUPPORTED_CURRENCIES.map(c => <option key={c.code} value={c.code} className="bg-slate-900 text-white">{c.code}</option>)}
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
}
