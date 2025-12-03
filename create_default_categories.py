"""
Script to create default food categories
Run this with: python manage.py shell < create_default_categories.py
"""

from core.models import Category

# Common food categories
categories = [
    {"name": "Pizza", "description": "Italian flatbread with toppings"},
    {"name": "Burger", "description": "Sandwiches with patties"},
    {"name": "Pasta", "description": "Italian noodle dishes"},
    {"name": "Salad", "description": "Fresh vegetable dishes"},
    {"name": "Sandwich", "description": "Bread with fillings"},
    {"name": "Sushi", "description": "Japanese rice dishes"},
    {"name": "Dessert", "description": "Sweet treats"},
    {"name": "Drinks", "description": "Beverages"},
    {"name": "Appetizer", "description": "Starters and snacks"},
    {"name": "Rice", "description": "Rice-based dishes"},
    {"name": "Noodles", "description": "Noodle dishes"},
    {"name": "Chicken", "description": "Chicken-based dishes"},
    {"name": "Seafood", "description": "Fish and seafood"},
    {"name": "Vegetarian", "description": "Plant-based dishes"},
    {"name": "BBQ", "description": "Grilled and barbecued items"},
    {"name": "Soup", "description": "Hot liquid dishes"},
    {"name": "Breakfast", "description": "Morning meals"},
    {"name": "Biryani", "description": "Spiced rice dishes"},
    {"name": "Curry", "description": "Sauce-based dishes"},
    {"name": "Kebab", "description": "Grilled meat skewers"},
]

created_count = 0
existing_count = 0

for cat_data in categories:
    category, created = Category.objects.get_or_create(
        name=cat_data["name"],
        defaults={"description": cat_data["description"]}
    )
    if created:
        created_count += 1
        print(f"✓ Created: {category.name}")
    else:
        existing_count += 1
        print(f"- Already exists: {category.name}")

print(f"\n✅ Done! Created {created_count} new categories, {existing_count} already existed.")
print(f"Total categories: {Category.objects.count()}")
