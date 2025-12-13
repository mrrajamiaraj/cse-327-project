#!/usr/bin/env python3
"""
Test both customer and restaurant chat endpoints
"""
import requests
import json

def test_chat_endpoints():
    print("🧪 Testing Chat Endpoints for Both User Types...")
    
    # Test restaurant user
    print("\n🏪 Testing Restaurant User:")
    restaurant_login = {
        "email": "restaurant@gmail.com",
        "password": "restaurantchalai"
    }
    
    try:
        # Login as restaurant
        login_response = requests.post('http://127.0.0.1:8000/api/v1/auth/login/', json=restaurant_login)
        if login_response.status_code == 200:
            token = login_response.json()['access']
            headers = {'Authorization': f'Bearer {token}'}
            
            # Test restaurant order endpoint
            order_response = requests.get('http://127.0.0.1:8000/api/v1/restaurant/orders/11/', headers=headers)
            print(f"Restaurant order 11 API: {order_response.status_code}")
            
            if order_response.status_code == 200:
                order = order_response.json()
                print(f"  Order: #{order['id']} - {order['restaurant']['name']}")
                
                # Test restaurant chat endpoint
                chat_response = requests.get('http://127.0.0.1:8000/api/v1/restaurant/orders/11/chat/', headers=headers)
                print(f"Restaurant chat API: {chat_response.status_code}")
                
                if chat_response.status_code == 200:
                    messages = chat_response.json()
                    print(f"  Messages: {len(messages)}")
                    for msg in messages[:2]:  # Show first 2 messages
                        print(f"    {msg['sender']['email']}: {msg['message'][:50]}...")
                else:
                    print(f"  Chat error: {chat_response.text}")
            else:
                print(f"  Order error: {order_response.text}")
        else:
            print(f"Restaurant login failed: {login_response.text}")
    except Exception as e:
        print(f"Restaurant test error: {e}")
    
    # Test customer user
    print("\n👤 Testing Customer User:")
    customer_login = {
        "email": "customer@test.com",
        "password": "password123"
    }
    
    try:
        # Login as customer
        login_response = requests.post('http://127.0.0.1:8000/api/v1/auth/login/', json=customer_login)
        if login_response.status_code == 200:
            token = login_response.json()['access']
            headers = {'Authorization': f'Bearer {token}'}
            
            # Test customer order endpoint
            order_response = requests.get('http://127.0.0.1:8000/api/v1/customer/orders/11/', headers=headers)
            print(f"Customer order 11 API: {order_response.status_code}")
            
            if order_response.status_code == 200:
                order = order_response.json()
                print(f"  Order: #{order['id']} - {order['restaurant']['name']}")
                
                # Test customer chat endpoint
                chat_response = requests.get('http://127.0.0.1:8000/api/v1/customer/orders/11/chat/', headers=headers)
                print(f"Customer chat API: {chat_response.status_code}")
                
                if chat_response.status_code == 200:
                    messages = chat_response.json()
                    print(f"  Messages: {len(messages)}")
                    for msg in messages[:2]:  # Show first 2 messages
                        print(f"    {msg['sender']['email']}: {msg['message'][:50]}...")
                else:
                    print(f"  Chat error: {chat_response.text}")
            else:
                print(f"  Order error: {order_response.text}")
        else:
            print(f"Customer login failed: {login_response.text}")
    except Exception as e:
        print(f"Customer test error: {e}")

if __name__ == "__main__":
    test_chat_endpoints()