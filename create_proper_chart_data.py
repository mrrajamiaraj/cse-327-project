#!/usr/bin/env python3
"""
Create proper chart data with timezone-aware datetimes
"""
import os
import django
from datetime import datetime, timedelta, date
import random
from django.utils import timezone

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from core.models import User, Restaurant, Order, Address
from decimal import Decimal

def create_proper_chart_data():
    print("📊 Creating Proper Chart Data with Timezone Support...")
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
        
        # Clear existing orders
        Order.objects.filter(restaurant=restaurant).delete()
        print("🧹 Cleared existing orders")
        
        orders_created = 0
        now = timezone.now()
        today = now.date()
        
        # 1. Create TODAY'S orders with proper hour distribution
        print(f"\n📅 Creating today's orders by hour ({today})...")
        
        # Define realistic hourly distribution
        hourly_distribution = {
            8: (2, 300, 500),   # 8 AM - 2 orders, 300-500 taka each
            9: (1, 250, 400),   # 9 AM - 1 order
            10: (3, 400, 600),  # 10 AM - 3 orders
            11: (2, 350, 550),  # 11 AM - 2 orders
            12: (5, 500, 800),  # 12 PM - 5 orders (lunch rush)
            13: (4, 450, 700),  # 1 PM - 4 orders
            14: (2, 300, 500),  # 2 PM - 2 orders
            15: (1, 250, 400),  # 3 PM - 1 order
            16: (2, 350, 550),  # 4 PM - 2 orders
            17: (3, 400, 600),  # 5 PM - 3 orders
            18: (6, 600, 900),  # 6 PM - 6 orders (dinner rush)
            19: (4, 500, 800),  # 7 PM - 4 orders
            20: (3, 400, 700),  # 8 PM - 3 orders
            21: (2, 300, 500),  # 9 PM - 2 orders
        }
        
        for hour, (count, min_amount, max_amount) in hourly_distribution.items():
            for i in range(count):
                # Create timezone-aware datetime for this hour
                order_time = timezone.make_aware(
                    datetime.combine(today, datetime.min.time().replace(hour=hour)) + timedelta(
                        minutes=random.randint(0, 59),
                        seconds=random.randint(0, 59)
                    )
                )
                
                total_amount = random.randint(min_amount, max_amount)
                
                # Create order and manually set created_at
                order = Order(
                    user=customer,
                    restaurant=restaurant,
                    address=address,
                    items=[{
                        'food_id': 1,
                        'quantity': random.randint(1, 3),
                        'variants': [],
                        'addons': []
                    }],
                    subtotal=Decimal(str(total_amount - 50)),
                    delivery_fee=Decimal('50.00'),
                    total=Decimal(str(total_amount)),
                    payment_method='cod',
                    status='delivered'
                )
                order.save()
                
                # Update created_at after saving
                Order.objects.filter(id=order.id).update(created_at=order_time)
                
                orders_created += 1
                print(f"   {hour:2d}:00 - Order ৳{total_amount} at {order_time.strftime('%H:%M')}")
        
        # 2. Create THIS MONTH'S orders (excluding today)
        print(f"\n📅 Creating this month's orders (excluding today)...")
        
        for day in range(1, today.day):  # Exclude today
            # Vary orders per day
            if day % 7 in [5, 6]:  # Weekend (Friday, Saturday)
                daily_orders = random.randint(8, 15)
            else:  # Weekday
                daily_orders = random.randint(4, 10)
            
            day_total = 0
            for i in range(daily_orders):
                order_time = timezone.make_aware(
                    datetime(today.year, today.month, day) + timedelta(
                        hours=random.randint(8, 22),
                        minutes=random.randint(0, 59)
                    )
                )
                
                total_amount = random.randint(300, 800)
                day_total += total_amount
                
                order = Order(
                    user=customer,
                    restaurant=restaurant,
                    address=address,
                    items=[{
                        'food_id': 1,
                        'quantity': random.randint(1, 4),
                        'variants': [],
                        'addons': []
                    }],
                    subtotal=Decimal(str(total_amount - 50)),
                    delivery_fee=Decimal('50.00'),
                    total=Decimal(str(total_amount)),
                    payment_method='cod',
                    status='delivered'
                )
                order.save()
                
                # Update created_at after saving
                Order.objects.filter(id=order.id).update(created_at=order_time)
                
                orders_created += 1
            
            print(f"   Day {day:2d}: {daily_orders} orders, ৳{day_total}")
        
        # 3. Create PREVIOUS MONTHS' orders for yearly view
        print(f"\n📅 Creating previous months' orders...")
        
        for month in range(1, today.month):  # Previous months this year
            month_orders = random.randint(80, 150)
            month_total = 0
            
            # Determine days in month
            if month in [1, 3, 5, 7, 8, 10, 12]:
                days_in_month = 31
            elif month in [4, 6, 9, 11]:
                days_in_month = 30
            else:  # February
                days_in_month = 28
            
            for i in range(month_orders):
                day = random.randint(1, days_in_month)
                order_time = timezone.make_aware(
                    datetime(today.year, month, day) + timedelta(
                        hours=random.randint(8, 22),
                        minutes=random.randint(0, 59)
                    )
                )
                
                total_amount = random.randint(350, 900)
                month_total += total_amount
                
                order = Order(
                    user=customer,
                    restaurant=restaurant,
                    address=address,
                    items=[{
                        'food_id': 1,
                        'quantity': random.randint(1, 5),
                        'variants': [],
                        'addons': []
                    }],
                    subtotal=Decimal(str(total_amount - 50)),
                    delivery_fee=Decimal('50.00'),
                    total=Decimal(str(total_amount)),
                    payment_method='cod',
                    status='delivered'
                )
                order.save()
                
                # Update created_at after saving
                Order.objects.filter(id=order.id).update(created_at=order_time)
                
                orders_created += 1
            
            month_names = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            print(f"   {month_names[month]}: {month_orders} orders, ৳{month_total}")
        
        print(f"\n✅ Created {orders_created} properly distributed orders!")
        
        # Verify the data
        print(f"\n🔍 Verifying data distribution...")
        
        all_orders = Order.objects.filter(restaurant=restaurant, status='delivered')
        
        # Check today's hourly distribution
        today_orders = all_orders.filter(created_at__date=today)
        print(f"Today's orders: {today_orders.count()}")
        
        for hour in range(24):
            hour_start = timezone.make_aware(datetime.combine(today, datetime.min.time().replace(hour=hour)))
            hour_end = hour_start + timedelta(hours=1)
            
            hour_orders = today_orders.filter(
                created_at__gte=hour_start,
                created_at__lt=hour_end
            )
            
            if hour_orders.count() > 0:
                hour_revenue = sum(order.total for order in hour_orders)
                print(f"   {hour:2d}:00 - {hour_orders.count()} orders, ৳{hour_revenue}")
        
        # Final statistics
        total_revenue = sum(order.total for order in all_orders)
        today_revenue = sum(order.total for order in today_orders)
        
        month_start = timezone.make_aware(datetime(today.year, today.month, 1))
        month_orders = all_orders.filter(created_at__gte=month_start)
        month_revenue = sum(order.total for order in month_orders)
        
        year_start = timezone.make_aware(datetime(today.year, 1, 1))
        year_orders = all_orders.filter(created_at__gte=year_start)
        year_revenue = sum(order.total for order in year_orders)
        
        print(f"\n💰 Final Revenue Summary:")
        print(f"   Today: ৳{today_revenue:,.0f} ({today_orders.count()} orders)")
        print(f"   This Month: ৳{month_revenue:,.0f} ({month_orders.count()} orders)")
        print(f"   This Year: ৳{year_revenue:,.0f} ({year_orders.count()} orders)")
        print(f"   Total: ৳{total_revenue:,.0f} ({all_orders.count()} orders)")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    create_proper_chart_data()