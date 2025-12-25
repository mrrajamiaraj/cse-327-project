#!/usr/bin/env python3
"""
Check users in the database
"""
import os
import django
from django.conf import settings

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from core.models import User, Restaurant

def check_users():
    print("👥 Checking users in database...")
    
    users = User.objects.all()
    print(f"Total users: {users.count()}")
    
    for user in users:
        print(f"  - {user.email} (Role: {user.role}, ID: {user.id})")
        
        # Check if user has a restaurant
        try:
            restaurant = Restaurant.objects.get(owner=user)
            print(f"    Restaurant: {restaurant.name} (Approved: {restaurant.is_approved})")
        except Restaurant.DoesNotExist:
            if user.role == 'restaurant':
                print(f"    ⚠️ Restaurant role but no restaurant found!")
    
    print(f"\n🏪 Checking restaurants...")
    restaurants = Restaurant.objects.all()
    print(f"Total restaurants: {restaurants.count()}")
    
    for restaurant in restaurants:
        print(f"  - {restaurant.name} (Owner: {restaurant.owner.email}, Approved: {restaurant.is_approved})")

if __name__ == "__main__":
    check_users()