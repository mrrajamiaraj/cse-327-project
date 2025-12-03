# Restaurant Image Display Fix

## Problem
Restaurant images (banners) were not displaying in the frontend because:
1. Backend uses `banner` field, frontend was looking for `image` field
2. Image URLs were not being constructed properly
3. Serializer wasn't returning full URLs

## Solution

### Backend Changes (core/serializers.py)

Updated `RestaurantSerializer` to return full image URLs:

```python
class RestaurantSerializer(serializers.ModelSerializer):
    banner = serializers.SerializerMethodField()
    
    def get_banner(self, obj):
        """Return full URL for banner image"""
        if obj.banner:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.banner.url)
            return obj.banner.url
        return None
```

Also updated `FoodSerializer` to return full image URLs for food items.

### Frontend Changes

**RestaurantView.jsx:**
- Fixed field names to match backend (`banner` instead of `image`)
- Fixed `cuisine` instead of `subtitle`
- Fixed `delivery_time` instead of `time`
- Simplified image handling since API now returns full URLs

**HomeScreen.jsx:**
- Simplified restaurant image handling
- API now returns full URLs, no need for manual construction

## How It Works Now

### 1. Upload Restaurant Banner
1. Go to Django Admin → Restaurants
2. Select a restaurant
3. Upload a banner image
4. Save

### 2. API Response
```json
{
  "id": 1,
  "name": "Pizza Palace",
  "banner": "http://localhost:8000/media/banners/restaurant1.jpg",
  "cuisine": "Italian",
  "rating": 4.5,
  "delivery_time": "25 min"
}
```

### 3. Frontend Display
The frontend now receives full URLs and displays them directly:
- Home screen restaurant cards show banner images
- Restaurant view page shows banner image
- Food items show their images

## Testing

### To test if images are working:

1. **Add a restaurant banner:**
   ```
   Django Admin → Restaurants → Select restaurant → Upload banner → Save
   ```

2. **Check API response:**
   ```
   http://localhost:8000/api/v1/customer/restaurants/1/
   ```
   Should return full URL like: `"banner": "http://localhost:8000/media/banners/..."`

3. **View in frontend:**
   - Home page should show restaurant images
   - Click on restaurant to see banner in restaurant view

## Media Files Configuration

Already configured in `backend/settings.py`:
```python
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
```

And in `backend/urls.py`:
```python
+ static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
```

## Fallback Images

If no banner is uploaded:
- Frontend shows a default placeholder image from Pexels
- No broken image icons

## Notes

- Images are stored in `media/banners/` directory
- Full URLs are returned by the API
- Frontend handles both uploaded images and fallback images
- Same fix applied to food item images
