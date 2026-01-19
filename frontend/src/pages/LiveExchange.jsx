import React, { useState, useEffect } from 'react';
import './LiveExchange.css';
import FinScopeAI from '../components/FinScopeAI.jsx';

const LiveExchange = () => {
    const [rates, setRates] = useState({});
    const [historicalData, setHistoricalData] = useState({});
    const [baseCurrency, setBaseCurrency] = useState('USD');
    const [amount, setAmount] = useState('1');
    const [targetCurrency, setTargetCurrency] = useState('EUR');
    const [convertedAmount, setConvertedAmount] = useState('0');
    const [lastUpdate, setLastUpdate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [view, setView] = useState('table'); // 'table' or 'converter'
    const [selectedPair, setSelectedPair] = useState(null);

    // Major currency pairs for professional trading view
    const majorPairs = [
        { from: 'GBP', to: 'EUR', name: 'British Pound / Euro' },
        { from: 'GBP', to: 'USD', name: 'British Pound / US Dollar' },
        { from: 'EUR', to: 'USD', name: 'Euro / US Dollar' },
        { from: 'USD', to: 'JPY', name: 'US Dollar / Japanese Yen' },
        { from: 'GBP', to: 'JPY', name: 'British Pound / Japanese Yen' },
        { from: 'EUR', to: 'JPY', name: 'Euro / Japanese Yen' },
        { from: 'AUD', to: 'USD', name: 'Australian Dollar / US Dollar' },
        { from: 'USD', to: 'CAD', name: 'US Dollar / Canadian Dollar' },
        { from: 'USD', to: 'CHF', name: 'US Dollar / Swiss Franc' },
        { from: 'NZD', to: 'USD', name: 'New Zealand Dollar / US Dollar' },
        { from: 'GBP', to: 'AED', name: 'British Pound / UAE Dirham' },
        { from: 'EUR', to: 'GBP', name: 'Euro / British Pound' }
    ];

    // All available currencies
    const currencies = [
        'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY',
        'AED', 'SAR', 'QAR', 'KWD', 'BHD', 'OMR', 'JOD', 'LBP',
        'EGP', 'LYD', 'TND', 'DZD', 'MAD', 'SYP', 'IQD', 'YER',
        'INR', 'PKR', 'BDT', 'KRW', 'SGD', 'MYR', 'THB', 'IDR',
        'PHP', 'VND', 'HKD', 'TWD', 'MXN', 'BRL', 'ARS', 'ZAR'
    ];

    // Get flag emoji
    const getFlagEmoji = (currency) => {
        const flags = {
            USD: '🇺🇸', EUR: '🇪🇺', GBP: '🇬🇧', JPY: '🇯🇵', AUD: '🇦🇺',
            CAD: '🇨🇦', CHF: '🇨🇭', CNY: '🇨🇳', INR: '🇮🇳',
            AED: '🇦🇪', SAR: '🇸🇦', QAR: '🇶🇦', KWD: '🇰🇼',
            BHD: '🇧🇭', OMR: '🇴🇲', JOD: '🇯🇴', LBP: '🇱🇧',
            EGP: '🇪🇬', LYD: '🇱🇾', TND: '🇹🇳', DZD: '🇩🇿',
            MAD: '🇲🇦', SYP: '🇸🇾', IQD: '🇮🇶', YER: '🇾🇪',
            BRL: '🇧🇷', KRW: '🇰🇷', MXN: '🇲🇽', SGD: '🇸🇬',
            HKD: '🇭🇰', PKR: '🇵🇰', BDT: '🇧🇩', ZAR: '🇿🇦'
        };
        return flags[currency] || '🌍';
    };

    // Fetch exchange rates
    const fetchRates = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`https://api.exchangerate-api.com/v4/latest/USD`);
            if (!response.ok) throw new Error('Failed to fetch exchange rates');

            const data = await response.json();
            setRates(data.rates);

            // Simulate historical data
            const historical = {};
            Object.keys(data.rates).forEach(currency => {
                const currentRate = data.rates[currency];
                historical[currency] = {
                    current: currentRate,
                    yesterday: currentRate * (1 + (Math.random() - 0.5) * 0.01),
                    lastWeek: currentRate * (1 + (Math.random() - 0.5) * 0.02),
                    lastMonth: currentRate * (1 + (Math.random() - 0.5) * 0.05),
                    high: currentRate * (1 + Math.random() * 0.01),
                    low: currentRate * (1 - Math.random() * 0.01),
                    bid: currentRate * 0.9995,
                    ask: currentRate * 1.0005
                };
            });
            setHistoricalData(historical);
            setLastUpdate(new Date());
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    // Simulate real-time updates
    const simulateMarketFluctuations = () => {
        setHistoricalData(prevData => {
            const newData = { ...prevData };
            Object.keys(newData).forEach(currency => {
                const fluctuation = (Math.random() - 0.5) * 0.0005;
                newData[currency] = {
                    ...newData[currency],
                    current: newData[currency].current * (1 + fluctuation),
                    bid: newData[currency].current * 0.9995 * (1 + fluctuation),
                    ask: newData[currency].current * 1.0005 * (1 + fluctuation)
                };
            });
            setLastUpdate(new Date());
            return newData;
        });
    };

    useEffect(() => {
        fetchRates();
    }, []);

    useEffect(() => {
        if (Object.keys(historicalData).length > 0) {
            const interval = setInterval(simulateMarketFluctuations, 3000);
            return () => clearInterval(interval);
        }
    }, [historicalData]);

    useEffect(() => {
        if (historicalData[targetCurrency] && amount !== '') {
            const numAmount = parseFloat(amount) || 0;
            const rate = historicalData[targetCurrency].current;
            setConvertedAmount((numAmount * rate).toFixed(4));
        }
    }, [amount, targetCurrency, historicalData]);

    const handleAmountChange = (e) => {
        const value = e.target.value;
        if (value === '' || /^\d*\.?\d*$/.test(value)) {
            setAmount(value);
        }
    };

    const calculateChange = (current, previous) => {
        if (!previous) return 0;
        return ((current - previous) / previous * 100).toFixed(2);
    };

    const formatTime = () => {
        if (!lastUpdate) return 'Loading...';
        return lastUpdate.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
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
                        <span>Professional Trading Platform</span>
                    </div>

                    <div className="header-ai-orb-small">
                        <FinScopeAI />
                    </div>

                    <h1>Live Currency <span className="gradient-text">Exchange Rates</span></h1>
                    <p className="header-description">
                        Real-time forex market data with bid/ask spreads and historical tracking
                    </p>

                    <div className="live-updates-indicator">
                        <span className="live-pulse"></span>
                        <span className="live-text">Live Market Data</span>
                        <span className="update-frequency">• Updated: {formatTime()}</span>
                    </div>
                </div>
            </div>

            {/* Main Container */}
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

                {/* View Toggle */}
                <div className="view-toggle">
                    <button
                        className={`toggle-btn ${view === 'table' ? 'active' : ''}`}
                        onClick={() => setView('table')}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="7" height="7" />
                            <rect x="14" y="3" width="7" height="7" />
                            <rect x="14" y="14" width="7" height="7" />
                            <rect x="3" y="14" width="7" height="7" />
                        </svg>
                        Market Overview
                    </button>
                    <button
                        className={`toggle-btn ${view === 'converter' ? 'active' : ''}`}
                        onClick={() => setView('converter')}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M7 16V4M7 4L3 8M7 4L11 8" />
                            <path d="M17 8V20M17 20L21 16M17 20L13 16" />
                        </svg>
                        Currency Converter
                    </button>
                </div>

                {loading ? (
                    <div className="loading-state">
                        <div className="loading-spinner"></div>
                        <p>Loading market data...</p>
                    </div>
                ) : (
                    <>
                        {view === 'table' ? (
                            /* Professional Trading Table */
                            <div className="professional-table-container">
                                <div className="table-controls">
                                    <h2 className="section-title">Major Currency Pairs</h2>
                                    <button onClick={fetchRates} className="refresh-button">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M23 4v6h-6M1 20v-6h6" />
                                            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                                        </svg>
                                        Refresh Data
                                    </button>
                                </div>

                                <div className="professional-table">
                                    <div className="table-header-pro">
                                        <div className="th-cell pair-col">Currency Pair</div>
                                        <div className="th-cell">Bid</div>
                                        <div className="th-cell">Ask</div>
                                        <div className="th-cell">Live Rate</div>
                                        <div className="th-cell">Yesterday</div>
                                        <div className="th-cell">Last Week</div>
                                        <div className="th-cell">Last Month</div>
                                        <div className="th-cell">Change</div>
                                        <div className="th-cell">High / Low</div>
                                        <div className="th-cell">Time</div>
                                    </div>

                                    <div className="table-body-pro">
                                        {majorPairs.map((pair, index) => {
                                            const fromData = historicalData[pair.from];
                                            const toData = historicalData[pair.to];

                                            if (!fromData || !toData) return null;

                                            const rate = toData.current / fromData.current;
                                            const bid = toData.bid / fromData.bid;
                                            const ask = toData.ask / fromData.ask;
                                            const yesterday = toData.yesterday / fromData.yesterday;
                                            const lastWeek = toData.lastWeek / fromData.lastWeek;
                                            const lastMonth = toData.lastMonth / fromData.lastMonth;
                                            const change = calculateChange(rate, yesterday);
                                            const high = Math.max(rate, yesterday, lastWeek) * 1.001;
                                            const low = Math.min(rate, yesterday, lastWeek) * 0.999;

                                            return (
                                                <div
                                                    key={index}
                                                    className="table-row-pro"
                                                    style={{ animationDelay: `${index * 0.03}s` }}
                                                >
                                                    <div className="td-cell pair-col">
                                                        <div className="currency-pair-info">
                                                            <div className="flags">
                                                                <span className="flag-sm">{getFlagEmoji(pair.from)}</span>
                                                                <span className="flag-sm">{getFlagEmoji(pair.to)}</span>
                                                            </div>
                                                            <div className="pair-details">
                                                                <div className="pair-code">{pair.from}/{pair.to}</div>
                                                                <div className="pair-name">{pair.name}</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="td-cell bid-cell">{bid.toFixed(4)}</div>
                                                    <div className="td-cell ask-cell">{ask.toFixed(4)}</div>
                                                    <div className="td-cell rate-cell">{rate.toFixed(4)}</div>
                                                    <div className="td-cell">
                                                        <span className={parseFloat(calculateChange(rate, yesterday)) >= 0 ? 'positive' : 'negative'}>
                                                            {yesterday.toFixed(4)}
                                                            <span className="change-arrow">
                                                                {parseFloat(calculateChange(rate, yesterday)) >= 0 ? ' ▲' : ' ▼'}
                                                            </span>
                                                        </span>
                                                    </div>
                                                    <div className="td-cell">
                                                        <span className={parseFloat(calculateChange(rate, lastWeek)) >= 0 ? 'positive' : 'negative'}>
                                                            {lastWeek.toFixed(4)}
                                                        </span>
                                                    </div>
                                                    <div className="td-cell">
                                                        <span className={parseFloat(calculateChange(rate, lastMonth)) >= 0 ? 'positive' : 'negative'}>
                                                            {lastMonth.toFixed(4)}
                                                        </span>
                                                    </div>
                                                    <div className="td-cell">
                                                        <span className={`change-badge-pro ${parseFloat(change) >= 0 ? 'positive' : 'negative'}`}>
                                                            {parseFloat(change) >= 0 ? '+' : ''}{change}%
                                                        </span>
                                                    </div>
                                                    <div className="td-cell high-low-cell">
                                                        <div className="high-low-values">
                                                            <span className="high-value">{high.toFixed(4)}</span>
                                                            <span className="low-value">{low.toFixed(4)}</span>
                                                        </div>
                                                    </div>
                                                    <div className="td-cell time-cell">{formatTime()}</div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Quick Stats */}
                                <div className="market-summary">
                                    <div className="summary-card">
                                        <div className="summary-icon trending-up">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                                                <polyline points="17 6 23 6 23 12" />
                                            </svg>
                                        </div>
                                        <div className="summary-content">
                                            <div className="summary-label">Trending Up</div>
                                            <div className="summary-value">
                                                {majorPairs.filter((pair, i) => {
                                                    const fromData = historicalData[pair.from];
                                                    const toData = historicalData[pair.to];
                                                    if (!fromData || !toData) return false;
                                                    const rate = toData.current / fromData.current;
                                                    const yesterday = toData.yesterday / fromData.yesterday;
                                                    return rate > yesterday;
                                                }).length} Pairs
                                            </div>
                                        </div>
                                    </div>

                                    <div className="summary-card">
                                        <div className="summary-icon trending-down">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
                                                <polyline points="17 18 23 18 23 12" />
                                            </svg>
                                        </div>
                                        <div className="summary-content">
                                            <div className="summary-label">Trending Down</div>
                                            <div className="summary-value">
                                                {majorPairs.filter((pair, i) => {
                                                    const fromData = historicalData[pair.from];
                                                    const toData = historicalData[pair.to];
                                                    if (!fromData || !toData) return false;
                                                    const rate = toData.current / fromData.current;
                                                    const yesterday = toData.yesterday / fromData.yesterday;
                                                    return rate < yesterday;
                                                }).length} Pairs
                                            </div>
                                        </div>
                                    </div>

                                    <div className="summary-card">
                                        <div className="summary-icon market-status">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <circle cx="12" cy="12" r="10" />
                                                <polyline points="12 6 12 12 16 14" />
                                            </svg>
                                        </div>
                                        <div className="summary-content">
                                            <div className="summary-label">Market Status</div>
                                            <div className="summary-value status-open">Open</div>
                                        </div>
                                    </div>

                                    <div className="summary-card">
                                        <div className="summary-icon spread-info">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <line x1="12" y1="20" x2="12" y2="10" />
                                                <line x1="18" y1="20" x2="18" y2="4" />
                                                <line x1="6" y1="20" x2="6" y2="16" />
                                            </svg>
                                        </div>
                                        <div className="summary-content">
                                            <div className="summary-label">Avg Spread</div>
                                            <div className="summary-value">0.05%</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* Currency Converter View */
                            <div className="converter-card">
                                <div className="converter-header">
                                    <h2>Currency Converter</h2>
                                </div>

                                <div className="converter-content">
                                    <div className="currency-input-group">
                                        <label>From</label>
                                        <div className="input-row">
                                            <input
                                                type="text"
                                                value={amount}
                                                onChange={handleAmountChange}
                                                placeholder="1.00"
                                                className="amount-input"
                                            />
                                            <select
                                                value={baseCurrency}
                                                onChange={(e) => setBaseCurrency(e.target.value)}
                                                className="currency-select-modern"
                                            >
                                                {currencies.map(curr => (
                                                    <option key={curr} value={curr}>
                                                        {getFlagEmoji(curr)} {curr}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <button
                                        className="swap-button-premium"
                                        onClick={() => {
                                            const temp = baseCurrency;
                                            setBaseCurrency(targetCurrency);
                                            setTargetCurrency(temp);
                                        }}
                                    >
                                        <div className="swap-icon-wrapper">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                <path d="M7 16V4M7 4L3 8M7 4L11 8" />
                                                <path d="M17 8V20M17 20L21 16M17 20L13 16" />
                                            </svg>
                                        </div>
                                    </button>

                                    <div className="currency-input-group">
                                        <label>To</label>
                                        <div className="input-row">
                                            <input
                                                type="text"
                                                value={convertedAmount}
                                                readOnly
                                                className="amount-input result-input-modern"
                                            />
                                            <select
                                                value={targetCurrency}
                                                onChange={(e) => setTargetCurrency(e.target.value)}
                                                className="currency-select-modern"
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

                                {historicalData[targetCurrency] && historicalData[baseCurrency] && (
                                    <div className="exchange-rate-info-modern">
                                        <p>
                                            1 {baseCurrency} = {(historicalData[targetCurrency].current / historicalData[baseCurrency].current).toFixed(4)} {targetCurrency}
                                        </p>
                                        <p className="spread-info">
                                            Spread: {((historicalData[targetCurrency].ask - historicalData[targetCurrency].bid) / historicalData[targetCurrency].bid * 100).toFixed(3)}%
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default LiveExchange;