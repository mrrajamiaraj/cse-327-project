#!/usr/bin/env python3
"""
Test Category model directly
"""
import os
import django
from django.conf import settings

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from core.models import Category

def test_category_model():
    print("🧪 Testing Category model...")
    
    try:
        # Test basic query
        categories = Category.objects.all()
        print(f"Total categories: {categories.count()}")
        
        # Test ordering
        ordered_categories = Category.objects.all().order_by('name')
        print(f"Ordered categories: {ordered_categories.count()}")
        
        # Test individual category access
        for i, category in enumerate(ordered_categories[:3]):
            print(f"Category {i+1}: {category.id} - {category.name}")
            
        print("✅ Category model works fine")
        
    except Exception as e:
        print(f"❌ Category model error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_category_model()