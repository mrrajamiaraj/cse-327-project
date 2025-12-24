#!/usr/bin/env python3
"""
Test yearly chart data in frontend
"""
import requests
import json

def test_yearly_chart():
    print("🔍 Testing Yearly Chart Data...")
    
    # Login as restaurant user
    login_data = {
        "email": "restaurant@gmail.com",
        "password": "pass1234"
    }
    
    try:
        # Login
        login_response = requests.post('http://127.0.0.1:8000/api/v1/auth/login/', json=login_data)
        
        if login_response.status_code == 200:
            token = login_response.json()['access']
            headers = {'Authorization': f'Bearer {token}'}
            
            # Test total revenue API
            response = requests.get('http://127.0.0.1:8000/api/v1/restaurant/earnings/', headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                
                yearly_data = data.get('yearly_data', [])
                print(f"📅 Yearly Data for Chart ({len(yearly_data)} items):")
                
                for item in yearly_data:
                    year_label = item.get('year', 'Unknown')
                    net_revenue = item.get('net_revenue', 0)
                    orders_count = item.get('orders_count', 0)
                    
                    print(f"  {year_label}: ৳{net_revenue:,.0f} ({orders_count} orders)")
                
                # Test if data would show in chart
                if yearly_data:
                    max_value = max(item.get('net_revenue', 0) for item in yearly_data)
                    print(f"\n📊 Chart Info:")
                    print(f"  Max Value: ৳{max_value:,.0f}")
                    print(f"  All bars would be visible: {'✅ Yes' if max_value > 0 else '❌ No'}")
                else:
                    print("\n❌ No yearly data available for chart")
                
            else:
                print(f"❌ API Error: {response.status_code}")
                print(response.text)
                
        else:
            print(f"❌ Login failed: {login_response.text}")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_yearly_chart()