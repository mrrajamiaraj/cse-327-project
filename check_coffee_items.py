#!/usr/bin/env python3
"""
Check what coffee and hot drink items are available
"""
import os
import django
from django.conf import settings

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from core.models import Food, Restaurant

def check_coffee_items():
    print("☕ Checking available coffee and hot drink items...")
    
    # Find coffee shops
    coffee_shops = Restaurant.objects.filter(name__icontains='coffee')
    print(f"\n🏪 Coffee Shops ({coffee_shops.count()}):")
    for shop in coffee_shops:
        print(f"  - {shop.name}")
    
    # Find all coffee/tea items
    coffee_items = Food.objects.filter(name__icontains='coffee')
    print(f"\n☕ Coffee Items ({coffee_items.count()}):")
    for item in coffee_items:
        print(f"  - {item.name} from {item.restaurant.name} (৳{item.price})")
    
    tea_items = Food.objects.filter(name__icontains='tea')
    print(f"\n🍵 Tea Items ({tea_items.count()}):")
    for item in tea_items:
        print(f"  - {item.name} from {item.restaurant.name} (৳{item.price})")
    
    # Find items from coffee shops
    all_coffee_shop_items = Food.objects.filter(restaurant__name__icontains='coffee')
    print(f"\n🏪 All items from coffee shops ({all_coffee_shop_items.count()}):")
    for item in all_coffee_shop_items:
        print(f"  - {item.name} from {item.restaurant.name} (৳{item.price})")
    
    # Find hot drink categories
    hot_categories = ['Coffee', 'Tea', 'Drinks']
    for category_name in hot_categories:
        items = Food.objects.filter(category__name__icontains=category_name)
        if items.exists():
            print(f"\n📂 {category_name} Category ({items.count()}):")
            for item in items[:5]:
                print(f"  - {item.name} from {item.restaurant.name}")

if __name__ == "__main__":
    check_coffee_items()