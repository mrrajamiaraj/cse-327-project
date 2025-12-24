#!/usr/bin/env python3
"""
Create business-standard revenue data that follows real business patterns
"""
import os
import sys
import django
from datetime import datetime, timedelta
from decimal import Decimal
import random

# Setup Django
sys.path.append('.')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from core.models import *

def create_business_standard_data():
    print("🏢 Creating Business-Standard Revenue Data...")
    print("=" * 60)
    
    # Clear all existing orders
    Order.objects.all().delete()
    RestaurantEarnings.objects.all().delete()
    
    print("✅ Cleared existing data")
    
    # Get restaurant and customer
    try:
        restaurant = Restaurant.objects.get(owner__email="restaurant@gmail.com")
        customer = User.objects.get(email="raiyan.rahman06@northsouth.edu")
        print(f"📍 Restaurant: {restaurant.name}")
        print(f"👤 Customer: {customer.email}")
    except (Restaurant.DoesNotExist, User.DoesNotExist) as e:
        print(f"❌ Error: {e}")
        return
    
    now = datetime.now()
    orders_created = 0
    
    print("\n📊 Creating data for business chart periods...")
    
    # 1. DAILY CHART DATA (Last 7 days)
    print("\n📅 Daily Chart Data (Last 7 days):")
    daily_revenues = [1200, 1800, 2200, 1600, 2800, 2400, 3200]  # Realistic daily progression
    
    for i in range(6, -1, -1):  # 6 days ago to today
        target_date = now.date() - timedelta(days=i)
        day_revenue = daily_revenues[6-i]
        
        # Create 3-8 orders per day with varying amounts
        num_orders = random.randint(3, 8)
        remaining_revenue = day_revenue
        
        for order_num in range(num_orders):
            if order_num == num_orders - 1:  # Last order gets remaining amount
                order_amount = max(200, remaining_revenue)  # Ensure minimum order
            else:
                # Random order amount (200-800) but ensure we don't go below minimum
                max_amount = min(800, remaining_revenue - (200 * (num_orders - order_num - 1)))
                if max_amount < 200:
                    max_amount = 200
                order_amount = random.randint(200, max_amount)
                remaining_revenue -= order_amount
            
            # Random time during the day
            hour = random.randint(8, 22)  # 8 AM to 10 PM
            minute = random.randint(0, 59)
            
            order_time = datetime.combine(target_date, datetime.min.time()) + timedelta(hours=hour, minutes=minute)
            
            order = Order.objects.create(
                user=customer,
                restaurant=restaurant,
                items=[{"food_id": 1, "quantity": random.randint(1, 4)}],
                subtotal=Decimal(str(order_amount - 50)),
                delivery_fee=Decimal('50.00'),
                total=Decimal(str(order_amount)),
                status='delivered',
                payment_method='cod'
            )
            order.created_at = order_time
            order.save()
            orders_created += 1
        
        day_label = "Today" if i == 0 else ("Yesterday" if i == 1 else target_date.strftime('%a'))
        print(f"  {day_label}: ৳{day_revenue:,} ({num_orders} orders)")
    
    # 2. WEEKLY CHART DATA (Last 8 weeks)
    print("\n📅 Weekly Chart Data (Last 8 weeks):")
    weekly_revenues = [8500, 9200, 10800, 9600, 11200, 10400, 12800, 14200]  # Growing trend
    
    for i in range(7, -1, -1):  # 7 weeks ago to this week
        week_revenue = weekly_revenues[7-i]
        
        # Calculate week start (Monday)
        days_since_monday = now.weekday()
        current_week_start = now - timedelta(days=days_since_monday, weeks=i)
        week_start = current_week_start.replace(hour=0, minute=0, second=0, microsecond=0)
        
        # Skip if this overlaps with daily data (current week)
        if i == 0:
            continue
            
        # Create orders throughout the week
        num_orders = random.randint(15, 25)
        remaining_revenue = week_revenue
        
        for order_num in range(num_orders):
            if order_num == num_orders - 1:
                order_amount = max(300, remaining_revenue)
            else:
                max_amount = min(1000, remaining_revenue - (300 * (num_orders - order_num - 1)))
                if max_amount < 300:
                    max_amount = 300
                order_amount = random.randint(300, max_amount)
                remaining_revenue -= order_amount
            
            # Random day and time during the week
            day_offset = random.randint(0, 6)  # Monday to Sunday
            hour = random.randint(8, 22)
            minute = random.randint(0, 59)
            
            order_time = week_start + timedelta(days=day_offset, hours=hour, minutes=minute)
            
            order = Order.objects.create(
                user=customer,
                restaurant=restaurant,
                items=[{"food_id": 1, "quantity": random.randint(1, 5)}],
                subtotal=Decimal(str(order_amount - 50)),
                delivery_fee=Decimal('50.00'),
                total=Decimal(str(order_amount)),
                status='delivered',
                payment_method='cod'
            )
            order.created_at = order_time
            order.save()
            orders_created += 1
        
        week_label = "This Week" if i == 0 else ("Last Week" if i == 1 else week_start.strftime('%m/%d'))
        print(f"  {week_label}: ৳{week_revenue:,} ({num_orders} orders)")
    
    # 3. MONTHLY CHART DATA (Last 12 months)
    print("\n📅 Monthly Chart Data (Last 12 months):")
    monthly_revenues = [25000, 28000, 32000, 35000, 38000, 42000, 45000, 48000, 52000, 55000, 58000, 62000]
    
    for i in range(11, -1, -1):  # 11 months ago to this month
        month_revenue = monthly_revenues[11-i]
        
        # Calculate month boundaries
        target_date = now.replace(day=1) - timedelta(days=32*i)
        month_start = target_date.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        # Skip current month (already have daily/weekly data)
        if i == 0:
            continue
            
        # Create orders throughout the month
        num_orders = random.randint(40, 80)
        remaining_revenue = month_revenue
        
        for order_num in range(num_orders):
            if order_num == num_orders - 1:
                order_amount = max(400, remaining_revenue)
            else:
                max_amount = min(1500, remaining_revenue - (400 * (num_orders - order_num - 1)))
                if max_amount < 400:
                    max_amount = 400
                order_amount = random.randint(400, max_amount)
                remaining_revenue -= order_amount
            
            # Random day and time during the month
            day_offset = random.randint(0, 27)  # Safe range for all months
            hour = random.randint(8, 22)
            minute = random.randint(0, 59)
            
            order_time = month_start + timedelta(days=day_offset, hours=hour, minutes=minute)
            
            order = Order.objects.create(
                user=customer,
                restaurant=restaurant,
                items=[{"food_id": 1, "quantity": random.randint(1, 6)}],
                subtotal=Decimal(str(order_amount - 50)),
                delivery_fee=Decimal('50.00'),
                total=Decimal(str(order_amount)),
                status='delivered',
                payment_method='cod'
            )
            order.created_at = order_time
            order.save()
            orders_created += 1
        
        month_label = "This Month" if i == 0 else ("Last Month" if i == 1 else month_start.strftime('%b %y'))
        print(f"  {month_label}: ৳{month_revenue:,} ({num_orders} orders)")
    
    # 4. YEARLY CHART DATA (Last 5 years)
    print("\n📅 Yearly Chart Data (Last 5 years):")
    yearly_revenues = [180000, 220000, 280000, 350000, 420000]  # Business growth over years
    
    current_year = now.year
    for i in range(4, -1, -1):  # 4 years ago to this year
        year_revenue = yearly_revenues[4-i]
        target_year = current_year - i
        
        # Skip current year (already have monthly data)
        if i == 0:
            continue
            
        year_start = datetime(target_year, 1, 1)
        
        # Create orders throughout the year
        num_orders = random.randint(200, 400)
        remaining_revenue = year_revenue
        
        for order_num in range(num_orders):
            if order_num == num_orders - 1:
                order_amount = max(500, remaining_revenue)
            else:
                max_amount = min(2000, remaining_revenue - (500 * (num_orders - order_num - 1)))
                if max_amount < 500:
                    max_amount = 500
                order_amount = random.randint(500, max_amount)
                remaining_revenue -= order_amount
            
            # Random date and time during the year
            day_offset = random.randint(0, 360)  # Safe range for any year
            hour = random.randint(8, 22)
            minute = random.randint(0, 59)
            
            order_time = year_start + timedelta(days=day_offset, hours=hour, minutes=minute)
            
            order = Order.objects.create(
                user=customer,
                restaurant=restaurant,
                items=[{"food_id": 1, "quantity": random.randint(1, 8)}],
                subtotal=Decimal(str(order_amount - 50)),
                delivery_fee=Decimal('50.00'),
                total=Decimal(str(order_amount)),
                status='delivered',
                payment_method='cod'
            )
            order.created_at = order_time
            order.save()
            orders_created += 1
        
        year_label = "This Year" if i == 0 else ("Last Year" if i == 1 else str(target_year))
        print(f"  {year_label}: ৳{year_revenue:,} ({num_orders} orders)")
    
    print(f"\n✅ Created {orders_created} orders with business-standard distribution")
    
    # Calculate totals
    total_revenue = Order.objects.filter(restaurant=restaurant, status='delivered').aggregate(
        total=models.Sum('total')
    )['total'] or 0
    
    total_orders = Order.objects.filter(restaurant=restaurant, status='delivered').count()
    avg_order_value = total_revenue / total_orders if total_orders > 0 else 0
    
    print(f"\n📊 BUSINESS SUMMARY:")
    print(f"  Total Revenue: ৳{total_revenue:,.2f}")
    print(f"  Total Orders: {total_orders:,}")
    print(f"  Average Order Value: ৳{avg_order_value:,.2f}")
    
    print(f"\n🎯 Business-standard revenue data created successfully!")
    print(f"📈 Charts will now show realistic business growth patterns")
    print(f"📊 Data spans multiple time periods with proper distribution")

if __name__ == "__main__":
    create_business_standard_data()