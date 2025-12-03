# Categories Page Feature

## Overview
Added a dedicated "All Categories" page that displays all food categories in a grid layout.

## What Was Added

### 1. New Categories Page (`frontend/src/pages/Categories.jsx`)

**Features:**
- Grid layout showing all categories (3 columns)
- Category icons with fallback emoji
- Click on any category to filter restaurants on home page
- Back button to return to home
- Hover effects for better UX
- Responsive design

**Layout:**
```
┌─────────────────────────────┐
│  ← All Categories           │
├─────────────────────────────┤
│  🍕      🍔      🍝         │
│ Pizza   Burger  Pasta       │
│                             │
│  🥗      🍱      🍣         │
│ Salad   Rice    Sushi       │
│                             │
│  🍰      🥤      🍗         │
│Dessert  Drinks  Chicken     │
└─────────────────────────────┘
```

### 2. Updated HomeScreen

**Changes:**
- "See All" button now navigates to `/categories` instead of `/search`
- Added support for receiving selected category from Categories page
- When user selects a category, they're redirected back to home with that category active

### 3. Updated App.jsx

**Added Route:**
```jsx
<Route path="/categories" element={<Categories />} />
```

## User Flow

### Scenario 1: Browse All Categories
1. User is on Home screen
2. Clicks "See All >" next to "All Categories"
3. Navigates to Categories page
4. Sees all 20+ categories in a grid
5. Clicks back button to return to home

### Scenario 2: Filter by Category
1. User is on Home screen
2. Clicks "See All >" next to "All Categories"
3. Navigates to Categories page
4. Clicks on "Pizza" category
5. Redirected back to Home screen
6. "Pizza" category is now active
7. Only restaurants with Pizza items are shown

## Features

### Visual Design
- **Grid Layout**: 3 columns for easy browsing
- **Category Icons**: Shows uploaded icons or fallback emoji
- **Hover Effects**: Cards lift and highlight on hover
- **Smooth Transitions**: All interactions are animated
- **Consistent Styling**: Matches the app's design system

### Interaction
- **Click to Filter**: Clicking a category filters restaurants
- **Back Navigation**: Easy return to previous page
- **State Management**: Selected category persists when returning to home

### Responsive
- Works on all screen sizes
- Grid adjusts for mobile devices
- Touch-friendly tap targets

## API Integration

**Endpoint Used:**
```
GET /api/v1/customer/home/
```

**Response:**
```json
{
  "categories": [
    {
      "id": 1,
      "name": "Pizza",
      "icon": "http://localhost:8000/media/categories/pizza.png"
    },
    {
      "id": 2,
      "name": "Burger",
      "icon": "http://localhost:8000/media/categories/burger.png"
    }
  ]
}
```

## Categories Available

The system includes 20+ categories:
- Pizza
- Burger
- Pasta
- Salad
- Sandwich
- Sushi
- Dessert
- Drinks
- Appetizer
- Rice
- Noodles
- Chicken
- Seafood
- Vegetarian
- BBQ
- Soup
- Breakfast
- Biryani
- Curry
- Kebab

## Code Structure

### Categories.jsx
```jsx
- Fetches categories from API
- Displays in 3-column grid
- Handles category selection
- Navigates back to home with selected category
```

### HomeScreen.jsx
```jsx
- Receives selected category from navigation state
- Updates active category
- Filters restaurants accordingly
```

## Styling

**Colors:**
- Background: `#f3f3f3`
- Card Background: `#fff`
- Hover Border: `#ff7a00` (orange)
- Text: `#222` (dark gray)

**Spacing:**
- Grid gap: 16px
- Card padding: 16px 8px
- Border radius: 20px

## Benefits

1. **Better Discovery**: Users can see all available categories at once
2. **Easy Navigation**: One tap to filter by category
3. **Visual Appeal**: Grid layout is more engaging than horizontal scroll
4. **Scalability**: Easy to add more categories as the platform grows
5. **User-Friendly**: Clear visual hierarchy and intuitive interactions

## Testing

### To Test:
1. Start the frontend: `npm run dev` (in frontend folder)
2. Navigate to Home screen
3. Click "See All >" next to "All Categories"
4. Should see Categories page with all categories
5. Click on any category (e.g., "Pizza")
6. Should return to Home with Pizza category active
7. Should see only restaurants with Pizza items

## Future Enhancements

Possible improvements:
- Search within categories
- Category descriptions
- Number of restaurants per category
- Favorite categories
- Recently viewed categories
- Category-specific banners
