#!/usr/bin/env python3
"""
Test the enhanced running orders API with detailed serializer data
"""
import requests
import json

def test_enhanced_orders_api():
    print("🧪 Testing Enhanced Running Orders API...")
    
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
            
            # Test active orders with enhanced data
            print("\n📦 Testing Enhanced Active Orders API:")
            orders_response = requests.get('http://127.0.0.1:8000/api/v1/restaurant/orders/?status=active', headers=headers)
            print(f"Orders API status: {orders_response.status_code}")
            
            if orders_response.status_code == 200:
                orders = orders_response.json()
                print(f"  Active orders: {len(orders)} orders")
                
                if orders:
                    sample_order = orders[0]
                    print(f"\n📋 Enhanced Order Data:")
                    print(f"  Order ID: {sample_order.get('id')}")
                    print(f"  Status: {sample_order.get('status')}")
                    print(f"  Total: ৳{sample_order.get('total')}")
                    print(f"  Customer: {sample_order.get('user', {}).get('first_name', 'Unknown')}")
                    print(f"  Created: {sample_order.get('formatted_created_at')}")
                    print(f"  Time ago: {sample_order.get('time_ago')}")
                    print(f"  Payment method: {sample_order.get('payment_method')}")
                    print(f"  Delivery address: {sample_order.get('delivery_address_display')}")
                    
                    # Check enhanced items data
                    items_details = sample_order.get('items_details', [])
                    print(f"  Items details: {len(items_details)} items")
                    
                    if items_details:
                        first_item = items_details[0]
                        print(f"    First item: {first_item.get('food_name')} x{first_item.get('quantity')} = ৳{first_item.get('subtotal')}")
                    
                    # Show full structure for debugging
                    print(f"\n🔍 Full Order Structure (first order):")
                    print(json.dumps(sample_order, indent=2, default=str)[:1000] + "..." if len(str(sample_order)) > 1000 else json.dumps(sample_order, indent=2, default=str))
                    
                else:
                    print("  No active orders found")
                    
            else:
                print(f"  Orders API error: {orders_response.text}")
                
        else:
            print(f"Login failed: {login_response.text}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_enhanced_orders_api()