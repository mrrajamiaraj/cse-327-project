#!/usr/bin/env python3
"""
Test the complete running orders functionality
"""
import requests
import json

def test_running_orders_complete():
    print("🧪 Testing Complete Running Orders Functionality...")
    
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
            
            # Test active orders endpoint
            print("\n📦 Testing Active Orders Endpoint:")
            orders_response = requests.get('http://127.0.0.1:8000/api/v1/restaurant/orders/?status=active', headers=headers)
            print(f"Status: {orders_response.status_code}")
            
            if orders_response.status_code == 200:
                orders = orders_response.json()
                print(f"Active orders: {len(orders)}")
                
                if orders:
                    # Test order actions
                    sample_order = orders[0]
                    order_id = sample_order['id']
                    current_status = sample_order['status']
                    
                    print(f"\n🔄 Testing Order Actions on Order #{order_id} (Status: {current_status}):")
                    
                    if current_status == 'pending':
                        # Test accept order
                        print("  Testing accept order...")
                        accept_response = requests.post(
                            f'http://127.0.0.1:8000/api/v1/restaurant/orders/{order_id}/accept/',
                            json={'prep_time_minutes': 25},
                            headers=headers
                        )
                        print(f"  Accept status: {accept_response.status_code}")
                        if accept_response.status_code == 200:
                            print(f"  New status: {accept_response.json().get('status')}")
                        
                        # Refresh orders to see change
                        orders_response = requests.get('http://127.0.0.1:8000/api/v1/restaurant/orders/?status=active', headers=headers)
                        if orders_response.status_code == 200:
                            updated_orders = orders_response.json()
                            updated_order = next((o for o in updated_orders if o['id'] == order_id), None)
                            if updated_order:
                                print(f"  Verified status: {updated_order['status']}")
                    
                    elif current_status == 'preparing':
                        # Test mark ready
                        print("  Testing mark ready...")
                        ready_response = requests.post(
                            f'http://127.0.0.1:8000/api/v1/restaurant/orders/{order_id}/ready/',
                            headers=headers
                        )
                        print(f"  Ready status: {ready_response.status_code}")
                        if ready_response.status_code == 200:
                            print(f"  New status: {ready_response.json().get('status')}")
                    
                    # Show enhanced order data
                    print(f"\n📋 Enhanced Order Data Structure:")
                    enhanced_order = sample_order
                    print(f"  Order ID: {enhanced_order.get('id')}")
                    print(f"  Status: {enhanced_order.get('status')}")
                    print(f"  Customer: {enhanced_order.get('user', {}).get('first_name')}")
                    print(f"  Phone: {enhanced_order.get('user', {}).get('phone')}")
                    print(f"  Items: {len(enhanced_order.get('items_details', []))}")
                    print(f"  Total: ৳{enhanced_order.get('total')}")
                    print(f"  Time: {enhanced_order.get('time_ago')}")
                    print(f"  Address: {enhanced_order.get('delivery_address_display')}")
                    
                    # Show items details
                    items = enhanced_order.get('items_details', [])
                    if items:
                        print(f"  Items breakdown:")
                        for i, item in enumerate(items[:3]):  # Show first 3 items
                            print(f"    {i+1}. {item.get('food_name')} x{item.get('quantity')} = ৳{item.get('subtotal')}")
                
                else:
                    print("  No active orders found")
                    
            else:
                print(f"  Error: {orders_response.text}")
                
        else:
            print(f"Login failed: {login_response.text}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_running_orders_complete()