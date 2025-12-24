#!/usr/bin/env python3
"""
Test the running orders API to see current data structure
"""
import requests
import json

def test_running_orders_api():
    print("🧪 Testing Running Orders API...")
    
    # Login as restaurant user
    login_data = {
        "email": "restaurant@gmail.com",
        "password": "pass1234"
    }
    
    try:
        # Login
        login_response = requests.post('http://127.0.0.1:8000/api/v1/auth/login/', json=login_data)
        print(f"Login status: {login_response.status_code}")
        
        if login_response.status_code == 200:
            token = login_response.json()['access']
            headers = {'Authorization': f'Bearer {token}'}
            
            # Test restaurant orders endpoint
            print("\n📦 Testing Restaurant Orders API:")
            orders_response = requests.get('http://127.0.0.1:8000/api/v1/restaurant/orders/', headers=headers)
            print(f"Orders API status: {orders_response.status_code}")
            
            if orders_response.status_code == 200:
                orders_data = orders_response.json()
                
                # Check if it's paginated or direct list
                if isinstance(orders_data, dict) and 'results' in orders_data:
                    orders = orders_data['results']
                    print(f"  Orders (paginated): {len(orders)} orders")
                elif isinstance(orders_data, list):
                    orders = orders_data
                    print(f"  Orders (direct): {len(orders)} orders")
                else:
                    print(f"  Unexpected orders format: {type(orders_data)}")
                    orders = []
                
                # Filter running orders
                running_orders = [order for order in orders if order.get('status') in ['pending', 'preparing', 'ready_for_pickup']]
                print(f"  Running orders: {len(running_orders)}")
                
                # Show sample running order data
                if running_orders:
                    sample_order = running_orders[0]
                    print(f"\n📋 Sample Running Order Data:")
                    print(f"  Order ID: {sample_order.get('id')}")
                    print(f"  Status: {sample_order.get('status')}")
                    print(f"  Total: ৳{sample_order.get('total')}")
                    print(f"  Customer: {sample_order.get('user', {}).get('first_name', 'Unknown')}")
                    print(f"  Items: {len(sample_order.get('items', []))} items")
                    print(f"  Created: {sample_order.get('created_at')}")
                    print(f"  Payment method: {sample_order.get('payment_method')}")
                    
                    # Check items structure
                    items = sample_order.get('items', [])
                    if items:
                        print(f"  First item: {items[0]}")
                    
                    # Check address info
                    address = sample_order.get('address')
                    delivery_location = sample_order.get('delivery_location')
                    print(f"  Address: {address}")
                    print(f"  Delivery location: {delivery_location}")
                    
                else:
                    print("  No running orders found")
                    
                # Test with status filter
                print(f"\n🔍 Testing with status filter (active orders):")
                active_orders_response = requests.get('http://127.0.0.1:8000/api/v1/restaurant/orders/?status=active', headers=headers)
                print(f"Active orders API status: {active_orders_response.status_code}")
                
                if active_orders_response.status_code == 200:
                    active_orders = active_orders_response.json()
                    if isinstance(active_orders, list):
                        print(f"  Active orders: {len(active_orders)} orders")
                    else:
                        print(f"  Active orders response: {type(active_orders)}")
                        
            else:
                print(f"  Orders API error: {orders_response.text}")
                
        else:
            print(f"Login failed: {login_response.text}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_running_orders_api()