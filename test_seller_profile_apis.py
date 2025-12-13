#!/usr/bin/env python3
"""
Test the new seller profile API endpoints
"""
import requests
import json

def test_seller_profile_apis():
    print("🧪 Testing Seller Profile API Endpoints...")
    
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
            
            # Test restaurant earnings endpoint
            print("\n💰 Testing Restaurant Earnings API:")
            earnings_response = requests.get('http://127.0.0.1:8000/api/v1/restaurant/earnings/', headers=headers)
            print(f"Earnings API status: {earnings_response.status_code}")
            
            if earnings_response.status_code == 200:
                earnings = earnings_response.json()
                print(f"  Total earnings: ৳{earnings['total_earnings']}")
                print(f"  Available balance: ৳{earnings['available_balance']}")
                print(f"  Commission rate: {earnings['commission_rate']}%")
            else:
                print(f"  Earnings API error: {earnings_response.text}")
            
            # Test withdrawals endpoint
            print("\n📤 Testing Withdrawals API:")
            withdrawals_response = requests.get('http://127.0.0.1:8000/api/v1/restaurant/withdrawals/', headers=headers)
            print(f"Withdrawals API status: {withdrawals_response.status_code}")
            
            if withdrawals_response.status_code == 200:
                withdrawals = withdrawals_response.json()
                print(f"  Withdrawal history: {len(withdrawals)} records")
                for w in withdrawals[:2]:  # Show first 2
                    print(f"    ৳{w['amount']} - {w['status']} ({w['payment_method']})")
            else:
                print(f"  Withdrawals API error: {withdrawals_response.text}")
            
            # Test reviews endpoint
            print("\n⭐ Testing Reviews API:")
            reviews_response = requests.get('http://127.0.0.1:8000/api/v1/restaurant/reviews/', headers=headers)
            print(f"Reviews API status: {reviews_response.status_code}")
            
            if reviews_response.status_code == 200:
                reviews = reviews_response.json()
                print(f"  Reviews: {len(reviews)} records")
                for r in reviews[:2]:  # Show first 2
                    rating = r.get('rating', 0)
                    review_text = r.get('review', 'No text')[:50]
                    print(f"    {rating}⭐ - {review_text}...")
            else:
                print(f"  Reviews API error: {reviews_response.text}")
            
            # Test analytics endpoint (existing)
            print("\n📊 Testing Analytics API:")
            analytics_response = requests.get('http://127.0.0.1:8000/api/v1/restaurant/analytics/', headers=headers)
            print(f"Analytics API status: {analytics_response.status_code}")
            
            if analytics_response.status_code == 200:
                analytics = analytics_response.json()
                print(f"  Total orders: {analytics['total_orders']}")
                print(f"  Daily revenue: ৳{analytics['daily_revenue']}")
                print(f"  Average rating: {analytics['average_rating']}⭐")
            else:
                print(f"  Analytics API error: {analytics_response.text}")
                
        else:
            print(f"Login failed: {login_response.text}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_seller_profile_apis()