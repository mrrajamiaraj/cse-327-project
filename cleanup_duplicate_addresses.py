#!/usr/bin/env python
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from core.models import Address

def cleanup_duplicate_current_locations():
    """Remove duplicate 'Current Location' addresses for each user"""
    
    # Get all users who have Current Location addresses
    users_with_current_location = Address.objects.filter(
        title="Current Location"
    ).values_list('user_id', flat=True).distinct()
    
    total_deleted = 0
    
    for user_id in users_with_current_location:
        # Get all Current Location addresses for this user
        current_locations = Address.objects.filter(
            user_id=user_id,
            title="Current Location"
        ).order_by('id')
        
        if current_locations.count() > 1:
            # Keep the first one, delete the rest
            addresses_to_delete = current_locations[1:]
            count = len(addresses_to_delete)
            
            print(f"User {user_id}: Deleting {count} duplicate 'Current Location' addresses")
            
            for addr in addresses_to_delete:
                addr.delete()
                total_deleted += 1
    
    print(f"\n✅ Cleanup complete! Deleted {total_deleted} duplicate addresses.")
    
    # Show remaining Current Location addresses
    remaining = Address.objects.filter(title="Current Location").count()
    print(f"📍 Remaining 'Current Location' addresses: {remaining}")

if __name__ == "__main__":
    print("🧹 Cleaning up duplicate 'Current Location' addresses...")
    cleanup_duplicate_current_locations()