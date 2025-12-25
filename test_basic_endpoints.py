#!/usr/bin/env python3
"""
Test basic endpoints to see what's working
"""
import requests

def test_basic_endpoints():
    print("🧪 Testing basic endpoints...")
    
    # Test 1: Root API endpoint
    try:
        root_response = requests.get('http://127.0.0.1:8000/api/v1/')
        print(f"Root API status: {root_response.status_code}")
    except Exception as e:
        print(f"Root API error: {e}")
    
    # Test 2: Login endpoint (known to work)
    try:
        login_response = requests.post('http://127.0.0.1:8000/api/v1/auth/login/', 
                                     json={"email": "test@restaurant.com", "password": "test123"})
        print(f"Login status: {login_response.status_code}")
        if login_response.status_code == 200:
            print("✅ Login works")
            token = login_response.json()['access']
            
            # Test 3: Categories endpoint
            headers = {'Authorization': f'Bearer {token}'}
            cat_response = requests.get('http://127.0.0.1:8000/api/v1/restaurant/menu/categories/', 
                                      headers=headers)
            print(f"Categories status: {cat_response.status_code}")
            
            # Test 4: Menu items endpoint  
            items_response = requests.get('http://127.0.0.1:8000/api/v1/restaurant/menu/items/', 
                                        headers=headers)
            print(f"Menu items status: {items_response.status_code}")
            
        else:
            print(f"❌ Login failed: {login_response.text}")
    except Exception as e:
        print(f"Login error: {e}")

if __name__ == "__main__":
    test_basic_endpoints()