#!/usr/bin/env python3
"""
Test Django API directly to see debug output
"""
import os
import django
from django.conf import settings

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from core.huggingface_service import HuggingFaceService

def test_service_directly():
    print("🔧 Testing Hugging Face Service Directly...")
    
    service = HuggingFaceService()
    
    print(f"API Key from settings: {getattr(settings, 'HUGGINGFACE_API_KEY', 'NOT FOUND')}")
    print(f"Service API Key: {service.api_key}")
    
    # Test the service
    try:
        result = service.get_food_suggestions("I'm feeling happy today!", "Dhaka")
        print(f"Result: {result}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_service_directly()