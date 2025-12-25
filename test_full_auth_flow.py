#!/usr/bin/env python3
"""
Test the full authentication flow like the frontend does
"""
import requests
import json

def test_full_auth_flow():
    print("🔐 Testing full authentication flow...")
    
    # Step 1: Login like the frontend does
    login_data = {
        "email": "test@restaurant.com",
        "password": "test123"
    }
    
    try:
        print("1. Testing login...")
        login_response = requests.post('http://127.0.0.1:8000/api/v1/auth/login/', json=login_data)
        print(f"Login status: {login_response.status_code}")
        
        if login_response.status_code != 200:
            print(f"❌ Login failed: {login_response.text}")
            return
        
        login_result = login_response.json()
        access_token = login_result['access']
        refresh_token = login_result['refresh']
        user_info = login_result['user']
        
        print(f"✅ Login successful!")
        print(f"User: {user_info['email']} (Role: {user_info['role']})")
        print(f"Access token: {access_token[:20]}...")
        
        # Step 0: Test simple endpoint
        print("\n0. Testing simple test endpoint...")
        test_response = requests.get(
            'http://127.0.0.1:8000/api/v1/test/', 
            headers=headers
        )
        print(f"Test endpoint status: {test_response.status_code}")
        if test_response.status_code == 200:
            print(f"✅ Test endpoint works: {test_response.json()}")
        else:
            print(f"❌ Test endpoint failed: {test_response.text[:200]}")
        
        # Step 2: Test categories with proper auth header
        print("\n2. Testing categories with proper auth...")
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }
        
        categories_response = requests.get(
            'http://127.0.0.1:8000/api/v1/restaurant/menu/categories/', 
            headers=headers
        )
        print(f"Categories status: {categories_response.status_code}")
        
        if categories_response.status_code == 200:
            categories = categories_response.json()
            print(f"✅ Categories loaded: {len(categories)} found")
            for cat in categories[:3]:
                print(f"  - {cat.get('name', 'Unknown')}")
        else:
            print(f"❌ Categories failed: {categories_response.text[:200]}")
        
        # Step 3: Test menu item creation with proper auth
        print("\n3. Testing menu item creation with proper auth...")
        
        # Use multipart form data like the frontend
        data = {
            "name": "Test Food Auth Flow",
            "description": "Testing with proper auth flow",
            "price": "199.99",
            "category_name": "Test Auth Category",
            "is_veg": "true",
            "stock_quantity": "25",
            "is_available": "true"
        }
        
        # Remove Content-Type header for multipart data
        auth_headers = {'Authorization': f'Bearer {access_token}'}
        
        create_response = requests.post(
            'http://127.0.0.1:8000/api/v1/restaurant/menu/items/', 
            data=data,
            headers=auth_headers
        )
        print(f"Create item status: {create_response.status_code}")
        
        if create_response.status_code == 201:
            print("✅ Item created successfully!")
            created_item = create_response.json()
            print(f"Created: {created_item.get('name')} (ID: {created_item.get('id')})")
        else:
            print(f"❌ Create failed: {create_response.text}")
            try:
                error_data = create_response.json()
                print(f"Error details: {error_data}")
            except:
                pass
        
    except Exception as e:
        print(f"❌ Test failed: {e}")

if __name__ == "__main__":
    test_full_auth_flow()