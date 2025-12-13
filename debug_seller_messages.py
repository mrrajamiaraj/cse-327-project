#!/usr/bin/env python3
"""
Debug script to check why seller messages aren't showing
"""
import os
import sys
import django

# Add the project root to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from core.models import User, Order, OrderChatMessage, Restaurant

def debug_seller_messages():
    print("🔍 Debugging Seller Messages...")
    
    # Check restaurant users
    print("\n🏪 Restaurant Users:")
    restaurant_users = User.objects.filter(role='restaurant')
    for user in restaurant_users:
        print(f"  {user}")
        
        # Check if they have a restaurant
        try:
            restaurant = Restaurant.objects.get(owner=user)
            print(f"    Restaurant: {restaurant.name}")
            
            # Check orders for this restaurant
            orders = Order.objects.filter(restaurant=restaurant)
            print(f"    Orders: {orders.count()}")
            
            for order in orders[:3]:  # Show first 3 orders
                print(f"      Order #{order.id}: {order.status} - Customer: {order.user.email}")
                
                # Check chat messages for this order
                messages = OrderChatMessage.objects.filter(order=order)
                print(f"        Chat messages: {messages.count()}")
                
                for msg in messages:
                    print(f"          {msg.sender.email} ({msg.sender.role}): {msg.message[:50]}...")
                    
        except Restaurant.DoesNotExist:
            print(f"    ❌ No restaurant found for this user")
    
    # Check all chat messages
    print(f"\n💬 Total Chat Messages: {OrderChatMessage.objects.count()}")
    
    # Check recent messages
    recent_messages = OrderChatMessage.objects.order_by('-created_at')[:5]
    print("\n📝 Recent Messages:")
    for msg in recent_messages:
        print(f"  Order #{msg.order.id} - {msg.sender.email} ({msg.sender.role}): {msg.message[:50]}...")
    
    # Check which restaurant should see messages
    print("\n🎯 Expected Results:")
    for restaurant_user in restaurant_users:
        try:
            restaurant = Restaurant.objects.get(owner=restaurant_user)
            orders_with_messages = Order.objects.filter(
                restaurant=restaurant,
                orderchatmessage__isnull=False
            ).distinct()
            
            print(f"  {restaurant_user.email} should see {orders_with_messages.count()} conversations")
            
            for order in orders_with_messages:
                last_message = OrderChatMessage.objects.filter(order=order).order_by('-created_at').first()
                if last_message:
                    print(f"    Order #{order.id}: Last message from {last_message.sender.email}")
                    
        except Restaurant.DoesNotExist:
            continue

if __name__ == "__main__":
    debug_seller_messages()