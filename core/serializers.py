# core/serializers.py
from rest_framework import serializers
from .models import *

class UserSerializer(serializers.ModelSerializer):
    avatar_url = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'phone', 'bio', 'avatar', 'avatar_url', 'role', 'is_online']
        extra_kwargs = {
            'password': {'write_only': True, 'required': False},
            'avatar': {'required': False}
        }
    
    def get_avatar_url(self, obj):
        """Return full URL for avatar image"""
        if obj.avatar:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.avatar.url)
            return obj.avatar.url
        return None
    
    def validate_phone(self, value):
        """Validate Bangladesh phone number format - temporarily disabled for debugging"""
        # Temporarily return value as-is for debugging
        return value
        
        # Original validation code (commented out for debugging)
        # if not value:
        #     return value
        # 
        # import re
        # # Remove all spaces and dashes for validation
        # clean_phone = re.sub(r'[\s\-]', '', value)
        # 
        # # Bangladesh phone number patterns
        # patterns = [
        #     r'^(\+880|880)?1[3-9]\d{8}$',  # +880 1XXX-XXXXXX format
        #     r'^01[3-9]\d{8}$',             # 01XXX-XXXXXX format
        # ]
        # 
        # if not any(re.match(pattern, clean_phone) for pattern in patterns):
        #     raise serializers.ValidationError(
        #         "Invalid Bangladesh phone number format. Use +880 1XXX-XXXXXX or 01XXX-XXXXXX"
        #     )
        # 
        # # Format the phone number consistently
        # if clean_phone.startswith('+880'):
        #     clean_phone = clean_phone[4:]
        # elif clean_phone.startswith('880'):
        #     clean_phone = clean_phone[3:]
        # elif clean_phone.startswith('0'):
        #     clean_phone = clean_phone[1:]
        # 
        # # Return formatted phone number
        # return f"+880 {clean_phone[:4]}-{clean_phone[4:]}"

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = User(**validated_data)
        if password:
            user.set_password(password)
        user.save()  # save() will auto-set username = email
        return user

    def update(self, instance, validated_data):
        print("=== UserSerializer update ===")
        print("validated_data:", validated_data)
        print("avatar in validated_data:", 'avatar' in validated_data)
        
        password = validated_data.pop('password', None)
        
        # Handle avatar separately if it exists
        avatar = validated_data.pop('avatar', None)
        print("avatar extracted:", avatar)
        
        for attr, value in validated_data.items():
            print(f"Setting {attr} = {value}")
            setattr(instance, attr, value)
            
        if avatar:
            print("Setting avatar:", avatar)
            instance.avatar = avatar
        else:
            print("No avatar to set")
            
        if password:
            instance.set_password(password)
            
        instance.save()
        print("Instance saved, avatar field:", instance.avatar)
        return instance


# Keep all other serializers exactly as they were
class RestaurantSerializer(serializers.ModelSerializer):
    rating = serializers.SerializerMethodField()
    delivery_time = serializers.SerializerMethodField()
    banner = serializers.SerializerMethodField()
    
    class Meta:
        model = Restaurant
        fields = ['id', 'owner', 'name', 'banner', 'cuisine', 'address', 'rating', 'delivery_time', 
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
    user = UserSerializer(read_only=True)
    restaurant = RestaurantSerializer(read_only=True)
    address = AddressSerializer(read_only=True)
    
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
    order = OrderSerializer(read_only=True)
    
    class Meta:
        model = Review
        fields = '__all__'

class PaymentMethodSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentMethod
        fields = ['id', 'type', 'details']
        read_only_fields = ['user']

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