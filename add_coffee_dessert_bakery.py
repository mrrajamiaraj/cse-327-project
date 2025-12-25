#!/usr/bin/env python3
"""
Add Coffee Shops, Dessert Shops, and Bakeries to the database
"""
import os
import django
from django.contrib.auth.hashers import make_password

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from core.models import User, Restaurant, Category, Food

def create_categories():
    """Create food categories for coffee shops, desserts, and bakeries"""
    categories = [
        {'name': 'Coffee', 'description': 'Hot and cold coffee beverages'},
        {'name': 'Tea', 'description': 'Various tea options'},
        {'name': 'Pastries', 'description': 'Fresh baked pastries'},
        {'name': 'Cakes', 'description': 'Delicious cakes and cupcakes'},
        {'name': 'Cookies', 'description': 'Fresh baked cookies'},
        {'name': 'Bread', 'description': 'Fresh bread and rolls'},
        {'name': 'Ice Cream', 'description': 'Cold desserts and ice cream'},
        {'name': 'Smoothies', 'description': 'Fresh fruit smoothies'},
    ]
    
    created_categories = {}
    for cat_data in categories:
        category, created = Category.objects.get_or_create(
            name=cat_data['name'],
            defaults={'description': cat_data['description']}
        )
        created_categories[cat_data['name']] = category
        if created:
            print(f"✅ Created category: {category.name}")
        else:
            print(f"📋 Category exists: {category.name}")
    
    return created_categories

def create_coffee_shops(categories):
    """Create coffee shop restaurants and their food items"""
    
    # Create coffee shop owners
    coffee_owners = []
    coffee_shop_data = [
        {
            'email': 'starbucks@coffee.com',
            'name': 'Starbucks Coffee',
            'cuisine': 'Coffee & Beverages',
            'description': 'Premium coffee and handcrafted beverages'
        },
        {
            'email': 'northend@coffee.com', 
            'name': 'North End Coffee Roasters',
            'cuisine': 'Artisan Coffee',
            'description': 'Locally roasted specialty coffee'
        },
        {
            'email': 'brewhouse@coffee.com',
            'name': 'The Brew House',
            'cuisine': 'Coffee & Light Bites',
            'description': 'Cozy coffee shop with fresh pastries'
        }
    ]
    
    coffee_restaurants = []
    for shop_data in coffee_shop_data:
        # Create owner user
        owner, created = User.objects.get_or_create(
            email=shop_data['email'],
            defaults={
                'password': make_password('password123'),
                'role': 'restaurant',
                'first_name': shop_data['name'].split()[0],
                'is_active': True
            }
        )
        
        # Create restaurant
        restaurant, created = Restaurant.objects.get_or_create(
            owner=owner,
            defaults={
                'name': shop_data['name'],
                'cuisine': shop_data['cuisine'],
                'address_title': 'Main Branch',
                'address_line': 'Gulshan Avenue, Dhaka',
                'area': 'Gulshan',
                'city': 'Dhaka',
                'postal_code': '1212',
                'lat': 23.8103,
                'lng': 90.4125,
                'is_approved': True,
                'prep_time_minutes': 15
            }
        )
        
        coffee_restaurants.append(restaurant)
        if created:
            print(f"☕ Created coffee shop: {restaurant.name}")
        else:
            print(f"📋 Coffee shop exists: {restaurant.name}")
    
    # Add coffee items
    coffee_items = [
        # Starbucks items
        {'restaurant': 0, 'name': 'Americano', 'category': 'Coffee', 'price': 180, 'description': 'Rich espresso with hot water'},
        {'restaurant': 0, 'name': 'Cappuccino', 'category': 'Coffee', 'price': 220, 'description': 'Espresso with steamed milk foam'},
        {'restaurant': 0, 'name': 'Latte', 'category': 'Coffee', 'price': 250, 'description': 'Smooth espresso with steamed milk'},
        {'restaurant': 0, 'name': 'Frappuccino', 'category': 'Coffee', 'price': 320, 'description': 'Blended iced coffee drink'},
        {'restaurant': 0, 'name': 'Green Tea Latte', 'category': 'Tea', 'price': 280, 'description': 'Matcha green tea with steamed milk'},
        {'restaurant': 0, 'name': 'Blueberry Muffin', 'category': 'Pastries', 'price': 150, 'description': 'Fresh baked muffin with blueberries'},
        {'restaurant': 0, 'name': 'Chocolate Croissant', 'category': 'Pastries', 'price': 180, 'description': 'Buttery croissant with chocolate'},
        
        # North End Coffee items
        {'restaurant': 1, 'name': 'Single Origin Espresso', 'category': 'Coffee', 'price': 160, 'description': 'Premium single origin coffee'},
        {'restaurant': 1, 'name': 'Cold Brew', 'category': 'Coffee', 'price': 200, 'description': 'Smooth cold brewed coffee'},
        {'restaurant': 1, 'name': 'Flat White', 'category': 'Coffee', 'price': 240, 'description': 'Double shot with microfoam milk'},
        {'restaurant': 1, 'name': 'Chai Latte', 'category': 'Tea', 'price': 220, 'description': 'Spiced tea with steamed milk'},
        {'restaurant': 1, 'name': 'Banana Smoothie', 'category': 'Smoothies', 'price': 280, 'description': 'Fresh banana and milk smoothie'},
        {'restaurant': 1, 'name': 'Almond Croissant', 'category': 'Pastries', 'price': 200, 'description': 'Flaky croissant with almond cream'},
        
        # Brew House items
        {'restaurant': 2, 'name': 'House Blend Coffee', 'category': 'Coffee', 'price': 140, 'description': 'Our signature coffee blend'},
        {'restaurant': 2, 'name': 'Iced Coffee', 'category': 'Coffee', 'price': 180, 'description': 'Refreshing iced coffee'},
        {'restaurant': 2, 'name': 'Mocha', 'category': 'Coffee', 'price': 260, 'description': 'Espresso with chocolate and milk'},
        {'restaurant': 2, 'name': 'English Breakfast Tea', 'category': 'Tea', 'price': 120, 'description': 'Classic black tea'},
        {'restaurant': 2, 'name': 'Cinnamon Roll', 'category': 'Pastries', 'price': 170, 'description': 'Sweet cinnamon pastry'},
        {'restaurant': 2, 'name': 'Chocolate Chip Cookie', 'category': 'Cookies', 'price': 80, 'description': 'Fresh baked chocolate chip cookie'},
    ]
    
    for item in coffee_items:
        restaurant = coffee_restaurants[item['restaurant']]
        category = categories[item['category']]
        
        food, created = Food.objects.get_or_create(
            restaurant=restaurant,
            name=item['name'],
            defaults={
                'category': category,
                'price': item['price'],
                'description': item['description'],
                'is_available': True,
                'stock_quantity': 50
            }
        )
        
        if created:
            print(f"  ➕ Added: {food.name} - ৳{food.price}")

def create_dessert_shops(categories):
    """Create dessert shop restaurants and their food items"""
    
    dessert_shop_data = [
        {
            'email': 'sweetdreams@dessert.com',
            'name': 'Sweet Dreams Dessert Parlor',
            'cuisine': 'Desserts & Ice Cream',
            'description': 'Premium desserts and handcrafted ice cream'
        },
        {
            'email': 'frozenyogurt@dessert.com',
            'name': 'Frozen Delight',
            'cuisine': 'Ice Cream & Frozen Treats',
            'description': 'Fresh ice cream and frozen yogurt'
        }
    ]
    
    dessert_restaurants = []
    for shop_data in dessert_shop_data:
        # Create owner user
        owner, created = User.objects.get_or_create(
            email=shop_data['email'],
            defaults={
                'password': make_password('password123'),
                'role': 'restaurant',
                'first_name': shop_data['name'].split()[0],
                'is_active': True
            }
        )
        
        # Create restaurant
        restaurant, created = Restaurant.objects.get_or_create(
            owner=owner,
            defaults={
                'name': shop_data['name'],
                'cuisine': shop_data['cuisine'],
                'address_title': 'Main Branch',
                'address_line': 'Dhanmondi Road, Dhaka',
                'area': 'Dhanmondi',
                'city': 'Dhaka',
                'postal_code': '1205',
                'lat': 23.7461,
                'lng': 90.3742,
                'is_approved': True,
                'prep_time_minutes': 20
            }
        )
        
        dessert_restaurants.append(restaurant)
        if created:
            print(f"🍨 Created dessert shop: {restaurant.name}")
        else:
            print(f"📋 Dessert shop exists: {restaurant.name}")
    
    # Add dessert items
    dessert_items = [
        # Sweet Dreams items
        {'restaurant': 0, 'name': 'Chocolate Fudge Cake', 'category': 'Cakes', 'price': 350, 'description': 'Rich chocolate cake with fudge'},
        {'restaurant': 0, 'name': 'Red Velvet Cupcake', 'category': 'Cakes', 'price': 120, 'description': 'Classic red velvet with cream cheese'},
        {'restaurant': 0, 'name': 'Vanilla Ice Cream', 'category': 'Ice Cream', 'price': 180, 'description': 'Premium vanilla ice cream'},
        {'restaurant': 0, 'name': 'Chocolate Ice Cream', 'category': 'Ice Cream', 'price': 180, 'description': 'Rich chocolate ice cream'},
        {'restaurant': 0, 'name': 'Strawberry Cheesecake', 'category': 'Cakes', 'price': 280, 'description': 'Creamy cheesecake with strawberries'},
        {'restaurant': 0, 'name': 'Tiramisu', 'category': 'Cakes', 'price': 320, 'description': 'Italian coffee-flavored dessert'},
        {'restaurant': 0, 'name': 'Mango Smoothie', 'category': 'Smoothies', 'price': 220, 'description': 'Fresh mango smoothie'},
        
        # Frozen Delight items
        {'restaurant': 1, 'name': 'Cookies & Cream Ice Cream', 'category': 'Ice Cream', 'price': 200, 'description': 'Vanilla ice cream with cookie pieces'},
        {'restaurant': 1, 'name': 'Mint Chocolate Chip', 'category': 'Ice Cream', 'price': 200, 'description': 'Mint ice cream with chocolate chips'},
        {'restaurant': 1, 'name': 'Frozen Yogurt', 'category': 'Ice Cream', 'price': 160, 'description': 'Healthy frozen yogurt'},
        {'restaurant': 1, 'name': 'Banana Split', 'category': 'Ice Cream', 'price': 380, 'description': 'Classic banana split sundae'},
        {'restaurant': 1, 'name': 'Chocolate Milkshake', 'category': 'Smoothies', 'price': 250, 'description': 'Thick chocolate milkshake'},
        {'restaurant': 1, 'name': 'Strawberry Milkshake', 'category': 'Smoothies', 'price': 250, 'description': 'Fresh strawberry milkshake'},
    ]
    
    for item in dessert_items:
        restaurant = dessert_restaurants[item['restaurant']]
        category = categories[item['category']]
        
        food, created = Food.objects.get_or_create(
            restaurant=restaurant,
            name=item['name'],
            defaults={
                'category': category,
                'price': item['price'],
                'description': item['description'],
                'is_available': True,
                'stock_quantity': 30
            }
        )
        
        if created:
            print(f"  ➕ Added: {food.name} - ৳{food.price}")

def create_bakeries(categories):
    """Create bakery restaurants and their food items"""
    
    bakery_data = [
        {
            'email': 'goldenbread@bakery.com',
            'name': 'Golden Bread Bakery',
            'cuisine': 'Fresh Baked Goods',
            'description': 'Fresh bread, pastries and baked goods daily'
        },
        {
            'email': 'artisanbakery@bakery.com',
            'name': 'Artisan Bakery & Cafe',
            'cuisine': 'Artisan Breads & Pastries',
            'description': 'Handcrafted breads and European pastries'
        }
    ]
    
    bakery_restaurants = []
    for shop_data in bakery_data:
        # Create owner user
        owner, created = User.objects.get_or_create(
            email=shop_data['email'],
            defaults={
                'password': make_password('password123'),
                'role': 'restaurant',
                'first_name': shop_data['name'].split()[0],
                'is_active': True
            }
        )
        
        # Create restaurant
        restaurant, created = Restaurant.objects.get_or_create(
            owner=owner,
            defaults={
                'name': shop_data['name'],
                'cuisine': shop_data['cuisine'],
                'address_title': 'Main Branch',
                'address_line': 'Uttara Sector 7, Dhaka',
                'area': 'Uttara',
                'city': 'Dhaka',
                'postal_code': '1230',
                'lat': 23.8759,
                'lng': 90.3795,
                'is_approved': True,
                'prep_time_minutes': 25
            }
        )
        
        bakery_restaurants.append(restaurant)
        if created:
            print(f"🥖 Created bakery: {restaurant.name}")
        else:
            print(f"📋 Bakery exists: {restaurant.name}")
    
    # Add bakery items
    bakery_items = [
        # Golden Bread Bakery items
        {'restaurant': 0, 'name': 'White Bread Loaf', 'category': 'Bread', 'price': 80, 'description': 'Fresh white bread loaf'},
        {'restaurant': 0, 'name': 'Whole Wheat Bread', 'category': 'Bread', 'price': 90, 'description': 'Healthy whole wheat bread'},
        {'restaurant': 0, 'name': 'Dinner Rolls (6 pcs)', 'category': 'Bread', 'price': 60, 'description': 'Soft dinner rolls'},
        {'restaurant': 0, 'name': 'Chocolate Chip Cookies (6 pcs)', 'category': 'Cookies', 'price': 120, 'description': 'Fresh baked chocolate chip cookies'},
        {'restaurant': 0, 'name': 'Oatmeal Cookies (6 pcs)', 'category': 'Cookies', 'price': 110, 'description': 'Healthy oatmeal cookies'},
        {'restaurant': 0, 'name': 'Danish Pastry', 'category': 'Pastries', 'price': 140, 'description': 'Flaky Danish pastry'},
        {'restaurant': 0, 'name': 'Apple Pie Slice', 'category': 'Cakes', 'price': 180, 'description': 'Classic apple pie slice'},
        
        # Artisan Bakery items
        {'restaurant': 1, 'name': 'Sourdough Bread', 'category': 'Bread', 'price': 150, 'description': 'Artisan sourdough bread'},
        {'restaurant': 1, 'name': 'Baguette', 'category': 'Bread', 'price': 120, 'description': 'French baguette'},
        {'restaurant': 1, 'name': 'Croissant', 'category': 'Pastries', 'price': 100, 'description': 'Buttery French croissant'},
        {'restaurant': 1, 'name': 'Pain au Chocolat', 'category': 'Pastries', 'price': 130, 'description': 'Chocolate filled pastry'},
        {'restaurant': 1, 'name': 'Macarons (6 pcs)', 'category': 'Cookies', 'price': 300, 'description': 'French macarons assorted flavors'},
        {'restaurant': 1, 'name': 'Eclair', 'category': 'Pastries', 'price': 160, 'description': 'Cream filled eclair'},
        {'restaurant': 1, 'name': 'Lemon Tart', 'category': 'Cakes', 'price': 200, 'description': 'Tangy lemon tart'},
    ]
    
    for item in bakery_items:
        restaurant = bakery_restaurants[item['restaurant']]
        category = categories[item['category']]
        
        food, created = Food.objects.get_or_create(
            restaurant=restaurant,
            name=item['name'],
            defaults={
                'category': category,
                'price': item['price'],
                'description': item['description'],
                'is_available': True,
                'stock_quantity': 25
            }
        )
        
        if created:
            print(f"  ➕ Added: {food.name} - ৳{food.price}")

def main():
    print("🏪 Adding Coffee Shops, Dessert Shops, and Bakeries to Database...")
    print("=" * 60)
    
    # Create categories
    print("\n📂 Creating Categories...")
    categories = create_categories()
    
    # Create coffee shops
    print("\n☕ Creating Coffee Shops...")
    create_coffee_shops(categories)
    
    # Create dessert shops
    print("\n🍨 Creating Dessert Shops...")
    create_dessert_shops(categories)
    
    # Create bakeries
    print("\n🥖 Creating Bakeries...")
    create_bakeries(categories)
    
    print("\n" + "=" * 60)
    print("🎉 Successfully added all coffee shops, dessert shops, and bakeries!")
    print("\n📊 Summary:")
    print(f"   ☕ Coffee Shops: 3")
    print(f"   🍨 Dessert Shops: 2") 
    print(f"   🥖 Bakeries: 2")
    print(f"   🍽️ Total Food Items: ~40")
    print(f"   📂 New Categories: 8")
    
    print("\n🔐 Login Credentials (all use password: password123):")
    print("   ☕ starbucks@coffee.com")
    print("   ☕ northend@coffee.com")
    print("   ☕ brewhouse@coffee.com")
    print("   🍨 sweetdreams@dessert.com")
    print("   🍨 frozenyogurt@dessert.com")
    print("   🥖 goldenbread@bakery.com")
    print("   🥖 artisanbakery@bakery.com")

if __name__ == "__main__":
    main()