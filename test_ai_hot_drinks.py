#!/usr/bin/env python3
"""
Test AI system for hot drink understanding
"""
import os
import django
from django.conf import settings

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from core.huggingface_service import HuggingFaceService

def test_ai_hot_drinks():
    print("🤖 Testing AI Hot Drink Understanding...")
    
    service = HuggingFaceService()
    
    # Test messages
    test_messages = [
        "I want something hot",
        "I need a hot drink", 
        "Something hot to drink",
        "I want hot coffee",
        "Give me something spicy",
        "I need something cold to drink"
    ]
    
    for message in test_messages:
        print(f"\n📝 Testing: '{message}'")
        try:
            result = service.get_food_suggestions(message, "Dhaka")
            print(f"🤖 Response: {result['response'][:100]}...")
            print(f"📋 Recommendations: {len(result['recommendations'])} items")
            for rec in result['recommendations'][:2]:
                print(f"  - {rec['name']} from {rec['restaurant']}")
        except Exception as e:
            print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_ai_hot_drinks()