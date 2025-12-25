#!/usr/bin/env python3
"""
Test CategoryViewSet URL directly using Django test client
"""
import os
import django
from django.conf import settings

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.test import Client
from core.models import User
from rest_framework_simplejwt.tokens import RefreshToken

def test_category_url():
    print("🧪 Testing CategoryViewSet URL...")
    
    try:
        # Get a restaurant user
        user = User.objects.get(email="test@restaurant.com")
        print(f"User: {user.email} (Role: {user.role})")
        
        # Create JWT token
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        
        # Create test client
        client = Client()
        
        # Test the URL endpoint
        response = client.get(
            '/api/v1/restaurant/menu/categories/',
            HTTP_AUTHORIZATION=f'Bearer {access_token}',
            content_type='application/json'
        )
        
        print(f"Response status: {response.status_code}")
        print(f"Response content type: {response.get('Content-Type', 'Unknown')}")
        
        if response.status_code == 200:
            print("✅ CategoryViewSet URL test passed!")
            data = response.json()
            print(f"Categories count: {len(data)}")
            print(f"First category: {data[0] if len(data) > 0 else 'No data'}")
        else:
            print(f"❌ CategoryViewSet URL test failed")
            print(f"Response content: {response.content.decode()[:500]}")
        
    except Exception as e:
        print(f"❌ CategoryViewSet URL test failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_category_url()