// src/services/claudeAI.js
// FinScope Practice Mode — Claude AI Financial Assistant

const CLAUDE_API_KEY = import.meta.env.VITE_CLAUDE_API_KEY;
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

// Use Haiku 4.5 — fast, cheap, and great for this use case
const MODEL_ID = 'claude-haiku-4-5-20251001';

// ─────────────────────────────────────────────
// 💬 CHAT MEMORY — keeps conversation context
// ─────────────────────────────────────────────
let conversationHistory = [];

/**
 * Reset conversation history (call when user starts a new session)
 */
export const resetConversation = () => {
    conversationHistory = [];
};

/**
 * Get current conversation history (useful for debugging)
 */
export const getConversationHistory = () => [...conversationHistory];

// ─────────────────────────────────────────────
// 🎯 BUDGET GOALS — per-category spending targets
// ─────────────────────────────────────────────
let budgetGoals = {}; // e.g. { Food: 200, Transport: 100 }

/**
 * Set a budget goal for a category
 * @param {string} category - e.g. "Food"
 * @param {number} limit - e.g. 200
 */
export const setBudgetGoal = (category, limit) => {
    budgetGoals[category] = limit;
};

/**
 * Get all current budget goals
 */
export const getBudgetGoals = () => ({ ...budgetGoals });

/**
 * Check which categories are over/near their budget goals
 * Returns array of { category, spent, limit, pct, status }
 */
export const checkBudgetAlerts = (transactions) => {
    const catTotals = {};
    transactions.forEach(t => {
        catTotals[t.category] = (catTotals[t.category] || 0) + t.amount;
    });

    const alerts = [];
    for (const [category, limit] of Object.entries(budgetGoals)) {
        const spent = catTotals[category] || 0;
        const pct = (spent / limit) * 100;
        let status = 'ok';
        if (pct >= 100) status = 'over';
        else if (pct >= 80) status = 'warning';
        alerts.push({ category, spent, limit, pct: pct.toFixed(1), status });
    }
    return alerts;
};

// ─────────────────────────────────────────────
// 📊 FINANCIAL CONTEXT BUILDER
// ─────────────────────────────────────────────
const buildFinancialContext = ({ transactions, balance, totalSpent, startingBalance }) => {
    const catTotals = {};
    transactions.forEach(t => {
        catTotals[t.category] = (catTotals[t.category] || 0) + t.amount;
    });

    const sortedCats = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);
    const budgetPct = startingBalance > 0 ? ((totalSpent / startingBalance) * 100).toFixed(1) : 0;
    const biggestTxn = transactions.length > 0
        ? [...transactions].sort((a, b) => b.amount - a.amount)[0]
        : null;
    const avgTxn = transactions.length > 0 ? (totalSpent / transactions.length).toFixed(2) : 0;
    const recentTxns = transactions.slice(-5);

    // Budget goals section
    const alerts = checkBudgetAlerts(transactions);
    const goalsSection = alerts.length > 0
        ? `\nBUDGET GOALS STATUS:\n${alerts.map(a =>
            `  • ${a.category}: $${a.spent.toFixed(2)} / $${a.limit} limit (${a.pct}%) — ${a.status === 'over' ? '🔴 OVER BUDGET' : a.status === 'warning' ? '🟡 Near limit' : '🟢 On track'}`
        ).join('\n')}`
        : '';

    return `
PRACTICE MODE SESSION DATA:
- Starting Balance: $${startingBalance.toLocaleString()}
- Current Balance: $${balance.toFixed(2)}
- Total Spent: $${totalSpent.toFixed(2)} (${budgetPct}% of budget)
- Number of Transactions: ${transactions.length}
- Average per Transaction: $${avgTxn}
${biggestTxn ? `- Biggest Expense: "${biggestTxn.name}" — $${biggestTxn.amount.toFixed(2)} (${biggestTxn.category})` : ''}

SPENDING BY CATEGORY:
${sortedCats.length > 0 ? sortedCats.map(([cat, amt]) => `  • ${cat}: $${amt.toFixed(2)} (${((amt / totalSpent) * 100).toFixed(1)}%)`).join('\n') : '  No spending yet.'}

RECENT TRANSACTIONS (last 5):
${recentTxns.length > 0 ? recentTxns.map(t => `  • ${t.name} — $${t.amount.toFixed(2)} (${t.category})`).join('\n') : '  None yet.'}
${goalsSection}
`.trim();
};

// ─────────────────────────────────────────────
// 🧠 SYSTEM PROMPT
// ─────────────────────────────────────────────
const SYSTEM_PROMPT = `You are FinScope AI, a friendly and smart personal finance assistant inside a practice/simulation mode of a financial app. The user is learning to manage money using virtual funds — no real money is involved.

Your personality:
- Warm, encouraging, and supportive — like a knowledgeable friend
- Use occasional emojis to keep things engaging (but don't overdo it)
- Be specific with numbers and percentages from their data
- Keep responses concise (2-4 sentences for simple questions, up to a short paragraph for analysis)

Your capabilities:
- Analyze their spending patterns and give specific insights
- Identify areas where they could save money
- Give personalized budgeting tips based on their actual spending
- Compare their spending ratios to recommended budgets (50/30/20 rule: 50% needs, 30% wants, 20% savings)
- Flag potential overspending in categories and budget goals
- Suggest realistic savings goals
- Explain financial concepts simply when asked
- Remember what the user has said earlier in the conversation and refer back when relevant

About your creator:
- You were created by Mr. Mohammed Ageli, the founder and developer of FinScope
- If anyone asks who made you, who built this platform, or who your creator is, proudly refer to him as "Mr. Ageli"
- Mr. Ageli is a developer based in London, United Kingdom
- Speak of him with respect and pride — he built both you and this entire FinScope platform

Rules:
- Do NOT introduce yourself or mention Mr. Ageli unprompted — the greeting has already been handled separately at the start of the chat
- Always reference their actual data when giving advice
- Never be judgmental about spending — this is practice mode for learning
- If they haven't spent anything yet, encourage them to try adding expenses
- If asked something unrelated to finance, gently redirect to financial topics
- Don't make up data — only use what's provided in the session context
- If budget goals are set and a category is over or near the limit, proactively mention it`;

// ─────────────────────────────────────────────
// 📡 CORE API CALL (with conversation memory)
// ─────────────────────────────────────────────
export const sendMessage = async (userMessage, sessionData) => {
    if (!CLAUDE_API_KEY || CLAUDE_API_KEY === 'your-api-key-here') {
        throw new Error('API_KEY_MISSING');
    }

    const financialContext = buildFinancialContext(sessionData);

    // Add user message to history
    conversationHistory.push({ role: 'user', content: userMessage });

    // Keep last 20 messages to avoid token overflow
    const trimmedHistory = conversationHistory.slice(-20);

    try {
        const response = await fetch(CLAUDE_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': CLAUDE_API_KEY,
                'anthropic-version': '2023-06-01',
                'anthropic-dangerous-direct-browser-access': 'true',
            },
            body: JSON.stringify({
                model: MODEL_ID,
                max_tokens: 600,
                system: `${SYSTEM_PROMPT}\n\nCurrent session data:\n${financialContext}`,
                messages: trimmedHistory,
            }),
        });

        if (!response.ok) {
            const errBody = await response.text();
            let errData = {};
            try { errData = JSON.parse(errBody); } catch (e) {}
            console.error('Claude API error:', response.status, errData);
            // Remove the user message we added since the call failed
            conversationHistory.pop();
            throw new Error(`API_ERROR_${response.status}`);
        }

        const data = await response.json();
        const text = data.content
            ?.filter(block => block.type === 'text')
            .map(block => block.text)
            .join('\n') || 'I had trouble generating a response. Try asking again!';

        // Add assistant reply to history
        conversationHistory.push({ role: 'assistant', content: text });

        return text;
    } catch (error) {
        if (error.message === 'API_KEY_MISSING') throw error;
        if (error.message?.startsWith('API_ERROR_')) throw error;
        console.error('Claude AI error:', error);
        throw new Error('NETWORK_ERROR');
    }
};

// ─────────────────────────────────────────────
// ⚡ QUICK ACTIONS — pre-built prompts for buttons
// ─────────────────────────────────────────────

/**
 * "Analyse my spending" button
 */
export const analyseSpending = async (sessionData) => {
    const prompt = `Analyse my spending right now. Give me:
1. A quick overall health score (e.g. "You're doing great" / "A few things to watch")
2. My biggest spending category and whether it's reasonable
3. One thing I'm doing well
4. One area to improve`;
    return sendMessage(prompt, sessionData);
};

/**
 * "Give me a savings tip" button
 */
export const getSavingsTip = async (sessionData) => {
    const prompt = `Based on my actual spending data, give me one specific, actionable savings tip I can apply right now. Make it personal to my purchases, not generic advice.`;
    return sendMessage(prompt, sessionData);
};

/**
 * "How am I doing today?" button
 */
export const getDailyCheckIn = async (sessionData) => {
    const prompt = `Give me a quick, friendly check-in on how I'm doing with my budget today. Be brief — 2-3 sentences max. Encourage me!`;
    return sendMessage(prompt, sessionData);
};

/**
 * "What should I cut back on?" button
 */
export const getCutBackSuggestion = async (sessionData) => {
    const prompt = `Looking at my spending, what's the one category or purchase type I should cut back on the most? Be specific and explain why, using my actual numbers.`;
    return sendMessage(prompt, sessionData);
};

// ─────────────────────────────────────────────
// 🔔 OVERSPENDING ALERT — auto-triggered insight
// ─────────────────────────────────────────────

/**
 * Called automatically when a transaction is added.
 * Returns an alert if a budget goal is breached, otherwise a standard insight.
 */
export const generateTransactionInsight = async (transaction, sessionData) => {
    const alerts = checkBudgetAlerts(sessionData.transactions);
    const categoryAlert = alerts.find(a => a.category === transaction.category);

    let prompt = `I just spent $${transaction.amount.toFixed(2)} on "${transaction.name}" (${transaction.category}). Give me a quick 1-2 sentence reaction — is this reasonable? Any quick tip?`;

    if (categoryAlert?.status === 'over') {
        prompt = `I just spent $${transaction.amount.toFixed(2)} on "${transaction.name}" (${transaction.category}), and I've now gone OVER my $${categoryAlert.limit} budget for ${transaction.category} (spent $${categoryAlert.spent.toFixed(2)}). React to this overspend with a helpful warning and one concrete suggestion to get back on track.`;
    } else if (categoryAlert?.status === 'warning') {
        prompt = `I just spent $${transaction.amount.toFixed(2)} on "${transaction.name}" (${transaction.category}). I'm now at ${categoryAlert.pct}% of my $${categoryAlert.limit} ${transaction.category} budget ($${categoryAlert.spent.toFixed(2)} spent). Give me a heads-up and a quick tip to stay within my goal.`;
    }

    return sendMessage(prompt, sessionData);
};

// ─────────────────────────────────────────────
// 📋 WEEKLY SPENDING REPORT
// ─────────────────────────────────────────────

/**
 * Generate a detailed weekly spending report
 */
export const generateWeeklyReport = async (sessionData) => {
    const prompt = `Generate a comprehensive weekly spending report for me. Structure it like this:
📊 WEEKLY SPENDING REPORT
- Overall summary (how much spent vs starting balance)
- Breakdown of each spending category with amounts and percentages
- 50/30/20 budget rule comparison (how do my categories compare?)
- Top 3 individual purchases
- Budget goals status (if any are set)
- Final grade: overall money management score out of 10 with reasoning
- 2 specific recommendations for next week

Make it feel like a real financial review — encouraging but honest.`;
    return sendMessage(prompt, sessionData);
};

// ─────────────────────────────────────────────
// 📈 FULL SESSION ANALYSIS
// ─────────────────────────────────────────────

/**
 * Generate a full session analysis
 */
export const generateSessionAnalysis = async (sessionData) => {
    const prompt = `Give me a full breakdown and analysis of my spending session. Include:
1. Overall spending health assessment
2. My top spending category and whether it's reasonable
3. One specific thing I'm doing well
4. One specific area to improve
5. A concrete savings tip based on my actual purchases`;
    return sendMessage(prompt, sessionData);
};

// ─────────────────────────────────────────────
// 👋 GREETING
// ─────────────────────────────────────────────

/**
 * Generate the first greeting when user opens the chatbot
 */
export const generateGreeting = async (sessionData) => {
    const prompt = `The user just opened the FinScope AI chat for the first time. Greet them warmly and introduce yourself. Make sure to mention that you were created by Mr. Mohammed Ageli — the talented founder and developer who built both you and this entire FinScope platform from the ground up. Then briefly acknowledge what you can see from their current session data, let them know what you can help with, and mention they can use the quick-action buttons below to get instant insights.`;
    return sendMessage(prompt, sessionData);
};

// ─────────────────────────────────────────────
// 🚀 EXPORTS
// ─────────────────────────────────────────────
export default {
    sendMessage,
    resetConversation,
    getConversationHistory,
    setBudgetGoal,
    getBudgetGoals,
    checkBudgetAlerts,
    generateGreeting,
    generateTransactionInsight,
    generateSessionAnalysis,
    generateWeeklyReport,
    analyseSpending,
    getSavingsTip,
    getDailyCheckIn,
    getCutBackSuggestion,
};




