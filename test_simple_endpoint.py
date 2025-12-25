#!/usr/bin/env python3
"""
Test simple endpoint to verify basic API functionality
"""
import requests

def test_simple_endpoint():
    print("🧪 Testing simple endpoint...")
    
    # Login first
    login_data = {"email": "test@restaurant.com", "password": "test123"}
    
    try:
        login_response = requests.post('http://127.0.0.1:8000/api/v1/auth/login/', json=login_data)
        if login_response.status_code != 200:
            print(f"❌ Login failed: {login_response.text}")
            return
        
        access_token = login_response.json()['access']
        headers = {'Authorization': f'Bearer {access_token}'}
        
        # Test simple endpoint
        test_response = requests.get('http://127.0.0.1:8000/api/v1/test/', headers=headers)
        print(f"Test endpoint status: {test_response.status_code}")
        
        if test_response.status_code == 200:
            print(f"✅ Test endpoint works: {test_response.json()}")
        else:
            print(f"❌ Test endpoint failed: {test_response.text}")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_simple_endpoint()