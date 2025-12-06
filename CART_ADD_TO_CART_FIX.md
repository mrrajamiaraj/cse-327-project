# Cart "Add to Cart" Fix

## Issues Fixed

### 1. Items Not Being Added to Cart
**Problem:** When creating a new cart item, the quantity wasn't being set
**Solution:** Added explicit quantity assignment for new items

**Before:**
```python
item, created = CartItem.objects.get_or_create(cart=cart, food=food)
if not created:
    item.quantity += request.data.get('quantity', 1)
# If created=True, quantity was never set!
```

**After:**
```python
item, created = CartItem.objects.get_or_create(cart=cart, food=food)
if created:
    item.quantity = request.data.get('quantity', 1)  # Set initial quantity
else:
    item.quantity += request.data.get('quantity', 1)  # Increase existing
```

### 2. Cart Quantity Update Not Working
**Problem:** No backend endpoint to update cart item quantities
**Solution:** Added `update_item` and `remove_item` actions to CartViewSet

**New Endpoints:**
```
PATCH  /api/v1/customer/cart/{id}/update_item/  # Update quantity
DELETE /api/v1/customer/cart/{id}/remove_item/  # Remove item
```

### 3. Better Error Handling
**Problem:** Generic error messages
**Solution:** Added detailed error messages and logging

## Changes Made

### Backend (core/views.py)

#### 1. Fixed Cart Item Creation
```python
def create(self, request):
    cart, _ = Cart.objects.get_or_create(user=request.user)
    food = get_object_or_404(Food, id=request.data['food_id'])
    item, created = CartItem.objects.get_or_create(cart=cart, food=food)
    
    if created:
        # New item - set initial quantity
        item.quantity = request.data.get('quantity', 1)
    else:
        # Existing item - increase quantity
        item.quantity += request.data.get('quantity', 1)
    
    item.variants = request.data.get('variants', [])
    item.addons = request.data.get('addons', [])
    item.save()
    return Response(CartSerializer(cart).data)
```

#### 2. Added Update Item Endpoint
```python
@action(detail=True, methods=['patch'])
def update_item(self, request, pk=None):
    """Update cart item quantity"""
    cart_item = get_object_or_404(CartItem, id=pk, cart__user=request.user)
    quantity = request.data.get('quantity', cart_item.quantity)
    
    if quantity < 1:
        cart_item.delete()
        return Response({'message': 'Item removed'})
    
    cart_item.quantity = quantity
    cart_item.save()
    return Response(CartItemSerializer(cart_item).data)
```

#### 3. Added Remove Item Endpoint
```python
@action(detail=True, methods=['delete'])
def remove_item(self, request, pk=None):
    """Remove item from cart"""
    cart_item = get_object_or_404(CartItem, id=pk, cart__user=request.user)
    cart_item.delete()
    return Response({'message': 'Item removed'})
```

### Frontend

#### 1. RestaurantView.jsx - Better Feedback
```javascript
const handleAddToCart = async (foodId) => {
  try {
    const response = await api.post('customer/cart/', {
      food_id: foodId,
      quantity: 1,
      variants: [],
      addons: []
    });
    console.log("Item added to cart:", response.data);
    alert("✓ Added to cart!");
  } catch (error) {
    console.error("Error adding to cart:", error);
    const errorMsg = error.response?.data?.error || "Failed to add to cart";
    alert(`Error: ${errorMsg}`);
  }
};
```

#### 2. Cart.jsx - Use Correct Endpoints
```javascript
const updateQty = async (cartItemId, newQuantity) => {
  if (newQuantity < 1) {
    // Remove item if quantity is 0
    await api.delete(`customer/cart/${cartItemId}/remove_item/`);
    fetchCart();
    return;
  }
  
  // Update quantity
  await api.patch(`customer/cart/${cartItemId}/update_item/`, { 
    quantity: newQuantity 
  });
  fetchCart();
};
```

## How It Works Now

### Adding Items to Cart

**Scenario 1: New Item**
1. User clicks "Add to Cart" on Pizza (₹450)
2. Backend creates CartItem with quantity=1
3. Cart now has: Pizza x1
4. User sees "✓ Added to cart!" message

**Scenario 2: Existing Item**
1. User clicks "Add to Cart" on Pizza again
2. Backend finds existing CartItem
3. Increases quantity: 1 + 1 = 2
4. Cart now has: Pizza x2
5. User sees "✓ Added to cart!" message

### Updating Quantities

**Increase Quantity:**
1. User clicks + button
2. Frontend calls: `PATCH /cart/1/update_item/` with `{quantity: 3}`
3. Backend updates CartItem.quantity = 3
4. Frontend refreshes cart
5. Display updates to show x3

**Decrease Quantity:**
1. User clicks - button
2. If quantity > 1: Updates quantity
3. If quantity = 0: Removes item from cart
4. Frontend refreshes cart

## API Endpoints

### Cart Management
```
GET    /api/v1/customer/cart/                    # Get cart
POST   /api/v1/customer/cart/                    # Add item
PATCH  /api/v1/customer/cart/{id}/update_item/   # Update quantity
DELETE /api/v1/customer/cart/{id}/remove_item/   # Remove item
DELETE /api/v1/customer/cart/clear/              # Clear cart
```

### Request/Response Examples

**Add to Cart:**
```javascript
POST /api/v1/customer/cart/
{
  "food_id": 5,
  "quantity": 1,
  "variants": [],
  "addons": []
}

Response:
{
  "id": 1,
  "items": [...],
  "subtotal": 450,
  "delivery_fee": 5.00,
  "total": 455.00
}
```

**Update Quantity:**
```javascript
PATCH /api/v1/customer/cart/1/update_item/
{
  "quantity": 3
}

Response:
{
  "id": 1,
  "food": {...},
  "quantity": 3,
  "variants": [],
  "addons": []
}
```

## Testing

### Test 1: Add New Item
1. Browse to restaurant
2. Click "Add to Cart" on any food item
3. Should see "✓ Added to cart!" alert
4. Go to cart
5. Should see item with quantity 1

### Test 2: Add Existing Item
1. Add same item again
2. Should see "✓ Added to cart!" alert
3. Go to cart
4. Should see item with quantity 2

### Test 3: Update Quantity
1. In cart, click + button
2. Quantity should increase
3. Total should update
4. Click - button
5. Quantity should decrease

### Test 4: Remove Item
1. In cart, decrease quantity to 0
2. Item should be removed
3. Cart should refresh

## Benefits

1. **Items Actually Add:** Fixed the core issue
2. **Quantity Management:** Proper increase/decrease
3. **Better UX:** Clear feedback messages
4. **Error Handling:** Detailed error messages
5. **Consistent State:** Cart always reflects backend

## Notes

- Cart items are user-specific
- Quantities must be >= 1
- Setting quantity to 0 removes the item
- All changes persist in database
- Cart refreshes after each operation
