#!/usr/bin/env python3
"""
Create test chat messages for demonstration
"""
import os
import sys
import django

# Add the project root to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from core.models import User, Order, OrderChatMessage
from datetime import datetime, timedelta

def create_test_chat_messages():
    print("Creating test chat messages...")
    
    try:
        # Get some existing orders
        orders = Order.objects.all()[:3]  # Get first 3 orders
        
        if not orders:
            print("No orders found. Please create some orders first.")
            return
        
        # Get users for different roles
        customer = User.objects.filter(role='customer').first()
        restaurant = User.objects.filter(role='restaurant').first()
        rider = User.objects.filter(role='rider').first()
        
        if not customer or not restaurant:
            print("Missing required users. Please create test users first.")
            return
        
        messages_created = 0
        
        for i, order in enumerate(orders):
            # Create a conversation for each order
            base_time = order.created_at
            
            # Customer asks about order
            OrderChatMessage.objects.create(
                order=order,
                sender=order.user,  # Customer who placed the order
                message=f"Hi! I just placed order #{order.id}. How long will it take?",
                created_at=base_time + timedelta(minutes=5)
            )
            messages_created += 1
            
            # Restaurant responds
            OrderChatMessage.objects.create(
                order=order,
                sender=order.restaurant.owner,  # Restaurant owner
                message=f"Hello! Your order is being prepared. It will be ready in about {order.restaurant.prep_time_minutes} minutes.",
                created_at=base_time + timedelta(minutes=10)
            )
            messages_created += 1
            
            # Customer asks follow-up
            follow_ups = [
                "Great! Can you make it less spicy?",
                "Perfect! Is there any discount available?",
                "Thank you! Can I add extra sauce?"
            ]
            
            OrderChatMessage.objects.create(
                order=order,
                sender=order.user,
                message=follow_ups[i % len(follow_ups)],
                created_at=base_time + timedelta(minutes=15)
            )
            messages_created += 1
            
            # Restaurant responds
            responses = [
                "Sure! I'll make it mild for you.",
                "Sorry, no discounts on this order, but we have a loyalty program!",
                "Of course! I'll add extra sauce at no charge."
            ]
            
            OrderChatMessage.objects.create(
                order=order,
                sender=order.restaurant.owner,
                message=responses[i % len(responses)],
                created_at=base_time + timedelta(minutes=20)
            )
            messages_created += 1
            
            # If rider exists and is assigned, add rider message
            if rider and order.rider:
                OrderChatMessage.objects.create(
                    order=order,
                    sender=order.rider,
                    message="I'm on my way to pick up your order!",
                    created_at=base_time + timedelta(minutes=30)
                )
                messages_created += 1
                
                # Customer thanks rider
                OrderChatMessage.objects.create(
                    order=order,
                    sender=order.user,
                    message="Thank you! I'll be waiting.",
                    created_at=base_time + timedelta(minutes=32)
                )
                messages_created += 1
        
        print(f"✅ Created {messages_created} test chat messages for {len(orders)} orders")
        
        # Show summary
        print("\n📊 Chat Messages Summary:")
        for order in orders:
            msg_count = OrderChatMessage.objects.filter(order=order).count()
            print(f"  Order #{order.id}: {msg_count} messages")
        
    except Exception as e:
        print(f"❌ Error creating chat messages: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    create_test_chat_messages()