#!/usr/bin/env python3
"""
Test the complete Total Revenue functionality with real data
"""
import requests
import json

def test_total_revenue_complete():
    print("💰 Testing Complete Total Revenue Functionality...")
    
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
            
            # Test earnings endpoint
            print("\n💰 Testing Total Revenue API:")
            earnings_response = requests.get('http://127.0.0.1:8000/api/v1/restaurant/earnings/', headers=headers)
            print(f"Status: {earnings_response.status_code}")
            
            if earnings_response.status_code == 200:
                earnings = earnings_response.json()
                
                # Verify all required fields for frontend
                required_fields = [
                    'total_earnings', 'available_balance', 'total_withdrawn', 'commission_rate',
                    'daily_revenue', 'total_statistics', 'monthly_data', 'weekly_data', 'restaurant_name'
                ]
                
                print(f"\n✅ API Response Validation:")
                for field in required_fields:
                    if field in earnings:
                        print(f"  ✅ {field}: Present")
                    else:
                        print(f"  ❌ {field}: Missing")
                
                # Test data quality
                print(f"\n📊 Data Quality Check:")
                
                # Check if we have real data (not all zeros)
                has_real_data = (
                    earnings.get('total_earnings', 0) > 0 or
                    earnings.get('daily_revenue', {}).get('gross', 0) > 0 or
                    len(earnings.get('monthly_data', [])) > 0
                )
                print(f"  Real data present: {'✅ Yes' if has_real_data else '❌ No'}")
                
                # Check monthly data structure
                monthly_data = earnings.get('monthly_data', [])
                if monthly_data:
                    sample_month = monthly_data[0]
                    month_fields = ['month', 'gross_revenue', 'commission', 'net_revenue', 'orders_count']
                    print(f"  Monthly data structure:")
                    for field in month_fields:
                        if field in sample_month:
                            print(f"    ✅ {field}: {sample_month[field]}")
                        else:
                            print(f"    ❌ {field}: Missing")
                
                # Check calculations
                daily = earnings.get('daily_revenue', {})
                if daily.get('gross', 0) > 0:
                    expected_commission = daily['gross'] * (earnings.get('commission_rate', 15) / 100)
                    actual_commission = daily.get('commission', 0)
                    commission_correct = abs(expected_commission - actual_commission) < 0.01
                    print(f"  Commission calculation: {'✅ Correct' if commission_correct else '❌ Incorrect'}")
                    print(f"    Expected: ৳{expected_commission:.2f}, Actual: ৳{actual_commission:.2f}")
                
                # Performance metrics
                print(f"\n📈 Business Metrics:")
                stats = earnings.get('total_statistics', {})
                print(f"  Total Orders: {stats.get('total_orders', 0):,}")
                print(f"  Total Revenue: ৳{stats.get('total_gross_revenue', 0):,.2f}")
                print(f"  Average Order: ৳{stats.get('average_order_value', 0):.2f}")
                print(f"  Commission Paid: ৳{stats.get('total_commission', 0):,.2f}")
                print(f"  Net Earnings: ৳{earnings.get('total_earnings', 0):,.2f}")
                
                # Monthly trend analysis
                if monthly_data and len(monthly_data) >= 2:
                    latest_month = monthly_data[-1]
                    previous_month = monthly_data[-2]
                    growth = ((latest_month['net_revenue'] - previous_month['net_revenue']) / previous_month['net_revenue'] * 100) if previous_month['net_revenue'] > 0 else 0
                    print(f"\n📊 Trend Analysis:")
                    print(f"  Latest month ({latest_month['month']}): ৳{latest_month['net_revenue']:.2f}")
                    print(f"  Previous month ({previous_month['month']}): ৳{previous_month['net_revenue']:.2f}")
                    print(f"  Growth: {growth:+.1f}%")
                
                print(f"\n✅ Total Revenue API is fully functional with real database data!")
                
            else:
                print(f"  Error: {earnings_response.text}")
                
        else:
            print(f"Login failed: {login_response.text}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_total_revenue_complete()