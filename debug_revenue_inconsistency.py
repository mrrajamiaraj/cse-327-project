#!/usr/bin/env python3
"""
Debug revenue inconsistency between dashboard and total revenue page
"""
import requests
import json
from datetime import datetime, timedelta

def debug_revenue_inconsistency():
    print("🔍 Debugging Revenue Inconsistency...")
    
    # Login as restaurant user
    login_data = {
        "email": "restaurant@gmail.com",
        "password": "pass1234"
    }
    
    try:
        # Login
        login_response = requests.post('http://127.0.0.1:8000/api/v1/auth/login/', json=login_data)
        print(f"Login status: {login_response.status_code}")
        
        if login_response.status_code == 200:
            token = login_response.json()['access']
            headers = {'Authorization': f'Bearer {token}'}
            
            # Get dashboard analytics
            print("\n📊 Dashboard Analytics:")
            analytics_response = requests.get('http://127.0.0.1:8000/api/v1/restaurant/analytics/', headers=headers)
            if analytics_response.status_code == 200:
                analytics = analytics_response.json()
                print(f"  Daily Revenue: ৳{analytics.get('daily_revenue', 0)}")
                print(f"  Total Orders: {analytics.get('total_orders', 0)}")
            
            # Get total revenue data
            print("\n💰 Total Revenue Data:")
            earnings_response = requests.get('http://127.0.0.1:8000/api/v1/restaurant/earnings/', headers=headers)
            if earnings_response.status_code == 200:
                earnings = earnings_response.json()
                
                daily = earnings.get('daily_revenue', {})
                print(f"  Today's Gross: ৳{daily.get('gross', 0)}")
                print(f"  Today's Net: ৳{daily.get('net', 0)}")
                
                print(f"\n📅 Weekly Data:")
                weekly_data = earnings.get('weekly_data', [])
                total_weekly = 0
                for week in weekly_data:
                    net_revenue = week.get('net_revenue', 0)
                    total_weekly += net_revenue
                    print(f"    {week.get('week')}: ৳{net_revenue} ({week.get('orders_count', 0)} orders)")
                
                print(f"  Total 4-week revenue: ৳{total_weekly}")
                print(f"  Average weekly: ৳{total_weekly/4 if total_weekly > 0 else 0}")
                print(f"  Expected weekly (daily × 7): ৳{daily.get('gross', 0) * 7}")
                
                print(f"\n📅 Monthly Data:")
                monthly_data = earnings.get('monthly_data', [])
                if monthly_data:
                    latest_month = monthly_data[-1]
                    print(f"    Latest month ({latest_month.get('month')}): ৳{latest_month.get('net_revenue', 0)} ({latest_month.get('orders_count', 0)} orders)")
                    
                    # Calculate expected monthly based on daily
                    days_in_month = 30  # approximate
                    expected_monthly = daily.get('gross', 0) * days_in_month * 0.85  # 85% after commission
                    print(f"    Expected monthly (daily × 30 × 0.85): ৳{expected_monthly}")
            
            print(f"\n🔍 Issue Analysis:")
            print(f"The problem seems to be:")
            print(f"1. Dashboard shows TODAY's revenue: ৳{analytics.get('daily_revenue', 0) if 'analytics' in locals() else 'N/A'}")
            print(f"2. But weekly data shows HISTORICAL weeks, not current week")
            print(f"3. Most orders might be concentrated on recent days")
            
        else:
            print(f"Login failed: {login_response.text}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    debug_revenue_inconsistency()