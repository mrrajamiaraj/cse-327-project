#!/usr/bin/env python3
"""
Test the enhanced Total Revenue API with real database data
"""
import requests
import json

def test_total_revenue_api():
    print("💰 Testing Enhanced Total Revenue API...")
    
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
            
            # Test enhanced earnings endpoint
            print("\n💰 Testing Enhanced Earnings API:")
            earnings_response = requests.get('http://127.0.0.1:8000/api/v1/restaurant/earnings/', headers=headers)
            print(f"Earnings API status: {earnings_response.status_code}")
            
            if earnings_response.status_code == 200:
                earnings = earnings_response.json()
                
                print(f"\n📊 Basic Earnings Data:")
                print(f"  Total Earnings: ৳{earnings.get('total_earnings', 0)}")
                print(f"  Available Balance: ৳{earnings.get('available_balance', 0)}")
                print(f"  Total Withdrawn: ৳{earnings.get('total_withdrawn', 0)}")
                print(f"  Commission Rate: {earnings.get('commission_rate', 0)}%")
                print(f"  Restaurant: {earnings.get('restaurant_name', 'Unknown')}")
                
                print(f"\n📈 Daily Revenue:")
                daily = earnings.get('daily_revenue', {})
                print(f"  Gross: ৳{daily.get('gross', 0)}")
                print(f"  Commission: ৳{daily.get('commission', 0)}")
                print(f"  Net: ৳{daily.get('net', 0)}")
                
                print(f"\n📊 Total Statistics:")
                stats = earnings.get('total_statistics', {})
                print(f"  Total Orders: {stats.get('total_orders', 0)}")
                print(f"  Total Gross Revenue: ৳{stats.get('total_gross_revenue', 0)}")
                print(f"  Total Commission: ৳{stats.get('total_commission', 0)}")
                print(f"  Average Order Value: ৳{stats.get('average_order_value', 0)}")
                
                print(f"\n📅 Monthly Data (Last 6 months):")
                monthly_data = earnings.get('monthly_data', [])
                for month in monthly_data:
                    print(f"  {month.get('month')}: ৳{month.get('net_revenue', 0)} net ({month.get('orders_count', 0)} orders)")
                
                print(f"\n📅 Weekly Data (Last 4 weeks):")
                weekly_data = earnings.get('weekly_data', [])
                for week in weekly_data:
                    print(f"  {week.get('week')}: ৳{week.get('net_revenue', 0)} net ({week.get('orders_count', 0)} orders)")
                
                # Show sample of full structure
                print(f"\n🔍 Sample Data Structure:")
                if monthly_data:
                    print(f"  Monthly sample: {json.dumps(monthly_data[0], indent=2)}")
                    
            else:
                print(f"  Earnings API error: {earnings_response.text}")
                
        else:
            print(f"Login failed: {login_response.text}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_total_revenue_api()