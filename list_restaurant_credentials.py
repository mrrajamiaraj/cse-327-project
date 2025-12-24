#!/usr/bin/env python3
"""
List all restaurant user credentials
"""
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from core.models import User, Restaurant

def list_restaurant_credentials():
    print("🏪 Restaurant Login Credentials")
    print("=" * 60)
    
    # Get all restaurant users
    restaurant_users = User.objects.filter(role='restaurant').order_by('email')
    
    if not restaurant_users.exists():
        print("❌ No restaurant users found in the database")
        return
    
    print(f"📊 Found {restaurant_users.count()} restaurant accounts:\n")
    
    for i, user in enumerate(restaurant_users, 1):
        print(f"{i}. 🏪 Restaurant Account:")
        print(f"   📧 Email: {user.email}")
        print(f"   👤 Name: {user.first_name} {user.last_name}".strip())
        print(f"   📱 Phone: {user.phone or 'Not set'}")
        
        # Check if restaurant profile exists
        try:
            restaurant = Restaurant.objects.get(owner=user)
            print(f"   🏢 Restaurant: {restaurant.name}")
            print(f"   📍 Address: {restaurant.address or 'Not set'}")
            print(f"   ✅ Approved: {'Yes' if restaurant.is_approved else 'No'}")
        except Restaurant.DoesNotExist:
            print(f"   ⚠️  No restaurant profile created yet")
        
        print(f"   🔑 Password: password123")
        print(f"   🌐 Login URL: http://localhost:5173/login")
        print("-" * 50)
    
    print("\n💡 How to Login:")
    print("1. Go to http://localhost:5173/login")
    print("2. Use any email from the list above")
    print("3. Password is always: password123")
    print("4. You'll be redirected to the seller dashboard")
    
    print("\n🔧 Main Restaurant Account (Most Data):")
    main_restaurant = restaurant_users.filter(email='restaurant@gmail.com').first()
    if main_restaurant:
        print(f"   📧 Email: restaurant@gmail.com")
        print(f"   🔑 Password: restaurantchalai")
        print(f"   💡 This account has the most test data and orders")
    else:
        print("   📧 Email: restaurant@test.com")
        print("   🔑 Password: password123")

if __name__ == "__main__":
    list_restaurant_credentials()