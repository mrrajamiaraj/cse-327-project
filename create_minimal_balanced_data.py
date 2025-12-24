#!/usr/bin/env python3
"""
Create minimal, balanced test data to demonstrate chart logic works correctly
"""
import os
import sys
import django
from datetime import datetime, timedelta
from decimal import Decimal

# Setup Django
sys.path.append('.')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from core.models import *

def create_minimal_balanced_data():
    print("🗑️ Clearing existing orders...")
    
    # Clear all existing orders
    Order.objects.all().delete()
    RestaurantEarnings.objects.all().delete()
    
    print("✅ All orders cleared")
    
    # Get restaurant and user
    try:
        restaurant = Restaurant.objects.get(owner__email="restaurant@gmail.com")
        customer = User.objects.get(email="raiyan.rahman06@northsouth.edu")  # Use existing customer
        print(f"📍 Using restaurant: {restaurant.name}")
        print(f"👤 Using customer: {customer.email}")
    except (Restaurant.DoesNotExist, User.DoesNotExist) as e:
        print(f"❌ Restaurant or customer not found: {e}")
        return
    
    print("📊 Creating minimal balanced test data...")
    
    # Create 20 orders distributed across different time periods
    orders_created = 0
    now = datetime.now()
    
    # Today - 5 orders at different hours (for daily chart)
    today_hours = [8, 12, 15, 18, 21]  # 8AM, 12PM, 3PM, 6PM, 9PM
    for hour in today_hours:
        order_time = now.replace(hour=hour, minute=0, second=0, microsecond=0)
        
        order = Order.objects.create(
            user=customer,
            restaurant=restaurant,
            items=[{"food_id": 1, "quantity": 2}],
            subtotal=Decimal('800.00'),
            delivery_fee=Decimal('50.00'),
            total=Decimal('850.00'),
            status='delivered',
            payment_method='cod'
        )
        order.created_at = order_time
        order.save()
        orders_created += 1
        print(f"  ✓ Order {orders_created}: Today {hour}:00 - ৳850")
    
    # This month - 5 orders on different days (for monthly chart)
    month_days = [5, 10, 15, 20, 22]  # Different days of current month
    for day in month_days:
        try:
            order_time = now.replace(day=day, hour=14, minute=0, second=0, microsecond=0)
            
            order = Order.objects.create(
                user=customer,
                restaurant=restaurant,
                items=[{"food_id": 1, "quantity": 3}],
                subtotal=Decimal('1200.00'),
                delivery_fee=Decimal('50.00'),
                total=Decimal('1250.00'),
                status='delivered',
                payment_method='cod'
            )
            order.created_at = order_time
            order.save()
            orders_created += 1
            print(f"  ✓ Order {orders_created}: Dec {day} - ৳1250")
        except ValueError:
            # Skip if day doesn't exist in current month
            continue
    
    # This year - 5 orders in different months (for yearly chart)
    year_months = [2, 4, 6, 8, 10]  # Feb, Apr, Jun, Aug, Oct
    for month in year_months:
        try:
            order_time = datetime(now.year, month, 15, 16, 0, 0, 0)
            
            order = Order.objects.create(
                user=customer,
                restaurant=restaurant,
                items=[{"food_id": 1, "quantity": 4}],
                subtotal=Decimal('1600.00'),
                delivery_fee=Decimal('50.00'),
                total=Decimal('1650.00'),
                status='delivered',
                payment_method='cod'
            )
            order.created_at = order_time
            order.save()
            orders_created += 1
            print(f"  ✓ Order {orders_created}: {order_time.strftime('%b %Y')} - ৳1650")
        except ValueError:
            continue
    
    # Previous weeks - 5 orders (for weekly chart in total revenue page)
    for week_offset in [7, 14, 21, 28, 35]:  # 1, 2, 3, 4, 5 weeks ago
        order_time = now - timedelta(days=week_offset)
        order_time = order_time.replace(hour=13, minute=0, second=0, microsecond=0)
        
        order = Order.objects.create(
            user=customer,
            restaurant=restaurant,
            items=[{"food_id": 1, "quantity": 2}],
            subtotal=Decimal('900.00'),
            delivery_fee=Decimal('50.00'),
            total=Decimal('950.00'),
            status='delivered',
            payment_method='cod'
        )
        order.created_at = order_time
        order.save()
        orders_created += 1
        print(f"  ✓ Order {orders_created}: {order_time.strftime('%b %d')} - ৳950")
    
    print(f"\n✅ Created {orders_created} balanced orders")
    
    # Calculate totals
    total_revenue = Order.objects.filter(restaurant=restaurant, status='delivered').aggregate(
        total=models.Sum('total')
    )['total'] or 0
    
    print(f"📊 Total revenue: ৳{total_revenue:,.2f}")
    print(f"📊 Average order value: ৳{total_revenue/orders_created:,.2f}")
    
    # Verify distribution
    print("\n📈 Data distribution verification:")
    
    # Today's orders
    today_orders = Order.objects.filter(
        restaurant=restaurant, 
        status='delivered',
        created_at__date=now.date()
    ).count()
    print(f"  Today: {today_orders} orders")
    
    # This month's orders
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    month_orders = Order.objects.filter(
        restaurant=restaurant,
        status='delivered',
        created_at__gte=month_start
    ).count()
    print(f"  This month: {month_orders} orders")
    
    # This year's orders
    year_start = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
    year_orders = Order.objects.filter(
        restaurant=restaurant,
        status='delivered',
        created_at__gte=year_start
    ).count()
    print(f"  This year: {year_orders} orders")
    
    print("\n🎯 Minimal balanced dataset created successfully!")
    print("📊 Charts should now show proper distribution across all time periods")

if __name__ == "__main__":
    create_minimal_balanced_data()