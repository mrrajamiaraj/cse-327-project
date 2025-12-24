#!/usr/bin/env python3
"""
Create minimal data just to make graphs work properly
"""
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from core.models import Order, User, Restaurant, Food
from datetime import datetime, timedelta
from decimal import Decimal
import random

def create_minimal_graph_data():
    print("📊 Creating Minimal Graph Data...")
    
    try:
        # Get KFC restaurant
        restaurant = Restaurant.objects.get(name="KFC")
        customers = list(User.objects.filter(role='customer')[:5])
        foods = list(Food.objects.filter(restaurant=restaurant)[:3])
        
        if not customers or not foods:
            print("❌ Need customers and food items")
            return
        
        current_time = datetime.now()
        total_orders = 0
        
        # 1. Create TODAY's hourly data (for daily chart) - just 24 orders
        print("📅 Creating today's hourly data...")
        for hour in range(24):
            # Skip some hours to make it realistic
            if random.random() < 0.3:  # 30% chance to skip an hour
                continue
                
            order_time = current_time.replace(hour=hour, minute=random.randint(0, 59), second=0, microsecond=0)
            
            # Create 1-3 orders for this hour
            orders_this_hour = random.randint(1, 3)
            for _ in range(orders_this_hour):
                customer = random.choice(customers)
                food = random.choice(foods)
                
                subtotal = Decimal(str(random.randint(300, 800)))
                delivery_fee = Decimal('60.00')
                total = subtotal + delivery_fee
                
                Order.objects.create(
                    user=customer,
                    restaurant=restaurant,
                    items=[{'food_id': food.id, 'quantity': 1, 'variants': [], 'addons': []}],
                    subtotal=subtotal,
                    delivery_fee=delivery_fee,
                    total=total,
                    payment_method='cod',
                    status='delivered',
                    created_at=order_time,
                    updated_at=order_time
                )
                total_orders += 1
        
        # 2. Create THIS MONTH's daily data (for monthly chart) - just current month
        print("📅 Creating this month's daily data...")
        for day in range(1, current_time.day):  # Only up to today
            day_date = current_time.replace(day=day, hour=12, minute=0, second=0, microsecond=0)
            
            # Create 5-15 orders for this day
            daily_orders = random.randint(5, 15)
            for _ in range(daily_orders):
                customer = random.choice(customers)
                food = random.choice(foods)
                
                # Random time during the day
                hour = random.randint(8, 22)
                minute = random.randint(0, 59)
                order_time = day_date.replace(hour=hour, minute=minute)
                
                subtotal = Decimal(str(random.randint(300, 800)))
                delivery_fee = Decimal('60.00')
                total = subtotal + delivery_fee
                
                Order.objects.create(
                    user=customer,
                    restaurant=restaurant,
                    items=[{'food_id': food.id, 'quantity': 1, 'variants': [], 'addons': []}],
                    subtotal=subtotal,
                    delivery_fee=delivery_fee,
                    total=total,
                    payment_method='cod',
                    status='delivered',
                    created_at=order_time,
                    updated_at=order_time
                )
                total_orders += 1
        
        # 3. Create THIS YEAR's monthly data (for yearly chart) - just 12 months
        print("📅 Creating this year's monthly data...")
        for month in range(1, 13):
            # Skip current month (already created above)
            if month == current_time.month:
                continue
                
            # Create 50-150 orders for this month
            monthly_orders = random.randint(50, 150)
            for _ in range(monthly_orders):
                customer = random.choice(customers)
                food = random.choice(foods)
                
                # Random day and time in the month
                day = random.randint(1, 28)  # Safe for all months
                hour = random.randint(8, 22)
                minute = random.randint(0, 59)
                
                order_time = datetime(current_time.year, month, day, hour, minute, 0, 0)
                
                subtotal = Decimal(str(random.randint(300, 800)))
                delivery_fee = Decimal('60.00')
                total = subtotal + delivery_fee
                
                Order.objects.create(
                    user=customer,
                    restaurant=restaurant,
                    items=[{'food_id': food.id, 'quantity': 1, 'variants': [], 'addons': []}],
                    subtotal=subtotal,
                    delivery_fee=delivery_fee,
                    total=total,
                    payment_method='cod',
                    status='delivered',
                    created_at=order_time,
                    updated_at=order_time
                )
                total_orders += 1
        
        print(f"\n✅ Created {total_orders} orders total")
        print(f"📊 Data distribution:")
        
        # Verify distribution
        today_orders = Order.objects.filter(restaurant=restaurant, created_at__date=current_time.date()).count()
        month_orders = Order.objects.filter(restaurant=restaurant, created_at__year=current_time.year, created_at__month=current_time.month).count()
        year_orders = Order.objects.filter(restaurant=restaurant, created_at__year=current_time.year).count()
        
        print(f"  Today: {today_orders} orders")
        print(f"  This month: {month_orders} orders")
        print(f"  This year: {year_orders} orders")
        
        print(f"\n✅ Minimal graph data created successfully!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    create_minimal_graph_data()