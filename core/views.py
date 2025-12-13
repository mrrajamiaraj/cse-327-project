from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404
from django.contrib.auth import authenticate
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from django.db import models
from rest_framework_simplejwt.tokens import RefreshToken
from .models import *
from .serializers import *

# Auth
class RegisterView(APIView):
    permission_classes = [AllowAny]
    VALID_ROLES = ['customer', 'rider', 'restaurant', 'admin']

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")
        first_name = request.data.get("first_name", "").strip()
        phone = request.data.get("phone", "").strip()
        role = request.data.get("role", "customer")

        # Validate required fields
        if not email or not password:
            return Response({"error": "Email and password required"}, status=400)

        # Validate email format
        try:
            validate_email(email)
        except ValidationError:
            return Response({"error": "Invalid email format"}, status=400)

        # Validate password length
        if len(password) < 8:
            return Response({"error": "Password must be at least 8 characters"}, status=400)

        # Validate role
        if role not in self.VALID_ROLES:
            return Response({
                "error": f"Invalid role. Must be one of: {', '.join(self.VALID_ROLES)}"
            }, status=400)

        # Check if email already exists
        if User.objects.filter(email=email).exists():
            return Response({"error": "Email already taken"}, status=400)

        # Create user
        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
            first_name=first_name,
            phone=phone,
            role=role
        )

        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserSerializer(user).data
        }, status=201)

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        # Validate required fields
        if not email or not password:
            return Response({"error": "Email and password required"}, status=400)

        # Authenticate user
        user = authenticate(username=email, password=password)
        if user:
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': UserSerializer(user).data
            })
        
        # Return generic error for security (prevents user enumeration)
        return Response({'error': 'Invalid credentials'}, status=401)

class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user, context={'request': request})
        return Response(serializer.data)

    def put(self, request):
        # Debug: Print what we're receiving
        print("=== ProfileView PUT Debug ===")
        print("request.data:", request.data)
        print("request.FILES:", request.FILES)
        print("Avatar in FILES:", 'avatar' in request.FILES)
        
        serializer = UserSerializer(request.user, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            print("Serializer saved successfully")
            print("User avatar after save:", request.user.avatar)
            return Response(serializer.data)
        else:
            print("Serializer errors:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Customer
class HomeView(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        # Mock data for Figma home
        banners = [{'id': 1, 'image': 'banner.jpg'}]
        popular_foods = Food.objects.order_by('-id')[:5]
        nearby_restaurants = Restaurant.objects.filter(is_approved=True)[:10]  # Increased to show more restaurants
        categories = Category.objects.all()  # Return all categories
        return Response({
            'banners': banners,
            'popular_foods': FoodSerializer(popular_foods, many=True, context={'request': request}).data,
            'nearby_restaurants': RestaurantSerializer(nearby_restaurants, many=True, context={'request': request}).data,
            'categories': CategorySerializer(categories, many=True, context={'request': request}).data
        })

class RestaurantViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Restaurant.objects.filter(is_approved=True)
    serializer_class = RestaurantSerializer
    permission_classes = [IsAuthenticated]

class FoodViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Food.objects.all()
    serializer_class = FoodSerializer
    permission_classes = [IsAuthenticated]

class CartViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        from decimal import Decimal
        cart, _ = Cart.objects.get_or_create(user=request.user)
        serializer = CartSerializer(cart, context={'request': request})
        data = serializer.data
        data['delivery_fee'] = 5.00
        data['total'] = float(data['subtotal']) + data['delivery_fee']
        return Response(data)

    def create(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        food = get_object_or_404(Food, id=request.data['food_id'])
        
        # Check if food is available
        if not food.is_available:
            return Response({'error': 'This item is currently unavailable'}, status=400)
        
        requested_quantity = request.data.get('quantity', 1)
        item, created = CartItem.objects.get_or_create(cart=cart, food=food)
        
        if created:
            # New item - check stock availability
            if food.stock_quantity < requested_quantity:
                return Response({
                    'error': f'Only {food.stock_quantity} items available in stock'
                }, status=400)
            item.quantity = requested_quantity
        else:
            # Existing item - check total quantity against stock
            total_quantity = item.quantity + requested_quantity
            if food.stock_quantity < total_quantity:
                available = max(0, food.stock_quantity - item.quantity)
                if available <= 0:
                    return Response({'error': 'No more items available in stock'}, status=400)
                return Response({
                    'error': f'Only {available} more items can be added to cart'
                }, status=400)
            item.quantity = total_quantity
            
        item.variants = request.data.get('variants', [])
        item.addons = request.data.get('addons', [])
        item.save()
        return Response(CartSerializer(cart).data)

    @action(detail=True, methods=['patch'])
    def update_item(self, request, pk=None):
        """Update cart item quantity"""
        cart_item = get_object_or_404(CartItem, id=pk, cart__user=request.user)
        quantity = request.data.get('quantity', cart_item.quantity)
        
        if quantity < 1:
            cart_item.delete()
            return Response({'message': 'Item removed'})
        
        # Check stock availability for the new quantity
        food = cart_item.food
        if not food.is_available:
            return Response({'error': 'This item is currently unavailable'}, status=400)
            
        if food.stock_quantity < quantity:
            return Response({
                'error': f'Only {food.stock_quantity} items available in stock'
            }, status=400)
            
        cart_item.quantity = quantity
        cart_item.save()
        return Response(CartItemSerializer(cart_item).data)
    
    @action(detail=True, methods=['delete'])
    def remove_item(self, request, pk=None):
        """Remove item from cart"""
        cart_item = get_object_or_404(CartItem, id=pk, cart__user=request.user)
        cart_item.delete()
        return Response({'message': 'Item removed'})

    @action(detail=False, methods=['delete'])
    def clear(self, request):
        cart = get_object_or_404(Cart, user=request.user)
        cart.items.all().delete()
        return Response({'message': 'Cleared'})

class CheckoutView(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def create(self, request):
        try:
            print(f"=== Checkout Debug ===")
            print(f"User: {request.user}")
            print(f"Request data: {request.data}")
            
            # Check if cart exists
            try:
                cart = Cart.objects.get(user=request.user)
                print(f"Cart found: {cart.id}")
            except Cart.DoesNotExist:
                print("Cart does not exist, creating one")
                cart = Cart.objects.create(user=request.user)
            
            # Check if cart has items
            cart_items = cart.items.all()
            print(f"Cart items count: {cart_items.count()}")
            
            if not cart_items.exists():
                print("Cart is empty")
                return Response({'error': 'Empty cart'}, status=400)
            
            # Check address - either saved address or current location
            address_id = request.data.get('address_id')
            current_location = request.data.get('current_location')
            address = None
            
            if address_id:
                # Using saved address
                print(f"Address ID: {address_id}")
                try:
                    address = Address.objects.get(id=address_id, user=request.user)
                    print(f"Address found: {address.title} - {address.address}")
                except Address.DoesNotExist:
                    print(f"Address not found or doesn't belong to user")
                    return Response({'error': 'Invalid address'}, status=400)
            elif current_location:
                # Using current location - will be stored in delivery_location field
                print(f"Using current location: {current_location}")
                address = None  # No saved address
            else:
                print("No address or current location provided")
                return Response({'error': 'Address or current location required'}, status=400)
            
            # Process cart items
            items = []
            subtotal = 0
            restaurant = None
            
            for item in cart_items:
                print(f"Processing item: {item.food.name} x {item.quantity}")
                items.append({
                    'food_id': item.food.id, 
                    'quantity': item.quantity, 
                    'variants': item.variants or [], 
                    'addons': item.addons or []
                })
                subtotal += item.food.price * item.quantity
                if not restaurant:
                    restaurant = item.food.restaurant
                    print(f"Restaurant: {restaurant.name}")
            
            from decimal import Decimal
            delivery_fee = Decimal('5.00')
            total = subtotal + delivery_fee
            payment_method = request.data.get('payment_method', 'cod')
            
            print(f"Order details: subtotal={subtotal}, delivery_fee={delivery_fee}, total={total}, payment_method={payment_method}")
            
            # Final stock validation before order creation (prevent race conditions)
            print("=== Final Stock Validation ===")
            for item in cart_items:
                food = item.food
                print(f"Validating stock for {food.name}: requested={item.quantity}, available={food.stock_quantity}")
                
                if not food.is_available:
                    print(f"Item {food.name} is not available")
                    return Response({'error': f'{food.name} is currently unavailable'}, status=400)
                
                if food.stock_quantity < item.quantity:
                    print(f"Insufficient stock for {food.name}")
                    return Response({
                        'error': f'Insufficient stock for {food.name}. Only {food.stock_quantity} available.'
                    }, status=400)
            
            # Create order
            order_data = {
                'user': request.user,
                'restaurant': restaurant,
                'address': address,
                'items': items,
                'subtotal': subtotal,
                'delivery_fee': delivery_fee,
                'total': total,
                'payment_method': payment_method,
                'note': request.data.get('note', '')
            }
            
            # Add delivery location if using current location
            if current_location and not address:
                order_data['delivery_location'] = current_location
                print(f"Storing delivery location: {current_location}")
            
            order = Order.objects.create(**order_data)
            
            print(f"Order created: {order.id}")
            
            # Reduce stock quantities for ordered items
            print("=== Reducing Stock ===")
            for item in cart_items:
                food = item.food
                old_stock = food.stock_quantity
                success = food.reduce_stock(item.quantity)
                new_stock = food.stock_quantity
                print(f"Stock reduction for {food.name}: {old_stock} -> {new_stock} (reduced by {item.quantity})")
                
                if not success:
                    print(f"WARNING: Failed to reduce stock for {food.name} - insufficient stock!")
                    # Note: Order is already created, so we log this as a warning
                    # In production, you might want to handle this differently
            
            # Clear cart
            cart.items.all().delete()
            print("Cart cleared")
            
            # Create notification
            Notification.objects.create(user=request.user, message='Order placed!')
            print("Notification created")
            
            return Response({'order_id': order.id, 'status': order.status})
            
        except Exception as e:
            print(f"Checkout error: {str(e)}")
            print(f"Error type: {type(e)}")
            import traceback
            traceback.print_exc()
            return Response({'error': f'Checkout failed: {str(e)}'}, status=500)

class AddressViewSet(viewsets.ModelViewSet):
    serializer_class = AddressSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        order = self.get_object()
        if order.status not in ['pending', 'preparing']:
            return Response({'error': 'Cannot cancel'}, status=400)
        order.status = 'cancelled'
        order.save()
        return Response({'message': 'Cancelled'})

    @action(detail=True, methods=['post'])
    def rate(self, request, pk=None):
        order = self.get_object()
        if order.status != 'delivered':
            return Response({'error': 'Not delivered'}, status=400)
        Review.objects.create(order=order, rating=request.data['rating'], review=request.data.get('review'), images=request.data.get('images', []))
        return Response({'message': 'Rated'})

    @action(detail=True, methods=['post'])
    def reorder(self, request, pk=None):
        old_order = self.get_object()
        new_order = Order.objects.create(
            user=request.user,
            restaurant=old_order.restaurant,
            address=old_order.address,
            items=old_order.items,
            subtotal=old_order.subtotal,
            delivery_fee=old_order.delivery_fee,
            total=old_order.total,
            payment_method=old_order.payment_method,
            note=old_order.note
        )
        return Response({'order_id': new_order.id})

    @action(detail=True, methods=['get'])
    def timeline(self, request, pk=None):
        order = self.get_object()
        # Mock timeline for Figma
        timeline = [
            {'status': 'placed', 'time': order.created_at},
            {'status': 'preparing', 'time': order.updated_at},
        ]
        return Response(timeline)

    @action(detail=True, methods=['get'])
    def track(self, request, pk=None):
        order = self.get_object()
        # Mock for Figma map
        rider_location = {'lat': 37.77, 'lng': -122.41, 'eta': '10 min'}
        return Response(rider_location)

    @action(detail=True, methods=['get', 'post'])
    def chat(self, request, pk=None):
        order = self.get_object()
        if request.method == 'GET':
            messages = OrderChatMessage.objects.filter(order=order)
            return Response(OrderChatMessageSerializer(messages, many=True).data)
        serializer = OrderChatMessageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(order=order, sender=request.user)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

class FavoriteViewSet(viewsets.ModelViewSet):
    serializer_class = FavoriteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

class PaymentMethodViewSet(viewsets.ModelViewSet):
    serializer_class = PaymentMethodSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return PaymentMethod.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class TransactionViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Transaction.objects.filter(order__user=self.request.user)

class AIChatViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def create(self, request):
        message = request.data['message']
        # Mock AI for Figma mood suggestion
        response = "Based on your mood, try Pizza!"
        AIChatMessage.objects.create(user=request.user, message=message, response=response)
        return Response({'suggestion': response, 'recommended_foods': [{'id': 1, 'name': 'Pizza'}]})

    @action(detail=False, methods=['get'])
    def history(self, request):
        messages = AIChatMessage.objects.filter(user=self.request.user)
        return Response(AIChatSerializer(messages, many=True).data)

# Restaurant
class RestaurantProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        restaurant = get_object_or_404(Restaurant, owner=request.user)
        return Response(RestaurantSerializer(restaurant).data)

    def put(self, request):
        restaurant = get_object_or_404(Restaurant, owner=request.user)
        serializer = RestaurantSerializer(restaurant, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Category.objects.filter(restaurant__owner=self.request.user)

    def perform_create(self, serializer):
        restaurant = get_object_or_404(Restaurant, owner=self.request.user)
        serializer.save(restaurant=restaurant)

class MenuItemViewSet(viewsets.ModelViewSet):
    serializer_class = FoodSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Food.objects.filter(restaurant__owner=self.request.user)

    def perform_create(self, serializer):
        restaurant = get_object_or_404(Restaurant, owner=self.request.user)
        serializer.save(restaurant=restaurant)

class RestaurantOrderViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(restaurant__owner=self.request.user)

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        order = self.get_object()
        order.status = 'preparing'
        order.prep_time = request.data['prep_time_minutes']
        order.save()
        return Response({'status': order.status})

    @action(detail=True, methods=['post'])
    def ready(self, request, pk=None):
        order = self.get_object()
        order.status = 'ready_for_pickup'
        order.save()
        return Response({'status': order.status})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        order = self.get_object()
        order.status = 'cancelled'
        order.save()
        return Response({'status': order.status})

class RestaurantAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Get restaurant owned by current user
            restaurant = Restaurant.objects.get(owner=request.user)
            
            # Get orders for this restaurant
            orders = Order.objects.filter(restaurant=restaurant)
            
            # Calculate analytics
            from datetime import date, timedelta
            from decimal import Decimal
            
            today = date.today()
            
            # Daily revenue (today)
            daily_orders = orders.filter(created_at__date=today)
            daily_revenue = sum(order.total for order in daily_orders)
            
            # Total orders
            total_orders = orders.count()
            
            # Running orders (pending, preparing, ready)
            running_orders = orders.filter(
                status__in=['pending', 'preparing', 'ready_for_pickup']
            ).count()
            
            # Cancelled orders
            cancelled_orders = orders.filter(status='cancelled').count()
            
            # Delivered orders
            delivered_orders = orders.filter(status='delivered').count()
            
            # Reviews
            reviews = Review.objects.filter(order__restaurant=restaurant)
            total_reviews = reviews.count()
            avg_rating = reviews.aggregate(avg_rating=models.Avg('rating'))['avg_rating'] or 0
            
            # Recent reviews
            recent_reviews = reviews.order_by('-created_at')[:3]
            
            return Response({
                'daily_revenue': float(daily_revenue),
                'total_orders': total_orders,
                'running_orders': running_orders,
                'cancelled_orders': cancelled_orders,
                'delivered_orders': delivered_orders,
                'total_reviews': total_reviews,
                'average_rating': round(float(avg_rating), 1),
                'recent_reviews': ReviewSerializer(recent_reviews, many=True).data,
                'restaurant_name': restaurant.name,
                'restaurant_address': restaurant.address
            })
            
        except Restaurant.DoesNotExist:
            return Response({'error': 'Restaurant not found'}, status=404)
        except Exception as e:
            return Response({'error': str(e)}, status=500)

class RestaurantReviewViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Review.objects.filter(order__restaurant__owner=self.request.user)

# Rider
class RiderAvailabilityView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        request.user.is_online = request.data['is_online']
        request.user.save()
        return Response({'message': 'Updated'})

class RiderLocationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        location, _ = RiderLocation.objects.get_or_create(rider=request.user)
        location.lat = request.data['lat']
        location.lng = request.data['lng']
        location.save()
        return Response({'message': 'Location updated'})

class RiderProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)

    def put(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

class RiderAvailableOrderViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Mock for Figma
        return Order.objects.filter(status='ready_for_pickup')

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        order = self.get_object()
        order.rider = request.user
        order.status = 'rider_assigned'
        order.save()
        return Response({'status': order.status})

class RiderOrderHistoryViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(rider=self.request.user)

class RiderEarningsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Mock for Figma
        total = 500
        trips = 100
        return Response({'total_earned': total, 'trips_completed': trips})

# Admin
class AdminDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'admin':
            return Response({'error': 'Access denied'}, status=403)
        # Mock for Figma dashboard
        revenue = 1280
        orders = 75
        cancelled = 65
        deliveries = 357
        charts = {'pie': {'orders': 81, 'growth': 22, 'revenue': 62}, 'line': [100, 200, 300], 'bar': [80, 60, 40], 'map': {'customers': 100}}
        reviews = Review.objects.all()[:3]
        return Response({'revenue': revenue, 'orders': orders, 'cancelled': cancelled, 'deliveries': deliveries, 'charts': charts, 'reviews': ReviewSerializer(reviews, many=True).data})

class AdminUserViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    queryset = User.objects.all()
    permission_classes = [IsAuthenticated]

    def perform_update(self, serializer):
        if self.request.user.role != 'admin':
            raise PermissionDenied
        serializer.save()

class AdminRestaurantViewSet(viewsets.ModelViewSet):
    serializer_class = RestaurantSerializer
    queryset = Restaurant.objects.all()
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        restaurant = self.get_object()
        restaurant.is_approved = True
        restaurant.save()
        return Response({'message': 'Approved'})

class AdminOrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    queryset = Order.objects.all()
    permission_classes = [IsAuthenticated]

class AdminReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer
    queryset = Review.objects.all()
    permission_classes = [IsAuthenticated]

class AdminRevenueView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Mock for Figma
        charts = {'line': [100, 200, 300, 400]}
        return Response({'charts': charts})

