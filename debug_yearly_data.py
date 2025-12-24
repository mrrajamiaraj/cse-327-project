#!/usr/bin/env python3
"""
Debug yearly data in total revenue API
"""
import requests
import json

def debug_yearly_data():
    print("🔍 Debugging Yearly Data in Total Revenue API...")
    
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
                
                print("📊 Available data keys:")
                for key in data.keys():
                    print(f"  - {key}")
                
                print(f"\n📅 Daily Data: {len(data.get('daily_data', []))} items")
                if data.get('daily_data'):
                    print(f"  Sample: {data['daily_data'][0]}")
                
                print(f"\n📅 Weekly Data: {len(data.get('weekly_data', []))} items")
                if data.get('weekly_data'):
                    print(f"  Sample: {data['weekly_data'][0]}")
                
                print(f"\n📅 Monthly Data: {len(data.get('monthly_data', []))} items")
                if data.get('monthly_data'):
                    print(f"  Sample: {data['monthly_data'][0]}")
                
                print(f"\n📅 Yearly Data: {len(data.get('yearly_data', []))} items")
                if data.get('yearly_data'):
                    print(f"  Sample: {data['yearly_data'][0]}")
                else:
                    print("  ❌ No yearly data found!")
                
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
    debug_yearly_data()