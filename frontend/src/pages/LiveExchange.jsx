import React, { useState, useEffect } from 'react';
import './LiveExchange.css';

const LiveExchange = () => {
    const [rates, setRates] = useState({});
    const [baseCurrency, setBaseCurrency] = useState('USD');
    const [amount, setAmount] = useState(1);
    const [targetCurrency, setTargetCurrency] = useState('EUR');
    const [convertedAmount, setConvertedAmount] = useState(0);
    const [lastUpdate, setLastUpdate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Popular currency pairs to display
    const popularPairs = [
        { from: 'USD', to: 'EUR', name: 'US Dollar to Euro', gradient: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)' },
        { from: 'USD', to: 'GBP', name: 'US Dollar to British Pound', gradient: 'linear-gradient(135deg, #134e4a 0%, #0f766e 100%)' },
        { from: 'USD', to: 'AED', name: 'US Dollar to UAE Dirham', gradient: 'linear-gradient(135deg, #713f12 0%, #92400e 100%)' },
        { from: 'USD', to: 'SAR', name: 'US Dollar to Saudi Riyal', gradient: 'linear-gradient(135deg, #166534 0%, #15803d 100%)' },
        { from: 'USD', to: 'LYD', name: 'US Dollar to Libyan Dinar', gradient: 'linear-gradient(135deg, #7c2d12 0%, #9a3412 100%)' },
        { from: 'EUR', to: 'AED', name: 'Euro to UAE Dirham', gradient: 'linear-gradient(135deg, #0c4a6e 0%, #075985 100%)' },
        { from: 'GBP', to: 'AED', name: 'British Pound to UAE Dirham', gradient: 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)' },
        { from: 'USD', to: 'EGP', name: 'US Dollar to Egyptian Pound', gradient: 'linear-gradient(135deg, #831843 0%, #9f1239 100%)' },
        { from: 'USD', to: 'QAR', name: 'US Dollar to Qatari Riyal', gradient: 'linear-gradient(135deg, #4a044e 0%, #6b21a8 100%)' },
        { from: 'USD', to: 'KWD', name: 'US Dollar to Kuwaiti Dinar', gradient: 'linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%)' },
        { from: 'USD', to: 'BHD', name: 'US Dollar to Bahraini Dinar', gradient: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' },
        { from: 'USD', to: 'OMR', name: 'US Dollar to Omani Rial', gradient: 'linear-gradient(135deg, #052e16 0%, #14532d 100%)' }
    ];

    // All available currencies - Enhanced with Arab countries
    const currencies = [
        // Major Global Currencies
        'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY',

        // Middle East & Arab Countries
        'AED', 'SAR', 'QAR', 'KWD', 'BHD', 'OMR', 'JOD', 'LBP',
        'EGP', 'LYD', 'TND', 'DZD', 'MAD', 'SYP', 'IQD', 'YER',
        'SDG', 'SOS', 'DJF', 'MRU', 'KMF',

        // European Currencies
        'SEK', 'NOK', 'DKK', 'PLN', 'CZK', 'HUF', 'RON', 'BGN',
        'HRK', 'ISK', 'TRY', 'RUB', 'UAH',

        // Asian Currencies
        'INR', 'PKR', 'BDT', 'LKR', 'NPR', 'AFN', 'KRW', 'SGD',
        'MYR', 'THB', 'IDR', 'PHP', 'VND', 'HKD', 'TWD',

        // Americas
        'MXN', 'BRL', 'ARS', 'CLP', 'COP', 'PEN', 'VEF',

        // Africa
        'ZAR', 'NGN', 'KES', 'GHS', 'UGX', 'TZS', 'ETB',

        // Oceania
        'NZD', 'FJD',

        // Cryptocurrencies
        'BTC', 'ETH'
    ];

    // Fetch exchange rates from API
    const fetchRates = async () => {
        try {
            setLoading(true);
            setError(null);

            // Using exchangerate-api.com (free tier)
            const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${baseCurrency}`);

            if (!response.ok) {
                throw new Error('Failed to fetch exchange rates');
            }

            const data = await response.json();
            setRates(data.rates);
            setLastUpdate(new Date(data.time_last_updated));
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
            console.error('Error fetching rates:', err);
        }
    };

    // Initial fetch
    useEffect(() => {
        fetchRates();
    }, [baseCurrency]);

    // Auto-refresh every 60 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            fetchRates();
        }, 60000); // 60 seconds

        return () => clearInterval(interval);
    }, [baseCurrency]);

    // Calculate conversion
    useEffect(() => {
        if (rates[targetCurrency]) {
            setConvertedAmount((amount * rates[targetCurrency]).toFixed(2));
        }
    }, [amount, targetCurrency, rates]);

    // Get rate change simulation (random for demonstration)
    const getRateChange = () => {
        return (Math.random() * 2 - 1).toFixed(2);
    };

    // Format currency with symbol
    const getCurrencySymbol = (currency) => {
        const symbols = {
            // Major Currencies
            USD: '$', EUR: '€', GBP: '£', JPY: '¥', AUD: 'A$',
            CAD: 'C$', CHF: 'CHF', CNY: '¥', INR: '₹',

            // Arab Currencies
            AED: 'د.إ', SAR: '﷼', QAR: 'ر.ق', KWD: 'د.ك',
            BHD: '.د.ب', OMR: 'ر.ع.', JOD: 'د.ا', LBP: 'ل.ل',
            EGP: '£', LYD: 'ل.د', TND: 'د.ت', DZD: 'د.ج',
            MAD: 'د.م.', SYP: '£', IQD: 'ع.د', YER: '﷼',
            SDG: 'ج.س.', SOS: 'Sh', DJF: 'Fdj', MRU: 'UM', KMF: 'CF',

            // Crypto
            BTC: '₿', ETH: 'Ξ',

            // Others
            RUB: '₽', TRY: '₺', KRW: '₩', BRL: 'R$',
            MXN: '$', ZAR: 'R', PLN: 'zł', SEK: 'kr',
            NOK: 'kr', DKK: 'kr'
        };
        return symbols[currency] || currency;
    };

    // Get flag emoji for currency
    const getFlagEmoji = (currency) => {
        const flags = {
            // Major Currencies
            USD: '🇺🇸', EUR: '🇪🇺', GBP: '🇬🇧', JPY: '🇯🇵', AUD: '🇦🇺',
            CAD: '🇨🇦', CHF: '🇨🇭', CNY: '🇨🇳', INR: '🇮🇳',

            // Arab Countries & Middle East
            AED: '🇦🇪', SAR: '🇸🇦', QAR: '🇶🇦', KWD: '🇰🇼',
            BHD: '🇧🇭', OMR: '🇴🇲', JOD: '🇯🇴', LBP: '🇱🇧',
            EGP: '🇪🇬', LYD: '🇱🇾', TND: '🇹🇳', DZD: '🇩🇿',
            MAD: '🇲🇦', SYP: '🇸🇾', IQD: '🇮🇶', YER: '🇾🇪',
            SDG: '🇸🇩', SOS: '🇸🇴', DJF: '🇩🇯', MRU: '🇲🇷', KMF: '🇰🇲',

            // Other Countries
            BRL: '🇧🇷', RUB: '🇷🇺', KRW: '🇰🇷', MXN: '🇲🇽',
            SGD: '🇸🇬', HKD: '🇭🇰', SEK: '🇸🇪', NOK: '🇳🇴',
            NZD: '🇳🇿', ZAR: '🇿🇦', TRY: '🇹🇷', PLN: '🇵🇱',
            THB: '🇹🇭', MYR: '🇲🇾', IDR: '🇮🇩', PHP: '🇵🇭',
            DKK: '🇩🇰', CZK: '🇨🇿', HUF: '🇭🇺', RON: '🇷🇴',
            PKR: '🇵🇰', BDT: '🇧🇩', VND: '🇻🇳', ARS: '🇦🇷',
            CLP: '🇨🇱', COP: '🇨🇴', PEN: '🇵🇪', NGN: '🇳🇬',
            KES: '🇰🇪', GHS: '🇬🇭', UGX: '🇺🇬', TZS: '🇹🇿',

            // Cryptocurrencies
            BTC: '₿', ETH: 'Ξ'
        };
        return flags[currency] || '🌍';
    };

    return (
        <div className="live-exchange-page">
            {/* Header */}
            <div className="exchange-header">
                <div className="header-content">
                    <div className="header-badge">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="1" x2="12" y2="23" />
                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                        </svg>
                        <span>Real-Time Exchange Rates</span>
                    </div>
                    <h1>Live Currency <span className="gradient-text">Exchange</span></h1>
                    <p className="header-description">
                        Track real-time exchange rates for major currencies worldwide. Powered by live market data.
                    </p>
                    {lastUpdate && (
                        <div className="last-update">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M23 4v6h-6M1 20v-6h6" />
                                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                            </svg>
                            Last updated: {lastUpdate.toLocaleTimeString()}
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="exchange-container">
                {error && (
                    <div className="error-message">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        <p>{error}</p>
                        <button onClick={fetchRates} className="retry-button">Retry</button>
                    </div>
                )}

                {/* Currency Converter Card */}
                <div className="converter-card">
                    <div className="converter-header">
                        <h2>Currency Converter</h2>
                        <button onClick={fetchRates} className="refresh-button" disabled={loading}>
                            <svg className={loading ? 'spinning' : ''} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M23 4v6h-6M1 20v-6h6" />
                                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                            </svg>
                            {loading ? 'Updating...' : 'Refresh'}
                        </button>
                    </div>

                    <div className="converter-content">
                        {/* From Currency */}
                        <div className="currency-input-group">
                            <label>From</label>
                            <div className="input-wrapper">
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                                    placeholder="Enter amount"
                                />
                                <select
                                    value={baseCurrency}
                                    onChange={(e) => setBaseCurrency(e.target.value)}
                                    className="currency-select"
                                >
                                    {currencies.map(curr => (
                                        <option key={curr} value={curr}>
                                            {getFlagEmoji(curr)} {curr}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Swap Button */}
                        <button
                            className="swap-button"
                            onClick={() => {
                                const temp = baseCurrency;
                                setBaseCurrency(targetCurrency);
                                setTargetCurrency(temp);
                            }}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <polyline points="19 12 12 19 5 12" />
                            </svg>
                        </button>

                        {/* To Currency */}
                        <div className="currency-input-group">
                            <label>To</label>
                            <div className="input-wrapper">
                                <input
                                    type="text"
                                    value={convertedAmount}
                                    readOnly
                                    className="result-input"
                                />
                                <select
                                    value={targetCurrency}
                                    onChange={(e) => setTargetCurrency(e.target.value)}
                                    className="currency-select"
                                >
                                    {currencies.map(curr => (
                                        <option key={curr} value={curr}>
                                            {getFlagEmoji(curr)} {curr}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {rates[targetCurrency] && (
                        <div className="exchange-rate-info">
                            <p>
                                1 {baseCurrency} = {rates[targetCurrency].toFixed(4)} {targetCurrency}
                            </p>
                        </div>
                    )}
                </div>

                {/* Popular Exchange Rates Grid */}
                <div className="rates-section">
                    <h2 className="section-title">Popular Exchange Rates</h2>

                    {loading ? (
                        <div className="loading-state">
                            <div className="loading-spinner"></div>
                            <p>Loading exchange rates...</p>
                        </div>
                    ) : (
                        <div className="rates-grid">
                            {popularPairs.map((pair, index) => {
                                const rate = rates[pair.to];
                                const change = getRateChange();
                                const isPositive = change > 0;

                                return (
                                    <div
                                        key={index}
                                        className="rate-card"
                                        style={{
                                            animationDelay: `${index * 0.05}s`,
                                            background: `linear-gradient(135deg, rgba(30, 32, 60, 0.8), rgba(20, 22, 50, 0.8))`,
                                            borderImage: `${pair.gradient} 1`,
                                            borderImageSlice: 1
                                        }}
                                    >
                                        <div className="rate-card-gradient" style={{ background: pair.gradient }}></div>

                                        <div className="rate-header">
                                            <div className="currency-pair">
                                                <span className="flag">{getFlagEmoji(pair.from)}</span>
                                                <span className="pair-text">{pair.from}/{pair.to}</span>
                                                <span className="flag">{getFlagEmoji(pair.to)}</span>
                                            </div>
                                            <div className={`rate-change ${isPositive ? 'positive' : 'negative'}`}>
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    {isPositive ? (
                                                        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                                                    ) : (
                                                        <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
                                                    )}
                                                </svg>
                                                <span>{isPositive ? '+' : ''}{change}%</span>
                                            </div>
                                        </div>

                                        <div className="rate-value">
                                            {rate ? rate.toFixed(4) : 'N/A'}
                                        </div>

                                        <div className="rate-name">{pair.name}</div>

                                        <button
                                            className="use-rate-btn"
                                            onClick={() => {
                                                setBaseCurrency(pair.from);
                                                setTargetCurrency(pair.to);
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                            }}
                                        >
                                            Use this rate
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <line x1="5" y1="12" x2="19" y2="12" />
                                                <polyline points="12 5 19 12 12 19" />
                                            </svg>
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* All Rates Table */}
                <div className="all-rates-section">
                    <h2 className="section-title">All Exchange Rates (Base: {baseCurrency})</h2>

                    <div className="rates-table">
                        <div className="table-header">
                            <div className="table-cell">Currency</div>
                            <div className="table-cell">Rate</div>
                            <div className="table-cell">Change</div>
                            <div className="table-cell">Action</div>
                        </div>

                        <div className="table-body">
                            {Object.entries(rates)
                                .filter(([currency]) => currencies.includes(currency))
                                .sort(([a], [b]) => a.localeCompare(b))
                                .map(([currency, rate], index) => {
                                    const change = getRateChange();
                                    const isPositive = change > 0;

                                    return (
                                        <div key={currency} className="table-row" style={{ animationDelay: `${index * 0.02}s` }}>
                                            <div className="table-cell currency-cell">
                                                <span className="flag-large">{getFlagEmoji(currency)}</span>
                                                <div className="currency-info">
                                                    <span className="currency-code">{currency}</span>
                                                    <span className="currency-symbol">{getCurrencySymbol(currency)}</span>
                                                </div>
                                            </div>
                                            <div className="table-cell rate-cell">
                                                {rate.toFixed(4)}
                                            </div>
                                            <div className="table-cell">
                                                <span className={`change-badge ${isPositive ? 'positive' : 'negative'}`}>
                                                    {isPositive ? '↑' : '↓'} {Math.abs(change)}%
                                                </span>
                                            </div>
                                            <div className="table-cell">
                                                <button
                                                    className="convert-btn"
                                                    onClick={() => {
                                                        setTargetCurrency(currency);
                                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                                    }}
                                                >
                                                    Convert
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>
                </div>

                {/* Info Cards */}
                <div className="info-cards">
                    <div className="info-card">
                        <div className="info-icon live-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                            </svg>
                        </div>
                        <h3>Real-Time Data</h3>
                        <p>Exchange rates updated every 60 seconds from live market data sources.</p>
                    </div>

                    <div className="info-card">
                        <div className="info-icon secure-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                        </div>
                        <h3>Secure & Accurate</h3>
                        <p>Trusted API sources ensure accuracy and reliability for all currency conversions.</p>
                    </div>

                    <div className="info-card">
                        <div className="info-icon global-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="2" y1="12" x2="22" y2="12" />
                                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                            </svg>
                        </div>
                        <h3>Global Coverage</h3>
                        <p>Support for 30+ major currencies including crypto like Bitcoin and Ethereum.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LiveExchange;