"""
Chat Service - Handles AI chat responses for FinScope AI
"""

from models.spending_predictor import predict_spending, analyze_spending_patterns
from models.budget_optimizer import optimize_budget


def format_spending_for_chat(transactions):
    """
    Format spending data for chat display with cards and trends

    Args:
        transactions: List of transaction dicts with 'amount' and 'category'

    Returns:
        Dict with rich chat content (cards + trends)
    """
    if not transactions:
        return {
            "type": "text",
            "text": "I don't see any transactions yet. Start adding transactions to see your spending analysis!"
        }

    # Analyze spending using your existing model
    prediction = predict_spending(transactions)
    breakdown = prediction['breakdown']
    total = prediction['predicted_amount']

    # Find top spending category
    top_category = max(breakdown, key=breakdown.get) if breakdown else "None"
    top_amount = breakdown.get(top_category, 0)

    # Calculate savings rate
    # TODO: Get actual income from user profile/database
    income = 5000  # Mock income - replace with real data
    savings_rate = int(((income - total) / income * 100)) if income > 0 else 0

    # Return rich response with cards and trends
    return {
        "type": "rich",
        "text": "Here's your spending analysis for this month. I've broken it down by categories and highlighted your top expenses.",
        "data": {
            "cards": [
                {
                    "icon": "💰",
                    "label": "Total Spent",
                    "value": f"${total:,.2f}",
                    "subtitle": "This month"
                },
                {
                    "icon": "📊",
                    "label": "Top Category",
                    "value": top_category,
                    "subtitle": f"${top_amount:,.2f} spent"
                },
                {
                    "icon": "🎯",
                    "label": "Savings Rate",
                    "value": f"{savings_rate}%",
                    "subtitle": "Of income"
                }
            ],
            "trends": [
                {
                    "category": cat,
                    "amount": amt,
                    "color": get_category_color(cat)
                }
                for cat, amt in breakdown.items()
            ]
        }
    }


def get_category_color(category):
    """
    Return gradient color for each category

    Args:
        category: Category name

    Returns:
        CSS gradient string
    """
    colors = {
        'Food': 'linear-gradient(90deg, #3b82f6, #06b6d4)',
        'Transport': 'linear-gradient(90deg, #06b6d4, #0891b2)',
        'Shopping': 'linear-gradient(90deg, #8b5cf6, #6366f1)',
        'Entertainment': 'linear-gradient(90deg, #a78bfa, #8b5cf6)',
        'Bills': 'linear-gradient(90deg, #6366f1, #3b82f6)',
        'Other': 'linear-gradient(90deg, #3b82f6, #8b5cf6)'
    }
    return colors.get(category, 'linear-gradient(90deg, #3b82f6, #8b5cf6)')


def handle_chat_message(user_message, user_transactions):
    """
    Main chat handler - determines what kind of response to send

    Args:
        user_message: The user's message text
        user_transactions: List of user's transactions

    Returns:
        Dict with chat response content
    """
    message_lower = user_message.lower()

    # Spending analysis request
    if any(word in message_lower for word in ['spending', 'total', 'spent', 'expense']):
        return format_spending_for_chat(user_transactions)

    # Trends/patterns request
    elif any(word in message_lower for word in ['trend', 'pattern', 'breakdown']):
        return format_spending_for_chat(user_transactions)

    # Budget help request
    elif any(word in message_lower for word in ['budget', 'recommend', 'suggest']):
        return {
            "type": "text",
            "text": "I can help you create a budget! First, let me know your monthly income and I'll suggest an optimized budget based on the 50/30/20 rule."
        }

    # Help/default
    else:
        return {
            "type": "text",
            "text": "I can help you with spending analysis, trend reports, budget planning, and custom financial dashboards. Try asking about your spending or trends!"
        }