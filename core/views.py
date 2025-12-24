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
from django.utils import timezone
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

    def get_client_ip(self, request):
        """Get client IP address from request"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

    def get_user_agent(self, request):
        """Get user agent from request"""
        return request.META.get('HTTP_USER_AGENT', '')

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")
        
        # Get client info for logging
        ip_address = self.get_client_ip(request)
        user_agent = self.get_user_agent(request)

        # Validate required fields
        if not email or not password:
            # Log failed attempt (no user to associate with)
            return Response({"error": "Email and password required"}, status=400)

        # Try to find user first for logging purposes
        try:
            user_for_logging = User.objects.get(email=email)
        except User.DoesNotExist:
            user_for_logging = None

        # Authenticate user
        user = authenticate(username=email, password=password)
        if user:
            # Successful login
            refresh = RefreshToken.for_user(user)
            
            # Log successful login
            LoginLog.objects.create(
                user=user,
                ip_address=ip_address,
                user_agent=user_agent,
                success=True,
                session_key=request.session.session_key
            )
            
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': UserSerializer(user).data
            })
        else:
            # Failed login
            failure_reason = "Invalid credentials"
            
            # Log failed attempt if we found the user (wrong password)
            if user_for_logging:
                LoginLog.objects.create(
                    user=user_for_logging,
                    ip_address=ip_address,
                    user_agent=user_agent,
                    success=False,
                    failure_reason=failure_reason
                )
            
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
        
        response_data = {
            'order_id': order.id,
            'status': order.status,
            'restaurant': {
                'name': order.restaurant.name,
                'address': order.restaurant.address,
                'lat': order.restaurant.lat,
                'lng': order.restaurant.lng,
                'phone': order.restaurant.owner.phone if order.restaurant.owner else None
            },
            'prep_time_remaining': order.prep_time_remaining,
            'estimated_delivery_time': order.estimated_delivery_time,
            'eta': order.eta
        }
        
        # Add rider information if assigned
        if order.rider:
            try:
                rider_location = RiderLocation.objects.get(rider=order.rider)
                response_data['rider'] = {
                    'name': f"{order.rider.first_name} {order.rider.last_name}".strip() or "Rider",
                    'phone': order.rider.phone,
                    'location': {
                        'lat': rider_location.lat,
                        'lng': rider_location.lng,
                        'heading': rider_location.heading,
                        'is_moving': rider_location.is_moving,
                        'last_updated': rider_location.updated_at.isoformat()
                    },
                    'rating': 4.8  # Mock rating for now
                }
            except RiderLocation.DoesNotExist:
                response_data['rider'] = {
                    'name': f"{order.rider.first_name} {order.rider.last_name}".strip() or "Rider",
                    'phone': order.rider.phone,
                    'location': None,
                    'rating': 4.8
                }
        
        # Add delivery address
        if order.address:
            response_data['delivery_address'] = {
                'title': order.address.title,
                'address': order.address.address,
                'lat': order.address.lat,
                'lng': order.address.lng
            }
        elif order.delivery_location:
            response_data['delivery_address'] = {
                'title': 'Current Location',
                'address': order.delivery_location.get('address', 'Customer Location'),
                'lat': order.delivery_location.get('lat'),
                'lng': order.delivery_location.get('lng')
            }
        
        return Response(response_data)

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
        
        # Handle category creation by name
        category_name = self.request.data.get('category_name')
        if category_name:
            category, created = Category.objects.get_or_create(name=category_name)
            serializer.save(restaurant=restaurant, category=category)
        else:
            serializer.save(restaurant=restaurant)

class RestaurantOrderViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Add ordering and limit for better performance
        queryset = Order.objects.filter(restaurant__owner=self.request.user).order_by('-created_at')
        
        # Add status filtering for dashboard efficiency
        status_filter = self.request.query_params.get('status')
        if status_filter:
            if status_filter == 'active':
                # Only pending and running orders for dashboard
                queryset = queryset.filter(status__in=['pending', 'preparing', 'ready_for_pickup', 'out_for_delivery'])
            elif status_filter == 'pending':
                queryset = queryset.filter(status='pending')
            elif status_filter == 'completed':
                queryset = queryset.filter(status__in=['delivered', 'cancelled'])
            else:
                queryset = queryset.filter(status=status_filter)
        
        return queryset

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        order = self.get_object()
        order.status = 'preparing'
        order.prep_time = request.data.get('prep_time_minutes', 20)
        order.prep_started_at = timezone.now()
        order.prep_time_remaining = order.prep_time
        order.save()
        
        # Create notification for customer
        Notification.objects.create(
            user=order.user,
            message=f'Your order from {order.restaurant.name} is being prepared! Estimated time: {order.prep_time} minutes'
        )
        
        return Response({'status': order.status, 'prep_time': order.prep_time})

    @action(detail=True, methods=['post'])
    def ready(self, request, pk=None):
        from django.utils import timezone
        
        order = self.get_object()
        order.status = 'ready_for_pickup'
        order.ready_at = timezone.now()
        order.prep_time_remaining = 0
        order.save()
        
        # Try to automatically assign an available rider
        try:
            # Find online riders without current orders
            available_rider = User.objects.filter(
                role='rider',
                is_online=True
            ).exclude(
                rider_orders__status__in=['rider_assigned', 'picked_up', 'out_for_delivery']
            ).first()
            
            if available_rider:
                order.rider = available_rider
                order.status = 'rider_assigned'
                order.save()
                
                # Create notification for rider
                Notification.objects.create(
                    user=available_rider,
                    message=f'New delivery request from {order.restaurant.name}! Pickup location: {order.restaurant.address}'
                )
                
                # Create notification for customer
                Notification.objects.create(
                    user=order.user,
                    message=f'Great news! A rider has been assigned to deliver your order from {order.restaurant.name}'
                )
            else:
                # No rider available, notify customer
                Notification.objects.create(
                    user=order.user,
                    message=f'Your order from {order.restaurant.name} is ready! We are looking for a delivery rider.'
                )
        except Exception as e:
            # If rider assignment fails, just log it and continue
            print(f"Could not auto-assign rider: {e}")
            # Notify customer that food is ready
            Notification.objects.create(
                user=order.user,
                message=f'Your order from {order.restaurant.name} is ready! We are looking for a delivery rider.'
            )
        
        return Response({'status': order.status, 'message': 'Order marked as ready'})

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        order = self.get_object()
        if order.status not in ['pending', 'preparing']:
            return Response({'error': 'Cannot cancel order at this stage'}, status=400)
        
        order.status = 'cancelled'
        order.save()
        
        # Create notification for customer
        Notification.objects.create(
            user=order.user,
            message=f'Your order from {order.restaurant.name} has been cancelled. You will receive a full refund.'
        )
        
        return Response({'status': order.status, 'message': 'Order cancelled successfully'})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        order = self.get_object()
        order.status = 'cancelled'
        order.save()
        return Response({'status': order.status})

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

class RestaurantAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Get restaurant owned by current user
            restaurant = Restaurant.objects.get(owner=request.user)
            
            # Check cache first for faster response
            from django.core.cache import cache
            cache_key = f"restaurant_analytics_{restaurant.id}_{request.GET.get('period', 'daily')}"
            cached_data = cache.get(cache_key)
            
            if cached_data:
                return Response(cached_data)
            
            # Get orders for this restaurant (use select_related for better performance)
            orders = Order.objects.filter(restaurant=restaurant).select_related('restaurant')
            
            # Calculate analytics
            from datetime import date, timedelta, datetime
            from decimal import Decimal
            from django.db.models import Sum, Count
            from django.db.models.functions import TruncDate, TruncMonth, TruncYear
            
            today = date.today()
            
            # Daily revenue (today)
            daily_orders = orders.filter(created_at__date=today, status='delivered')
            daily_revenue = sum(order.total for order in daily_orders)
            
            # Total orders
            total_orders = orders.count()
            
            # Order Requests (new orders waiting for restaurant acceptance)
            order_requests = orders.filter(status='pending').count()
            
            # Running orders (orders being actively processed)
            running_orders = orders.filter(
                status__in=['preparing', 'ready_for_pickup', 'out_for_delivery']
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
            
            # Chart data based on period
            period = request.GET.get('period', 'daily')
            chart_data = self.get_chart_data(restaurant, period)
            
            response_data = {
                'daily_revenue': float(daily_revenue),
                'total_orders': total_orders,
                'order_requests': order_requests,
                'running_orders': running_orders,
                'cancelled_orders': cancelled_orders,
                'delivered_orders': delivered_orders,
                'total_reviews': total_reviews,
                'average_rating': round(float(avg_rating), 1),
                'recent_reviews': ReviewSerializer(recent_reviews, many=True).data,
                'restaurant_name': restaurant.name,
                'restaurant_address': restaurant.address,
                'restaurant_id': restaurant.id,  # Add restaurant ID for frontend
                'chart_data': chart_data
            }
            
            # Cache for 2 minutes to balance freshness and performance
            cache.set(cache_key, response_data, 120)
            
            return Response(response_data)
            
        except Restaurant.DoesNotExist:
            return Response({'error': 'Restaurant not found'}, status=404)
        except Exception as e:
            return Response({'error': str(e)}, status=500)
    
    def get_chart_data(self, restaurant, period):
        """Generate business-standard chart data based on period"""
        from datetime import datetime, timedelta, date
        from django.db.models import Sum
        from calendar import monthrange
        
        orders = Order.objects.filter(restaurant=restaurant, status='delivered')
        now = datetime.now()
        
        if period == 'daily':
            # Last 7 days (business standard for daily view)
            labels = []
            values = []
            order_counts = []
            total_revenue = 0
            
            for i in range(6, -1, -1):  # 6 days ago to today
                target_date = now.date() - timedelta(days=i)
                day_start = datetime.combine(target_date, datetime.min.time())
                day_end = day_start + timedelta(days=1)
                
                day_orders = orders.filter(
                    created_at__gte=day_start,
                    created_at__lt=day_end
                )
                day_revenue = sum(order.total for order in day_orders)
                day_count = day_orders.count()
                
                # Format label (Mon, Tue, Wed, etc.)
                if i == 0:
                    label = "Today"
                elif i == 1:
                    label = "Yesterday"
                else:
                    label = target_date.strftime('%a')  # Mon, Tue, Wed
                
                labels.append(label)
                values.append(float(day_revenue))
                order_counts.append(day_count)
                total_revenue += day_revenue
            
            return {
                'labels': labels,
                'values': values,
                'order_counts': order_counts,
                'period': 'Daily',
                'period_description': 'Last 7 Days',
                'total_revenue': float(total_revenue),
                'max_value': max(values) if values else 0,
                'avg_daily': float(total_revenue / 7),
                'total_orders': sum(order_counts),
                'avg_order_value': float(total_revenue / sum(order_counts)) if sum(order_counts) > 0 else 0,
                'description': f"Revenue trend over the last 7 days"
            }
            
        elif period == 'weekly':
            # Last 8 weeks (business standard for weekly view)
            labels = []
            values = []
            order_counts = []
            total_revenue = 0
            
            for i in range(7, -1, -1):  # 7 weeks ago to this week
                # Calculate week start (Monday) and end (Sunday)
                days_since_monday = now.weekday()
                current_week_start = now - timedelta(days=days_since_monday, weeks=i)
                week_start = current_week_start.replace(hour=0, minute=0, second=0, microsecond=0)
                week_end = week_start + timedelta(days=7)
                
                week_orders = orders.filter(
                    created_at__gte=week_start,
                    created_at__lt=week_end
                )
                week_revenue = sum(order.total for order in week_orders)
                week_count = week_orders.count()
                
                # Format label
                if i == 0:
                    label = "This Week"
                elif i == 1:
                    label = "Last Week"
                else:
                    label = f"{week_start.strftime('%m/%d')}"
                
                labels.append(label)
                values.append(float(week_revenue))
                order_counts.append(week_count)
                total_revenue += week_revenue
            
            return {
                'labels': labels,
                'values': values,
                'order_counts': order_counts,
                'period': 'Weekly',
                'period_description': 'Last 8 Weeks',
                'total_revenue': float(total_revenue),
                'max_value': max(values) if values else 0,
                'avg_weekly': float(total_revenue / 8),
                'total_orders': sum(order_counts),
                'avg_order_value': float(total_revenue / sum(order_counts)) if sum(order_counts) > 0 else 0,
                'description': f"Revenue trend over the last 8 weeks"
            }
            
        elif period == 'monthly':
            # Last 12 months (business standard for monthly view)
            labels = []
            values = []
            order_counts = []
            total_revenue = 0
            
            for i in range(11, -1, -1):  # 11 months ago to this month
                # Calculate month start and end
                target_date = now.replace(day=1) - timedelta(days=32*i)
                month_start = target_date.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
                
                if month_start.month == 12:
                    month_end = month_start.replace(year=month_start.year + 1, month=1)
                else:
                    month_end = month_start.replace(month=month_start.month + 1)
                
                month_orders = orders.filter(
                    created_at__gte=month_start,
                    created_at__lt=month_end
                )
                month_revenue = sum(order.total for order in month_orders)
                month_count = month_orders.count()
                
                # Format label
                if i == 0:
                    label = "This Month"
                elif i == 1:
                    label = "Last Month"
                else:
                    label = month_start.strftime('%b %y')  # Jan 25, Feb 25, etc.
                
                labels.append(label)
                values.append(float(month_revenue))
                order_counts.append(month_count)
                total_revenue += month_revenue
            
            return {
                'labels': labels,
                'values': values,
                'order_counts': order_counts,
                'period': 'Monthly',
                'period_description': 'Last 12 Months',
                'total_revenue': float(total_revenue),
                'max_value': max(values) if values else 0,
                'avg_monthly': float(total_revenue / 12),
                'total_orders': sum(order_counts),
                'avg_order_value': float(total_revenue / sum(order_counts)) if sum(order_counts) > 0 else 0,
                'description': f"Revenue trend over the last 12 months"
            }
            
        elif period == 'yearly':
            # Last 5 years (business standard for yearly view)
            labels = []
            values = []
            order_counts = []
            total_revenue = 0
            
            current_year = now.year
            for i in range(4, -1, -1):  # 4 years ago to this year
                target_year = current_year - i
                year_start = datetime(target_year, 1, 1)
                year_end = datetime(target_year + 1, 1, 1)
                
                year_orders = orders.filter(
                    created_at__gte=year_start,
                    created_at__lt=year_end
                )
                year_revenue = sum(order.total for order in year_orders)
                year_count = year_orders.count()
                
                # Format label
                if i == 0:
                    label = "This Year"
                elif i == 1:
                    label = "Last Year"
                else:
                    label = str(target_year)
                
                labels.append(label)
                values.append(float(year_revenue))
                order_counts.append(year_count)
                total_revenue += year_revenue
            
            return {
                'labels': labels,
                'values': values,
                'order_counts': order_counts,
                'period': 'Yearly',
                'period_description': 'Last 5 Years',
                'total_revenue': float(total_revenue),
                'max_value': max(values) if values else 0,
                'avg_yearly': float(total_revenue / 5),
                'total_orders': sum(order_counts),
                'avg_order_value': float(total_revenue / sum(order_counts)) if sum(order_counts) > 0 else 0,
                'description': f"Revenue trend over the last 5 years"
            }
        
        # Default to daily if invalid period
        return self.get_chart_data(restaurant, 'daily')


class RestaurantEarningsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            restaurant = Restaurant.objects.get(owner=request.user)
        except Restaurant.DoesNotExist:
            return Response({'error': 'Restaurant not found'}, status=404)

        # Get or create earnings record
        earnings, created = RestaurantEarnings.objects.get_or_create(
            restaurant=restaurant,
            defaults={
                'total_earnings': 0,
                'available_balance': 0,
                'pending_balance': 0,
                'total_withdrawn': 0,
                'commission_rate': 15.00
            }
        )

        # If newly created, calculate earnings from existing orders
        if created:
            delivered_orders = Order.objects.filter(restaurant=restaurant, status='delivered')
            for order in delivered_orders:
                earnings.add_earnings(order.total)

        # Get additional revenue analytics using the same logic as dashboard
        from datetime import datetime, timedelta
        from django.db.models import Sum
        from decimal import Decimal
        
        # Get orders for calculations
        orders = Order.objects.filter(restaurant=restaurant, status='delivered')
        now = datetime.now()
        
        # Daily revenue data (last 7 days)
        daily_data = []
        for i in range(6, -1, -1):  # 6 days ago to today
            target_date = now.date() - timedelta(days=i)
            day_start = datetime.combine(target_date, datetime.min.time())
            day_end = day_start + timedelta(days=1)
            
            day_orders = orders.filter(
                created_at__gte=day_start,
                created_at__lt=day_end
            )
            day_revenue = sum(order.total for order in day_orders)
            day_commission = (day_revenue * earnings.commission_rate) / 100
            day_net_revenue = day_revenue - day_commission
            
            if i == 0:
                label = "Today"
            elif i == 1:
                label = "Yesterday"
            else:
                label = target_date.strftime('%a')  # Mon, Tue, Wed
            
            daily_data.append({
                'day': label,
                'date': target_date.strftime('%Y-%m-%d'),
                'gross_revenue': float(day_revenue),
                'commission': float(day_commission),
                'net_revenue': float(day_net_revenue),
                'orders_count': day_orders.count()
            })
        
        # Yearly data (last 5 years)
        yearly_data = []
        current_year = now.year
        for i in range(4, -1, -1):  # 4 years ago to this year
            target_year = current_year - i
            year_start = datetime(target_year, 1, 1)
            year_end = datetime(target_year + 1, 1, 1)
            
            year_orders = orders.filter(
                created_at__gte=year_start,
                created_at__lt=year_end
            )
            year_revenue = sum(order.total for order in year_orders)
            year_commission = (year_revenue * earnings.commission_rate) / 100
            year_net_revenue = year_revenue - year_commission
            
            if i == 0:
                label = "This Year"
            elif i == 1:
                label = "Last Year"
            else:
                label = str(target_year)
            
            yearly_data.append({
                'year': label,
                'year_number': target_year,
                'gross_revenue': float(year_revenue),
                'commission': float(year_commission),
                'net_revenue': float(year_net_revenue),
                'orders_count': year_orders.count()
            })
        
        # Daily revenue (today)
        today = datetime.now().date()
        today_orders = orders.filter(created_at__date=today)
        daily_revenue = sum(order.total for order in today_orders)
        daily_commission = (daily_revenue * earnings.commission_rate) / 100
        daily_net_revenue = daily_revenue - daily_commission
        
        # Monthly revenue data (last 6 months including current month)
        monthly_data = []
        current_date = datetime.now()
        
        for i in range(6):
            if i == 0:
                # Current month: from 1st of this month to end of today
                month_start = current_date.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
                month_end = current_date.replace(hour=23, minute=59, second=59, microsecond=999999)
            else:
                # Previous months: full months
                # Go back i months
                year = current_date.year
                month = current_date.month - i
                
                if month <= 0:
                    month += 12
                    year -= 1
                
                month_start = datetime(year, month, 1, 0, 0, 0, 0)
                
                # Get last day of the month
                if month == 12:
                    month_end = datetime(year + 1, 1, 1, 0, 0, 0, 0) - timedelta(microseconds=1)
                else:
                    month_end = datetime(year, month + 1, 1, 0, 0, 0, 0) - timedelta(microseconds=1)
            
            # Get orders for this month
            month_orders = orders.filter(
                created_at__gte=month_start,
                created_at__lte=month_end
            )
            month_revenue = sum(order.total for order in month_orders)
            month_commission = (month_revenue * earnings.commission_rate) / 100
            month_net_revenue = month_revenue - month_commission
            
            monthly_data.insert(0, {  # Insert at beginning to get chronological order
                'month': month_start.strftime('%b'),
                'month_year': month_start.strftime('%b %Y'),
                'gross_revenue': float(month_revenue),
                'commission': float(month_commission),
                'net_revenue': float(month_net_revenue),
                'orders_count': month_orders.count()
            })
        
        # Weekly revenue (last 4 weeks including current week)
        weekly_data = []
        current_date = datetime.now()
        
        for i in range(4):
            if i == 0:
                # Current week: from Monday of this week to end of today
                days_since_monday = current_date.weekday()
                week_start = current_date - timedelta(days=days_since_monday)
                week_start = week_start.replace(hour=0, minute=0, second=0, microsecond=0)
                week_end = current_date.replace(hour=23, minute=59, second=59, microsecond=999999)
            else:
                # Previous weeks: full 7-day periods
                week_end_date = current_date - timedelta(days=7 * i)
                week_start_date = week_end_date - timedelta(days=6)  # 7 days total
                
                week_start = week_start_date.replace(hour=0, minute=0, second=0, microsecond=0)
                week_end = week_end_date.replace(hour=23, minute=59, second=59, microsecond=999999)
            
            week_orders = orders.filter(
                created_at__gte=week_start,
                created_at__lte=week_end
            )
            week_revenue = sum(order.total for order in week_orders)
            week_commission = (week_revenue * earnings.commission_rate) / 100
            week_net_revenue = week_revenue - week_commission
            
            weekly_data.insert(0, {
                'week': f"Week {4-i}",
                'week_period': f"{week_start.strftime('%m/%d')} - {week_end.strftime('%m/%d')}",
                'gross_revenue': float(week_revenue),
                'commission': float(week_commission),
                'net_revenue': float(week_net_revenue),
                'orders_count': week_orders.count()
            })
        
        # Total statistics
        total_orders = orders.count()
        total_gross_revenue = sum(order.total for order in orders)
        total_commission = (total_gross_revenue * earnings.commission_rate) / 100
        
        # Average order value
        avg_order_value = total_gross_revenue / total_orders if total_orders > 0 else 0

        return Response({
            'total_earnings': float(earnings.total_earnings),
            'available_balance': float(earnings.available_balance),
            'pending_balance': float(earnings.pending_balance),
            'total_withdrawn': float(earnings.total_withdrawn),
            'commission_rate': float(earnings.commission_rate),
            
            # Additional analytics
            'daily_revenue': {
                'gross': float(daily_revenue),
                'commission': float(daily_commission),
                'net': float(daily_net_revenue)
            },
            'total_statistics': {
                'total_orders': total_orders,
                'total_gross_revenue': float(total_gross_revenue),
                'total_commission': float(total_commission),
                'average_order_value': float(avg_order_value)
            },
            'monthly_data': monthly_data,
            'weekly_data': weekly_data,
            'daily_data': daily_data,  # Add daily data for charts
            'yearly_data': yearly_data,  # Add yearly data for charts
            'restaurant_name': restaurant.name
        })


class RestaurantWithdrawalsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            restaurant = Restaurant.objects.get(owner=request.user)
        except Restaurant.DoesNotExist:
            return Response({'error': 'Restaurant not found'}, status=404)

        withdrawals = WithdrawalRequest.objects.filter(restaurant=restaurant)
        serializer = WithdrawalRequestSerializer(withdrawals, many=True)
        return Response(serializer.data)

    def post(self, request):
        try:
            restaurant = Restaurant.objects.get(owner=request.user)
        except Restaurant.DoesNotExist:
            return Response({'error': 'Restaurant not found'}, status=404)

        # Check if restaurant has sufficient balance
        try:
            earnings = RestaurantEarnings.objects.get(restaurant=restaurant)
        except RestaurantEarnings.DoesNotExist:
            return Response({'error': 'Earnings record not found'}, status=404)
        
        amount = float(request.data.get('amount', 0))
        
        if amount <= 0:
            return Response({'error': 'Invalid amount'}, status=400)
        
        if amount > earnings.available_balance:
            return Response({'error': 'Insufficient balance'}, status=400)

        # Create withdrawal request
        withdrawal = WithdrawalRequest.objects.create(
            restaurant=restaurant,
            amount=amount,
            payment_method=request.data.get('payment_method', 'bank_transfer'),
            payment_details=request.data.get('payment_details', {}),
            status='pending'
        )

        # Deduct from available balance
        earnings.available_balance -= amount
        earnings.save()

        serializer = WithdrawalRequestSerializer(withdrawal)
        return Response(serializer.data, status=201)


class RestaurantReviewViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Review.objects.filter(order__restaurant__owner=self.request.user)

# Rider
class RiderAvailabilityView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role != 'rider':
            return Response({'error': 'Access denied'}, status=403)
        
        request.user.is_online = request.data.get('is_online', False)
        request.user.save()
        
        # Update or create rider location if going online
        if request.user.is_online:
            lat = request.data.get('lat')
            lng = request.data.get('lng')
            if lat and lng:
                location, created = RiderLocation.objects.get_or_create(rider=request.user)
                location.lat = lat
                location.lng = lng
                location.save()
        
        return Response({
            'is_online': request.user.is_online,
            'message': 'Online' if request.user.is_online else 'Offline'
        })

class RiderLocationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role != 'rider':
            return Response({'error': 'Access denied'}, status=403)
            
        location, created = RiderLocation.objects.get_or_create(rider=request.user)
        location.lat = request.data['lat']
        location.lng = request.data['lng']
        location.heading = request.data.get('heading')
        location.speed = request.data.get('speed')
        location.accuracy = request.data.get('accuracy')
        location.is_moving = request.data.get('is_moving', False)
        location.save()
        
        # Update ETA for current order if rider is on delivery
        try:
            current_order = Order.objects.get(
                rider=request.user,
                status__in=['rider_assigned', 'picked_up', 'out_for_delivery']
            )
            
            # Calculate ETA based on distance and current location
            if current_order.status == 'out_for_delivery' and current_order.address:
                eta = self.calculate_eta(
                    location.lat, location.lng,
                    current_order.address.lat, current_order.address.lng
                )
                current_order.eta = eta
                current_order.save()
                
        except Order.DoesNotExist:
            pass
            
        return Response({'message': 'Location updated', 'eta_updated': True})
    
    def calculate_eta(self, rider_lat, rider_lng, dest_lat, dest_lng):
        """Calculate estimated time of arrival"""
        import math
        
        # Calculate distance using Haversine formula
        R = 6371  # Earth's radius in km
        dLat = math.radians(dest_lat - rider_lat)
        dLng = math.radians(dest_lng - rider_lng)
        a = (math.sin(dLat/2) * math.sin(dLat/2) +
             math.cos(math.radians(rider_lat)) * math.cos(math.radians(dest_lat)) *
             math.sin(dLng/2) * math.sin(dLng/2))
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
        distance = R * c
        
        # Assume average speed of 25 km/h for delivery
        time_hours = distance / 25
        time_minutes = int(time_hours * 60)
        
        if time_minutes < 1:
            return "1 min"
        elif time_minutes < 60:
            return f"{time_minutes} min"
        else:
            hours = time_minutes // 60
            minutes = time_minutes % 60
            return f"{hours}h {minutes}m"

class RiderProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'rider':
            return Response({'error': 'Access denied'}, status=403)
        return Response(UserSerializer(request.user).data)

    def put(self, request):
        if request.user.role != 'rider':
            return Response({'error': 'Access denied'}, status=403)
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

class RiderAvailableOrderViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role != 'rider':
            return Order.objects.none()
        
        # Get orders that are ready for pickup and don't have a rider assigned
        available_orders = Order.objects.filter(
            status='ready_for_pickup',
            rider__isnull=True
        ).select_related('restaurant', 'user', 'address').order_by('-created_at')
        
        # Add distance calculation if rider location is available
        try:
            rider_location = RiderLocation.objects.get(rider=self.request.user)
            # In a real app, you'd calculate distance here
            # For now, we'll add mock distance data
            for order in available_orders:
                order.distance = 2.5  # Mock distance in km
                order.delivery_fee = 50  # Mock delivery fee
        except RiderLocation.DoesNotExist:
            pass
            
        return available_orders

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        """Accept a delivery order"""
        if request.user.role != 'rider':
            return Response({'error': 'Access denied'}, status=403)
        
        try:
            order = Order.objects.get(id=pk, status='ready_for_pickup', rider__isnull=True)
        except Order.DoesNotExist:
            return Response({'error': 'Order not available'}, status=404)
        
        # Check if rider is online
        if not request.user.is_online:
            return Response({'error': 'You must be online to accept orders'}, status=400)
        
        # Check if rider already has an active order
        active_order = Order.objects.filter(
            rider=request.user,
            status__in=['rider_assigned', 'picked_up', 'out_for_delivery']
        ).first()
        
        if active_order:
            return Response({'error': 'You already have an active delivery'}, status=400)
        
        # Assign rider to order
        order.rider = request.user
        order.status = 'rider_assigned'
        order.save()
        
        # Create notifications
        Notification.objects.create(
            user=order.user,
            message=f'Great news! A rider has accepted your order from {order.restaurant.name}'
        )
        
        Notification.objects.create(
            user=order.restaurant.owner,
            message=f'Rider {request.user.first_name or request.user.email} is coming to pick up order #{order.id}'
        )
        
        return Response({
            'message': 'Order accepted successfully',
            'order_id': order.id,
            'status': order.status,
            'restaurant_name': order.restaurant.name,
            'restaurant_address': order.restaurant.address,
            'customer_name': f"{order.user.first_name} {order.user.last_name}".strip() or order.user.email,
            'delivery_address': order.get_delivery_address_display(),
            'total': float(order.total)
        })

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        if request.user.role != 'rider':
            return Response({'error': 'Access denied'}, status=403)
            
        order = self.get_object()
        
        # Check if order is still available
        if order.rider is not None:
            return Response({'error': 'Order already assigned'}, status=400)
        
        if order.status != 'ready_for_pickup':
            return Response({'error': 'Order not ready for pickup'}, status=400)
        
        # Assign rider and update status
        order.rider = request.user
        order.status = 'rider_assigned'
        order.save()
        
        # Create notification for customer
        Notification.objects.create(
            user=order.user,
            message=f'Your order from {order.restaurant.name} has been assigned to a rider!'
        )
        
        return Response({'status': order.status, 'message': 'Order accepted successfully'})

class RiderCurrentOrderView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        if request.user.role != 'rider':
            return Response({'error': 'Access denied'}, status=403)
        
        # Get current active order for this rider
        current_order = Order.objects.filter(
            rider=request.user,
            status__in=['rider_assigned', 'picked_up', 'out_for_delivery']
        ).select_related('restaurant', 'user', 'address').first()
        
        if not current_order:
            return Response(None)
        
        # Prepare order data for rider
        order_data = {
            'id': current_order.id,
            'status': current_order.status,
            'restaurant_name': current_order.restaurant.name,
            'restaurant_address': current_order.restaurant.address or 'Address not available',
            'customer_name': f"{current_order.user.first_name} {current_order.user.last_name}".strip() or current_order.user.email,
            'delivery_address': current_order.get_delivery_address_display(),
            'total': float(current_order.total),
            'payment_method': current_order.payment_method,
            'items_count': len(current_order.items),
            'created_at': current_order.created_at.isoformat(),
            'customer_phone': current_order.user.phone
        }
        
        return Response(order_data)

class RiderOrderUpdateView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, order_id):
        from django.utils import timezone
        
        if request.user.role != 'rider':
            return Response({'error': 'Access denied'}, status=403)
        
        try:
            order = Order.objects.get(id=order_id, rider=request.user)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=404)
        
        new_status = request.data.get('status')
        valid_transitions = {
            'rider_assigned': 'picked_up',
            'picked_up': 'out_for_delivery',
            'out_for_delivery': 'delivered'
        }
        
        if order.status not in valid_transitions:
            return Response({'error': 'Invalid order status'}, status=400)
        
        if new_status not in valid_transitions.get(order.status, []):
            return Response({'error': f'Cannot change status from {order.status} to {new_status}'}, status=400)
        
        order.status = new_status
        
        # Update timestamps based on status
        if new_status == 'picked_up':
            order.picked_up_at = timezone.now()
            # Calculate estimated delivery time (assume 20 minutes average)
            order.estimated_delivery_time = timezone.now() + timezone.timedelta(minutes=20)
            order.eta = "20 min"
            
            Notification.objects.create(
                user=order.user,
                message=f'Your order from {order.restaurant.name} has been picked up and is on the way!'
            )
            
        elif new_status == 'out_for_delivery':
            Notification.objects.create(
                user=order.user,
                message=f'Your rider is on the way! Track your order for real-time updates.'
            )
            
        elif new_status == 'delivered':
            Notification.objects.create(
                user=order.user,
                message=f'Your order from {order.restaurant.name} has been delivered! Enjoy your meal!'
            )
            # Update restaurant earnings
            try:
                earnings = RestaurantEarnings.objects.get(restaurant=order.restaurant)
                earnings.add_earnings(order.total)
            except RestaurantEarnings.DoesNotExist:
                RestaurantEarnings.objects.create(
                    restaurant=order.restaurant,
                    total_earnings=order.total * 0.85,  # 85% after 15% commission
                    available_balance=order.total * 0.85
                )
        
        order.save()
        
        return Response({
            'status': order.status, 
            'message': 'Order status updated successfully',
            'eta': order.eta,
            'estimated_delivery_time': order.estimated_delivery_time
        })

class RiderOrderHistoryViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role != 'rider':
            return Order.objects.none()
        return Order.objects.filter(rider=self.request.user).order_by('-created_at')

class RiderEarningsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'rider':
            return Response({'error': 'Access denied'}, status=403)
        
        from datetime import date, timedelta
        from django.db.models import Sum, Count, Avg
        
        # Get rider's completed orders
        completed_orders = Order.objects.filter(rider=request.user, status='delivered')
        
        # Today's earnings
        today = date.today()
        today_orders = completed_orders.filter(created_at__date=today)
        today_earnings = today_orders.count() * 50  # ৳50 per delivery
        today_trips = today_orders.count()
        
        # Total stats
        total_trips = completed_orders.count()
        total_earnings = total_trips * 50  # ৳50 per delivery
        
        # Average rating (mock for now)
        average_rating = 4.8
        
        # Weekly earnings (last 7 days)
        week_start = today - timedelta(days=6)
        weekly_orders = completed_orders.filter(created_at__date__gte=week_start)
        weekly_earnings = weekly_orders.count() * 50
        
        return Response({
            'today_earnings': today_earnings,
            'today_trips': today_trips,
            'total_earnings': total_earnings,
            'total_trips': total_trips,
            'weekly_earnings': weekly_earnings,
            'average_rating': average_rating,
            'earnings_per_trip': 50
        })

class RiderOrderViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for rider to manage their assigned orders and chat with customers
    """
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role != 'rider':
            return Order.objects.none()
        
        # Return orders assigned to this rider
        return Order.objects.filter(
            rider=self.request.user
        ).select_related('restaurant', 'user', 'address').order_by('-created_at')

    @action(detail=True, methods=['get', 'post'])
    def chat(self, request, pk=None):
        """
        Chat endpoint for rider to communicate with customer
        """
        if request.user.role != 'rider':
            return Response({'error': 'Access denied'}, status=403)
        
        order = self.get_object()
        
        # Verify rider is assigned to this order
        if order.rider != request.user:
            return Response({'error': 'You are not assigned to this order'}, status=403)
        
        # Only allow chat when rider is assigned or actively delivering
        if order.status not in ['rider_assigned', 'picked_up', 'out_for_delivery']:
            return Response({'error': 'Chat not available for this order status'}, status=400)
        
        if request.method == 'GET':
            # Get chat messages for this order
            messages = OrderChatMessage.objects.filter(order=order).order_by('created_at')
            return Response(OrderChatMessageSerializer(messages, many=True).data)
        
        elif request.method == 'POST':
            # Send a new message
            serializer = OrderChatMessageSerializer(data=request.data)
            if serializer.is_valid():
                message = serializer.save(order=order, sender=request.user)
                
                # Create notification for customer
                Notification.objects.create(
                    user=order.user,
                    message=f'New message from your delivery rider for order #{order.id}'
                )
                
                return Response(OrderChatMessageSerializer(message).data, status=201)
            return Response(serializer.errors, status=400)

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


class LoginLogViewSet(viewsets.ReadOnlyModelViewSet):
    """API endpoint for viewing login logs (admin only)"""
    serializer_class = LoginLogSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Only allow admin users to view login logs
        if self.request.user.role != 'admin':
            return LoginLog.objects.none()
        
        queryset = LoginLog.objects.select_related('user').order_by('-login_time')
        
        # Filter by user if specified
        user_id = self.request.query_params.get('user_id')
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        
        # Filter by success status
        success = self.request.query_params.get('success')
        if success is not None:
            queryset = queryset.filter(success=success.lower() == 'true')
        
        # Filter by date range
        from_date = self.request.query_params.get('from_date')
        to_date = self.request.query_params.get('to_date')
        if from_date:
            queryset = queryset.filter(login_time__date__gte=from_date)
        if to_date:
            queryset = queryset.filter(login_time__date__lte=to_date)
            
        return queryset
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get login statistics"""
        if request.user.role != 'admin':
            return Response({'error': 'Admin access required'}, status=403)
        
        from django.db.models import Count
        from datetime import datetime, timedelta
        
        # Get stats for the last 30 days
        thirty_days_ago = datetime.now() - timedelta(days=30)
        
        stats = {
            'total_logins': LoginLog.objects.count(),
            'successful_logins': LoginLog.objects.filter(success=True).count(),
            'failed_logins': LoginLog.objects.filter(success=False).count(),
            'recent_logins': LoginLog.objects.filter(login_time__gte=thirty_days_ago).count(),
            'logins_by_role': list(
                LoginLog.objects.filter(success=True)
                .values('user__role')
                .annotate(count=Count('id'))
                .order_by('-count')
            ),
            'recent_failed_attempts': LoginLog.objects.filter(
                success=False, 
                login_time__gte=thirty_days_ago
            ).count()
        }
        
        return Response(stats)

