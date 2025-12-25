#!/usr/bin/env python3
"""
Test CategoryViewSet API directly
"""
import os
import django
from django.conf import settings

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from core.models import Category, User
from core.views import CategoryViewSet
from django.test import RequestFactory
from rest_framework.test import force_authenticate
from django.urls import reverse

def test_category_api():
    print("🧪 Testing CategoryViewSet API...")
    
    try:
        # Get a restaurant user
        user = User.objects.get(email="test@restaurant.com")
        print(f"User: {user.email} (Role: {user.role})")
        
        # Create a request
        factory = RequestFactory()
        request = factory.get('/api/v1/restaurant/menu/categories/')
        force_authenticate(request, user=user)
        request.user = user
        
        # Test the viewset directly
        viewset = CategoryViewSet()
        viewset.request = request
        viewset.format_kwarg = None
        
        # Call list method
        response = viewset.list(request)
        print(f"Response status: {response.status_code}")
        print(f"Response data type: {type(response.data)}")
        print(f"Response data length: {len(response.data) if hasattr(response.data, '__len__') else 'N/A'}")
        
        if response.status_code == 200:
            print("✅ CategoryViewSet API test passed!")
            print(f"First few categories: {response.data[:3] if len(response.data) > 0 else 'No data'}")
        else:
            print(f"❌ CategoryViewSet API test failed: {response.data}")
        
    except Exception as e:
        print(f"❌ CategoryViewSet API test failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_category_api()