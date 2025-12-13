#!/usr/bin/env python
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from core.models import User, Restaurant

def create_test_users():
    """Create test users for different roles"""
    
    # Create customer user (already exists)
    customer, created = User.objects.get_or_create(
        email='customer@test.com',
        defaults={
            'username': 'customer@test.com',
            'first_name': 'John',
            'last_name': 'Customer',
            'role': 'customer',
            'phone': '+880 1234-567890'
        }
    )
    if created:
        customer.set_password('password123')
        customer.save()
        print("✅ Created customer user: customer@test.com / password123")
    else:
        print("ℹ️  Customer user already exists: customer@test.com")

    # Create restaurant owner user
    restaurant_owner, created = User.objects.get_or_create(
        email='restaurant@test.com',
        defaults={
            'username': 'restaurant@test.com',
            'first_name': 'Ahmed',
            'last_name': 'Restaurant',
            'role': 'restaurant',
            'phone': '+880 1234-567891'
        }
    )
    if created:
        restaurant_owner.set_password('password123')
        restaurant_owner.save()
        print("✅ Created restaurant owner: restaurant@test.com / password123")
    else:
        print("ℹ️  Restaurant owner already exists: restaurant@test.com")

    # Create restaurant for the owner
    restaurant, created = Restaurant.objects.get_or_create(
        owner=restaurant_owner,
        defaults={
            'name': 'Ahmed\'s Kitchen',
            'cuisine': 'Bangladeshi',
            'address': 'Dhanmondi 32, Dhaka 1209, Bangladesh',
            'is_approved': True,
            'lat': 23.7465,
            'lng': 90.3763,
            'prep_time_minutes': 25
        }
    )
    if created:
        print("✅ Created restaurant: Ahmed's Kitchen")
    else:
        print("ℹ️  Restaurant already exists: Ahmed's Kitchen")

    # Create rider user
    rider, created = User.objects.get_or_create(
        email='rider@test.com',
        defaults={
            'username': 'rider@test.com',
            'first_name': 'Karim',
            'last_name': 'Rider',
            'role': 'rider',
            'phone': '+880 1234-567892'
        }
    )
    if created:
        rider.set_password('password123')
        rider.save()
        print("✅ Created rider user: rider@test.com / password123")
    else:
        print("ℹ️  Rider user already exists: rider@test.com")

    # Create admin user
    admin, created = User.objects.get_or_create(
        email='admin@test.com',
        defaults={
            'username': 'admin@test.com',
            'first_name': 'Admin',
            'last_name': 'User',
            'role': 'admin',
            'phone': '+880 1234-567893',
            'is_staff': True,
            'is_superuser': True
        }
    )
    if created:
        admin.set_password('password123')
        admin.save()
        print("✅ Created admin user: admin@test.com / password123")
    else:
        print("ℹ️  Admin user already exists: admin@test.com")

    print("\n🎯 Test Users Summary:")
    print("👤 Customer: customer@test.com / password123 → /location → /home")
    print("🏪 Restaurant: restaurant@test.com / password123 → /seller-dashboard")
    print("🏍️ Rider: rider@test.com / password123 → /rider-dashboard")
    print("👑 Admin: admin@test.com / password123 → /admin-dashboard")

if __name__ == "__main__":
    create_test_users()