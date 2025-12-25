#!/usr/bin/env python3
"""
Test CategoryViewSet directly
"""
import os
import django
from django.conf import settings

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from core.models import Category, User
from core.serializers import CategorySerializer
from core.views import CategoryViewSet
from django.test import RequestFactory
from rest_framework.test import force_authenticate

def test_category_viewset():
    print("🧪 Testing CategoryViewSet directly...")
    
    try:
        # Get a restaurant user
        user = User.objects.get(email="test@restaurant.com")
        print(f"User: {user.email} (Role: {user.role})")
        
        # Create a request
        factory = RequestFactory()
        request = factory.get('/api/v1/restaurant/menu/categories/')
        force_authenticate(request, user=user)
        
        # Test the viewset
        viewset = CategoryViewSet()
        viewset.request = request
        
        # Test queryset
        queryset = viewset.get_queryset()
        print(f"Queryset count: {queryset.count()}")
        
        # Test serializer
        categories = Category.objects.all()[:3]
        serializer = CategorySerializer(categories, many=True)
        print(f"Serializer data: {serializer.data}")
        
        print("✅ CategoryViewSet test passed!")
        
    except Exception as e:
        print(f"❌ CategoryViewSet test failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_category_viewset()