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
    class Meta:
        model = Restaurant
        fields = '__all__'

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class FoodSerializer(serializers.ModelSerializer):
    class Meta:
        model = Food
        fields = '__all__'

class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = '__all__'

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