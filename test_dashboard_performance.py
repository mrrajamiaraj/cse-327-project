#!/usr/bin/env python3
"""
Test dashboard loading performance before and after optimization
"""
import requests
import time
import json

def test_dashboard_performance():
    print("🚀 Testing Dashboard Performance...")
    
    # Login as restaurant user
    login_data = {
        "email": "restaurant@gmail.com",
        "password": "pass1234"
    }
    
    try:
        # Login
        login_response = requests.post('http://127.0.0.1:8000/api/v1/auth/login/', json=login_data)
        
        if login_response.status_code == 200:
            token = login_response.json()['access']
            headers = {'Authorization': f'Bearer {token}'}
            
            print("\n📊 Testing Optimized Seller Dashboard Loading...")
            
            # Test multiple runs to get average
            times = []
            for i in range(5):
                start_time = time.time()
                
                # Simulate optimized dashboard loading (analytics only)
                analytics_response = requests.get('http://127.0.0.1:8000/api/v1/restaurant/analytics/', headers=headers)
                
                if analytics_response.status_code == 200:
                    # Get restaurant ID from analytics
                    analytics_data = analytics_response.json()
                    restaurant_id = analytics_data.get('restaurant_id', 1)
                    
                    # Fetch popular items with limit
                    food_response = requests.get(f'http://127.0.0.1:8000/api/v1/customer/food/?restaurant={restaurant_id}&limit=2', headers=headers)
                    
                    end_time = time.time()
                    load_time = (end_time - start_time) * 1000  # Convert to milliseconds
                    times.append(load_time)
                    
                    print(f"  Run {i+1}: {load_time:.0f}ms")
                else:
                    print(f"  Run {i+1}: Failed - {analytics_response.status_code}")
            
            if times:
                avg_time = sum(times) / len(times)
                print(f"\n✅ Average optimized loading time: {avg_time:.0f}ms")
                
                # Compare with old method (simulate)
                print("\n📊 Testing Old Method (Multiple Heavy API Calls)...")
                old_times = []
                
                for i in range(3):  # Fewer runs since it's slower
                    start_time = time.time()
                    
                    # Simulate old method - multiple API calls
                    profile_response = requests.get('http://127.0.0.1:8000/api/v1/restaurant/profile/', headers=headers)
                    analytics_response = requests.get('http://127.0.0.1:8000/api/v1/restaurant/analytics/', headers=headers)
                    orders_response = requests.get('http://127.0.0.1:8000/api/v1/restaurant/orders/', headers=headers)
                    
                    if all(r.status_code == 200 for r in [profile_response, analytics_response, orders_response]):
                        restaurant_id = profile_response.json().get('id', 1)
                        food_response = requests.get(f'http://127.0.0.1:8000/api/v1/customer/food/?restaurant={restaurant_id}', headers=headers)
                        
                        end_time = time.time()
                        load_time = (end_time - start_time) * 1000
                        old_times.append(load_time)
                        
                        print(f"  Run {i+1}: {load_time:.0f}ms")
                    else:
                        print(f"  Run {i+1}: Failed")
                
                if old_times:
                    old_avg_time = sum(old_times) / len(old_times)
                    improvement = ((old_avg_time - avg_time) / old_avg_time) * 100
                    
                    print(f"\n📈 Performance Comparison:")
                    print(f"  Old method: {old_avg_time:.0f}ms")
                    print(f"  New method: {avg_time:.0f}ms")
                    print(f"  Improvement: {improvement:.1f}% faster")
                    
                    if improvement > 0:
                        print(f"  🎉 Dashboard is now {improvement:.1f}% faster!")
                    else:
                        print(f"  ⚠️ Dashboard is {abs(improvement):.1f}% slower")
        else:
            print(f"Login failed: {login_response.text}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_dashboard_performance()