#!/usr/bin/env python3
"""
Comprehensive test for all seller profile pages and their API endpoints
"""
import requests
import json

def test_all_seller_pages():
    print("🧪 Testing All Seller Profile Pages API Endpoints...")
    
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
            
            print("\n=== Testing All Seller Profile Pages ===")
            
            # 1. SellerDashboard.jsx APIs
            print("\n📊 SellerDashboard.jsx APIs:")
            
            # Restaurant Profile
            profile_response = requests.get('http://127.0.0.1:8000/api/v1/restaurant/profile/', headers=headers)
            print(f"   ✅ Restaurant Profile: {profile_response.status_code}")
            
            # Restaurant Analytics
            analytics_response = requests.get('http://127.0.0.1:8000/api/v1/restaurant/analytics/', headers=headers)
            print(f"   ✅ Restaurant Analytics: {analytics_response.status_code}")
            
            # Restaurant Orders
            orders_response = requests.get('http://127.0.0.1:8000/api/v1/restaurant/orders/', headers=headers)
            print(f"   ✅ Restaurant Orders: {orders_response.status_code}")
            
            # Food Items
            if profile_response.status_code == 200:
                restaurant_id = profile_response.json().get('id')
                food_response = requests.get(f'http://127.0.0.1:8000/api/v1/customer/food/?restaurant={restaurant_id}', headers=headers)
                print(f"   ✅ Food Items: {food_response.status_code}")
            
            # 2. SellerProfile.jsx APIs
            print("\n👤 SellerProfile.jsx APIs:")
            
            # User Profile
            user_profile_response = requests.get('http://127.0.0.1:8000/api/v1/auth/profile/', headers=headers)
            print(f"   ✅ User Profile: {user_profile_response.status_code}")
            
            # Restaurant Profile (same as above)
            print(f"   ✅ Restaurant Profile: {profile_response.status_code}")
            
            # 3. TotalRevenue.jsx APIs
            print("\n💰 TotalRevenue.jsx APIs:")
            
            # Restaurant Analytics (for revenue stats)
            print(f"   ✅ Restaurant Analytics: {analytics_response.status_code}")
            
            # Restaurant Earnings
            earnings_response = requests.get('http://127.0.0.1:8000/api/v1/restaurant/earnings/', headers=headers)
            print(f"   ✅ Restaurant Earnings: {earnings_response.status_code}")
            
            if earnings_response.status_code == 200:
                earnings = earnings_response.json()
                print(f"      Total Earnings: ৳{earnings.get('total_earnings', 0)}")
                print(f"      Available Balance: ৳{earnings.get('available_balance', 0)}")
            
            # 4. WithdrawHistory.jsx APIs
            print("\n📤 WithdrawHistory.jsx APIs:")
            
            # Restaurant Withdrawals
            withdrawals_response = requests.get('http://127.0.0.1:8000/api/v1/restaurant/withdrawals/', headers=headers)
            print(f"   ✅ Restaurant Withdrawals: {withdrawals_response.status_code}")
            
            if withdrawals_response.status_code == 200:
                withdrawals = withdrawals_response.json()
                print(f"      Withdrawal Records: {len(withdrawals)}")
            
            # 5. SellerReviews.jsx APIs
            print("\n⭐ SellerReviews.jsx APIs:")
            
            # Restaurant Reviews
            reviews_response = requests.get('http://127.0.0.1:8000/api/v1/restaurant/reviews/', headers=headers)
            print(f"   ✅ Restaurant Reviews: {reviews_response.status_code}")
            
            if reviews_response.status_code == 200:
                reviews = reviews_response.json()
                print(f"      Review Records: {len(reviews)}")
                if reviews:
                    avg_rating = sum(r.get('rating', 0) for r in reviews) / len(reviews)
                    print(f"      Average Rating: {avg_rating:.1f}⭐")
            
            # Summary
            print("\n📋 API Status Summary:")
            all_apis = [
                ("Restaurant Profile", profile_response.status_code),
                ("Restaurant Analytics", analytics_response.status_code),
                ("Restaurant Orders", orders_response.status_code),
                ("Food Items", food_response.status_code if 'food_response' in locals() else 'N/A'),
                ("User Profile", user_profile_response.status_code),
                ("Restaurant Earnings", earnings_response.status_code),
                ("Restaurant Withdrawals", withdrawals_response.status_code),
                ("Restaurant Reviews", reviews_response.status_code),
            ]
            
            working_apis = 0
            total_apis = len(all_apis)
            
            for api_name, status in all_apis:
                if status == 200:
                    print(f"   ✅ {api_name}: Working")
                    working_apis += 1
                else:
                    print(f"   ❌ {api_name}: Error ({status})")
            
            print(f"\n🎯 Result: {working_apis}/{total_apis} APIs working correctly")
            
            if working_apis == total_apis:
                print("🎉 All seller profile pages should work perfectly!")
            else:
                print("⚠️  Some APIs need attention")
                
        else:
            print(f"Login failed: {login_response.text}")
            
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_all_seller_pages()