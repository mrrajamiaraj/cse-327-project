# Cart Backend Integration

## Overview
Connected the frontend cart with the backend API to enable real-time cart management across the application.

## Changes Made

### 1. Cart Page (`frontend/src/pages/Cart.jsx`)

**Before:** Static mock data with hardcoded items
**After:** Dynamic data from backend API

#### Features Implemented:
- ✅ Fetch cart items from backend
- ✅ Display real food items with images
- ✅ Update quantities via API
- ✅ Show delivery address from user's default address
- ✅ Calculate subtotal, delivery fee, and total
- ✅ Handle empty cart state
- ✅ Loading state while fetching data

#### API Endpoints Used:
```javascript
GET  /api/v1/customer/cart/          // Fetch cart
PATCH /api/v1/customer/cart/{id}/    // Update item quantity
GET  /api/v1/customer/addresses/     // Fetch delivery address
```

### 2. Home Screen Cart Badge (`frontend/src/pages/HomeScreen.jsx`)

**Before:** Static badge showing "2"
**After:** Dynamic badge showing actual cart item count

#### Features:
- ✅ Fetches cart count on page load
- ✅ Shows badge only when cart has items
- ✅ Updates automatically when cart changes

## Backend API Structure

### Cart Response Format:
```json
{
  "id": 1,
  "items": [
    {
      "id": 1,
      "food": {
        "id": 5,
        "name": "Margherita Pizza",
        "price": 450,
        "image": "http://localhost:8000/media/foods/pizza.jpg"
      },
      "quantity": 2,
      "variants": [],
      "addons": []
    }
  ],
  "subtotal": 900,
  "delivery_fee": 5.00,
  "total": 905.00
}
```

## User Flow

### Adding Items to Cart
1. User browses restaurants
2. Clicks "Add to Cart" on a food item
3. Item is added to backend cart via API
4. Cart badge updates automatically

### Viewing Cart
1. User clicks cart icon
2. Frontend fetches cart from backend
3. Displays all items with:
   - Food name and image
   - Price per item
   - Quantity controls
   - Subtotal per item

### Updating Quantity
1. User clicks + or - button
2. Frontend sends PATCH request to backend
3. Backend updates quantity
4. Frontend refreshes cart data
5. Total recalculates automatically

### Placing Order
1. User reviews cart
2. Checks delivery address
3. Clicks "PLACE ORDER"
4. Navigates to payment page with total

## Code Structure

### Cart.jsx
```javascript
// State Management
const [cartData, setCartData] = useState(null);
const [loading, setLoading] = useState(true);
const [defaultAddress, setDefaultAddress] = useState(null);

// Fetch cart on mount
useEffect(() => {
  fetchCart();
  fetchDefaultAddress();
}, []);

// Update quantity
const updateQty = async (cartItemId, newQuantity) => {
  await api.patch(`customer/cart/${cartItemId}/`, { quantity: newQuantity });
  fetchCart(); // Refresh
};
```

### HomeScreen.jsx
```javascript
// Cart count state
const [cartItemCount, setCartItemCount] = useState(0);

// Fetch cart count
const fetchCartCount = async () => {
  const response = await api.get('customer/cart/');
  setCartItemCount(response.data.items?.length || 0);
};

// Show badge only if items exist
{cartItemCount > 0 && (
  <div>{cartItemCount}</div>
)}
```

## Features

### Cart Page Features:
1. **Real-time Data**
   - Fetches from backend on load
   - Always shows current cart state

2. **Quantity Management**
   - Increase/decrease quantity
   - Minimum quantity: 1
   - Updates backend immediately

3. **Price Calculation**
   - Subtotal: Sum of all items
   - Delivery Fee: Fixed ৳5.00
   - Total: Subtotal + Delivery Fee

4. **Address Display**
   - Shows user's default delivery address
   - "Edit" button to change address

5. **Empty State**
   - Shows "Your cart is empty" message
   - Prevents placing order when empty

### Home Screen Features:
1. **Cart Badge**
   - Shows number of items in cart
   - Hidden when cart is empty
   - Updates on page load

2. **Cart Navigation**
   - Click cart icon to view cart
   - Badge provides visual feedback

## Error Handling

### Cart Fetch Errors:
```javascript
try {
  const response = await api.get('customer/cart/');
  setCartData(response.data);
} catch (error) {
  console.error("Error fetching cart:", error);
  // Shows empty cart state
}
```

### Quantity Update Errors:
```javascript
try {
  await api.patch(`customer/cart/${cartItemId}/`, { quantity });
  fetchCart();
} catch (error) {
  console.error("Error updating quantity:", error);
  // Cart remains unchanged
}
```

## Testing

### Test Scenario 1: View Cart
1. Add items to cart from restaurant page
2. Navigate to cart
3. Should see all added items
4. Should show correct prices and quantities
5. Should display delivery address

### Test Scenario 2: Update Quantity
1. Open cart with items
2. Click + button on an item
3. Quantity should increase
4. Total should update
5. Backend should be updated

### Test Scenario 3: Empty Cart
1. Open cart with no items
2. Should see "Your cart is empty" message
3. "PLACE ORDER" button should show alert

### Test Scenario 4: Cart Badge
1. Add items to cart
2. Go to home page
3. Cart badge should show correct count
4. Badge should be hidden if cart is empty

## Benefits

1. **Data Persistence**
   - Cart saved in backend database
   - Survives page refreshes
   - Accessible across devices

2. **Real-time Updates**
   - Changes reflect immediately
   - Consistent across all pages
   - No data loss

3. **Better UX**
   - Loading states
   - Error handling
   - Empty state messaging
   - Visual feedback

4. **Scalability**
   - Can add more features (remove items, clear cart)
   - Easy to extend
   - Follows REST API patterns

## Future Enhancements

Possible improvements:
- Remove individual items
- Clear entire cart
- Save for later
- Apply coupons/discounts
- Show estimated delivery time
- Add special instructions per item
- Show restaurant info in cart
- Validate stock availability

## API Endpoints Reference

### Cart Management:
```
GET    /api/v1/customer/cart/              # Get cart
POST   /api/v1/customer/cart/              # Add item
PATCH  /api/v1/customer/cart/{id}/         # Update item
DELETE /api/v1/customer/cart/clear/        # Clear cart
```

### Related Endpoints:
```
GET    /api/v1/customer/addresses/         # Get addresses
POST   /api/v1/customer/checkout/          # Place order
```

## Notes

- Cart is user-specific (requires authentication)
- Delivery fee is currently fixed at ৳5.00
- Cart automatically created on first item add
- Quantities must be >= 1
- Images fallback to placeholder if not available
- Address defaults to user's default address
