#!/usr/bin/env python3
"""
Create test earnings and withdrawal data for restaurants
"""
import os
import sys
import django
from decimal import Decimal

# Add the project root to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from core.models import Restaurant, RestaurantEarnings, WithdrawalRequest, Order

def create_test_earnings():
    print("💰 Creating test earnings and withdrawal data...")
    
    try:
        # Get all restaurants
        restaurants = Restaurant.objects.all()
        
        for restaurant in restaurants:
            print(f"\n🏪 Processing {restaurant.name}...")
            
            # Create or get earnings record
            earnings, created = RestaurantEarnings.objects.get_or_create(
                restaurant=restaurant,
                defaults={
                    'total_earnings': Decimal('0.00'),
                    'available_balance': Decimal('0.00'),
                    'pending_balance': Decimal('0.00'),
                    'total_withdrawn': Decimal('0.00'),
                    'commission_rate': Decimal('15.00')
                }
            )
            
            if created:
                print(f"  ✅ Created earnings record")
            else:
                print(f"  ℹ️  Earnings record already exists")
            
            # Calculate earnings from delivered orders
            delivered_orders = Order.objects.filter(restaurant=restaurant, status='delivered')
            total_order_value = sum(order.total for order in delivered_orders)
            
            if total_order_value > 0:
                # Calculate restaurant share (85% after 15% commission)
                commission = total_order_value * (earnings.commission_rate / 100)
                restaurant_share = total_order_value - commission
                
                earnings.total_earnings = restaurant_share
                earnings.available_balance = restaurant_share * Decimal('0.8')  # 80% available
                earnings.pending_balance = restaurant_share * Decimal('0.2')   # 20% pending
                earnings.save()
                
                print(f"  💵 Total order value: ৳{total_order_value}")
                print(f"  💰 Restaurant earnings: ৳{restaurant_share}")
                print(f"  💳 Available balance: ৳{earnings.available_balance}")
            
            # Create some sample withdrawal requests
            if earnings.available_balance > 1000:
                # Create a completed withdrawal
                withdrawal1 = WithdrawalRequest.objects.create(
                    restaurant=restaurant,
                    amount=Decimal('500.00'),
                    payment_method='bank_transfer',
                    payment_details={
                        'bank_name': 'Dutch Bangla Bank',
                        'account_number': '1234567890',
                        'account_holder': restaurant.owner.first_name or 'Restaurant Owner'
                    },
                    status='completed'
                )
                
                # Create a pending withdrawal
                withdrawal2 = WithdrawalRequest.objects.create(
                    restaurant=restaurant,
                    amount=Decimal('300.00'),
                    payment_method='mobile_banking',
                    payment_details={
                        'provider': 'bKash',
                        'mobile_number': '+8801712345678'
                    },
                    status='pending'
                )
                
                # Update earnings to reflect completed withdrawal
                earnings.total_withdrawn += withdrawal1.amount
                earnings.available_balance -= withdrawal1.amount
                earnings.save()
                
                print(f"  📤 Created withdrawal requests: ৳{withdrawal1.amount} (completed), ৳{withdrawal2.amount} (pending)")
        
        print(f"\n✅ Successfully created earnings data for {restaurants.count()} restaurants")
        
        # Show summary
        print("\n📊 Earnings Summary:")
        for restaurant in restaurants:
            try:
                earnings = RestaurantEarnings.objects.get(restaurant=restaurant)
                withdrawals = WithdrawalRequest.objects.filter(restaurant=restaurant).count()
                print(f"  {restaurant.name}: ৳{earnings.available_balance} available, {withdrawals} withdrawals")
            except RestaurantEarnings.DoesNotExist:
                print(f"  {restaurant.name}: No earnings record")
        
    except Exception as e:
        print(f"❌ Error creating earnings data: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    create_test_earnings()