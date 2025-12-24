#!/usr/bin/env python
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from core.models import Restaurant

def migrate_restaurant_addresses():
    """Migrate existing restaurant addresses to new format"""
    
    print("🔄 Migrating restaurant addresses to new format...")
    print("=" * 60)
    
    restaurants = Restaurant.objects.all()
    
    for restaurant in restaurants:
        print(f"\n📍 Processing: {restaurant.name}")
        
        # If restaurant has old address format, try to parse it
        if restaurant.address and restaurant.address_line == "Address not set":
            print(f"   Old address: {restaurant.address}")
            
            # Try to extract meaningful parts from the old address
            address_parts = restaurant.address.split(',')
            
            if len(address_parts) >= 1:
                restaurant.address_line = address_parts[0].strip()
            
            if len(address_parts) >= 2:
                restaurant.area = address_parts[1].strip()
            
            if len(address_parts) >= 3:
                # Look for city in the parts
                for part in address_parts[2:]:
                    part = part.strip()
                    if any(city in part.lower() for city in ['dhaka', 'chittagong', 'sylhet', 'rajshahi', 'khulna', 'barisal']):
                        restaurant.city = part
                        break
            
            # Set a meaningful title
            restaurant.address_title = f"{restaurant.name} - Main Location"
            
            print(f"   New address_line: {restaurant.address_line}")
            print(f"   New area: {restaurant.area}")
            print(f"   New city: {restaurant.city}")
            print(f"   New title: {restaurant.address_title}")
            
            restaurant.save()
            print("   ✅ Updated")
        else:
            print("   ℹ️  Already has new address format or no address")
    
    print(f"\n🎉 Migration completed!")
    print(f"   Total restaurants processed: {restaurants.count()}")
    
    # Show summary
    print("\n📋 Restaurant Address Summary:")
    for restaurant in Restaurant.objects.all():
        print(f"   {restaurant.name}:")
        print(f"     Title: {restaurant.address_title}")
        print(f"     Address: {restaurant.full_address}")
        print(f"     Coordinates: ({restaurant.lat}, {restaurant.lng})")

if __name__ == "__main__":
    migrate_restaurant_addresses()