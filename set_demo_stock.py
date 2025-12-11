#!/usr/bin/env python
"""
Script to set demo stock quantities for food items
"""

import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from core.models import Food

def set_demo_stock():
    """Set demo stock quantities for all food items"""
    foods = Food.objects.all()
    
    stock_levels = [50, 25, 10, 5, 0]  # Different stock levels for demo
    
    for i, food in enumerate(foods):
        # Cycle through different stock levels
        stock_quantity = stock_levels[i % len(stock_levels)]
        food.stock_quantity = stock_quantity
        food.is_available = stock_quantity > 0  # Auto-set availability
        food.save()
        
        status = "Available" if food.is_available else "Unavailable"
        print(f"Set {food.name}: {stock_quantity} units - {status}")
    
    print(f"\nUpdated stock for {foods.count()} food items")
    print("You can now see inventory management in Django Admin!")

if __name__ == "__main__":
    set_demo_stock()