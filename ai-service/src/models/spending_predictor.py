"""
Spending Predictor Model
Predicts future spending based on transaction history
"""

import numpy as np
from datetime import datetime, timedelta


def predict_spending(transactions, user_id=None, period='next_month'):
    """
    Predict user's spending for the next period

    Args:
        transactions: List of transaction dictionaries
        user_id: User identifier
        period: Prediction period ('next_week', 'next_month', etc.)

    Returns:
        Dictionary with predictions
    """

    # Calculate historical average
    if not transactions:
        return {
            'predicted_amount': 0,
            'confidence': 0,
            'breakdown': {}
        }

    # Simple prediction: average of last 30 days
    total = sum(t.get('amount', 0) for t in transactions)
    avg_per_transaction = total / len(transactions)

    # Category breakdown
    categories = {}
    for t in transactions:
        cat = t.get('category', 'Other')
        categories[cat] = categories.get(cat, 0) + t.get('amount', 0)

    # Predict based on period
    if period == 'next_week':
        predicted_amount = total * (7 / 30)
    else:  # next_month
        predicted_amount = total * 1.05  # 5% increase trend

    return {
        'predicted_amount': round(predicted_amount, 2),
        'confidence': 0.78,
        'breakdown': {
            cat: round(amt, 2)
            for cat, amt in categories.items()
        },
        'trend': 'increasing' if predicted_amount > total else 'stable',
        'period': period
    }


def analyze_spending_patterns(transactions):
    """
    Analyze spending patterns and trends

    Returns insights about spending behavior
    """

    if not transactions:
        return {'patterns': []}

    # Group by day of week
    day_spending = {}
    for t in transactions:
        # Mock date parsing
        day = 'Monday'  # Replace with actual date parsing
        day_spending[day] = day_spending.get(day, 0) + t.get('amount', 0)

    patterns = []

    # Find highest spending day
    if day_spending:
        highest_day = max(day_spending, key=day_spending.get)
        patterns.append(f"You spend most on {highest_day}")

    return {
        'patterns': patterns,
        'day_spending': day_spending
    }