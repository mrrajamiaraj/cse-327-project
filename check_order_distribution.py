#!/usr/bin/env python3
"""
Check order distribution to understand revenue inconsistency
"""
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from core.models import Order
from datetime import datetime, timedelta
from collections import defaultdict

def check_order_distribution():
    print("📊 Checking Order Distribution...")
    
    # Get all delivered orders for KFC
    orders = Order.objects.filter(restaurant_id=1, status='delivered').order_by('created_at')
    print(f'Total delivered orders: {orders.count()}')
    
    # Group by date
    date_counts = defaultdict(lambda: {'count': 0, 'revenue': 0})
    for order in orders:
        date_str = order.created_at.strftime('%Y-%m-%d')
        date_counts[date_str]['count'] += 1
        date_counts[date_str]['revenue'] += float(order.total)
    
    # Show last 10 days
    print('\nLast 10 days order distribution:')
    sorted_dates = sorted(date_counts.keys())[-10:]
    for date in sorted_dates:
        data = date_counts[date]
        print(f'  {date}: {data["count"]} orders, ৳{data["revenue"]:.2f} revenue')
    
    # Show today specifically
    today = datetime.now().strftime('%Y-%m-%d')
    if today in date_counts:
        today_data = date_counts[today]
        print(f'\nToday ({today}): {today_data["count"]} orders, ৳{today_data["revenue"]:.2f}')
    else:
        print(f'\nNo orders today ({today})')
    
    # Check if most orders are on one day
    max_revenue_date = max(date_counts.keys(), key=lambda d: date_counts[d]['revenue'])
    max_data = date_counts[max_revenue_date]
    total_revenue = sum(data['revenue'] for data in date_counts.values())
    
    print(f'\nHighest revenue day: {max_revenue_date}')
    print(f'  Orders: {max_data["count"]}')
    print(f'  Revenue: ৳{max_data["revenue"]:.2f}')
    print(f'  Percentage of total: {(max_data["revenue"] / total_revenue * 100):.1f}%')
    
    # Show weekly distribution
    print(f'\nWeekly distribution (last 4 weeks):')
    current_date = datetime.now()
    for i in range(4):
        week_start = current_date - timedelta(days=7 * (i + 1))
        week_end = current_date - timedelta(days=7 * i)
        
        week_orders = orders.filter(
            created_at__date__gte=week_start.date(),
            created_at__date__lt=week_end.date()
        )
        week_revenue = sum(float(order.total) for order in week_orders)
        
        print(f'  Week {4-i} ({week_start.strftime("%m/%d")} - {week_end.strftime("%m/%d")}): {week_orders.count()} orders, ৳{week_revenue:.2f}')

if __name__ == "__main__":
    check_order_distribution()