'use client';

import { useState, useEffect } from 'react';
import { ArrowRightLeft, RefreshCw, TrendingUp } from 'lucide-react';

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
    const [baseCurrency, setBaseCurrency] = useState('EUR');
    const [rates, setRates] = useState<Rates>({});
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchRates = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${baseCurrency}`);
            if (!response.ok) throw new Error('Failed to fetch rates');
            const data = await response.json();
            setRates(data.rates);
            setLastUpdated(new Date());
        } catch (err) {
            setError('Could not load exchange rates');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRates();
    }, [baseCurrency]);

    return (
        <div className="bg-gradient-card backdrop-blur-xl rounded-3xl border border-slate-700/50 shadow-2xl p-6 h-full">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                        <TrendingUp className="text-uhuru-cyan" size={24} />
                        Live Exchange Rates
                    </h2>
                    <p className="text-sm text-slate-400 mt-1">
                        Real-time market data
                    </p>
                </div>
                <div className="flex gap-2">
                    <select
                        value={baseCurrency}
                        onChange={(e) => setBaseCurrency(e.target.value)}
                        className="bg-slate-800/50 border border-slate-700 text-white text-sm rounded-lg focus:ring-uhuru-cyan focus:border-uhuru-cyan block p-2.5 outline-none"
                    >
                        {SUPPORTED_CURRENCIES.map((curr) => (
                            <option key={curr.code} value={curr.code}>
                                {curr.flag} {curr.code}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <RefreshCw className="animate-spin text-uhuru-cyan" size={32} />
                </div>
            ) : error ? (
                <div className="text-red-400 text-center py-8">{error}</div>
            ) : (
                <div className="space-y-4">
                    {SUPPORTED_CURRENCIES.filter(c => c.code !== baseCurrency).map((curr) => (
                        <div
                            key={curr.code}
                            className="flex items-center justify-between p-4 rounded-xl bg-slate-800/30 border border-slate-700/30 hover:border-slate-600 transition-all group"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">{curr.flag}</span>
                                <div>
                                    <div className="font-medium text-slate-200">{curr.name}</div>
                                    <div className="text-xs text-slate-500">1 {baseCurrency} =</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-lg font-bold text-white font-mono tracking-tight">
                                    {rates[curr.code]?.toFixed(4)}
                                </div>
                                <div className="text-xs text-uhuru-cyan dark:text-uhuru-cyan flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ArrowRightLeft size={12} />
                                    {curr.code}
                                </div>
                            </div>
                        </div>
                    ))}

                    <div className="text-xs text-slate-500 text-center mt-4 pt-4 border-t border-slate-700/50">
                        Last updated: {lastUpdated?.toLocaleTimeString()}
                    </div>
                </div>
            )}
        </div>
    );
}
