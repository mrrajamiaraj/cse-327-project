#!/usr/bin/env python3
"""
Create a test restaurant user for debugging
"""
import os
import django
from django.conf import settings

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from core.models import User, Restaurant

def create_test_user():
    print("🧪 Creating test restaurant user...")
    
    # Create or get test user
    email = "test@restaurant.com"
    password = "test123"
    
    try:
        # Try to get existing user
        user = User.objects.get(email=email)
        print(f"User {email} already exists")
        
        # Update password
        user.set_password(password)
        user.role = 'restaurant'
        user.save()
        print(f"Updated password for {email}")
        
    except User.DoesNotExist:
        # Create new user
        user = User.objects.create_user(
            email=email,
            password=password,
            first_name="Test",
            last_name="Restaurant",
            role='restaurant'
        )
        print(f"Created new user: {email}")
    
    # Create or get restaurant
    try:
        restaurant = Restaurant.objects.get(owner=user)
        print(f"Restaurant already exists: {restaurant.name}")
    except Restaurant.DoesNotExist:
        restaurant = Restaurant.objects.create(
            owner=user,
            name="Test Restaurant API",
            cuisine="Test Cuisine",
            address_line="Test Address Line",
            area="Test Area",
            city="Dhaka",
            is_approved=True
        )
        print(f"Created restaurant: {restaurant.name}")
    
    print(f"\n✅ Test user created:")
    print(f"Email: {email}")
    print(f"Password: {password}")
    print(f"Role: {user.role}")
    print(f"Restaurant: {restaurant.name}")

if __name__ == "__main__":
    create_test_user()