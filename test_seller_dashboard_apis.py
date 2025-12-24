#!/usr/bin/env python3
"""
Test the seller dashboard API endpoints to debug data fetching issues
"""
import requests
import json

def test_seller_dashboard_apis():
    print("🧪 Testing Seller Dashboard API Endpoints...")
    
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
            
            # Test restaurant profile endpoint
            print("\n🏪 Testing Restaurant Profile API:")
            profile_response = requests.get('http://127.0.0.1:8000/api/v1/restaurant/profile/', headers=headers)
            print(f"Profile API status: {profile_response.status_code}")
            
            if profile_response.status_code == 200:
                profile = profile_response.json()
                print(f"  Restaurant: {profile.get('name', 'Unknown')}")
                print(f"  Address: {profile.get('address', 'No address')}")
            else:
                print(f"  Profile API error: {profile_response.text}")
            
            # Test restaurant analytics endpoint
            print("\n📊 Testing Restaurant Analytics API:")
            analytics_response = requests.get('http://127.0.0.1:8000/api/v1/restaurant/analytics/', headers=headers)
            print(f"Analytics API status: {analytics_response.status_code}")
            
            if analytics_response.status_code == 200:
                analytics = analytics_response.json()
                print(f"  Daily revenue: ৳{analytics.get('daily_revenue', 0)}")
                print(f"  Total orders: {analytics.get('total_orders', 0)}")
                print(f"  Running orders: {analytics.get('running_orders', 0)}")
                print(f"  Average rating: {analytics.get('average_rating', 0)}⭐")
                print(f"  Total reviews: {analytics.get('total_reviews', 0)}")
            else:
                print(f"  Analytics API error: {analytics_response.text}")
            
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
                
                # Count orders by status
                if orders:
                    status_counts = {}
                    for order in orders:
                        status = order.get('status', 'unknown')
                        status_counts[status] = status_counts.get(status, 0) + 1
                    
                    print(f"  Order status breakdown:")
                    for status, count in status_counts.items():
                        print(f"    {status}: {count}")
                        
                    # Calculate running orders
                    running_statuses = ['pending', 'preparing', 'ready_for_pickup']
                    running_count = sum(status_counts.get(status, 0) for status in running_statuses)
                    pending_count = status_counts.get('pending', 0)
                    
                    print(f"  Running orders: {running_count}")
                    print(f"  Order requests (pending): {pending_count}")
                else:
                    print(f"  No orders found")
            else:
                print(f"  Orders API error: {orders_response.text}")
            
            # Test food items endpoint (for popular items)
            print("\n🍽️ Testing Food Items API:")
            try:
                # Get restaurant ID first
                if profile_response.status_code == 200:
                    restaurant_id = profile_response.json().get('id')
                    food_response = requests.get(f'http://127.0.0.1:8000/api/v1/customer/food/?restaurant={restaurant_id}', headers=headers)
                    print(f"Food API status: {food_response.status_code}")
                    
                    if food_response.status_code == 200:
                        food_data = food_response.json()
                        if isinstance(food_data, dict) and 'results' in food_data:
                            foods = food_data['results']
                        elif isinstance(food_data, list):
                            foods = food_data
                        else:
                            foods = []
                        
                        print(f"  Food items: {len(foods)} items")
                        for food in foods[:3]:  # Show first 3
                            print(f"    {food.get('name', 'Unknown')} - ৳{food.get('price', 0)}")
                    else:
                        print(f"  Food API error: {food_response.text}")
                else:
                    print("  Skipping food API (no restaurant ID)")
            except Exception as e:
                print(f"  Food API exception: {e}")
                
        else:
            print(f"Login failed: {login_response.text}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_seller_dashboard_apis()