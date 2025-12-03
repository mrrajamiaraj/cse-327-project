# Restaurant Rating and Delivery Time Changes

## Overview
Updated the restaurant system to make ratings and delivery times more realistic and user-centric.

## Changes Made

### 1. Rating System
**Before:** Restaurant owners could set their own rating (0-5 stars)
**After:** Rating is automatically calculated from customer reviews

#### How it works:
- The `rating` field has been removed from the Restaurant model
- A new method `get_average_rating()` calculates the average from all Review objects
- Returns 0.0 if no reviews exist yet
- Automatically updates as customers leave reviews after orders

#### Example:
```python
restaurant = Restaurant.objects.get(id=1)
rating = restaurant.get_average_rating()  # Returns 4.5 if average of reviews is 4.5
```

### 2. Delivery Time Calculation
**Before:** Restaurant owners set a static delivery time string (e.g., "25 min")
**After:** Delivery time is dynamically calculated based on:
- Distance between restaurant and customer
- Restaurant's preparation time
- Estimated travel time (assuming 30 km/h average speed)

#### How it works:
- The `delivery_time` field has been removed from the Restaurant model
- A new field `prep_time_minutes` stores the restaurant's average food preparation time (default: 20 minutes)
- A new method `calculate_delivery_time(customer_lat, customer_lng)` uses the Haversine formula to calculate distance
- Formula: `Total Time = Prep Time + (Distance / 30 km/h)`

#### Example:
```python
restaurant = Restaurant.objects.get(id=1)
# Customer is 5km away
delivery_time = restaurant.calculate_delivery_time(23.8151, 90.4277)
# Returns "30 min" (20 min prep + 10 min travel)
```

### 3. API Changes
The RestaurantSerializer now includes:
- `rating` (read-only): Calculated from reviews
- `delivery_time` (read-only): Calculated based on user's default address
- `prep_time_minutes` (editable): Restaurant can set their average prep time

#### API Response Example:
```json
{
  "id": 1,
  "name": "Spicy Restaurant",
  "cuisine": "Fast Food",
  "rating": 4.5,
  "delivery_time": "28 min",
  "prep_time_minutes": 20,
  "lat": 23.8103,
  "lng": 90.4125
}
```

## Migration
Run these commands to apply the changes:
```bash
python manage.py makemigrations
python manage.py migrate
```

## Benefits
1. **Trustworthy Ratings**: Customers see real ratings from other customers, not self-reported ratings
2. **Accurate Delivery Times**: Customers get realistic delivery estimates based on their actual location
3. **Better User Experience**: More transparent and reliable information
4. **Fair Competition**: Restaurants can't artificially inflate their ratings

## Notes
- Existing restaurants will have a rating of 0.0 until they receive reviews
- Restaurant owners can still set their `prep_time_minutes` to reflect their kitchen's efficiency
- Delivery time calculation assumes 30 km/h average speed (can be adjusted if needed)
