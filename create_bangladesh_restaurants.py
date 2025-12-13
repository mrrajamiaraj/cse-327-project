#!/usr/bin/env python
import os
import sys
import django
from decimal import Decimal

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from core.models import User, Restaurant, Category, Food, Addon

def create_bangladesh_restaurants():
    """Create real Bangladeshi restaurants with authentic food items"""
    
    print("🇧🇩 Creating Bangladeshi Restaurants with Authentic Food Items\n")
    
    # First, create or get categories
    categories = {}
    category_data = [
        ('Biriyani', 'Traditional rice dishes with meat and spices'),
        ('Curry', 'Various curry dishes with rice'),
        ('Kebab', 'Grilled meat items'),
        ('Dessert', 'Traditional Bangladeshi sweets'),
        ('Snacks', 'Light snacks and appetizers'),
        ('Drinks', 'Beverages and drinks'),
        ('Fish', 'Fish curry and preparations'),
        ('Chicken', 'Chicken dishes and preparations'),
        ('Beef', 'Beef dishes and preparations'),
        ('Vegetarian', 'Vegetable dishes')
    ]
    
    for name, desc in category_data:
        category, created = Category.objects.get_or_create(
            name=name,
            defaults={'description': desc}
        )
        categories[name] = category
        if created:
            print(f"✅ Created category: {name}")
    
    # Create addons
    addons = {}
    addon_data = [
        ('Extra Rice', 25),
        ('Extra Raita', 30),
        ('Boiled Egg', 20),
        ('Extra Spicy', 0),
        ('Less Spicy', 0),
        ('Extra Salad', 15),
        ('Pickle', 10),
        ('Papad', 15)
    ]
    
    # Restaurant data with real Bangladeshi restaurants
    restaurants_data = [
        {
            'owner_email': 'kacchi@bhai.com',
            'owner_name': 'Rafiq Ahmed',
            'password': 'kacchi123',
            'restaurant': {
                'name': 'Kacchi Bhai',
                'cuisine': 'Traditional Bangladeshi Biriyani',
                'address': 'Dhanmondi 27, Dhaka 1209, Bangladesh',
                'lat': 23.7465,
                'lng': 90.3763,
                'prep_time_minutes': 35
            },
            'foods': [
                ('Kacchi Biriyani (Mutton)', 'Biriyani', 450, 'Authentic Dhaka style kacchi biriyani with tender mutton, basmati rice and traditional spices', True, 25),
                ('Kacchi Biriyani (Beef)', 'Biriyani', 420, 'Traditional beef kacchi biriyani with aromatic rice and special masala', True, 30),
                ('Chicken Biriyani', 'Biriyani', 350, 'Flavorful chicken biriyani with long grain rice and homemade spices', True, 35),
                ('Borhani', 'Drinks', 45, 'Traditional spiced yogurt drink perfect with biriyani', True, 50),
                ('Firni', 'Dessert', 85, 'Creamy rice pudding with cardamom and pistachios', True, 20),
                ('Shami Kebab', 'Kebab', 180, 'Soft minced meat kebabs with traditional spices', True, 15)
            ]
        },
        {
            'owner_email': 'star@kabab.com',
            'owner_name': 'Karim Uddin',
            'password': 'star123',
            'restaurant': {
                'name': 'Star Kabab & Restaurant',
                'cuisine': 'Bangladeshi Kebab & Curry',
                'address': 'Bailey Road, Dhaka 1000, Bangladesh',
                'lat': 23.7367,
                'lng': 90.3956,
                'prep_time_minutes': 25
            },
            'foods': [
                ('Seekh Kebab', 'Kebab', 220, 'Grilled minced meat skewers with onions and spices', True, 20),
                ('Chicken Tikka', 'Kebab', 280, 'Marinated chicken pieces grilled to perfection', True, 18),
                ('Beef Rezala', 'Curry', 320, 'Rich and creamy beef curry with yogurt and spices', True, 12),
                ('Chicken Roast', 'Chicken', 350, 'Spicy roasted chicken with traditional masala', True, 15),
                ('Naan', 'Snacks', 25, 'Soft leavened bread baked in tandoor', True, 40),
                ('Laccha Paratha', 'Snacks', 35, 'Flaky layered flatbread', True, 30),
                ('Mint Lassi', 'Drinks', 65, 'Refreshing yogurt drink with mint', True, 25)
            ]
        },
        {
            'owner_email': 'haji@biriyani.com',
            'owner_name': 'Haji Mohammad Ali',
            'password': 'haji123',
            'restaurant': {
                'name': 'Haji Biriyani',
                'cuisine': 'Authentic Dhaka Biriyani',
                'address': 'Nazira Bazar, Old Dhaka, Bangladesh',
                'lat': 23.7104,
                'lng': 90.4074,
                'prep_time_minutes': 40
            },
            'foods': [
                ('Special Mutton Biriyani', 'Biriyani', 480, 'Premium mutton biriyani with saffron and dry fruits', True, 20),
                ('Chicken Biriyani', 'Biriyani', 380, 'Classic chicken biriyani with aromatic spices', True, 25),
                ('Beef Tehari', 'Biriyani', 350, 'Traditional beef tehari with potatoes', True, 22),
                ('Mutton Curry', 'Curry', 420, 'Rich mutton curry with traditional spices', True, 15),
                ('Chicken Korma', 'Curry', 320, 'Mild chicken curry in creamy sauce', True, 18),
                ('Doi (Yogurt)', 'Dessert', 40, 'Fresh homemade yogurt', True, 30),
                ('Cha (Tea)', 'Drinks', 15, 'Traditional milk tea with spices', True, 50)
            ]
        },
        {
            'owner_email': 'fakruddin@restaurant.com',
            'owner_name': 'Fakruddin Ahmed',
            'password': 'fakruddin123',
            'restaurant': {
                'name': 'Fakruddin Biriyani',
                'cuisine': 'Traditional Biriyani House',
                'address': 'Purana Paltan, Dhaka 1000, Bangladesh',
                'lat': 23.7367,
                'lng': 90.4125,
                'prep_time_minutes': 30
            },
            'foods': [
                ('Hyderabadi Biriyani', 'Biriyani', 420, 'Hyderabadi style biriyani with tender meat and fragrant rice', True, 28),
                ('Chicken Biriyani', 'Biriyani', 350, 'Traditional chicken biriyani with basmati rice', True, 32),
                ('Mutton Biriyani', 'Biriyani', 450, 'Succulent mutton biriyani with aromatic spices', True, 25),
                ('Chicken Roast', 'Chicken', 280, 'Spicy chicken roast with onions', True, 20),
                ('Beef Bhuna', 'Curry', 380, 'Slow-cooked beef in thick gravy', True, 15),
                ('Polao', 'Biriyani', 180, 'Fragrant rice pilaf with whole spices', True, 35),
                ('Borhani', 'Drinks', 50, 'Spiced buttermilk drink', True, 40)
            ]
        },
        {
            'owner_email': 'chillox@restaurant.com',
            'owner_name': 'Rashid Hassan',
            'password': 'chillox123',
            'restaurant': {
                'name': 'Chillox',
                'cuisine': 'Modern Bangladeshi Cuisine',
                'address': 'Gulshan 2, Dhaka 1212, Bangladesh',
                'lat': 23.7925,
                'lng': 90.4078,
                'prep_time_minutes': 20
            },
            'foods': [
                ('Beef Burger', 'Snacks', 320, 'Juicy beef patty with fresh vegetables and special sauce', False, 25),
                ('Chicken Burger', 'Snacks', 280, 'Grilled chicken breast with lettuce and mayo', False, 30),
                ('Fried Chicken', 'Chicken', 250, 'Crispy fried chicken pieces with spices', False, 22),
                ('Chicken Wings', 'Chicken', 220, 'Spicy chicken wings with BBQ sauce', False, 28),
                ('French Fries', 'Snacks', 120, 'Golden crispy potato fries', True, 40),
                ('Chocolate Shake', 'Drinks', 180, 'Rich chocolate milkshake', True, 20),
                ('Mango Juice', 'Drinks', 85, 'Fresh mango juice', True, 25)
            ]
        },
        {
            'owner_email': 'panjabi@restaurant.com',
            'owner_name': 'Salim Khan',
            'password': 'panjabi123',
            'restaurant': {
                'name': 'Panjabi Restaurant',
                'cuisine': 'North Indian & Bangladeshi',
                'address': 'Elephant Road, Dhaka 1205, Bangladesh',
                'lat': 23.7389,
                'lng': 90.3944,
                'prep_time_minutes': 25
            },
            'foods': [
                ('Butter Chicken', 'Curry', 380, 'Creamy tomato-based chicken curry', False, 18),
                ('Chicken Karahi', 'Curry', 350, 'Spicy chicken cooked in wok with tomatoes', False, 20),
                ('Mutton Karahi', 'Curry', 420, 'Tender mutton in spicy tomato gravy', True, 15),
                ('Dal Fry', 'Vegetarian', 180, 'Spiced lentil curry', True, 25),
                ('Garlic Naan', 'Snacks', 45, 'Naan bread with garlic and herbs', True, 35),
                ('Basmati Rice', 'Biriyani', 120, 'Steamed basmati rice', True, 50),
                ('Mango Kulfi', 'Dessert', 95, 'Traditional frozen dessert with mango', True, 15)
            ]
        },
        {
            'owner_email': 'bhojohori@manna.com',
            'owner_name': 'Abdur Rahman',
            'password': 'bhojohori123',
            'restaurant': {
                'name': 'Bhojohori Manna',
                'cuisine': 'Traditional Bengali Cuisine',
                'address': 'Dhanmondi 8/A, Dhaka 1209, Bangladesh',
                'lat': 23.7489,
                'lng': 90.3789,
                'prep_time_minutes': 30
            },
            'foods': [
                ('Hilsa Fish Curry', 'Fish', 450, 'Traditional Bengali hilsa fish in mustard curry', True, 12),
                ('Rui Fish Curry', 'Fish', 320, 'Rohu fish curry with Bengali spices', True, 15),
                ('Prawn Malai Curry', 'Fish', 480, 'Prawns in coconut milk curry', False, 18),
                ('Chicken Curry', 'Curry', 280, 'Home-style Bengali chicken curry', True, 20),
                ('Aloo Posto', 'Vegetarian', 180, 'Potatoes in poppy seed paste', True, 25),
                ('Steamed Rice', 'Biriyani', 80, 'Plain steamed rice', True, 60),
                ('Mishti Doi', 'Dessert', 65, 'Sweet yogurt dessert', True, 20),
                ('Rasgulla', 'Dessert', 45, 'Spongy cottage cheese balls in syrup', True, 25)
            ]
        }
    ]
    
    # Create restaurants and their foods
    for restaurant_data in restaurants_data:
        try:
            # Create or get user
            user, created = User.objects.get_or_create(
                email=restaurant_data['owner_email'],
                defaults={
                    'username': restaurant_data['owner_email'],
                    'first_name': restaurant_data['owner_name'].split()[0],
                    'last_name': ' '.join(restaurant_data['owner_name'].split()[1:]),
                    'role': 'restaurant'
                }
            )
            
            if created:
                user.set_password(restaurant_data['password'])
                user.save()
                print(f"✅ Created user: {restaurant_data['owner_name']} ({restaurant_data['owner_email']})")
            
            # Create or update restaurant
            restaurant, created = Restaurant.objects.get_or_create(
                owner=user,
                defaults=restaurant_data['restaurant']
            )
            
            if created:
                print(f"🏪 Created restaurant: {restaurant.name}")
            else:
                # Update existing restaurant
                for key, value in restaurant_data['restaurant'].items():
                    setattr(restaurant, key, value)
                restaurant.save()
                print(f"🔄 Updated restaurant: {restaurant.name}")
            
            # Create addons for this restaurant
            restaurant_addons = []
            for addon_name, price in addon_data:
                addon, created = Addon.objects.get_or_create(
                    name=addon_name,
                    restaurant=restaurant,
                    defaults={'price': Decimal(str(price))}
                )
                restaurant_addons.append(addon)
            
            # Create foods
            for food_name, category_name, price, description, is_veg, stock in restaurant_data['foods']:
                category = categories[category_name]
                
                food, created = Food.objects.get_or_create(
                    name=food_name,
                    restaurant=restaurant,
                    defaults={
                        'category': category,
                        'price': Decimal(str(price)),
                        'description': description,
                        'is_veg': is_veg,
                        'stock_quantity': stock,
                        'is_available': True
                    }
                )
                
                if created:
                    # Add some random addons to each food item
                    import random
                    selected_addons = random.sample(restaurant_addons, min(3, len(restaurant_addons)))
                    food.available_addons.set(selected_addons)
                    print(f"  🍽️ Added: {food_name} - ৳{price}")
                else:
                    # Update existing food
                    food.price = Decimal(str(price))
                    food.description = description
                    food.stock_quantity = stock
                    food.is_available = True
                    food.save()
            
            print(f"✅ Completed: {restaurant.name} with {len(restaurant_data['foods'])} food items\n")
            
        except Exception as e:
            print(f"❌ Error creating {restaurant_data['restaurant']['name']}: {str(e)}")
    
    print("🎉 Bangladesh Restaurant Data Entry Complete!")
    print("\n📋 Login Credentials:")
    for restaurant_data in restaurants_data:
        print(f"   {restaurant_data['owner_email']} / {restaurant_data['password']} → {restaurant_data['restaurant']['name']}")

if __name__ == "__main__":
    create_bangladesh_restaurants()