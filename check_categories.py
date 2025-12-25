#!/usr/bin/env python3
"""
Check categories in the database
"""
import os
import django
from django.conf import settings

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from core.models import Category

def check_categories():
    print("📂 Checking categories in database...")
    
    categories = Category.objects.all()
    print(f"Total categories: {categories.count()}")
    
    for category in categories:
        print(f"  - {category.name} (ID: {category.id})")
    
    if categories.count() == 0:
        print("⚠️ No categories found! Creating default categories...")
        
        default_categories = [
            "Biriyani", "Curry", "Kebab", "Fish", "Chicken", 
            "Beef", "Vegetarian", "Dessert", "Snacks", "Drinks",
            "Coffee", "Bakery", "Fast Food"
        ]
        
        for cat_name in default_categories:
            category, created = Category.objects.get_or_create(name=cat_name)
            if created:
                print(f"  ✅ Created: {cat_name}")
            else:
                print(f"  ⚠️ Already exists: {cat_name}")

if __name__ == "__main__":
    check_categories()