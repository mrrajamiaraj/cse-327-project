#!/usr/bin/env python3
"""
Test menu item creation with simplified approach
"""
import requests

def test_menu_creation():
    print("🧪 Testing menu item creation...")
    
    # Login
    login_response = requests.post('http://127.0.0.1:8000/api/v1/auth/login/', 
                                 json={"email": "test@restaurant.com", "password": "test123"})
    
    if login_response.status_code != 200:
        print(f"❌ Login failed")
        return
    
    token = login_response.json()['access']
    headers = {'Authorization': f'Bearer {token}'}
    
    # Test menu item creation
    data = {
        "name": "Simple Test Food",
        "description": "Simple test description", 
        "price": "99.99",
        "is_veg": "true",
        "stock_quantity": "10",
        "is_available": "true"
    }
    
    create_response = requests.post('http://127.0.0.1:8000/api/v1/restaurant/menu/items/', 
                                  data=data, headers=headers)
    
    print(f"Create status: {create_response.status_code}")
    
    if create_response.status_code == 201:
        print("✅ Menu item created successfully!")
        item = create_response.json()
        print(f"Created: {item.get('name')} (ID: {item.get('id')})")
    else:
        print(f"❌ Creation failed: {create_response.text}")

if __name__ == "__main__":
    test_menu_creation()