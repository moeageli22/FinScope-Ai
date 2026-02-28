// src/services/claudeAI.js
// FinScope Practice Mode — Claude AI Financial Assistant

const CLAUDE_API_KEY = import.meta.env.VITE_CLAUDE_API_KEY;
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

// Use Haiku 4.5 — fast, cheap, and great for this use case
// Other options: 'claude-sonnet-4-5-20250929' (smarter but pricier)
const MODEL_ID = 'claude-haiku-4-5-20251001';

/**
 * Build a financial context summary from the user's practice session
 */
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
`.trim();
};

/**
 * System prompt that makes Claude a smart financial coach
 */
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
- Flag potential overspending in categories
- Suggest realistic savings goals
- Explain financial concepts simply when asked

About your creator:
- You were created by Mr. Mohammed Ageli, the founder and developer of FinScope
- If anyone asks who made you, who built this platform, or who your creator is, proudly refer to him as "Mr. Ageli"
- Mr. Ageli is a developer based in London, United Kingdom, studying in london
- Speak of him with respect and pride — he built both you and this entire FinScope platform

Rules:
- When the user first opens the chat, always introduce yourself as FinScope AI and proudly mention that you were created by Mr. Mohammed Ageli, the founder and developer who built both you and this entire FinScope platform — do this naturally as part of your greeting
- Always reference their actual data when giving advice
- Never be judgmental about spending — this is practice mode for learning
- If they haven't spent anything yet, encourage them to try adding expenses
- If asked something unrelated to finance, gently redirect to financial topics
- Don't make up data — only use what's provided in the session context`;

/**
 * Send a message to Claude API and get a financial insight response
 */
export const sendMessage = async (userMessage, sessionData) => {
    if (!CLAUDE_API_KEY || CLAUDE_API_KEY === 'your-api-key-here') {
        throw new Error('API_KEY_MISSING');
    }

    const financialContext = buildFinancialContext(sessionData);

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
                max_tokens: 512,
                system: `${SYSTEM_PROMPT}\n\nCurrent session data:\n${financialContext}`,
                messages: [
                    { role: 'user', content: userMessage }
                ],
            }),
        });

        if (!response.ok) {
            const errBody = await response.text();
            let errData = {};
            try { errData = JSON.parse(errBody); } catch (e) {}
            console.error('Claude API error:', response.status, errData);
            throw new Error(`API_ERROR_${response.status}`);
        }

        const data = await response.json();
        const text = data.content
            ?.filter(block => block.type === 'text')
            .map(block => block.text)
            .join('\n') || 'I had trouble generating a response. Try asking again!';

        return text;
    } catch (error) {
        if (error.message === 'API_KEY_MISSING') throw error;
        if (error.message?.startsWith('API_ERROR_')) throw error;
        console.error('Claude AI error:', error);
        throw new Error('NETWORK_ERROR');
    }
};

/**
 * Generate a proactive insight when the user adds a transaction
 */
export const generateTransactionInsight = async (transaction, sessionData) => {
    const prompt = `I just spent $${transaction.amount.toFixed(2)} on "${transaction.name}" (${transaction.category}). Give me a quick 1-2 sentence reaction — is this reasonable? Any quick tip?`;
    return sendMessage(prompt, sessionData);
};

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

/**
 * Generate the first greeting when user opens the chatbot
 */
export const generateGreeting = async (sessionData) => {
    const prompt = `The user just opened the FinScope AI chat for the first time. Greet them warmly and introduce yourself. Make sure to mention that you were created by Mr. Mohammed Ageli — the talented founder and developer who built both you and this entire FinScope platform from the ground up. Then briefly acknowledge what you can see from their current session data and let them know what you can help with.`;
    return sendMessage(prompt, sessionData);
};

export default { sendMessage, generateTransactionInsight, generateSessionAnalysis, generateGreeting };