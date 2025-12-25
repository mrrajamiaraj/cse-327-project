#!/usr/bin/env python3
"""
Test MenuItemViewSet creation directly
"""
import os
import django
from django.conf import settings

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from core.models import User, Restaurant, Food
from core.serializers import FoodSerializer, MenuItemCreateSerializer
from core.views import MenuItemViewSet
from django.test import RequestFactory
from rest_framework.test import force_authenticate
import json

def test_menu_item_creation():
    print("🧪 Testing MenuItemViewSet creation...")
    
    try:
        # Get a restaurant user
        user = User.objects.get(email="test@restaurant.com")
        restaurant = Restaurant.objects.get(owner=user)
        print(f"User: {user.email} (Role: {user.role})")
        print(f"Restaurant: {restaurant.name}")
        
        # Test data
        test_data = {
            "name": "Test Food Item Direct",
            "description": "A test food item for debugging",
            "price": 150.00,
            "category_name": "Test Category",
            "is_veg": True,
            "stock_quantity": 50,
            "is_available": True
        }
        
        # Test serializer directly
        print("\n1. Testing serializer directly...")
        serializer = MenuItemCreateSerializer(data=test_data)
        if serializer.is_valid():
            print("✅ Serializer is valid")
            print(f"Validated data: {serializer.validated_data}")
            
            # Try to save with restaurant
            food_item = serializer.save(restaurant=restaurant)
            print(f"✅ Food item created: {food_item.name} (ID: {food_item.id})")
            
        else:
            print(f"❌ Serializer errors: {serializer.errors}")
        
        # Test viewset
        print("\n2. Testing viewset...")
        factory = RequestFactory()
        request = factory.post('/api/v1/restaurant/menu/items/', 
                              data=json.dumps(test_data), 
                              content_type='application/json')
        force_authenticate(request, user=user)
        
        # Ensure user is properly set
        request.user = user
        
        viewset = MenuItemViewSet()
        viewset.request = request
        
        # Test perform_create
        serializer2 = MenuItemCreateSerializer(data=test_data, context={'request': request})
        if serializer2.is_valid():
            print("✅ Second serializer is valid")
            try:
                viewset.perform_create(serializer2)
                print("✅ perform_create succeeded")
            except Exception as e:
                print(f"❌ perform_create failed: {e}")
        else:
            print(f"❌ Second serializer errors: {serializer2.errors}")
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_menu_item_creation()