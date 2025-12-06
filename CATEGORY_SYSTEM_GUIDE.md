# Global Category System Guide

## Overview
Categories are now **global** and shared across all restaurants. This means:
- ✅ All restaurants use the same category list (Pizza, Burger, Pasta, etc.)
- ✅ Consistent categorization across the platform
- ✅ Better search and filtering for customers
- ✅ Easier for restaurant owners (just select from existing categories)

## What Changed

### Before (Restaurant-Specific Categories)
```
Restaurant A creates: "Pizza", "Burger"
Restaurant B creates: "Pizza", "Burgers" (typo!)
Restaurant C creates: "Pizzas" (plural!)
```
❌ Inconsistent naming
❌ Duplicate categories
❌ Hard to filter/search

### After (Global Categories)
```
Global Categories: Pizza, Burger, Pasta, Salad, etc.
All restaurants select from the same list
```
✅ Consistent across all restaurants
✅ No duplicates
✅ Easy filtering and search

## Default Categories Created

The system now includes 20+ common food categories:

1. **Pizza** - Italian flatbread with toppings
2. **Burger** - Sandwiches with patties
3. **Pasta** - Italian noodle dishes
4. **Salad** - Fresh vegetable dishes
5. **Sandwich** - Bread with fillings
6. **Sushi** - Japanese rice dishes
7. **Dessert** - Sweet treats
8. **Drinks** - Beverages
9. **Appetizer** - Starters and snacks
10. **Rice** - Rice-based dishes
11. **Noodles** - Noodle dishes
12. **Chicken** - Chicken-based dishes
13. **Seafood** - Fish and seafood
14. **Vegetarian** - Plant-based dishes
15. **BBQ** - Grilled and barbecued items
16. **Soup** - Hot liquid dishes
17. **Breakfast** - Morning meals
18. **Biryani** - Spiced rice dishes
19. **Curry** - Sauce-based dishes
20. **Kebab** - Grilled meat skewers

## How to Use

### For Restaurant Owners

#### Adding Food Items:
1. Go to Django Admin → Foods → Add Food
2. Fill in food details (name, description, price, etc.)
3. In the **Category** dropdown, select from existing categories
4. Save

**Example:**
- Food: "Margherita Pizza"
- Category: Select "Pizza" from dropdown
- Restaurant: Your restaurant
- Price: ৳450

### For Admins

#### Adding New Categories:
1. Go to Django Admin → Categories → Add Category
2. Enter:
   - **Name**: e.g., "Tacos"
   - **Description**: e.g., "Mexican folded tortillas"
   - **Icon**: Upload an icon (optional)
3. Save

The new category is now available to ALL restaurants!

#### Editing Categories:
1. Go to Categories → Click on a category
2. Update name, description, or icon
3. Save
4. Changes apply to all restaurants using this category

## Benefits

### 1. Consistency
All restaurants use the same category names:
- No "Pizza" vs "Pizzas" vs "Pizza Items"
- Standardized across the platform

### 2. Better Search & Filtering
Customers can filter by category:
- "Show me all Pizza restaurants"
- "Find Burger places near me"
- Works perfectly because all restaurants use the same categories

### 3. Easier for Restaurant Owners
- No need to create categories
- Just select from existing list
- Focus on adding food items

### 4. Platform Growth
- Add new categories as the platform grows
- All restaurants can immediately use them
- Maintain consistency

## Example Scenarios

### Scenario 1: Pizza Restaurant
**Restaurant: "Pizza Palace"**

Foods:
- Margherita Pizza → Category: **Pizza**
- Pepperoni Pizza → Category: **Pizza**
- Caesar Salad → Category: **Salad**
- Garlic Bread → Category: **Appetizer**
- Coke → Category: **Drinks**

### Scenario 2: Multi-Cuisine Restaurant
**Restaurant: "Food Hub"**

Foods:
- Cheese Burger → Category: **Burger**
- Chicken Biryani → Category: **Biryani**
- Pad Thai → Category: **Noodles**
- Mango Lassi → Category: **Drinks**
- Chocolate Cake → Category: **Dessert**

### Scenario 3: Customer Search
**Customer wants Pizza:**
1. Filters by "Pizza" category
2. Sees ALL restaurants that have Pizza items:
   - Pizza Palace (5 pizza items)
   - Food Hub (2 pizza items)
   - Italian Corner (8 pizza items)

## API Response

### Get All Categories
```json
GET /api/categories/

[
  {
    "id": 1,
    "name": "Pizza",
    "description": "Italian flatbread with toppings",
    "icon": "/media/categories/pizza.png"
  },
  {
    "id": 2,
    "name": "Burger",
    "description": "Sandwiches with patties",
    "icon": "/media/categories/burger.png"
  }
]
```

### Food Item with Category
```json
GET /api/foods/1/

{
  "id": 1,
  "name": "Margherita Pizza",
  "restaurant": 1,
  "category": {
    "id": 1,
    "name": "Pizza",
    "icon": "/media/categories/pizza.png"
  },
  "price": 450
}
```

## Database Structure

```
Category (Global)
  ├── Pizza
  ├── Burger
  └── Pasta

Restaurant A
  └── Food: Margherita Pizza → Category: Pizza

Restaurant B
  └── Food: Cheese Burger → Category: Burger

Restaurant C
  ├── Food: Pepperoni Pizza → Category: Pizza
  └── Food: Beef Burger → Category: Burger
```

## Migration Applied

✅ Removed `restaurant` field from Category model
✅ Made category names unique
✅ Added description field
✅ Created 20 default categories

## Notes

- Categories are managed by admins
- Restaurant owners can only SELECT categories, not create them
- If you need a new category, contact an admin
- Category names must be unique
- All restaurants share the same category list
