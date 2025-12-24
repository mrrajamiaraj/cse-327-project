#!/usr/bin/env python3
"""
Compare graphs between seller dashboard and total revenue page
"""
import requests
import json

def compare_dashboard_graphs():
    print("📊 Comparing Dashboard Graphs...")
    
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
            
            print("\n🏪 SELLER DASHBOARD DATA:")
            print("=" * 50)
            
            # Test seller dashboard analytics for all periods
            for period in ['daily', 'monthly', 'yearly']:
                analytics_response = requests.get(
                    f'http://127.0.0.1:8000/api/v1/restaurant/analytics/?period={period}', 
                    headers=headers
                )
                
                if analytics_response.status_code == 200:
                    analytics = analytics_response.json()
                    chart_data = analytics.get('chart_data', {})
                    
                    print(f"\n📈 {period.upper()} Chart (Seller Dashboard):")
                    print(f"  Total Revenue: ৳{chart_data.get('total_revenue', 0):,.2f}")
                    print(f"  Data Points: {len(chart_data.get('labels', []))}")
                    print(f"  Max Value: ৳{chart_data.get('max_value', 0):,.2f}")
                    
                    values = chart_data.get('values', [])
                    non_zero_values = [v for v in values if v > 0]
                    print(f"  Non-zero Points: {len(non_zero_values)}")
                    if non_zero_values:
                        print(f"  Sample Values: {[f'৳{v:,.0f}' for v in non_zero_values[:3]]}")
                
            print("\n💰 TOTAL REVENUE PAGE DATA:")
            print("=" * 50)
            
            # Test total revenue page data
            earnings_response = requests.get('http://127.0.0.1:8000/api/v1/restaurant/earnings/', headers=headers)
            
            if earnings_response.status_code == 200:
                earnings = earnings_response.json()
                
                print(f"\n💵 Basic Revenue Data:")
                print(f"  Total Earnings: ৳{earnings.get('total_earnings', 0):,.2f}")
                print(f"  Daily Revenue: ৳{earnings.get('daily_revenue', {}).get('net', 0):,.2f}")
                
                # Monthly data from total revenue page
                monthly_data = earnings.get('monthly_data', [])
                print(f"\n📅 Monthly Data (Total Revenue Page):")
                print(f"  Data Points: {len(monthly_data)}")
                
                if monthly_data:
                    current_month = monthly_data[-1]  # Last month should be current
                    print(f"  Current Month ({current_month.get('month')}):")
                    print(f"    Net Revenue: ৳{current_month.get('net_revenue', 0):,.2f}")
                    print(f"    Orders: {current_month.get('orders_count', 0)}")
                
                # Weekly data from total revenue page
                weekly_data = earnings.get('weekly_data', [])
                print(f"\n📅 Weekly Data (Total Revenue Page):")
                print(f"  Data Points: {len(weekly_data)}")
                
                if weekly_data:
                    current_week = weekly_data[-1]  # Last week should be current
                    print(f"  Current Week ({current_week.get('week')}):")
                    print(f"    Net Revenue: ৳{current_week.get('net_revenue', 0):,.2f}")
                    print(f"    Orders: {current_week.get('orders_count', 0)}")
            
            print("\n🔍 CONSISTENCY CHECK:")
            print("=" * 50)
            
            # Compare the data sources
            if 'analytics' in locals() and 'earnings' in locals():
                # Get daily data from both sources
                dashboard_daily = None
                for period in ['daily']:
                    analytics_response = requests.get(
                        f'http://127.0.0.1:8000/api/v1/restaurant/analytics/?period={period}', 
                        headers=headers
                    )
                    if analytics_response.status_code == 200:
                        dashboard_daily = analytics_response.json().get('chart_data', {})
                        break
                
                earnings_daily = earnings.get('daily_revenue', {})
                
                if dashboard_daily and earnings_daily:
                    dashboard_total = dashboard_daily.get('total_revenue', 0)
                    earnings_total = earnings_daily.get('gross', 0)  # Use gross for comparison
                    
                    print(f"Daily Revenue Comparison:")
                    print(f"  Dashboard: ৳{dashboard_total:,.2f}")
                    print(f"  Total Revenue Page: ৳{earnings_total:,.2f}")
                    print(f"  Match: {'✅ Yes' if abs(dashboard_total - earnings_total) < 1 else '❌ No'}")
                
                # Compare monthly data
                dashboard_monthly = None
                for period in ['monthly']:
                    analytics_response = requests.get(
                        f'http://127.0.0.1:8000/api/v1/restaurant/analytics/?period={period}', 
                        headers=headers
                    )
                    if analytics_response.status_code == 200:
                        dashboard_monthly = analytics_response.json().get('chart_data', {})
                        break
                
                if dashboard_monthly and monthly_data:
                    dashboard_monthly_total = dashboard_monthly.get('total_revenue', 0)
                    earnings_monthly_total = monthly_data[-1].get('gross_revenue', 0) if monthly_data else 0
                    
                    print(f"\nMonthly Revenue Comparison:")
                    print(f"  Dashboard: ৳{dashboard_monthly_total:,.2f}")
                    print(f"  Total Revenue Page: ৳{earnings_monthly_total:,.2f}")
                    print(f"  Match: {'✅ Yes' if abs(dashboard_monthly_total - earnings_monthly_total) < 1 else '❌ No'}")
                
        else:
            print(f"Login failed: {login_response.text}")
            
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    compare_dashboard_graphs()