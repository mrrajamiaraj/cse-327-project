#!/usr/bin/env python3
"""
Debug yearly data structure
"""
import requests
import json

def debug_yearly_structure():
    print("🔍 Debugging Yearly Data Structure...")
    
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
                print(f"📅 Yearly Data ({len(yearly_data)} items):")
                
                for i, item in enumerate(yearly_data):
                    print(f"\n  Item {i+1}:")
                    for key, value in item.items():
                        print(f"    {key}: {value}")
                
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
    debug_yearly_structure()