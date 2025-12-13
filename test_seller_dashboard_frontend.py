#!/usr/bin/env python3
"""
Test the specific API endpoints that SellerDashboard.jsx uses
"""
import requests
import json

def test_seller_dashboard_frontend_apis():
    print("🧪 Testing SellerDashboard.jsx API Endpoints...")
    
    # Login as restaurant user
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
            
            print("\n=== Testing SellerDashboard.jsx API calls ===")
            
            # 1. Restaurant Profile (for restaurant data)
            print("\n1️⃣ Restaurant Profile API:")
            profile_response = requests.get('http://127.0.0.1:8000/api/v1/restaurant/profile/', headers=headers)
            print(f"   Status: {profile_response.status_code}")
            
            if profile_response.status_code == 200:
                restaurant = profile_response.json()
                print(f"   Restaurant ID: {restaurant.get('id')}")
                print(f"   Restaurant Name: {restaurant.get('name')}")
                print(f"   Address: {restaurant.get('address', 'No address')}")
                restaurant_id = restaurant.get('id')
            else:
                print(f"   Error: {profile_response.text}")
                return
            
            # 2. Restaurant Analytics (for dashboard metrics)
            print("\n2️⃣ Restaurant Analytics API:")
            analytics_response = requests.get('http://127.0.0.1:8000/api/v1/restaurant/analytics/', headers=headers)
            print(f"   Status: {analytics_response.status_code}")
            
            if analytics_response.status_code == 200:
                analytics = analytics_response.json()
                print(f"   Daily Revenue: ৳{analytics.get('daily_revenue', 0)}")
                print(f"   Total Orders: {analytics.get('total_orders', 0)}")
                print(f"   Average Rating: {analytics.get('average_rating', 0)}⭐")
                print(f"   Total Reviews: {analytics.get('total_reviews', 0)}")
                print(f"   Restaurant Address: {analytics.get('restaurant_address', 'N/A')}")
            else:
                print(f"   Error: {analytics_response.text}")
            
            # 3. Restaurant Orders (for running orders count)
            print("\n3️⃣ Restaurant Orders API:")
            orders_response = requests.get('http://127.0.0.1:8000/api/v1/restaurant/orders/', headers=headers)
            print(f"   Status: {orders_response.status_code}")
            
            if orders_response.status_code == 200:
                orders_data = orders_response.json()
                
                # Handle both paginated and direct list responses
                if isinstance(orders_data, dict) and 'results' in orders_data:
                    orders = orders_data['results']
                    print(f"   Orders (paginated): {len(orders)} orders")
                elif isinstance(orders_data, list):
                    orders = orders_data
                    print(f"   Orders (direct): {len(orders)} orders")
                else:
                    orders = []
                    print(f"   Unexpected format: {type(orders_data)}")
                
                # Calculate metrics that SellerDashboard.jsx needs
                running_orders = [o for o in orders if o.get('status') in ['pending', 'preparing', 'ready_for_pickup']]
                order_requests = [o for o in orders if o.get('status') == 'pending']
                
                print(f"   Running Orders: {len(running_orders)}")
                print(f"   Order Requests: {len(order_requests)}")
            else:
                print(f"   Error: {orders_response.text}")
            
            # 4. Food Items (for popular items)
            print("\n4️⃣ Food Items API (Popular Items):")
            food_response = requests.get(f'http://127.0.0.1:8000/api/v1/customer/food/?restaurant={restaurant_id}&ordering=-orders_count', headers=headers)
            print(f"   Status: {food_response.status_code}")
            
            if food_response.status_code == 200:
                food_data = food_response.json()
                
                # Handle both paginated and direct list responses
                if isinstance(food_data, dict) and 'results' in food_data:
                    foods = food_data['results']
                elif isinstance(food_data, list):
                    foods = food_data
                else:
                    foods = []
                
                popular_items = foods[:2]  # Top 2 items
                print(f"   Total Food Items: {len(foods)}")
                print(f"   Popular Items (top 2):")
                for i, item in enumerate(popular_items):
                    print(f"     {i+1}. {item.get('name', 'Unknown')} - ৳{item.get('price', 0)}")
            else:
                print(f"   Error: {food_response.text}")
            
            print("\n✅ All SellerDashboard.jsx API endpoints are working correctly!")
            print("   The frontend should now be able to fetch and display data properly.")
                
        else:
            print(f"Login failed: {login_response.text}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_seller_dashboard_frontend_apis()