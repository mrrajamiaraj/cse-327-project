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
            else:
                queryset = queryset.filter(status=status_filter)
        
        return queryset

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
        """Generate chart data based on period (daily, monthly, yearly)"""
        from datetime import datetime, timedelta, date
        from django.db.models import Sum
        from calendar import monthrange
        
        orders = Order.objects.filter(restaurant=restaurant, status='delivered')
        
        if period == 'daily':
            # Today's hourly data
            today = date.today()
            today_orders = orders.filter(created_at__date=today)
            
            # Calculate total earnings for today
            total_today = sum(order.total for order in today_orders)
            
            # Generate hourly data for today (24 hours)
            labels = []
            values = []
            
            for hour in range(24):
                hour_start = datetime.combine(today, datetime.min.time()) + timedelta(hours=hour)
                hour_end = hour_start + timedelta(hours=1)
                
                hour_orders = today_orders.filter(
                    created_at__gte=hour_start,
                    created_at__lt=hour_end
                )
                hour_revenue = sum(order.total for order in hour_orders)
                
                # Format hour label
                if hour == 0:
                    label = "12AM"
                elif hour < 12:
                    label = f"{hour}AM"
                elif hour == 12:
                    label = "12PM"
                else:
                    label = f"{hour-12}PM"
                
                labels.append(label)
                values.append(float(hour_revenue))
            
            return {
                'labels': labels,
                'values': values,
                'period': 'Daily',
                'total_revenue': float(total_today),
                'max_value': max(values) if values else 0,
                'description': f"Today's hourly earnings (Total: ৳{total_today})"
            }
            
        elif period == 'monthly':
            # Current month's daily data (Day 1, 2, 3... up to today or end of month)
            now = datetime.now()
            current_month_start = datetime(now.year, now.month, 1)
            
            # Get total for current month
            current_month_orders = orders.filter(created_at__gte=current_month_start)
            total_current_month = sum(order.total for order in current_month_orders)
            
            labels = []
            values = []
            
            # Get number of days in current month
            from calendar import monthrange
            _, days_in_month = monthrange(now.year, now.month)
            
            # Generate daily data for current month
            for day in range(1, days_in_month + 1):
                day_start = datetime(now.year, now.month, day)
                day_end = day_start + timedelta(days=1)
                
                # Only include days up to today
                if day_start.date() > now.date():
                    break
                
                day_orders = current_month_orders.filter(
                    created_at__gte=day_start,
                    created_at__lt=day_end
                )
                day_revenue = sum(order.total for order in day_orders)
                
                labels.append(str(day))
                values.append(float(day_revenue))
            
            return {
                'labels': labels,
                'values': values,
                'period': 'Monthly',
                'total_revenue': float(total_current_month),
                'max_value': max(values) if values else 0,
                'description': f"This month's daily earnings (Total: ৳{total_current_month})"
            }
            
        elif period == 'yearly':
            # Current year's monthly data
            current_year = datetime.now().year
            year_start = datetime(current_year, 1, 1)
            
            # Get total for current year
            year_orders = orders.filter(created_at__gte=year_start)
            total_year = sum(order.total for order in year_orders)
            
            labels = []
            values = []
            month_names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            
            for month in range(1, 13):
                month_start = datetime(current_year, month, 1)
                if month == 12:
                    month_end = datetime(current_year + 1, 1, 1)
                else:
                    month_end = datetime(current_year, month + 1, 1)
                
                month_orders = year_orders.filter(
                    created_at__gte=month_start,
                    created_at__lt=month_end
                )
                month_revenue = sum(order.total for order in month_orders)
                
                labels.append(month_names[month - 1])
                values.append(float(month_revenue))
            
            return {
                'labels': labels,
                'values': values,
                'period': 'Yearly',
                'total_revenue': float(total_year),
                'max_value': max(values) if values else 0,
                'description': f"This year's monthly earnings (Total: ৳{total_year})"
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

        # Get additional revenue analytics
        from datetime import datetime, timedelta
        from django.db.models import Sum
        from decimal import Decimal
        
        # Get orders for calculations
        orders = Order.objects.filter(restaurant=restaurant, status='delivered')
        
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

