#!/usr/bin/env python3
"""
Create realistic chart data with orders spread throughout different time periods
"""
import os
import django
from datetime import datetime, timedelta, date
import random

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from core.models import User, Restaurant, Order, Address
from decimal import Decimal

def create_realistic_chart_data():
    print("📊 Creating Realistic Chart Data...")
    print("=" * 50)
    
    try:
        # Get the main restaurant
        restaurant_user = User.objects.get(email='restaurant@gmail.com')
        restaurant = Restaurant.objects.get(owner=restaurant_user)
        
        # Get a customer for orders
        customer = User.objects.filter(role='customer').first()
        
        # Get or create address
        address, created = Address.objects.get_or_create(
            user=customer,
            defaults={
                'title': 'Home',
                'address': 'Test Address, Dhaka',
                'lat': 23.7465,
                'lng': 90.3763,
                'is_default': True
            }
        )
        
        print(f"🏪 Restaurant: {restaurant.name}")
        print(f"👤 Customer: {customer.email}")
        
        # Clear existing orders for clean data
        Order.objects.filter(restaurant=restaurant).delete()
        print("🧹 Cleared existing orders")
        
        orders_created = 0
        
        # 1. TODAY'S HOURLY DATA (for daily chart)
        print("\n📅 Creating today's hourly orders...")
        today = date.today()
        
        # Create orders at different hours of today
        hourly_orders = [
            (8, 2),   # 8 AM - 2 orders
            (9, 1),   # 9 AM - 1 order
            (10, 3),  # 10 AM - 3 orders
            (11, 2),  # 11 AM - 2 orders
            (12, 5),  # 12 PM - 5 orders (lunch rush)
            (13, 4),  # 1 PM - 4 orders
            (14, 2),  # 2 PM - 2 orders
            (15, 1),  # 3 PM - 1 order
            (16, 2),  # 4 PM - 2 orders
            (17, 3),  # 5 PM - 3 orders
            (18, 6),  # 6 PM - 6 orders (dinner rush)
            (19, 4),  # 7 PM - 4 orders
            (20, 3),  # 8 PM - 3 orders
            (21, 2),  # 9 PM - 2 orders
        ]
        
        for hour, count in hourly_orders:
            for i in range(count):
                order_time = datetime.combine(today, datetime.min.time()) + timedelta(
                    hours=hour, 
                    minutes=random.randint(0, 59)
                )
                
                order = Order.objects.create(
                    user=customer,
                    restaurant=restaurant,
                    address=address,
                    items=[{
                        'food_id': 1,
                        'quantity': random.randint(1, 3),
                        'variants': [],
                        'addons': []
                    }],
                    subtotal=Decimal(str(random.randint(200, 600))),
                    delivery_fee=Decimal('50.00'),
                    total=Decimal(str(random.randint(250, 650))),
                    payment_method='cod',
                    status='delivered',
                    created_at=order_time
                )
                orders_created += 1
        
        # 2. THIS MONTH'S DAILY DATA (for monthly chart)
        print("📅 Creating this month's daily orders...")
        now = datetime.now()
        
        # Create orders for different days of this month
        for day in range(1, now.day + 1):
            # More orders on weekends and recent days
            if day % 7 in [0, 6]:  # Weekend
                order_count = random.randint(8, 15)
            elif day > now.day - 7:  # Recent week
                order_count = random.randint(5, 12)
            else:
                order_count = random.randint(2, 8)
            
            for i in range(order_count):
                order_time = datetime(now.year, now.month, day) + timedelta(
                    hours=random.randint(8, 22),
                    minutes=random.randint(0, 59)
                )
                
                # Skip if it's today (already created above)
                if order_time.date() == today:
                    continue
                
                order = Order.objects.create(
                    user=customer,
                    restaurant=restaurant,
                    address=address,
                    items=[{
                        'food_id': 1,
                        'quantity': random.randint(1, 4),
                        'variants': [],
                        'addons': []
                    }],
                    subtotal=Decimal(str(random.randint(300, 800))),
                    delivery_fee=Decimal('50.00'),
                    total=Decimal(str(random.randint(350, 850))),
                    payment_method='cod',
                    status='delivered',
                    created_at=order_time
                )
                orders_created += 1
        
        # 3. THIS YEAR'S MONTHLY DATA (for yearly chart)
        print("📅 Creating this year's monthly orders...")
        current_year = now.year
        
        # Create orders for previous months of this year
        monthly_orders = [
            (1, 45),   # January
            (2, 52),   # February
            (3, 48),   # March
            (4, 55),   # April
            (5, 60),   # May
            (6, 58),   # June
            (7, 62),   # July
            (8, 65),   # August
            (9, 59),   # September
            (10, 63),  # October
            (11, 67),  # November
            # December will have current month's data
        ]
        
        for month, count in monthly_orders:
            if month >= now.month:  # Skip current and future months
                continue
                
            for i in range(count):
                # Random day in the month
                if month in [1, 3, 5, 7, 8, 10, 12]:
                    max_day = 31
                elif month in [4, 6, 9, 11]:
                    max_day = 30
                else:  # February
                    max_day = 28
                
                day = random.randint(1, max_day)
                order_time = datetime(current_year, month, day) + timedelta(
                    hours=random.randint(8, 22),
                    minutes=random.randint(0, 59)
                )
                
                order = Order.objects.create(
                    user=customer,
                    restaurant=restaurant,
                    address=address,
                    items=[{
                        'food_id': 1,
                        'quantity': random.randint(1, 5),
                        'variants': [],
                        'addons': []
                    }],
                    subtotal=Decimal(str(random.randint(400, 1200))),
                    delivery_fee=Decimal('50.00'),
                    total=Decimal(str(random.randint(450, 1250))),
                    payment_method='cod',
                    status='delivered',
                    created_at=order_time
                )
                orders_created += 1
        
        print(f"\n✅ Created {orders_created} realistic orders!")
        
        # Calculate and display statistics
        all_orders = Order.objects.filter(restaurant=restaurant, status='delivered')
        total_revenue = sum(order.total for order in all_orders)
        
        today_orders = all_orders.filter(created_at__date=today)
        today_revenue = sum(order.total for order in today_orders)
        
        month_start = datetime(now.year, now.month, 1)
        month_orders = all_orders.filter(created_at__gte=month_start)
        month_revenue = sum(order.total for order in month_orders)
        
        year_start = datetime(current_year, 1, 1)
        year_orders = all_orders.filter(created_at__gte=year_start)
        year_revenue = sum(order.total for order in year_orders)
        
        print(f"\n💰 Revenue Summary:")
        print(f"   Today: ৳{today_revenue} ({today_orders.count()} orders)")
        print(f"   This Month: ৳{month_revenue} ({month_orders.count()} orders)")
        print(f"   This Year: ৳{year_revenue} ({year_orders.count()} orders)")
        print(f"   Total: ৳{total_revenue} ({all_orders.count()} orders)")
        
        print(f"\n📊 Chart will now show:")
        print(f"   Daily: Hourly earnings for today")
        print(f"   Monthly: Daily earnings for this month")
        print(f"   Yearly: Monthly earnings for this year")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    create_realistic_chart_data()