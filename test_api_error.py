#!/usr/bin/env python3
"""
Test API to see the exact error
"""
import requests
import json

def test_api_error():
    print("🔍 Testing API Error...")
    
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
            
            # Test analytics API
            response = requests.get(
                'http://127.0.0.1:8000/api/v1/restaurant/analytics/?period=daily', 
                headers=headers
            )
            
            print(f"Status: {response.status_code}")
            print(f"Response: {response.text}")
            
        else:
            print(f"Login failed: {login_response.text}")
            
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_api_error()