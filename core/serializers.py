# core/serializers.py
from rest_framework import serializers
from .models import *

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'avatar', 'role', 'is_online']
        extra_kwargs = {
            'password': {'write_only': True, 'required': False}
        }

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = User(**validated_data)
        if password:
            user.set_password(password)
        user.save()  # save() will auto-set username = email
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


# Keep all other serializers exactly as they were
class RestaurantSerializer(serializers.ModelSerializer):
    rating = serializers.SerializerMethodField()
    delivery_time = serializers.SerializerMethodField()
    banner = serializers.SerializerMethodField()
    
    class Meta:
        model = Restaurant
        fields = ['id', 'owner', 'name', 'banner', 'cuisine', 'rating', 'delivery_time', 
                  'is_approved', 'lat', 'lng', 'prep_time_minutes']
        read_only_fields = ['rating', 'delivery_time']
    
    def get_banner(self, obj):
        """Return full URL for banner image"""
        if obj.banner:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.banner.url)
            return obj.banner.url
        return None
    
    def get_rating(self, obj):
        """Get calculated average rating from reviews"""
        return obj.get_average_rating()
    
    def get_delivery_time(self, obj):
        """Get calculated delivery time based on user's location"""
        # Try to get customer location from context
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            # Try to get user's default address
            try:
                address = Address.objects.filter(user=request.user, is_default=True).first()
                if address:
                    return obj.calculate_delivery_time(address.lat, address.lng)
            except:
                pass
        
        # Fallback: use a default time
        return f"{obj.prep_time_minutes + 10} min"

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class AddonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Addon
        fields = ['id', 'name', 'price']

class FoodSerializer(serializers.ModelSerializer):
    available_addons = AddonSerializer(many=True, read_only=True)
    image = serializers.SerializerMethodField()
    
    class Meta:
        model = Food
        fields = '__all__'
    
    def get_image(self, obj):
        """Return full URL for food image"""
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None

class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = '__all__'
        read_only_fields = ['user']

class CartItemSerializer(serializers.ModelSerializer):
    food = FoodSerializer()
    class Meta:
        model = CartItem
        fields = ['id', 'food', 'quantity', 'variants', 'addons']

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    subtotal = serializers.SerializerMethodField()
    def get_subtotal(self, obj):
        return sum(item.food.price * item.quantity for item in obj.items.all())
    class Meta:
        model = Cart
        fields = ['id', 'items', 'subtotal']

class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = '__all__'

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'

class FavoriteSerializer(serializers.ModelSerializer):
    food = FoodSerializer(read_only=True)
    restaurant = RestaurantSerializer(read_only=True)
    class Meta:
        model = Favorite
        fields = ['id', 'food', 'restaurant']

class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = '__all__'

class PaymentMethodSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentMethod
        fields = '__all__'

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = '__all__'

class AIChatSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIChatMessage
        fields = ['message', 'response', 'created_at']

class RiderLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = RiderLocation
        fields = ['lat', 'lng']

class OrderChatMessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    class Meta:
        model = OrderChatMessage
        fields = ['id', 'sender', 'message', 'image', 'created_at']