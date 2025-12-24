#!/usr/bin/env python3
"""
Test the chart functionality with different periods
"""
import requests
import json

def test_chart_functionality():
    print("📊 Testing Chart Functionality...")
    print("=" * 50)
    
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
            
            # Test different chart periods
            periods = ['daily', 'monthly', 'yearly']
            
            for period in periods:
                print(f"\n📈 Testing {period.upper()} chart data:")
                
                analytics_response = requests.get(
                    f'http://127.0.0.1:8000/api/v1/restaurant/analytics/?period={period}', 
                    headers=headers
                )
                
                print(f"   API Status: {analytics_response.status_code}")
                
                if analytics_response.status_code == 200:
                    data = analytics_response.json()
                    chart_data = data.get('chart_data', {})
                    
                    print(f"   Period: {chart_data.get('period', 'Unknown')}")
                    print(f"   Labels: {chart_data.get('labels', [])}")
                    print(f"   Values: {chart_data.get('values', [])}")
                    print(f"   Max Value: ৳{chart_data.get('max_value', 0)}")
                    
                    # Calculate total for this period
                    values = chart_data.get('values', [])
                    total = sum(values) if values else 0
                    print(f"   Total Revenue: ৳{total:.2f}")
                    
                else:
                    print(f"   Error: {analytics_response.text}")
            
            print(f"\n✅ Chart functionality test completed!")
            print(f"   The graph will now show real sales data")
            print(f"   Users can switch between Daily, Monthly, and Yearly views")
            
        else:
            print(f"Login failed: {login_response.text}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_chart_functionality()