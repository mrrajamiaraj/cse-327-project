#!/usr/bin/env python3
"""
Create realistic revenue data for Bangladesh food delivery market
"""
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from core.models import Order, User, Restaurant, Food
from datetime import datetime, timedelta
from decimal import Decimal
import random

def create_realistic_bangladesh_revenue():
    print("🇧🇩 Creating Realistic Bangladesh Revenue Data...")
    
    try:
        # Get KFC restaurant
        restaurant = Restaurant.objects.get(name="KFC")
        print(f"Restaurant: {restaurant.name}")
        
        # Get some customers
        customers = list(User.objects.filter(role='customer')[:20])
        print(f"Available customers: {len(customers)}")
        
        # Get food items
        foods = list(Food.objects.filter(restaurant=restaurant)[:10])
        print(f"Available food items: {len(foods)}")
        
        if not customers or not foods:
            print("❌ Need customers and food items to create orders")
            return
        
        # Delete existing orders to start fresh
        Order.objects.filter(restaurant=restaurant).delete()
        print("🗑️ Cleared existing orders")
        
        # Create realistic revenue data for the past year
        current_date = datetime.now()
        
        # Bangladesh food delivery market patterns:
        # - Higher revenue on weekends
        # - Peak hours: 12PM-2PM, 7PM-10PM
        # - Ramadan and festival seasons have higher sales
        # - Winter months (Nov-Feb) have higher orders
        
        total_orders_created = 0
        total_revenue_generated = 0
        
        # Generate data for past 12 months
        for month_offset in range(12):
            # Calculate month
            target_date = current_date - timedelta(days=30 * month_offset)
            year = target_date.year
            month = target_date.month
            
            # Seasonal multiplier for Bangladesh
            seasonal_multipliers = {
                1: 1.4,   # January - Winter peak
                2: 1.3,   # February - Winter
                3: 1.1,   # March - Pleasant weather
                4: 1.2,   # April - Good weather
                5: 0.9,   # May - Getting hot
                6: 0.8,   # June - Monsoon starts
                7: 0.7,   # July - Heavy monsoon
                8: 0.8,   # August - Monsoon
                9: 1.0,   # September - Post monsoon
                10: 1.1,  # October - Festival season
                11: 1.3,  # November - Winter starts
                12: 1.5   # December - Peak winter + holidays
            }
            
            month_multiplier = seasonal_multipliers.get(month, 1.0)
            
            # Base daily orders for the month
            base_daily_orders = int(80 * month_multiplier)  # 80-120 orders per day
            
            # Generate orders for each day of the month
            from calendar import monthrange
            _, days_in_month = monthrange(year, month)
            
            # For current month, only go up to today
            if month_offset == 0:
                days_in_month = min(days_in_month, target_date.day)
            
            for day in range(1, days_in_month + 1):
                order_date = datetime(year, month, day)
                
                # Skip future dates
                if order_date > current_date:
                    continue
                
                # Weekend multiplier (Friday-Saturday in Bangladesh)
                weekday = order_date.weekday()
                if weekday in [4, 5]:  # Friday, Saturday
                    daily_orders = int(base_daily_orders * 1.4)
                else:
                    daily_orders = base_daily_orders
                
                # Add some randomness
                daily_orders = max(20, daily_orders + random.randint(-15, 25))
                
                # Create orders for this day
                for order_num in range(daily_orders):
                    # Random time during the day (peak hours more likely)
                    hour_weights = [
                        1, 1, 1, 1, 1, 2,    # 12AM-5AM: Low
                        3, 4, 5, 6, 7, 8,    # 6AM-11AM: Morning rise
                        12, 15, 12, 8, 6, 5, # 12PM-5PM: Lunch peak
                        7, 15, 18, 15, 8, 4  # 6PM-11PM: Dinner peak
                    ]
                    
                    hour = random.choices(range(24), weights=hour_weights)[0]
                    minute = random.randint(0, 59)
                    
                    order_time = order_date.replace(hour=hour, minute=minute)
                    
                    # Random customer and food items
                    customer = random.choice(customers)
                    
                    # Order size (1-4 items, weighted toward smaller orders)
                    num_items = random.choices([1, 2, 3, 4], weights=[50, 30, 15, 5])[0]
                    
                    order_items = []
                    subtotal = Decimal('0.00')
                    
                    for _ in range(num_items):
                        food = random.choice(foods)
                        quantity = random.choices([1, 2, 3], weights=[70, 25, 5])[0]
                        
                        # Bangladesh pricing - adjust food prices to be realistic
                        # Typical prices: Rice ৳150-300, Chicken ৳200-400, Drinks ৳50-150
                        realistic_prices = {
                            'rice': random.randint(180, 320),
                            'chicken': random.randint(250, 450),
                            'beef': random.randint(300, 500),
                            'fish': random.randint(200, 380),
                            'vegetable': random.randint(120, 250),
                            'drink': random.randint(60, 150),
                            'dessert': random.randint(80, 200)
                        }
                        
                        # Determine food category and set realistic price
                        food_name_lower = food.name.lower()
                        if any(word in food_name_lower for word in ['rice', 'biryani', 'fried rice']):
                            price = realistic_prices['rice']
                        elif any(word in food_name_lower for word in ['chicken', 'fry']):
                            price = realistic_prices['chicken']
                        elif 'beef' in food_name_lower:
                            price = realistic_prices['beef']
                        elif any(word in food_name_lower for word in ['fish', 'hilsa']):
                            price = realistic_prices['fish']
                        elif any(word in food_name_lower for word in ['vegetable', 'dal', 'curry']):
                            price = realistic_prices['vegetable']
                        elif any(word in food_name_lower for word in ['drink', 'juice', 'water']):
                            price = realistic_prices['drink']
                        else:
                            price = random.randint(150, 350)  # Default range
                        
                        item_total = Decimal(str(price)) * quantity
                        subtotal += item_total
                        
                        order_items.append({
                            'food_id': food.id,
                            'quantity': quantity,
                            'variants': [],
                            'addons': []
                        })
                    
                    # Delivery fee (standard in Bangladesh)
                    delivery_fee = Decimal('60.00')  # ৳60 is typical
                    total = subtotal + delivery_fee
                    
                    # Create the order with proper timestamp
                    order = Order.objects.create(
                        user=customer,
                        restaurant=restaurant,
                        items=order_items,
                        subtotal=subtotal,
                        delivery_fee=delivery_fee,
                        total=total,
                        payment_method=random.choice(['cod', 'card', 'mobile_banking']),
                        status='delivered',  # All orders are delivered for revenue calculation
                        created_at=order_time,
                        updated_at=order_time
                    )
                    
                    # Manually set the created_at to ensure it's saved correctly
                    Order.objects.filter(id=order.id).update(
                        created_at=order_time,
                        updated_at=order_time
                    )
                    
                    total_orders_created += 1
                    total_revenue_generated += float(total)
            
            print(f"✅ Month {month}/{year}: Generated orders (Running total: {total_orders_created})")
        
        print(f"\n🎉 Revenue Data Generation Complete!")
        print(f"📊 Summary:")
        print(f"  Total Orders Created: {total_orders_created:,}")
        print(f"  Total Revenue Generated: ৳{total_revenue_generated:,.2f}")
        print(f"  Average Order Value: ৳{total_revenue_generated/total_orders_created:.2f}")
        
        # Calculate expected monthly average
        monthly_avg = total_revenue_generated / 12
        print(f"  Average Monthly Revenue: ৳{monthly_avg:,.2f}")
        
        # Today's expected revenue
        today_orders = Order.objects.filter(
            restaurant=restaurant,
            created_at__date=datetime.now().date()
        ).count()
        
        if today_orders > 0:
            today_revenue = sum(
                float(order.total) for order in Order.objects.filter(
                    restaurant=restaurant,
                    created_at__date=datetime.now().date()
                )
            )
            print(f"  Today's Revenue: ৳{today_revenue:,.2f} ({today_orders} orders)")
        
        print(f"\n🇧🇩 This matches realistic Bangladesh food delivery revenue!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    create_realistic_bangladesh_revenue()