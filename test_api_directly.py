#!/usr/bin/env python3
"""
Test the API endpoints directly to see what the frontend should get
"""
import requests
import json

def test_restaurant_api():
    print("🧪 Testing Restaurant API Endpoints...")
    
    # First, login as restaurant user
    login_data = {
        "email": "restaurant@gmail.com",
        "password": "restaurantchalai"
    }
    
    try:
        # Login
        login_response = requests.post('http://127.0.0.1:8000/api/v1/auth/login/', json=login_data)
        print(f"Login status: {login_response.status_code}")
        
        if login_response.status_code == 200:
            token = login_response.json()['access']
            headers = {'Authorization': f'Bearer {token}'}
            
            # Test restaurant orders endpoint
            orders_response = requests.get('http://127.0.0.1:8000/api/v1/restaurant/orders/', headers=headers)
            print(f"Orders API status: {orders_response.status_code}")
            
            if orders_response.status_code == 200:
                orders = orders_response.json()
                print(f"Orders found: {len(orders)}")
                
                for order in orders[:3]:  # Test first 3 orders
                    print(f"\nOrder #{order['id']}:")
                    print(f"  Customer: {order['user']['email']}")
                    print(f"  Status: {order['status']}")
                    
                    # Test chat endpoint for this order
                    chat_response = requests.get(f'http://127.0.0.1:8000/api/v1/restaurant/orders/{order["id"]}/chat/', headers=headers)
                    print(f"  Chat API status: {chat_response.status_code}")
                    
                    if chat_response.status_code == 200:
                        messages = chat_response.json()
                        print(f"  Messages: {len(messages)}")
                        
                        for msg in messages:
                            print(f"    {msg['sender']['email']} ({msg['sender']['role']}): {msg['message'][:50]}...")
                    else:
                        print(f"  Chat API error: {chat_response.text}")
            else:
                print(f"Orders API error: {orders_response.text}")
        else:
            print(f"Login error: {login_response.text}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_restaurant_api()