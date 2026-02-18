import React, { createContext, useContext, useState, useCallback } from 'react';

export const CURRENCIES = [
    { code: 'USD', symbol: '$',    flag: '🇺🇸', name: 'US Dollar' },
    { code: 'GBP', symbol: '£',    flag: '🇬🇧', name: 'British Pound' },
    { code: 'EUR', symbol: '€',    flag: '🇪🇺', name: 'Euro' },
    { code: 'JPY', symbol: '¥',    flag: '🇯🇵', name: 'Japanese Yen' },
    { code: 'CNY', symbol: '¥',    flag: '🇨🇳', name: 'Chinese Yuan' },
    { code: 'INR', symbol: '₹',    flag: '🇮🇳', name: 'Indian Rupee' },
    { code: 'AED', symbol: 'د.إ',  flag: '🇦🇪', name: 'UAE Dirham' },
    { code: 'SAR', symbol: '﷼',    flag: '🇸🇦', name: 'Saudi Riyal' },
    { code: 'KWD', symbol: 'KD',   flag: '🇰🇼', name: 'Kuwaiti Dinar' },
    { code: 'QAR', symbol: 'QR',   flag: '🇶🇦', name: 'Qatari Riyal' },
    { code: 'BHD', symbol: 'BD',   flag: '🇧🇭', name: 'Bahraini Dinar' },
    { code: 'OMR', symbol: 'RO',   flag: '🇴🇲', name: 'Omani Rial' },
    { code: 'LYD', symbol: 'LYD',   flag: '🇱🇾', name: 'Libyan Dinar' },
    { code: 'EGP', symbol: 'E£',   flag: '🇪🇬', name: 'Egyptian Pound' },
    { code: 'TRY', symbol: '₺',    flag: '🇹🇷', name: 'Turkish Lira' },
    { code: 'CAD', symbol: 'C$',   flag: '🇨🇦', name: 'Canadian Dollar' },
    { code: 'AUD', symbol: 'A$',   flag: '🇦🇺', name: 'Australian Dollar' },
    { code: 'CHF', symbol: 'Fr',   flag: '🇨🇭', name: 'Swiss Franc' },
    { code: 'SGD', symbol: 'S$',   flag: '🇸🇬', name: 'Singapore Dollar' },
    { code: 'HKD', symbol: 'HK$',  flag: '🇭🇰', name: 'Hong Kong Dollar' },
    { code: 'KRW', symbol: '₩',    flag: '🇰🇷', name: 'South Korean Won' },
    { code: 'BRL', symbol: 'R$',   flag: '🇧🇷', name: 'Brazilian Real' },
    { code: 'MXN', symbol: 'MX$',  flag: '🇲🇽', name: 'Mexican Peso' },
    { code: 'ZAR', symbol: 'R',    flag: '🇿🇦', name: 'South African Rand' },
    { code: 'NGN', symbol: '₦',    flag: '🇳🇬', name: 'Nigerian Naira' },
    { code: 'PKR', symbol: '₨',    flag: '🇵🇰', name: 'Pakistani Rupee' },
    { code: 'BDT', symbol: '৳',    flag: '🇧🇩', name: 'Bangladeshi Taka' },
    { code: 'IDR', symbol: 'Rp',   flag: '🇮🇩', name: 'Indonesian Rupiah' },
    { code: 'MYR', symbol: 'RM',   flag: '🇲🇾', name: 'Malaysian Ringgit' },
    { code: 'THB', symbol: '฿',    flag: '🇹🇭', name: 'Thai Baht' },
    { code: 'SEK', symbol: 'kr',   flag: '🇸🇪', name: 'Swedish Krona' },
    { code: 'NOK', symbol: 'kr',   flag: '🇳🇴', name: 'Norwegian Krone' },
    { code: 'DKK', symbol: 'kr',   flag: '🇩🇰', name: 'Danish Krone' },
    { code: 'PLN', symbol: 'zł',   flag: '🇵🇱', name: 'Polish Złoty' },
    { code: 'RUB', symbol: '₽',    flag: '🇷🇺', name: 'Russian Ruble' },
    { code: 'ILS', symbol: '₪',    flag: '🇮🇱', name: 'Israeli Shekel' },
    { code: 'NZD', symbol: 'NZ$',  flag: '🇳🇿', name: 'New Zealand Dollar' },
    { code: 'PHP', symbol: '₱',    flag: '🇵🇭', name: 'Philippine Peso' },
    { code: 'VND', symbol: '₫',    flag: '🇻🇳', name: 'Vietnamese Dong' },
    { code: 'CZK', symbol: 'Kč',   flag: '🇨🇿', name: 'Czech Koruna' },
    { code: 'HUF', symbol: 'Ft',   flag: '🇭🇺', name: 'Hungarian Forint' },
];

const getInitialCurrency = () => {
    try {
        const saved = localStorage.getItem('finscope_settings');
        if (saved) {
            const s = JSON.parse(saved);
            if (s.currency) {
                const found = CURRENCIES.find(c => c.code === s.currency);
                if (found) return found;
            }
        }
    } catch {}
    return CURRENCIES[0]; // default USD
};

const CurrencyContext = createContext(null);

export const CurrencyProvider = ({ children }) => {
    const [currency, setCurrencyState] = useState(getInitialCurrency);

    const setCurrency = useCallback((codeOrObj) => {
        const found = typeof codeOrObj === 'string'
            ? CURRENCIES.find(c => c.code === codeOrObj)
            : codeOrObj;
        if (!found) return;
        setCurrencyState(found);
        // persist to settings
        try {
            const saved = localStorage.getItem('finscope_settings');
            const s = saved ? JSON.parse(saved) : {};
            localStorage.setItem('finscope_settings', JSON.stringify({ ...s, currency: found.code }));
        } catch {}
    }, []);

    // Helper: format a number with the current currency symbol
    const fmt = useCallback((amount, opts = {}) => {
        const num = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
        const fixed = opts.decimals !== undefined ? opts.decimals : 2;
        const abs = Math.abs(num);
        const formatted = abs.toLocaleString(undefined, {
            minimumFractionDigits: fixed,
            maximumFractionDigits: fixed,
        });
        return `${currency.symbol}${formatted}`;
    }, [currency]);

    return (
        <CurrencyContext.Provider value={{ currency, setCurrency, fmt, CURRENCIES }}>
            {children}
        </CurrencyContext.Provider>
    );
};

export const useCurrency = () => {
    const ctx = useContext(CurrencyContext);
    if (!ctx) throw new Error('useCurrency must be used inside CurrencyProvider');
    return ctx;
};

export default CurrencyContext;