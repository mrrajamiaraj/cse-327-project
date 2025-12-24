#!/usr/bin/env python3
"""
Debug chart data to see what's happening with date filtering
"""
import os
import django
from datetime import datetime, date

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from core.models import User, Restaurant, Order

def debug_chart_data():
    print("🔍 Debugging Chart Data...")
    print("=" * 50)
    
    try:
        # Get the main restaurant
        restaurant_user = User.objects.get(email='restaurant@gmail.com')
        restaurant = Restaurant.objects.get(owner=restaurant_user)
        
        # Get all orders
        all_orders = Order.objects.filter(restaurant=restaurant, status='delivered')
        print(f"Total orders: {all_orders.count()}")
        
        # Check today's orders
        today = date.today()
        print(f"Today's date: {today}")
        
        today_orders = all_orders.filter(created_at__date=today)
        print(f"Today's orders: {today_orders.count()}")
        
        # Show some sample orders with their dates
        print(f"\nSample orders:")
        for order in all_orders[:10]:
            print(f"  Order {order.id}: {order.created_at} (Date: {order.created_at.date()}) - ৳{order.total}")
        
        # Check hourly distribution for today
        print(f"\nHourly distribution for today ({today}):")
        for hour in range(24):
            hour_start = datetime.combine(today, datetime.min.time().replace(hour=hour))
            hour_end = hour_start.replace(hour=(hour + 1) % 24)
            if hour == 23:
                hour_end = hour_end.replace(day=hour_end.day + 1, hour=0)
            
            hour_orders = today_orders.filter(
                created_at__gte=hour_start,
                created_at__lt=hour_end
            )
            hour_revenue = sum(order.total for order in hour_orders)
            
            if hour_orders.count() > 0:
                print(f"  {hour:2d}:00 - {hour_orders.count()} orders, ৳{hour_revenue}")
        
        # Check if all orders are on the same date
        unique_dates = set(order.created_at.date() for order in all_orders)
        print(f"\nUnique dates in orders: {len(unique_dates)}")
        for date_obj in sorted(unique_dates):
            date_orders = all_orders.filter(created_at__date=date_obj)
            date_revenue = sum(order.total for order in date_orders)
            print(f"  {date_obj}: {date_orders.count()} orders, ৳{date_revenue}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    debug_chart_data()