#!/usr/bin/env python3
"""
Test Restaurant API endpoints to debug the AddNewItems issues
"""
import requests
import json

def test_restaurant_api():
    print("🧪 Testing Restaurant API Endpoints...")
    
    # First, let's try to login as a restaurant user
    login_data = {
        "email": "test@restaurant.com",  # This is our test restaurant user
        "password": "test123"
    }
    
    try:
        # Login
        print("1. Testing login...")
        login_response = requests.post('http://127.0.0.1:8000/api/v1/auth/login/', json=login_data)
        print(f"Login status: {login_response.status_code}")
        
        if login_response.status_code == 200:
            login_result = login_response.json()
            token = login_result['access']
            user_info = login_result.get('user', {})
            print(f"User role: {user_info.get('role', 'Unknown')}")
            print(f"User ID: {user_info.get('id', 'Unknown')}")
            
            headers = {'Authorization': f'Bearer {token}'}
            
            # Test categories endpoint
            print("\n2. Testing categories endpoint...")
            try:
                categories_response = requests.get(
                    'http://127.0.0.1:8000/api/v1/restaurant/menu/categories/', 
                    headers=headers
                )
                print(f"Categories status: {categories_response.status_code}")
                
                if categories_response.status_code == 200:
                    categories = categories_response.json()
                    print(f"Categories found: {len(categories)}")
                    for cat in categories[:3]:  # Show first 3
                        print(f"  - {cat.get('name', 'Unknown')}")
                else:
                    print(f"Categories error: {categories_response.text[:500]}")
                    
            except Exception as e:
                print(f"Categories request failed: {e}")
            
            # Test menu items endpoint (GET)
            print("\n3. Testing menu items endpoint (GET)...")
            items_response = requests.get(
                'http://127.0.0.1:8000/api/v1/restaurant/menu/items/', 
                headers=headers
            )
            print(f"Menu items status: {items_response.status_code}")
            
            if items_response.status_code == 200:
                items = items_response.json()
                print(f"Menu items found: {len(items)}")
            else:
                print(f"Menu items error: {items_response.text}")
            
            # Test creating a menu item (POST)
            print("\n4. Testing menu item creation (POST)...")
            
            # Create FormData like the frontend does
            files = {}
            data = {
                "name": "Test Food Item API",
                "description": "A test food item for debugging API",
                "price": 150.00,
                "category_name": "Test Category",
                "is_veg": True,
                "stock_quantity": 50,
                "is_available": True
            }
            
            create_response = requests.post(
                'http://127.0.0.1:8000/api/v1/restaurant/menu/items/', 
                data=data,  # Use data instead of json for multipart
                files=files,  # Empty files dict for multipart
                headers=headers
            )
            print(f"Create item status: {create_response.status_code}")
            
            if create_response.status_code == 201:
                print("✅ Item created successfully!")
                created_item = create_response.json()
                print(f"Created item ID: {created_item.get('id')}")
                print(f"Created item name: {created_item.get('name')}")
            else:
                print(f"❌ Create item error: {create_response.text}")
                try:
                    error_data = create_response.json()
                    print(f"Error details: {error_data}")
                except:
                    pass
                
        else:
            print(f"❌ Login failed: {login_response.text}")
            
    except Exception as e:
        print(f"❌ Test Error: {e}")

def check_user_roles():
    """Check what users exist and their roles"""
    print("\n🔍 Checking user roles in database...")
    
    try:
        # Try to get profile info for different users
        test_emails = ["skmoin@gmail.com", "admin@example.com", "restaurant@example.com"]
        
        for email in test_emails:
            login_data = {"email": email, "password": "password123"}
            
            try:
                response = requests.post('http://127.0.0.1:8000/api/v1/auth/login/', json=login_data)
                if response.status_code == 200:
                    user_info = response.json().get('user', {})
                    print(f"✅ {email}: Role = {user_info.get('role', 'Unknown')}")
                else:
                    print(f"❌ {email}: Login failed")
            except:
                print(f"❌ {email}: Connection error")
                
    except Exception as e:
        print(f"Error checking users: {e}")

if __name__ == "__main__":
    test_restaurant_api()
    check_user_roles()