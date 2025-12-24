#!/usr/bin/env python3
"""
Verify revenue calculations step by step
"""
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from core.models import Order
from datetime import datetime, timedelta
import requests

def verify_revenue_calculations():
    print("🔍 Verifying Revenue Calculations...")
    
    # Manual calculation
    print("\n📊 Manual Database Calculation:")
    orders = Order.objects.filter(restaurant_id=1, status='delivered')
    
    # Today's calculation
    today = datetime.now().date()
    today_orders = orders.filter(created_at__date=today)
    today_revenue = sum(float(order.total) for order in today_orders)
    today_commission = today_revenue * 0.15
    today_net = today_revenue - today_commission
    
    print(f"Today ({today}):")
    print(f"  Orders: {today_orders.count()}")
    print(f"  Gross Revenue: ৳{today_revenue:.2f}")
    print(f"  Commission (15%): ৳{today_commission:.2f}")
    print(f"  Net Revenue: ৳{today_net:.2f}")
    
    # Current week calculation (Monday to today)
    current_date = datetime.now()
    days_since_monday = current_date.weekday()
    week_start = current_date - timedelta(days=days_since_monday)
    week_start_date = week_start.date()
    
    current_week_orders = orders.filter(
        created_at__date__gte=week_start_date,
        created_at__date__lte=today
    )
    current_week_revenue = sum(float(order.total) for order in current_week_orders)
    current_week_commission = current_week_revenue * 0.15
    current_week_net = current_week_revenue - current_week_commission
    
    print(f"\nCurrent Week ({week_start_date} to {today}):")
    print(f"  Orders: {current_week_orders.count()}")
    print(f"  Gross Revenue: ৳{current_week_revenue:.2f}")
    print(f"  Commission (15%): ৳{current_week_commission:.2f}")
    print(f"  Net Revenue: ৳{current_week_net:.2f}")
    
    # API calculation
    print("\n🌐 API Calculation:")
    login_data = {"email": "restaurant@gmail.com", "password": "pass1234"}
    login_response = requests.post('http://127.0.0.1:8000/api/v1/auth/login/', json=login_data)
    
    if login_response.status_code == 200:
        token = login_response.json()['access']
        headers = {'Authorization': f'Bearer {token}'}
        
        earnings_response = requests.get('http://127.0.0.1:8000/api/v1/restaurant/earnings/', headers=headers)
        if earnings_response.status_code == 200:
            earnings = earnings_response.json()
            
            daily = earnings.get('daily_revenue', {})
            print(f"API Today:")
            print(f"  Gross Revenue: ৳{daily.get('gross', 0)}")
            print(f"  Commission: ৳{daily.get('commission', 0)}")
            print(f"  Net Revenue: ৳{daily.get('net', 0)}")
            
            weekly_data = earnings.get('weekly_data', [])
            if weekly_data:
                current_week_api = weekly_data[-1]  # Last week should be current
                print(f"\nAPI Current Week ({current_week_api.get('week')}):")
                print(f"  Orders: {current_week_api.get('orders_count', 0)}")
                print(f"  Gross Revenue: ৳{current_week_api.get('gross_revenue', 0)}")
                print(f"  Commission: ৳{current_week_api.get('commission', 0)}")
                print(f"  Net Revenue: ৳{current_week_api.get('net_revenue', 0)}")
                
                if 'week_period' in current_week_api:
                    print(f"  Period: {current_week_api['week_period']}")
    
    # Comparison
    print(f"\n🔍 Comparison:")
    print(f"Today - Manual vs API:")
    print(f"  Gross: ৳{today_revenue:.2f} vs ৳{daily.get('gross', 0) if 'daily' in locals() else 'N/A'}")
    print(f"  Net: ৳{today_net:.2f} vs ৳{daily.get('net', 0) if 'daily' in locals() else 'N/A'}")
    
    if 'current_week_api' in locals():
        print(f"\nCurrent Week - Manual vs API:")
        print(f"  Orders: {current_week_orders.count()} vs {current_week_api.get('orders_count', 0)}")
        print(f"  Gross: ৳{current_week_revenue:.2f} vs ৳{current_week_api.get('gross_revenue', 0)}")
        print(f"  Net: ৳{current_week_net:.2f} vs ৳{current_week_api.get('net_revenue', 0)}")

if __name__ == "__main__":
    verify_revenue_calculations()