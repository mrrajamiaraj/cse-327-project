# Addon System Guide

## Overview
The addon system has been updated to use a proper database model instead of JSON fields. This makes it much easier to manage addons through the Django admin interface.

## What Changed

### Before (JSON Field)
```python
# Had to enter JSON manually like this:
addons = [
    {"name": "Extra Cheese", "price": 50},
    {"name": "Bacon", "price": 80}
]
```
❌ Hard to manage
❌ Error-prone (typos, formatting issues)
❌ No validation

### After (Addon Model)
✅ Create addons through Django admin interface
✅ Select addons from a dropdown when creating food items
✅ Reuse addons across multiple food items
✅ Easy to update prices

## How to Use

### Step 1: Create Addons (One Time Setup)

1. Go to Django Admin: `http://localhost:8000/admin/`
2. Click on **"Addons"** under the CORE section
3. Click **"Add Addon"**
4. Fill in:
   - **Name**: e.g., "Extra Cheese"
   - **Price**: e.g., 50
   - **Restaurant**: Select the restaurant
5. Click **"Save"**

**Example Addons to Create:**
- Extra Cheese - ৳50
- Bacon - ৳80
- Avocado - ৳60
- Extra Sauce - ৳20
- Jalapeños - ৳30
- Mushrooms - ৳40

### Step 2: Assign Addons to Food Items

1. Go to **"Foods"** in Django Admin
2. Click on a food item (or create a new one)
3. Scroll to **"Available addons"** field
4. You'll see a nice interface with two boxes:
   - **Available addons** (left): All addons for this restaurant
   - **Chosen addons** (right): Selected addons for this food
5. Select addons from the left and click the arrow to move them to the right
6. Click **"Save"**

### Step 3: API Response

When customers fetch food items, they'll see:

```json
{
  "id": 1,
  "name": "Cheese Burger",
  "price": 320,
  "available_addons": [
    {
      "id": 1,
      "name": "Extra Cheese",
      "price": 50
    },
    {
      "id": 2,
      "name": "Bacon",
      "price": 80
    }
  ]
}
```

## Benefits

### 1. Reusability
Create an addon once, use it for multiple food items:
- "Extra Cheese" can be added to burgers, pizzas, sandwiches
- Update the price once, it updates everywhere

### 2. Consistency
- All addons have the same format
- No typos or formatting errors
- Validated by Django

### 3. Easy Management
- Add/edit/delete addons through admin interface
- Filter addons by restaurant
- Search for specific addons

### 4. Better UX for Restaurant Owners
- No need to understand JSON
- Visual interface for selecting addons
- Can see all available addons at a glance

## Example Workflow

**Scenario: Pizza Restaurant**

1. **Create Common Addons:**
   - Extra Cheese - ৳50
   - Pepperoni - ৳80
   - Mushrooms - ৳40
   - Olives - ৳30
   - Extra Sauce - ৳20

2. **Create Pizza Items:**
   - **Margherita Pizza**
     - Addons: Extra Cheese, Mushrooms, Olives, Extra Sauce
   
   - **Pepperoni Pizza**
     - Addons: Extra Cheese, Pepperoni, Mushrooms, Extra Sauce
   
   - **Veggie Pizza**
     - Addons: Extra Cheese, Mushrooms, Olives, Extra Sauce

3. **Customer Orders:**
   - Customer selects "Margherita Pizza" (৳450)
   - Adds "Extra Cheese" (+৳50)
   - Adds "Mushrooms" (+৳40)
   - **Total: ৳540**

## Database Structure

```
Restaurant
    ↓
  Addon (many addons per restaurant)
    ↓
  Food ←→ Addon (many-to-many relationship)
```

## Migration Applied

The migration has already been run:
- ✅ Removed old `addons` JSON field from Food model
- ✅ Created new `Addon` model
- ✅ Added `available_addons` many-to-many field to Food model

## Notes

- Each addon belongs to one restaurant
- Each food item can have multiple addons
- The same addon can be used by multiple food items
- Addon prices are additional to the base food price
