"""
Budget Optimizer Model
Optimizes user's budget based on spending patterns and goals
"""


def optimize_budget(current_spending, income, goals=None):
    """
    Optimize budget allocation

    Args:
        current_spending: Dict of current spending by category
        income: Monthly income
        goals: List of financial goals

    Returns:
        Optimized budget recommendations
    """

    if not current_spending or not income:
        return {
            'success': False,
            'message': 'Insufficient data for optimization'
        }

    # Standard budget percentages (50/30/20 rule)
    recommended_percentages = {
        'Needs': 0.50,  # Rent, utilities, groceries
        'Wants': 0.30,  # Entertainment, dining out
        'Savings': 0.20  # Emergency fund, investments
    }

    # Calculate recommended amounts
    recommended_budget = {
        'Needs': income * 0.50,
        'Wants': income * 0.30,
        'Savings': income * 0.20
    }

    # Analyze current vs recommended
    total_spending = sum(current_spending.values())
    savings_potential = income - total_spending

    recommendations = []

    # Generate specific recommendations
    for category, amount in current_spending.items():
        percentage = (amount / income) * 100

        if category in ['Dining', 'Entertainment'] and percentage > 15:
            potential_saving = amount * 0.20
            recommendations.append({
                'category': category,
                'current': round(amount, 2),
                'suggested': round(amount * 0.80, 2),
                'saving': round(potential_saving, 2),
                'reason': f'Reduce {category} spending by 20%'
            })

    return {
        'success': True,
        'current_total': round(total_spending, 2),
        'income': income,
        'recommended_budget': {
            k: round(v, 2)
            for k, v in recommended_budget.items()
        },
        'savings_potential': round(savings_potential, 2),
        'recommendations': recommendations,
        'budget_health': 'Good' if savings_potential > 0 else 'Needs Improvement'
    }


def suggest_savings_plan(income, current_savings, goal_amount, timeframe_months):
    """
    Suggest a savings plan to reach a financial goal

    Args:
        income: Monthly income
        current_savings: Current savings amount
        goal_amount: Target savings goal
        timeframe_months: Number of months to reach goal

    Returns:
        Savings plan with monthly targets
    """

    remaining = goal_amount - current_savings
    monthly_target = remaining / timeframe_months if timeframe_months > 0 else 0

    # Check if goal is achievable
    max_saveable = income * 0.30  # Assume max 30% can be saved
    achievable = monthly_target <= max_saveable

    return {
        'goal_amount': goal_amount,
        'current_savings': current_savings,
        'remaining': round(remaining, 2),
        'monthly_target': round(monthly_target, 2),
        'timeframe_months': timeframe_months,
        'achievable': achievable,
        'recommended_monthly': round(min(monthly_target, max_saveable), 2),
        'message': 'Goal is achievable!' if achievable else 'Consider extending timeframe or reducing goal'
    }