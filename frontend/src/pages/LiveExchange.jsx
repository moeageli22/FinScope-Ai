import React, { useState, useEffect, useCallback, useRef } from 'react';
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
    const [view, setView] = useState('table'); // 'table', 'converter', or 'charts'
    const [selectedPair, setSelectedPair] = useState(null);

    // Chart states
    const [chartFrom, setChartFrom] = useState('USD');
    const [chartTo, setChartTo] = useState('EUR');
    const [chartTimeRange, setChartTimeRange] = useState('1Y');
    const [chartData, setChartData] = useState([]);
    const [hoveredPoint, setHoveredPoint] = useState(null);

    // Dropdown states
    const [showFromDropdown, setShowFromDropdown] = useState(false);
    const [showToDropdown, setShowToDropdown] = useState(false);
    const [showChartFromDropdown, setShowChartFromDropdown] = useState(false);
    const [showChartToDropdown, setShowChartToDropdown] = useState(false);
    const [searchFrom, setSearchFrom] = useState('');
    const [searchTo, setSearchTo] = useState('');
    const [searchChartFrom, setSearchChartFrom] = useState('');
    const [searchChartTo, setSearchChartTo] = useState('');

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

    // All available currencies with full names and flags
    const currenciesWithNames = [
        { code: 'USD', name: 'US Dollar', flag: '🇺🇸' },
        { code: 'EUR', name: 'Euro', flag: '🇪🇺' },
        { code: 'GBP', name: 'British Pound', flag: '🇬🇧' },
        { code: 'JPY', name: 'Japanese Yen', flag: '🇯🇵' },
        { code: 'AUD', name: 'Australian Dollar', flag: '🇦🇺' },
        { code: 'CAD', name: 'Canadian Dollar', flag: '🇨🇦' },
        { code: 'CHF', name: 'Swiss Franc', flag: '🇨🇭' },
        { code: 'CNY', name: 'Chinese Yuan', flag: '🇨🇳' },
        { code: 'AED', name: 'Emirati Dirham', flag: '🇦🇪' },
        { code: 'SAR', name: 'Saudi Riyal', flag: '🇸🇦' },
        { code: 'QAR', name: 'Qatari Riyal', flag: '🇶🇦' },
        { code: 'KWD', name: 'Kuwaiti Dinar', flag: '🇰🇼' },
        { code: 'BHD', name: 'Bahraini Dinar', flag: '🇧🇭' },
        { code: 'OMR', name: 'Omani Rial', flag: '🇴🇲' },
        { code: 'JOD', name: 'Jordanian Dinar', flag: '🇯🇴' },
        { code: 'LBP', name: 'Lebanese Pound', flag: '🇱🇧' },
        { code: 'EGP', name: 'Egyptian Pound', flag: '🇪🇬' },
        { code: 'LYD', name: 'Libyan Dinar', flag: '🇱🇾' },
        { code: 'TND', name: 'Tunisian Dinar', flag: '🇹🇳' },
        { code: 'DZD', name: 'Algerian Dinar', flag: '🇩🇿' },
        { code: 'MAD', name: 'Moroccan Dirham', flag: '🇲🇦' },
        { code: 'SYP', name: 'Syrian Pound', flag: '🇸🇾' },
        { code: 'IQD', name: 'Iraqi Dinar', flag: '🇮🇶' },
        { code: 'YER', name: 'Yemeni Rial', flag: '🇾🇪' },
        { code: 'INR', name: 'Indian Rupee', flag: '🇮🇳' },
        { code: 'PKR', name: 'Pakistani Rupee', flag: '🇵🇰' },
        { code: 'BDT', name: 'Bangladeshi Taka', flag: '🇧🇩' },
        { code: 'KRW', name: 'South Korean Won', flag: '🇰🇷' },
        { code: 'SGD', name: 'Singapore Dollar', flag: '🇸🇬' },
        { code: 'MYR', name: 'Malaysian Ringgit', flag: '🇲🇾' },
        { code: 'THB', name: 'Thai Baht', flag: '🇹🇭' },
        { code: 'IDR', name: 'Indonesian Rupiah', flag: '🇮🇩' },
        { code: 'PHP', name: 'Philippine Peso', flag: '🇵🇭' },
        { code: 'VND', name: 'Vietnamese Dong', flag: '🇻🇳' },
        { code: 'HKD', name: 'Hong Kong Dollar', flag: '🇭🇰' },
        { code: 'TWD', name: 'Taiwan Dollar', flag: '🇹🇼' },
        { code: 'MXN', name: 'Mexican Peso', flag: '🇲🇽' },
        { code: 'BRL', name: 'Brazilian Real', flag: '🇧🇷' },
        { code: 'ARS', name: 'Argentine Peso', flag: '🇦🇷' },
        { code: 'ZAR', name: 'South African Rand', flag: '🇿🇦' },
        { code: 'NZD', name: 'New Zealand Dollar', flag: '🇳🇿' },
        { code: 'SEK', name: 'Swedish Krona', flag: '🇸🇪' },
        { code: 'NOK', name: 'Norwegian Krone', flag: '🇳🇴' },
        { code: 'DKK', name: 'Danish Krone', flag: '🇩🇰' },
        { code: 'PLN', name: 'Polish Zloty', flag: '🇵🇱' },
        { code: 'CZK', name: 'Czech Koruna', flag: '🇨🇿' },
        { code: 'HUF', name: 'Hungarian Forint', flag: '🇭🇺' },
        { code: 'TRY', name: 'Turkish Lira', flag: '🇹🇷' },
        { code: 'ILS', name: 'Israeli Shekel', flag: '🇮🇱' },
        { code: 'CLP', name: 'Chilean Peso', flag: '🇨🇱' },
        { code: 'COP', name: 'Colombian Peso', flag: '🇨🇴' },
        { code: 'PEN', name: 'Peruvian Sol', flag: '🇵🇪' },
        { code: 'NGN', name: 'Nigerian Naira', flag: '🇳🇬' },
        { code: 'KES', name: 'Kenyan Shilling', flag: '🇰🇪' },
    ];

    // All available currencies (for backward compatibility)
    const currencies = currenciesWithNames.map(c => c.code);

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

    // Get currency details
    const getCurrencyByCode = (code) => {
        return currenciesWithNames.find(c => c.code === code) || { code, name: code, flag: '🌍' };
    };

    const getCurrencyName = (code) => {
        return getCurrencyByCode(code).name;
    };

    // Get currency symbol
    const getCurrencySymbol = (code) => {
        const symbols = {
            USD: '$', EUR: '€', GBP: '£', JPY: '¥', AUD: 'A$',
            CAD: 'C$', CHF: 'Fr', CNY: '¥', INR: '₹',
            AED: 'د.إ', SAR: '﷼', QAR: 'ر.ق', KWD: 'د.ك',
            BHD: '.د.ب', OMR: 'ر.ع', JOD: 'د.ا', LBP: 'ل.ل',
            EGP: 'ج.م', LYD: 'ل.د', TND: 'د.ت', DZD: 'د.ج',
            MAD: 'د.م', SYP: 'ل.س', IQD: 'ع.د', YER: '﷼',
            PKR: '₨', BDT: '৳', KRW: '₩', SGD: 'S$',
            MYR: 'RM', THB: '฿', IDR: 'Rp', PHP: '₱',
            VND: '₫', HKD: 'HK$', TWD: 'NT$', MXN: '$',
            BRL: 'R$', ARS: '$', ZAR: 'R', NZD: 'NZ$',
            SEK: 'kr', NOK: 'kr', DKK: 'kr', PLN: 'zł',
            CZK: 'Kč', HUF: 'Ft', TRY: '₺', ILS: '₪',
            CLP: '$', COP: '$', PEN: 'S/', NGN: '₦', KES: 'KSh'
        };
        return symbols[code] || code;
    };

    // Filter currencies based on search
    const getFilteredCurrencies = (search) => {
        if (!search) return currenciesWithNames;
        const searchLower = search.toLowerCase();
        return currenciesWithNames.filter(c =>
            c.code.toLowerCase().includes(searchLower) ||
            c.name.toLowerCase().includes(searchLower)
        );
    };

    // Popular currencies for quick access
    const popularCurrencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD'];

    // Generate chart data
    const generateChartData = useCallback((fromCurrency, toCurrency, timeRange) => {
        if (!historicalData[fromCurrency] || !historicalData[toCurrency]) return [];

        const now = Date.now();
        const ranges = {
            '12H': { points: 48, interval: 15 * 60 * 1000 },
            '1D': { points: 96, interval: 15 * 60 * 1000 },
            '1W': { points: 168, interval: 60 * 60 * 1000 },
            '1M': { points: 120, interval: 6 * 60 * 60 * 1000 },
            '1Y': { points: 365, interval: 24 * 60 * 60 * 1000 },
            '2Y': { points: 730, interval: 24 * 60 * 60 * 1000 },
            '5Y': { points: 1825, interval: 24 * 60 * 60 * 1000 },
            '10Y': { points: 3650, interval: 24 * 60 * 60 * 1000 }
        };

        const config = ranges[timeRange];
        const data = [];
        const currentRate = historicalData[toCurrency].current / historicalData[fromCurrency].current;

        const isPegged = ['AED', 'SAR', 'QAR', 'BHD', 'OMR'].includes(toCurrency);
        const baseVolatility = isPegged ? 0.00005 : 0.008;

        const trendDirection = (Math.random() - 0.5) * 2;
        const trendStrength = 0.15 * trendDirection;

        for (let i = config.points; i >= 0; i--) {
            const timestamp = now - (i * config.interval);
            const progress = (config.points - i) / config.points;

            const trend = trendStrength * progress;
            const noise = (Math.random() - 0.5) * baseVolatility * 2;
            const seasonality = Math.sin(progress * Math.PI * 8) * baseVolatility * 0.3;
            const volatilityBurst = (Math.random() > 0.95 ? (Math.random() - 0.5) * baseVolatility * 5 : 0);

            const rate = currentRate * (1 - trend + noise + seasonality + volatilityBurst);

            data.push({
                timestamp,
                rate,
                date: new Date(timestamp)
            });
        }

        return data;
    }, [historicalData]);

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
        if (historicalData[baseCurrency] && historicalData[targetCurrency] && amount !== '') {
            const numAmount = parseFloat(amount) || 0;

            // Calculate direct exchange rate between the two currencies
            const baseRate = historicalData[baseCurrency].current;
            const targetRate = historicalData[targetCurrency].current;
            const directRate = targetRate / baseRate;

            setConvertedAmount((numAmount * directRate).toFixed(4));
        }
    }, [amount, baseCurrency, targetCurrency, historicalData]);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = () => {
            setShowFromDropdown(false);
            setShowToDropdown(false);
            setShowChartFromDropdown(false);
            setShowChartToDropdown(false);
        };

        if (showFromDropdown || showToDropdown || showChartFromDropdown || showChartToDropdown) {
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    }, [showFromDropdown, showToDropdown, showChartFromDropdown, showChartToDropdown]);

    // Initial chart data load (only once when historicalData is first available)
    const [chartInitialized, setChartInitialized] = useState(false);

    useEffect(() => {
        if (historicalData[chartFrom] && historicalData[chartTo] && !chartInitialized) {
            const data = generateChartData(chartFrom, chartTo, chartTimeRange);
            setChartData(data);
            setChartInitialized(true);
        }
    }, [historicalData, chartFrom, chartTo, chartTimeRange, chartInitialized]);

    // Update chart data ONLY when user changes currencies or timerange manually
    const handleChartUpdate = useCallback((newFrom, newTo, newTimeRange) => {
        if (historicalData[newFrom || chartFrom] && historicalData[newTo || chartTo]) {
            const data = generateChartData(
                newFrom || chartFrom,
                newTo || chartTo,
                newTimeRange || chartTimeRange
            );
            setChartData(data);
        }
    }, [historicalData, chartFrom, chartTo, chartTimeRange, generateChartData]);

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

    const swapChartCurrencies = () => {
        const temp = chartFrom;
        setChartFrom(chartTo);
        setChartTo(temp);
    };

    // Chart rendering
    const renderChart = () => {
        if (chartData.length === 0) return null;

        const svgWidth = 1200;
        const svgHeight = 400;
        const padding = { top: 40, right: 80, bottom: 60, left: 80 };
        const innerWidth = svgWidth - padding.left - padding.right;
        const innerHeight = svgHeight - padding.top - padding.bottom;

        const rates = chartData.map(d => d.rate);
        const minRate = Math.min(...rates);
        const maxRate = Math.max(...rates);
        const rateRange = maxRate - minRate;
        const yPadding = rateRange * 0.05;

        const xScale = (index) => (index / (chartData.length - 1)) * innerWidth;
        const yScale = (rate) => innerHeight - ((rate - (minRate - yPadding)) / (rateRange + 2 * yPadding)) * innerHeight;

        const pathData = chartData.map((point, index) => {
            const x = xScale(index);
            const y = yScale(point.rate);
            return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
        }).join(' ');

        const firstRate = chartData[0].rate;
        const lastRate = chartData[chartData.length - 1].rate;
        const change = lastRate - firstRate;
        const changePercent = ((change / firstRate) * 100).toFixed(2);
        const isPositive = change >= 0;

        const formatDateLabel = (date) => {
            if (chartTimeRange === '12H' || chartTimeRange === '1D') {
                return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            } else if (chartTimeRange === '1W' || chartTimeRange === '1M') {
                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            } else {
                return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            }
        };

        return (
            <>
                {/* Chart Header */}
                <div className="chart-header-info">
                    <div className="chart-title-section">
                        <h3 className="chart-pair-title">{chartFrom} to {chartTo} Chart</h3>
                        <p className="chart-pair-subtitle">
                            {getCurrencyName(chartFrom)} to {getCurrencyName(chartTo)}
                        </p>
                    </div>
                    <div className="chart-performance">
                        <span className={`performance-badge ${isPositive ? 'positive' : 'negative'}`}>
                            {isPositive ? '+' : ''}{changePercent}% ({chartTimeRange})
                        </span>
                    </div>
                    <div className="chart-current-rate">
                        <span className="live-indicator">●</span>
                        <span className="rate-text">1 {chartFrom} = {lastRate.toFixed(6)} {chartTo}</span>
                        <span className="rate-timestamp">{lastUpdate?.toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}</span>
                    </div>
                </div>

                {/* Timerange Selector */}
                <div className="chart-timerange-selector">
                    {['12H', '1D', '1W', '1M', '1Y', '2Y', '5Y', '10Y'].map(range => (
                        <button
                            key={range}
                            className={`timerange-pill ${chartTimeRange === range ? 'active' : ''}`}
                            onClick={() => {
                                setChartTimeRange(range);
                                handleChartUpdate(null, null, range);
                            }}
                        >
                            {range}
                        </button>
                    ))}
                </div>

                {/* Chart SVG */}
                <div className="chart-svg-wrapper">
                    <svg
                        width="100%"
                        height={svgHeight}
                        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                        preserveAspectRatio="xMidYMid meet"
                    >
                        <defs>
                            <linearGradient id="chartAreaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity="0.2" />
                                <stop offset="100%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity="0.02" />
                            </linearGradient>
                        </defs>

                        <g transform={`translate(${padding.left}, ${padding.top})`}>
                            {/* Y-axis grid lines */}
                            {[0, 1, 2, 3, 4, 5].map(i => {
                                const y = (innerHeight / 5) * i;
                                const rate = (maxRate + yPadding) - ((rateRange + 2 * yPadding) / 5) * i;
                                return (
                                    <g key={i}>
                                        <line
                                            x1={0}
                                            y1={y}
                                            x2={innerWidth}
                                            y2={y}
                                            stroke="rgba(148, 163, 184, 0.1)"
                                            strokeWidth="1"
                                        />
                                        <text
                                            x={innerWidth + 10}
                                            y={y + 4}
                                            fill="rgba(148, 163, 184, 0.6)"
                                            fontSize="11"
                                            fontWeight="600"
                                        >
                                            {rate.toFixed(6)}
                                        </text>
                                    </g>
                                );
                            })}

                            {/* Area under line */}
                            <path
                                d={`${pathData} L ${xScale(chartData.length - 1)} ${innerHeight} L ${xScale(0)} ${innerHeight} Z`}
                                fill="url(#chartAreaGradient)"
                            />

                            {/* Main line */}
                            <path
                                d={pathData}
                                fill="none"
                                stroke={isPositive ? "#10b981" : "#ef4444"}
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />

                            {/* X-axis labels */}
                            {chartData.filter((_, i) => {
                                const step = Math.ceil(chartData.length / 8);
                                return i % step === 0 || i === chartData.length - 1;
                            }).map((point, index) => {
                                const dataIndex = chartData.indexOf(point);
                                const x = xScale(dataIndex);
                                return (
                                    <text
                                        key={index}
                                        x={x}
                                        y={innerHeight + 25}
                                        fill="rgba(148, 163, 184, 0.6)"
                                        fontSize="11"
                                        fontWeight="600"
                                        textAnchor="middle"
                                    >
                                        {formatDateLabel(point.date)}
                                    </text>
                                );
                            })}

                            {/* Hover points */}
                            {chartData.map((point, index) => (
                                <circle
                                    key={index}
                                    cx={xScale(index)}
                                    cy={yScale(point.rate)}
                                    r={hoveredPoint === index ? 6 : 0}
                                    fill={isPositive ? "#10b981" : "#ef4444"}
                                    stroke="#ffffff"
                                    strokeWidth="2"
                                    style={{ transition: 'r 0.2s' }}
                                />
                            ))}

                            {/* Invisible hover zones */}
                            {chartData.map((point, index) => (
                                <rect
                                    key={`hover-${index}`}
                                    x={xScale(index) - 10}
                                    y={0}
                                    width={20}
                                    height={innerHeight}
                                    fill="transparent"
                                    style={{ cursor: 'pointer' }}
                                    onMouseEnter={() => setHoveredPoint(index)}
                                    onMouseLeave={() => setHoveredPoint(null)}
                                />
                            ))}

                            {/* Tooltip */}
                            {hoveredPoint !== null && (
                                <g>
                                    <rect
                                        x={xScale(hoveredPoint) - 85}
                                        y={yScale(chartData[hoveredPoint].rate) - 65}
                                        width="170"
                                        height="55"
                                        fill="rgba(15, 23, 42, 0.98)"
                                        stroke="rgba(59, 130, 246, 0.4)"
                                        strokeWidth="1.5"
                                        rx="8"
                                        filter="drop-shadow(0 8px 16px rgba(0, 0, 0, 0.4))"
                                    />
                                    <text
                                        x={xScale(hoveredPoint)}
                                        y={yScale(chartData[hoveredPoint].rate) - 40}
                                        fill="#ffffff"
                                        fontSize="16"
                                        fontWeight="700"
                                        textAnchor="middle"
                                    >
                                        {chartData[hoveredPoint].rate.toFixed(6)}
                                    </text>
                                    <text
                                        x={xScale(hoveredPoint)}
                                        y={yScale(chartData[hoveredPoint].rate) - 22}
                                        fill="rgba(255, 255, 255, 0.6)"
                                        fontSize="12"
                                        fontWeight="600"
                                        textAnchor="middle"
                                    >
                                        {chartData[hoveredPoint].date.toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </text>
                                </g>
                            )}
                        </g>
                    </svg>
                </div>
            </>
        );
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
                        className={`toggle-btn ${view === 'charts' ? 'active' : ''}`}
                        onClick={() => setView('charts')}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                        </svg>
                        Currency Charts
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
                        ) : view === 'charts' ? (
                            /* Charts View */
                            <div className="charts-view-container">
                                {/* Currency Pair Selector */}
                                <div className="chart-currency-controls">
                                    <div className="chart-pair-selector">
                                        <div className="pair-select-group">
                                            <label>From</label>
                                            <div
                                                className="currency-selector-box-chart"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setShowChartFromDropdown(!showChartFromDropdown);
                                                    setShowChartToDropdown(false);
                                                }}
                                            >
                                                <span className="currency-flag-chart">{getCurrencyByCode(chartFrom).flag}</span>
                                                <div className="currency-display-chart">
                                                    <span className="currency-code-chart">{chartFrom}</span>
                                                    <span className="currency-symbol-display">{getCurrencySymbol(chartFrom)}</span>
                                                    <span className="currency-name-chart-small">- {getCurrencyName(chartFrom)}</span>
                                                </div>
                                                <svg className="dropdown-chevron-chart" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <polyline points="6 9 12 15 18 9" />
                                                </svg>
                                            </div>

                                            {showChartFromDropdown && (
                                                <div className="currency-dropdown-panel" onClick={(e) => e.stopPropagation()}>
                                                    <div className="dropdown-search-box">
                                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <circle cx="11" cy="11" r="8" />
                                                            <path d="m21 21-4.35-4.35" />
                                                        </svg>
                                                        <input
                                                            type="text"
                                                            placeholder="Search currencies..."
                                                            value={searchChartFrom}
                                                            onChange={(e) => setSearchChartFrom(e.target.value)}
                                                            onClick={(e) => e.stopPropagation()}
                                                            autoFocus
                                                        />
                                                    </div>

                                                    {!searchChartFrom && (
                                                        <>
                                                            <div className="dropdown-section-label">POPULAR</div>
                                                            {popularCurrencies.map(code => {
                                                                const curr = getCurrencyByCode(code);
                                                                return (
                                                                    <div
                                                                        key={code}
                                                                        className={`dropdown-currency-item ${chartFrom === code ? 'selected' : ''}`}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setChartFrom(code);
                                                                            handleChartUpdate(code, null, null);
                                                                            setShowChartFromDropdown(false);
                                                                            setSearchChartFrom('');
                                                                        }}
                                                                    >
                                                                        <span className="dropdown-flag">{curr.flag}</span>
                                                                        <div className="dropdown-text-group">
                                                                            <span className="dropdown-code">{curr.code}</span>
                                                                            <span className="dropdown-symbol">{getCurrencySymbol(curr.code)}</span>
                                                                            <span className="dropdown-name">{curr.name}</span>
                                                                        </div>
                                                                        {chartFrom === code && (
                                                                            <svg className="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                                                                <polyline points="20 6 9 17 4 12" />
                                                                            </svg>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
                                                            <div className="dropdown-section-label">ALL CURRENCIES</div>
                                                        </>
                                                    )}

                                                    {getFilteredCurrencies(searchChartFrom).map(curr => (
                                                        <div
                                                            key={curr.code}
                                                            className={`dropdown-currency-item ${chartFrom === curr.code ? 'selected' : ''}`}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setChartFrom(curr.code);
                                                                handleChartUpdate(curr.code, null, null);
                                                                setShowChartFromDropdown(false);
                                                                setSearchChartFrom('');
                                                            }}
                                                        >
                                                            <span className="dropdown-flag">{curr.flag}</span>
                                                            <div className="dropdown-text-group">
                                                                <span className="dropdown-code">{curr.code}</span>
                                                                <span className="dropdown-symbol">{getCurrencySymbol(curr.code)}</span>
                                                                <span className="dropdown-name">{curr.name}</span>
                                                            </div>
                                                            {chartFrom === curr.code && (
                                                                <svg className="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                                                    <polyline points="20 6 9 17 4 12" />
                                                                </svg>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <button className="swap-chart-btn" onClick={swapChartCurrencies}>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                <path d="M7 16V4M7 4L3 8M7 4L11 8" />
                                                <path d="M17 8V20M17 20L21 16M17 20L13 16" />
                                            </svg>
                                        </button>

                                        <div className="pair-select-group">
                                            <label>To</label>
                                            <div
                                                className="currency-selector-box-chart"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setShowChartToDropdown(!showChartToDropdown);
                                                    setShowChartFromDropdown(false);
                                                }}
                                            >
                                                <span className="currency-flag-chart">{getCurrencyByCode(chartTo).flag}</span>
                                                <div className="currency-display-chart">
                                                    <span className="currency-code-chart">{chartTo}</span>
                                                    <span className="currency-symbol-display">{getCurrencySymbol(chartTo)}</span>
                                                    <span className="currency-name-chart-small">- {getCurrencyName(chartTo)}</span>
                                                </div>
                                                <svg className="dropdown-chevron-chart" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <polyline points="6 9 12 15 18 9" />
                                                </svg>
                                            </div>

                                            {showChartToDropdown && (
                                                <div className="currency-dropdown-panel" onClick={(e) => e.stopPropagation()}>
                                                    <div className="dropdown-search-box">
                                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <circle cx="11" cy="11" r="8" />
                                                            <path d="m21 21-4.35-4.35" />
                                                        </svg>
                                                        <input
                                                            type="text"
                                                            placeholder="Search currencies..."
                                                            value={searchChartTo}
                                                            onChange={(e) => setSearchChartTo(e.target.value)}
                                                            onClick={(e) => e.stopPropagation()}
                                                            autoFocus
                                                        />
                                                    </div>

                                                    {!searchChartTo && (
                                                        <>
                                                            <div className="dropdown-section-label">POPULAR</div>
                                                            {popularCurrencies.map(code => {
                                                                const curr = getCurrencyByCode(code);
                                                                return (
                                                                    <div
                                                                        key={code}
                                                                        className={`dropdown-currency-item ${chartTo === code ? 'selected' : ''}`}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setChartTo(code);
                                                                            handleChartUpdate(null, code, null);
                                                                            setShowChartToDropdown(false);
                                                                            setSearchChartTo('');
                                                                        }}
                                                                    >
                                                                        <span className="dropdown-flag">{curr.flag}</span>
                                                                        <div className="dropdown-text-group">
                                                                            <span className="dropdown-code">{curr.code}</span>
                                                                            <span className="dropdown-symbol">{getCurrencySymbol(curr.code)}</span>
                                                                            <span className="dropdown-name">{curr.name}</span>
                                                                        </div>
                                                                        {chartTo === code && (
                                                                            <svg className="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                                                                <polyline points="20 6 9 17 4 12" />
                                                                            </svg>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
                                                            <div className="dropdown-section-label">ALL CURRENCIES</div>
                                                        </>
                                                    )}

                                                    {getFilteredCurrencies(searchChartTo).map(curr => (
                                                        <div
                                                            key={curr.code}
                                                            className={`dropdown-currency-item ${chartTo === curr.code ? 'selected' : ''}`}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setChartTo(curr.code);
                                                                handleChartUpdate(null, curr.code, null);
                                                                setShowChartToDropdown(false);
                                                                setSearchChartTo('');
                                                            }}
                                                        >
                                                            <span className="dropdown-flag">{curr.flag}</span>
                                                            <div className="dropdown-text-group">
                                                                <span className="dropdown-code">{curr.code}</span>
                                                                <span className="dropdown-symbol">{getCurrencySymbol(curr.code)}</span>
                                                                <span className="dropdown-name">{curr.name}</span>
                                                            </div>
                                                            {chartTo === curr.code && (
                                                                <svg className="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                                                    <polyline points="20 6 9 17 4 12" />
                                                                </svg>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Chart Display */}
                                <div className="chart-display-container">
                                    {renderChart()}
                                </div>
                            </div>
                        ) : (
                            /* Currency Converter View - Upgraded with Search */
                            <div className="converter-card-upgraded">
                                <div className="converter-header-upgraded">
                                    <h2>Currency Converter</h2>
                                    <div className="midmarket-badge">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="12" r="10" />
                                            <path d="M12 16v-4M12 8h.01" />
                                        </svg>
                                        <span>We use midmarket rates</span>
                                    </div>
                                </div>

                                <div className="converter-content-upgraded">
                                    {/* Amount Input */}
                                    <div className="currency-input-section-upgraded">
                                        <label>Amount</label>
                                        <input
                                            type="text"
                                            value={amount}
                                            onChange={handleAmountChange}
                                            placeholder="1.00"
                                            className="amount-input-upgraded"
                                        />
                                    </div>

                                    {/* From Currency with Search Dropdown */}
                                    <div className="currency-input-section-upgraded">
                                        <label>From</label>
                                        <div
                                            className="currency-selector-box-upgraded"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setShowFromDropdown(!showFromDropdown);
                                                setShowToDropdown(false);
                                            }}
                                        >
                                            <span className="currency-flag-upgraded">{getCurrencyByCode(baseCurrency).flag}</span>
                                            <div className="currency-display-upgraded">
                                                <span className="currency-code-upgraded">{baseCurrency}</span>
                                                <span className="currency-symbol-display">{getCurrencySymbol(baseCurrency)}</span>
                                                <span className="currency-name-small">- {getCurrencyName(baseCurrency)}</span>
                                            </div>
                                            <svg className="dropdown-chevron-upgraded" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polyline points="6 9 12 15 18 9" />
                                            </svg>
                                        </div>

                                        {showFromDropdown && (
                                            <div className="currency-dropdown-panel" onClick={(e) => e.stopPropagation()}>
                                                <div className="dropdown-search-box">
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <circle cx="11" cy="11" r="8" />
                                                        <path d="m21 21-4.35-4.35" />
                                                    </svg>
                                                    <input
                                                        type="text"
                                                        placeholder="Search currencies..."
                                                        value={searchFrom}
                                                        onChange={(e) => setSearchFrom(e.target.value)}
                                                        onClick={(e) => e.stopPropagation()}
                                                        autoFocus
                                                    />
                                                </div>

                                                {!searchFrom && (
                                                    <>
                                                        <div className="dropdown-section-label">POPULAR</div>
                                                        {popularCurrencies.map(code => {
                                                            const curr = getCurrencyByCode(code);
                                                            return (
                                                                <div
                                                                    key={code}
                                                                    className={`dropdown-currency-item ${baseCurrency === code ? 'selected' : ''}`}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setBaseCurrency(code);
                                                                        setShowFromDropdown(false);
                                                                        setSearchFrom('');
                                                                    }}
                                                                >
                                                                    <span className="dropdown-flag">{curr.flag}</span>
                                                                    <div className="dropdown-text-group">
                                                                        <span className="dropdown-code">{curr.code}</span>
                                                                        <span className="dropdown-symbol">{getCurrencySymbol(curr.code)}</span>
                                                                        <span className="dropdown-name">{curr.name}</span>
                                                                    </div>
                                                                    {baseCurrency === code && (
                                                                        <svg className="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                                                            <polyline points="20 6 9 17 4 12" />
                                                                        </svg>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                        <div className="dropdown-section-label">ALL CURRENCIES</div>
                                                    </>
                                                )}

                                                {getFilteredCurrencies(searchFrom).map(curr => (
                                                    <div
                                                        key={curr.code}
                                                        className={`dropdown-currency-item ${baseCurrency === curr.code ? 'selected' : ''}`}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setBaseCurrency(curr.code);
                                                            setShowFromDropdown(false);
                                                            setSearchFrom('');
                                                        }}
                                                    >
                                                        <span className="dropdown-flag">{curr.flag}</span>
                                                        <div className="dropdown-text-group">
                                                            <span className="dropdown-code">{curr.code}</span>
                                                            <span className="dropdown-symbol">{getCurrencySymbol(curr.code)}</span>
                                                            <span className="dropdown-name">{curr.name}</span>
                                                        </div>
                                                        {baseCurrency === curr.code && (
                                                            <svg className="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                                                <polyline points="20 6 9 17 4 12" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Swap Button */}
                                    <button
                                        className="swap-button-upgraded"
                                        onClick={() => {
                                            const temp = baseCurrency;
                                            setBaseCurrency(targetCurrency);
                                            setTargetCurrency(temp);
                                        }}
                                    >
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                            <path d="M7 16V4M7 4L3 8M7 4L11 8" />
                                            <path d="M17 8V20M17 20L21 16M17 20L13 16" />
                                        </svg>
                                    </button>

                                    {/* To Currency with Search Dropdown */}
                                    <div className="currency-input-section-upgraded">
                                        <label>To</label>
                                        <div
                                            className="currency-selector-box-upgraded"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setShowToDropdown(!showToDropdown);
                                                setShowFromDropdown(false);
                                            }}
                                        >
                                            <span className="currency-flag-upgraded">{getCurrencyByCode(targetCurrency).flag}</span>
                                            <div className="currency-display-upgraded">
                                                <span className="currency-code-upgraded">{targetCurrency}</span>
                                                <span className="currency-symbol-display">{getCurrencySymbol(targetCurrency)}</span>
                                                <span className="currency-name-small">- {getCurrencyName(targetCurrency)}</span>
                                            </div>
                                            <svg className="dropdown-chevron-upgraded" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polyline points="6 9 12 15 18 9" />
                                            </svg>
                                        </div>

                                        {showToDropdown && (
                                            <div className="currency-dropdown-panel" onClick={(e) => e.stopPropagation()}>
                                                <div className="dropdown-search-box">
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <circle cx="11" cy="11" r="8" />
                                                        <path d="m21 21-4.35-4.35" />
                                                    </svg>
                                                    <input
                                                        type="text"
                                                        placeholder="Search currencies..."
                                                        value={searchTo}
                                                        onChange={(e) => setSearchTo(e.target.value)}
                                                        onClick={(e) => e.stopPropagation()}
                                                        autoFocus
                                                    />
                                                </div>

                                                {!searchTo && (
                                                    <>
                                                        <div className="dropdown-section-label">POPULAR</div>
                                                        {popularCurrencies.map(code => {
                                                            const curr = getCurrencyByCode(code);
                                                            return (
                                                                <div
                                                                    key={code}
                                                                    className={`dropdown-currency-item ${targetCurrency === code ? 'selected' : ''}`}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setTargetCurrency(code);
                                                                        setShowToDropdown(false);
                                                                        setSearchTo('');
                                                                    }}
                                                                >
                                                                    <span className="dropdown-flag">{curr.flag}</span>
                                                                    <div className="dropdown-text-group">
                                                                        <span className="dropdown-code">{curr.code}</span>
                                                                        <span className="dropdown-symbol">{getCurrencySymbol(curr.code)}</span>
                                                                        <span className="dropdown-name">{curr.name}</span>
                                                                    </div>
                                                                    {targetCurrency === code && (
                                                                        <svg className="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                                                            <polyline points="20 6 9 17 4 12" />
                                                                        </svg>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                        <div className="dropdown-section-label">ALL CURRENCIES</div>
                                                    </>
                                                )}

                                                {getFilteredCurrencies(searchTo).map(curr => (
                                                    <div
                                                        key={curr.code}
                                                        className={`dropdown-currency-item ${targetCurrency === curr.code ? 'selected' : ''}`}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setTargetCurrency(curr.code);
                                                            setShowToDropdown(false);
                                                            setSearchTo('');
                                                        }}
                                                    >
                                                        <span className="dropdown-flag">{curr.flag}</span>
                                                        <div className="dropdown-text-group">
                                                            <span className="dropdown-code">{curr.code}</span>
                                                            <span className="dropdown-symbol">{getCurrencySymbol(curr.code)}</span>
                                                            <span className="dropdown-name">{curr.name}</span>
                                                        </div>
                                                        {targetCurrency === curr.code && (
                                                            <svg className="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                                                <polyline points="20 6 9 17 4 12" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Convert Button */}
                                    <button className="convert-button-upgraded">
                                        Convert
                                    </button>
                                </div>

                                {historicalData[targetCurrency] && historicalData[baseCurrency] && (
                                    <>
                                        <div className="conversion-result-upgraded">
                                            <div className="result-amount-upgraded">
                                                {convertedAmount} {targetCurrency}
                                            </div>
                                            <div className="result-rate-upgraded">
                                                1 {baseCurrency} = {(historicalData[targetCurrency].current / historicalData[baseCurrency].current).toFixed(6)} {targetCurrency}
                                            </div>
                                            <div className="result-timestamp-upgraded">
                                                Updated {formatTime()}
                                            </div>
                                        </div>

                                        <div className="exchange-rate-details-upgraded">
                                            <p className="rate-info-text">
                                                Mid-market exchange rate at {formatTime()}
                                            </p>
                                            <p className="spread-info-upgraded">
                                                Bid-Ask Spread: {((historicalData[targetCurrency].ask - historicalData[targetCurrency].bid) / historicalData[targetCurrency].bid * 100).toFixed(3)}%
                                            </p>
                                        </div>
                                    </>
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