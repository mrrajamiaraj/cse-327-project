#!/usr/bin/env python3
"""
Create properly distributed revenue data for realistic graphs
"""
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from core.models import Order, User, Restaurant, Food
from datetime import datetime, timedelta
from decimal import Decimal
import random

def create_distributed_revenue_data():
    print("📊 Creating Properly Distributed Revenue Data...")
    
    try:
        # Get KFC restaurant
        restaurant = Restaurant.objects.get(name="KFC")
        print(f"Restaurant: {restaurant.name}")
        
        # Get customers and food items
        customers = list(User.objects.filter(role='customer')[:20])
        foods = list(Food.objects.filter(restaurant=restaurant)[:10])
        
        if not customers or not foods:
            print("❌ Need customers and food items")
            return
        
        print(f"Available customers: {len(customers)}")
        print(f"Available food items: {len(foods)}")
        
        # Create realistic distributed data
        current_time = datetime.now()
        total_orders_created = 0
        total_revenue_generated = 0
        
        # 1. Create data for the past 12 months (for yearly chart)
        print("\n📅 Creating yearly data (12 months)...")
        for month_offset in range(12):
            month_date = current_time - timedelta(days=30 * month_offset)
            
            # Monthly order count (realistic for Bangladesh)
            if month_offset == 0:  # Current month
                monthly_orders = random.randint(2500, 3500)
            else:
                monthly_orders = random.randint(2000, 3000)
            
            # Distribute orders across the month
            days_in_month = 30
            for day in range(days_in_month):
                day_date = month_date - timedelta(days=day)
                
                # Skip future dates
                if day_date > current_time:
                    continue
                
                # Daily orders (distribute monthly total)
                daily_orders = monthly_orders // days_in_month
                daily_orders += random.randint(-10, 15)  # Add variation
                daily_orders = max(10, daily_orders)  # Minimum 10 orders per day
                
                # Create orders for this day
                for order_num in range(daily_orders):
                    # Random hour (weighted for peak times)
                    hour_weights = [1, 1, 1, 1, 1, 2, 3, 4, 5, 6, 7, 8, 12, 15, 12, 8, 6, 5, 7, 15, 18, 15, 8, 4]
                    hour = random.choices(range(24), weights=hour_weights)[0]
                    minute = random.randint(0, 59)
                    second = random.randint(0, 59)
                    
                    order_time = day_date.replace(hour=hour, minute=minute, second=second)
                    
                    # Create realistic order
                    customer = random.choice(customers)
                    num_items = random.choices([1, 2, 3], weights=[60, 30, 10])[0]
                    
                    order_items = []
                    subtotal = Decimal('0.00')
                    
                    for _ in range(num_items):
                        food = random.choice(foods)
                        quantity = random.choices([1, 2], weights=[80, 20])[0]
                        
                        # Realistic Bangladesh pricing
                        price = random.randint(200, 500)  # ৳200-500 per item
                        item_total = Decimal(str(price)) * quantity
                        subtotal += item_total
                        
                        order_items.append({
                            'food_id': food.id,
                            'quantity': quantity,
                            'variants': [],
                            'addons': []
                        })
                    
                    delivery_fee = Decimal('60.00')
                    total = subtotal + delivery_fee
                    
                    # Create order with specific timestamp
                    order = Order.objects.create(
                        user=customer,
                        restaurant=restaurant,
                        items=order_items,
                        subtotal=subtotal,
                        delivery_fee=delivery_fee,
                        total=total,
                        payment_method=random.choice(['cod', 'card', 'mobile_banking']),
                        status='delivered',
                        created_at=order_time,
                        updated_at=order_time
                    )
                    
                    total_orders_created += 1
                    total_revenue_generated += float(total)
                    
                    # Print progress every 1000 orders
                    if total_orders_created % 1000 == 0:
                        print(f"  Created {total_orders_created:,} orders...")
        
        print(f"\n🎉 Data Creation Complete!")
        print(f"📊 Summary:")
        print(f"  Total Orders: {total_orders_created:,}")
        print(f"  Total Revenue: ৳{total_revenue_generated:,.2f}")
        print(f"  Average Order Value: ৳{total_revenue_generated/total_orders_created:.2f}")
        
        # Verify data distribution
        print(f"\n🔍 Verifying Data Distribution:")
        
        # Check today's hourly distribution
        today = datetime.now().date()
        today_orders = Order.objects.filter(restaurant=restaurant, created_at__date=today)
        print(f"  Today's orders: {today_orders.count()}")
        
        if today_orders.count() > 0:
            # Check hour distribution
            from collections import defaultdict
            hour_counts = defaultdict(int)
            for order in today_orders:
                hour_counts[order.created_at.hour] += 1
            
            print(f"  Hours with orders: {len(hour_counts)}")
            print(f"  Peak hour: {max(hour_counts.keys(), key=lambda h: hour_counts[h])} ({hour_counts[max(hour_counts.keys(), key=lambda h: hour_counts[h])] } orders)")
        
        # Check monthly distribution
        current_month_orders = Order.objects.filter(
            restaurant=restaurant,
            created_at__year=current_time.year,
            created_at__month=current_time.month
        )
        print(f"  Current month orders: {current_month_orders.count()}")
        
        # Check yearly distribution
        current_year_orders = Order.objects.filter(
            restaurant=restaurant,
            created_at__year=current_time.year
        )
        print(f"  Current year orders: {current_year_orders.count()}")
        
        print(f"\n✅ Revenue data properly distributed across time periods!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    create_distributed_revenue_data()