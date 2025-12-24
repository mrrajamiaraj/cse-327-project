#!/usr/bin/env python3
"""
Reset all restaurant user passwords to 'pass1234'
"""
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from core.models import User

def reset_restaurant_passwords():
    print("🔑 Resetting Restaurant Passwords...")
    print("=" * 50)
    
    # Get all restaurant users
    restaurant_users = User.objects.filter(role='restaurant')
    
    if not restaurant_users.exists():
        print("❌ No restaurant users found in the database")
        return
    
    new_password = "pass1234"
    updated_count = 0
    
    print(f"📊 Found {restaurant_users.count()} restaurant accounts")
    print(f"🔄 Setting all passwords to: {new_password}")
    print()
    
    for user in restaurant_users:
        try:
            # Set the new password
            user.set_password(new_password)
            user.save()
            
            print(f"✅ Updated: {user.email}")
            updated_count += 1
            
        except Exception as e:
            print(f"❌ Failed to update {user.email}: {str(e)}")
    
    print()
    print(f"🎉 Successfully updated {updated_count} restaurant passwords!")
    print(f"🔑 New password for all restaurants: {new_password}")
    print()
    print("📋 Updated Restaurant Accounts:")
    print("-" * 40)
    
    for user in restaurant_users:
        print(f"📧 {user.email} → 🔑 {new_password}")
    
    print()
    print("💡 How to Login:")
    print("1. Go to http://localhost:5173/login")
    print("2. Use any restaurant email from the list above")
    print(f"3. Password is now: {new_password}")
    print("4. You'll be redirected to the seller dashboard")

if __name__ == "__main__":
    reset_restaurant_passwords()