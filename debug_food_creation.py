#!/usr/bin/env python3
"""
Debug food creation issue
"""
import os
import django
from django.conf import settings

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from core.models import User, Restaurant, Food, Category
from core.serializers import FoodSerializer

def debug_food_creation():
    print("🔍 Debugging food creation...")
    
    # Get test user and restaurant
    user = User.objects.get(email="test@restaurant.com")
    restaurant = Restaurant.objects.get(owner=user)
    
    print(f"User: {user.email}")
    print(f"Restaurant: {restaurant.name}")
    
    # Test data
    test_data = {
        "name": "Debug Food Item",
        "description": "Debug description",
        "price": 100.00,
        "category_name": "Debug Category",
        "is_veg": True,
        "stock_quantity": 10,
        "is_available": True
    }
    
    print(f"\nTest data: {test_data}")
    
    # Test 1: Create food directly with model
    print("\n1. Testing direct model creation...")
    try:
        category, _ = Category.objects.get_or_create(name="Debug Category")
        food_direct = Food.objects.create(
            restaurant=restaurant,
            category=category,
            name="Debug Food Direct",
            description="Direct creation",
            price=100.00,
            is_veg=True,
            stock_quantity=10,
            is_available=True
        )
        print(f"✅ Direct creation successful: {food_direct.name}")
    except Exception as e:
        print(f"❌ Direct creation failed: {e}")
    
    # Test 2: Test serializer validation
    print("\n2. Testing serializer validation...")
    serializer = FoodSerializer(data=test_data)
    print(f"Serializer is_valid: {serializer.is_valid()}")
    if not serializer.is_valid():
        print(f"Serializer errors: {serializer.errors}")
    else:
        print(f"Validated data: {serializer.validated_data}")
    
    # Test 3: Test serializer with context
    print("\n3. Testing serializer with context...")
    
    # Create a mock request object
    class MockRequest:
        def __init__(self, user):
            self.user = user
    
    mock_request = MockRequest(user)
    context = {'request': mock_request}
    
    serializer_with_context = FoodSerializer(data=test_data, context=context)
    print(f"Serializer with context is_valid: {serializer_with_context.is_valid()}")
    if not serializer_with_context.is_valid():
        print(f"Serializer with context errors: {serializer_with_context.errors}")
    else:
        print(f"Validated data with context: {serializer_with_context.validated_data}")
        
        # Try to save
        try:
            food_item = serializer_with_context.save()
            print(f"✅ Serializer save successful: {food_item.name}")
        except Exception as e:
            print(f"❌ Serializer save failed: {e}")

if __name__ == "__main__":
    debug_food_creation()