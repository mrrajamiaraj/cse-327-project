#!/usr/bin/env python3
"""
Test direct model creation to isolate the issue
"""
import os
import django
from django.conf import settings

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from core.models import User, Restaurant, Food, Category

def test_direct_creation():
    print("🧪 Testing direct Food model creation...")
    
    try:
        # Get test user and restaurant
        user = User.objects.get(email="test@restaurant.com")
        restaurant = Restaurant.objects.get(owner=user)
        
        print(f"User: {user.email}")
        print(f"Restaurant: {restaurant.name}")
        
        # Create category
        category, _ = Category.objects.get_or_create(name="Direct Test Category")
        
        # Create food item directly
        food = Food.objects.create(
            restaurant=restaurant,
            category=category,
            name="Direct Test Food",
            description="Created directly via model",
            price=50.00,
            is_veg=True,
            stock_quantity=5,
            is_available=True
        )
        
        print(f"✅ Food created successfully: {food.name} (ID: {food.id})")
        print(f"Restaurant: {food.restaurant.name}")
        
    except Exception as e:
        print(f"❌ Direct creation failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_direct_creation()