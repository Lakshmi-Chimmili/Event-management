from app.models.expense import EXPENSE_CATEGORIES

def calculate_event_budget(event):
    """
    Automatically calculate:
    - Total Estimated Cost
    - Total Actual Cost
    - Remaining Budget
    - Budget Usage Percentage
    - Category distribution
    """
    total_budget = float(event.total_budget) if event.total_budget else 0.0
    total_estimated = 0.0
    total_actual = 0.0
    
    category_summary = {cat: {'estimated': 0.0, 'actual': 0.0, 'count': 0} for cat in EXPENSE_CATEGORIES}
    
    for exp in event.expenses:
        est = float(exp.estimated_cost) if exp.estimated_cost else 0.0
        act = float(exp.actual_cost) if exp.actual_cost else 0.0
        total_estimated += est
        total_actual += act
        
        cat = exp.category if exp.category in category_summary else 'Other'
        category_summary[cat]['estimated'] += est
        category_summary[cat]['actual'] += act
        category_summary[cat]['count'] += 1

    remaining_budget = total_budget - total_actual
    usage_percentage = round((total_actual / total_budget * 100), 1) if total_budget > 0 else 0.0

    return {
        'total_budget': total_budget,
        'total_estimated_cost': round(total_estimated, 2),
        'total_actual_cost': round(total_actual, 2),
        'remaining_budget': round(remaining_budget, 2),
        'budget_usage_percentage': usage_percentage,
        'category_summary': category_summary
    }

def calculate_guest_summary(event):
    """
    Calculate guest attendance and RSVP stats
    """
    accepted = sum(g.number_of_guests for g in event.guests if g.rsvp_status == 'Accepted')
    declined = sum(g.number_of_guests for g in event.guests if g.rsvp_status == 'Declined')
    pending = sum(g.number_of_guests for g in event.guests if g.rsvp_status == 'Pending')
    total_headcount = accepted + declined + pending

    return {
        'total_invitations': len(event.guests),
        'total_headcount': total_headcount,
        'accepted_headcount': accepted,
        'declined_headcount': declined,
        'pending_headcount': pending,
        'accepted_percentage': round((accepted / total_headcount * 100), 1) if total_headcount > 0 else 0.0
    }
