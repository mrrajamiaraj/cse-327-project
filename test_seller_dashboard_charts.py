#!/usr/bin/env python3
"""
Test seller dashboard charts with proper period logic
"""
import requests
import json

def test_seller_dashboard_charts():
    print("📊 Testing Seller Dashboard Charts...")
    
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
            
            # Test all three chart periods
            periods = ['daily', 'monthly', 'yearly']
            
            for period in periods:
                print(f"\n📈 Testing {period.upper()} Chart:")
                
                analytics_response = requests.get(
                    f'http://127.0.0.1:8000/api/v1/restaurant/analytics/?period={period}', 
                    headers=headers
                )
                
                if analytics_response.status_code == 200:
                    analytics = analytics_response.json()
                    chart_data = analytics.get('chart_data', {})
                    
                    print(f"  Period: {chart_data.get('period', 'Unknown')}")
                    print(f"  Total Revenue: ৳{chart_data.get('total_revenue', 0)}")
                    print(f"  Description: {chart_data.get('description', 'N/A')}")
                    
                    labels = chart_data.get('labels', [])
                    values = chart_data.get('values', [])
                    
                    print(f"  Data Points: {len(labels)}")
                    print(f"  Labels: {labels[:5]}{'...' if len(labels) > 5 else ''}")
                    print(f"  Sample Values: {[f'৳{v}' for v in values[:5]]}{'...' if len(values) > 5 else ''}")
                    print(f"  Max Value: ৳{chart_data.get('max_value', 0)}")
                    
                    # Verify period-specific logic
                    if period == 'daily':
                        expected_labels = 24  # 24 hours
                        print(f"  ✅ Expected 24 hours: {'✅' if len(labels) == expected_labels else '❌'} Got {len(labels)}")
                        
                    elif period == 'monthly':
                        # Should be days of current month (up to today)
                        from datetime import datetime
                        today = datetime.now().day
                        print(f"  ✅ Expected ≤{today} days: {'✅' if len(labels) <= today else '❌'} Got {len(labels)}")
                        print(f"  ✅ Labels are days: {'✅' if all(l.isdigit() for l in labels[:3]) else '❌'}")
                        
                    elif period == 'yearly':
                        expected_labels = 12  # 12 months
                        print(f"  ✅ Expected 12 months: {'✅' if len(labels) == expected_labels else '❌'} Got {len(labels)}")
                        print(f"  ✅ Labels are months: {'✅' if 'Jan' in labels or 'Feb' in labels else '❌'}")
                    
                    # Check for non-zero data
                    non_zero_values = [v for v in values if v > 0]
                    print(f"  ✅ Has real data: {'✅' if len(non_zero_values) > 0 else '❌'} {len(non_zero_values)} non-zero points")
                    
                else:
                    print(f"  ❌ API Error: {analytics_response.status_code}")
                    print(f"     {analytics_response.text}")
            
            # Compare the three periods
            print(f"\n🔍 Period Comparison:")
            print(f"Expected behavior:")
            print(f"  📅 Daily: 24 hourly data points for TODAY")
            print(f"  📅 Monthly: Daily data points for CURRENT MONTH")
            print(f"  📅 Yearly: 12 monthly data points for CURRENT YEAR")
            
        else:
            print(f"Login failed: {login_response.text}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_seller_dashboard_charts()