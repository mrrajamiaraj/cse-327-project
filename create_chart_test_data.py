#!/usr/bin/env python3
"""
Create test orders with different dates to make the chart functional
"""
import os
import django
from datetime import datetime, timedelta
import random

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from core.models import User, Restaurant, Order, Address
from decimal import Decimal

def create_chart_test_data():
    print("📊 Creating Chart Test Data...")
    print("=" * 50)
    
    try:
        # Get the main restaurant
        restaurant_user = User.objects.get(email='restaurant@gmail.com')
        restaurant = Restaurant.objects.get(owner=restaurant_user)
        
        # Get a customer for orders
        customer = User.objects.filter(role='customer').first()
        if not customer:
            print("❌ No customer found. Creating one...")
            customer = User.objects.create_user(
                email='testcustomer@gmail.com',
                password='pass1234',
                first_name='Test',
                last_name='Customer',
                role='customer'
            )
        
        # Create a default address for the customer
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
        
        # Create orders for different time periods
        orders_created = 0
        
        # Daily data - last 24 hours
        print("\n📅 Creating daily orders (last 24 hours)...")
        for i in range(12):  # 12 orders in last 24 hours
            hours_ago = random.randint(1, 24)
            order_time = datetime.now() - timedelta(hours=hours_ago)
            
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
                subtotal=Decimal(str(random.randint(200, 800))),
                delivery_fee=Decimal('50.00'),
                total=Decimal(str(random.randint(250, 850))),
                payment_method='cod',
                status='delivered',
                created_at=order_time
            )
            orders_created += 1
        
        # Monthly data - last 12 months
        print("📅 Creating monthly orders (last 12 months)...")
        for i in range(36):  # 36 orders across 12 months
            days_ago = random.randint(1, 365)
            order_time = datetime.now() - timedelta(days=days_ago)
            
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
                subtotal=Decimal(str(random.randint(300, 1200))),
                delivery_fee=Decimal('50.00'),
                total=Decimal(str(random.randint(350, 1250))),
                payment_method='cod',
                status='delivered',
                created_at=order_time
            )
            orders_created += 1
        
        # Yearly data - last 5 years
        print("📅 Creating yearly orders (last 5 years)...")
        for i in range(60):  # 60 orders across 5 years
            days_ago = random.randint(1, 1825)  # 5 years
            order_time = datetime.now() - timedelta(days=days_ago)
            
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
                subtotal=Decimal(str(random.randint(400, 1500))),
                delivery_fee=Decimal('50.00'),
                total=Decimal(str(random.randint(450, 1550))),
                payment_method='cod',
                status='delivered',
                created_at=order_time
            )
            orders_created += 1
        
        print(f"\n✅ Created {orders_created} test orders!")
        print("📊 Chart data is now ready for:")
        print("   - Daily view (last 24 hours)")
        print("   - Monthly view (last 12 months)")
        print("   - Yearly view (last 5 years)")
        
        # Calculate some stats
        total_revenue = sum(order.total for order in Order.objects.filter(restaurant=restaurant, status='delivered'))
        print(f"\n💰 Total restaurant revenue: ৳{total_revenue}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    create_chart_test_data()