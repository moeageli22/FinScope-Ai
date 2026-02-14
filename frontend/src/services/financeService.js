// src/services/financeService.js
// FinScope AI - Persistent Financial Data Service (Supabase)
// Handles transactions, balances, deposits, withdrawals with full persistence

import { supabase } from '../config/supabase.js';

/* ═══════════════════════════════════════════
   TABLE SETUP HELPERS
   Creates tables if they don't exist using
   Supabase's built-in storage
   ═══════════════════════════════════════════ */

/**
 * Initialize user financial profile if not exists
 */
export const initUserFinance = async (userId) => {
    // Check if user already has a finance profile
    const { data: existing } = await supabase
        .from('user_finances')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (existing) return existing;

    // Create new finance profile
    const { data, error } = await supabase
        .from('user_finances')
        .insert({
            user_id: userId,
            balance: 0,
            total_income: 0,
            total_expenses: 0,
            created_at: new Date().toISOString(),
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating finance profile:', error);
        // Return a default object if table doesn't exist yet
        return { user_id: userId, balance: 0, total_income: 0, total_expenses: 0 };
    }
    return data;
};

/**
 * Get user's financial summary
 */
export const getUserFinance = async (userId) => {
    const { data, error } = await supabase
        .from('user_finances')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (error) {
        console.log('Finance profile not found, initializing...');
        return initUserFinance(userId);
    }
    return data;
};

/**
 * Update user's balance and totals
 */
export const updateUserFinance = async (userId, updates) => {
    const { data, error } = await supabase
        .from('user_finances')
        .update({
            ...updates,
            updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single();

    if (error) {
        console.error('Error updating finance:', error);
        throw error;
    }
    return data;
};

/* ═══════════════════════════════════════════
   TRANSACTIONS
   ═══════════════════════════════════════════ */

/**
 * Add a transaction (expense or income/deposit)
 */
export const addTransaction = async (userId, transaction) => {
    const { data, error } = await supabase
        .from('user_transactions')
        .insert({
            user_id: userId,
            name: transaction.name,
            amount: transaction.amount,
            type: transaction.type, // 'expense' | 'deposit' | 'withdrawal'
            category: transaction.category,
            emoji: transaction.emoji || '💳',
            logo: transaction.logo || null,
            notes: transaction.notes || null,
            created_at: new Date().toISOString(),
        })
        .select()
        .single();

    if (error) {
        console.error('Error adding transaction:', error);
        throw error;
    }

    // Update balance
    const finance = await getUserFinance(userId);
    const balanceChange = transaction.type === 'deposit'
        ? transaction.amount
        : -transaction.amount;

    const newBalance = (finance.balance || 0) + balanceChange;
    const newIncome = transaction.type === 'deposit'
        ? (finance.total_income || 0) + transaction.amount
        : finance.total_income || 0;
    const newExpenses = transaction.type === 'expense'
        ? (finance.total_expenses || 0) + transaction.amount
        : finance.total_expenses || 0;

    await updateUserFinance(userId, {
        balance: newBalance,
        total_income: newIncome,
        total_expenses: newExpenses,
    });

    return { transaction: data, newBalance, newIncome, newExpenses };
};

/**
 * Get all transactions for a user
 */
export const getTransactions = async (userId, options = {}) => {
    let query = supabase
        .from('user_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (options.limit) query = query.limit(options.limit);
    if (options.from) query = query.gte('created_at', options.from);
    if (options.to) query = query.lte('created_at', options.to);
    if (options.type) query = query.eq('type', options.type);
    if (options.category) query = query.eq('category', options.category);

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching transactions:', error);
        return [];
    }
    return data || [];
};

/**
 * Get transactions for a specific month
 */
export const getMonthlyTransactions = async (userId, year, month) => {
    const from = new Date(year, month, 1).toISOString();
    const to = new Date(year, month + 1, 0, 23, 59, 59).toISOString();
    return getTransactions(userId, { from, to });
};

/**
 * Get spending summary by category for a time range
 */
export const getCategorySummary = async (userId, from, to) => {
    const transactions = await getTransactions(userId, { from, to, type: 'expense' });
    const catTotals = {};
    transactions.forEach(t => {
        catTotals[t.category] = (catTotals[t.category] || 0) + t.amount;
    });
    return Object.entries(catTotals)
        .sort((a, b) => b[1] - a[1])
        .map(([name, amount]) => ({ name, amount }));
};

/**
 * Get monthly summary (for AI to analyze multi-month trends)
 */
export const getMonthlySummaries = async (userId, months = 6) => {
    const summaries = [];
    const now = new Date();

    for (let i = 0; i < months; i++) {
        const year = now.getFullYear();
        const month = now.getMonth() - i;
        const date = new Date(year, month, 1);
        const actualYear = date.getFullYear();
        const actualMonth = date.getMonth();

        const from = new Date(actualYear, actualMonth, 1).toISOString();
        const to = new Date(actualYear, actualMonth + 1, 0, 23, 59, 59).toISOString();

        const transactions = await getTransactions(userId, { from, to });
        const expenses = transactions.filter(t => t.type === 'expense');
        const deposits = transactions.filter(t => t.type === 'deposit');

        const totalExpenses = expenses.reduce((s, t) => s + t.amount, 0);
        const totalDeposits = deposits.reduce((s, t) => s + t.amount, 0);

        const catTotals = {};
        expenses.forEach(t => {
            catTotals[t.category] = (catTotals[t.category] || 0) + t.amount;
        });

        summaries.push({
            month: date.toLocaleString('default', { month: 'long', year: 'numeric' }),
            year: actualYear,
            monthIndex: actualMonth,
            totalExpenses,
            totalDeposits,
            transactionCount: transactions.length,
            expenseCount: expenses.length,
            categories: catTotals,
            topCategory: Object.entries(catTotals).sort((a, b) => b[1] - a[1])[0] || null,
            saved: totalDeposits - totalExpenses,
        });
    }

    return summaries;
};

/**
 * Delete a transaction and adjust balance
 */
export const deleteTransaction = async (userId, transactionId) => {
    // Get the transaction first
    const { data: txn } = await supabase
        .from('user_transactions')
        .select('*')
        .eq('id', transactionId)
        .eq('user_id', userId)
        .single();

    if (!txn) throw new Error('Transaction not found');

    // Delete it
    const { error } = await supabase
        .from('user_transactions')
        .delete()
        .eq('id', transactionId)
        .eq('user_id', userId);

    if (error) throw error;

    // Adjust balance
    const finance = await getUserFinance(userId);
    const balanceChange = txn.type === 'deposit' ? -txn.amount : txn.amount;
    const newBalance = (finance.balance || 0) + balanceChange;

    await updateUserFinance(userId, {
        balance: newBalance,
        total_income: txn.type === 'deposit'
            ? Math.max(0, (finance.total_income || 0) - txn.amount)
            : finance.total_income,
        total_expenses: txn.type === 'expense'
            ? Math.max(0, (finance.total_expenses || 0) - txn.amount)
            : finance.total_expenses,
    });

    return { newBalance };
};

/* ═══════════════════════════════════════════
   SAVINGS GOALS
   ═══════════════════════════════════════════ */

export const getSavingsGoals = async (userId) => {
    const { data, error } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) return [];
    return data || [];
};

export const createSavingsGoal = async (userId, goal) => {
    const { data, error } = await supabase
        .from('savings_goals')
        .insert({
            user_id: userId,
            name: goal.name,
            target_amount: goal.targetAmount,
            current_amount: 0,
            deadline: goal.deadline || null,
            created_at: new Date().toISOString(),
        })
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const updateSavingsGoal = async (userId, goalId, updates) => {
    const { data, error } = await supabase
        .from('savings_goals')
        .update(updates)
        .eq('id', goalId)
        .eq('user_id', userId)
        .select()
        .single();

    if (error) throw error;
    return data;
};

export default {
    initUserFinance,
    getUserFinance,
    updateUserFinance,
    addTransaction,
    getTransactions,
    getMonthlyTransactions,
    getCategorySummary,
    getMonthlySummaries,
    deleteTransaction,
    getSavingsGoals,
    createSavingsGoal,
    updateSavingsGoal,
};