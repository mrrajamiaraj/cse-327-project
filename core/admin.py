# core/admin.py
from django.contrib import admin
from .models import *

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'role', 'first_name', 'is_active')

@admin.register(Restaurant)
class RestaurantAdmin(admin.ModelAdmin):
    list_display = ('name', 'owner', 'cuisine', 'get_rating_display', 'is_approved')
    
    def get_rating_display(self, obj):
        """Display calculated rating in admin"""
        return obj.get_average_rating()
    get_rating_display.short_description = 'Rating'

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'description', 'icon')
    search_fields = ('name',)

@admin.register(Addon)
class AddonAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'restaurant')
    list_filter = ('restaurant',)
    search_fields = ('name',)

@admin.register(Food)
class FoodAdmin(admin.ModelAdmin):
    list_display = ('name', 'restaurant', 'price', 'stock_status', 'is_veg')
    list_filter = ('restaurant', 'is_available', 'is_veg', 'category')
    search_fields = ('name', 'restaurant__name')
    filter_horizontal = ('available_addons',)  # Nice UI for selecting multiple addons
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'description', 'price', 'image', 'is_veg', 'ingredients')
        }),
        ('Restaurant & Category', {
            'fields': ('restaurant', 'category', 'available_addons')
        }),
        ('Inventory Management', {
            'fields': ('stock_quantity', 'is_available'),
            'description': 'Manage stock levels and availability for this item'
        }),
    )
    
    def stock_status(self, obj):
        """Display stock status with colors"""
        return obj.stock_status
    stock_status.short_description = 'Stock Status'
    
    actions = ['mark_as_available', 'mark_as_unavailable', 'set_low_stock_alert']
    
    def mark_as_available(self, request, queryset):
        """Mark selected items as available"""
        updated = queryset.update(is_available=True)
        self.message_user(request, f'{updated} items marked as available.')
    mark_as_available.short_description = "Mark selected items as available"
    
    def mark_as_unavailable(self, request, queryset):
        """Mark selected items as unavailable"""
        updated = queryset.update(is_available=False)
        self.message_user(request, f'{updated} items marked as unavailable.')
    mark_as_unavailable.short_description = "Mark selected items as unavailable"
    
    def set_low_stock_alert(self, request, queryset):
        """Set stock to 3 for low stock testing"""
        updated = queryset.update(stock_quantity=3)
        self.message_user(request, f'{updated} items set to low stock (3 units).')
    set_low_stock_alert.short_description = "Set to low stock (3 units)"

@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = ('user', 'title', 'address')

@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ('user', 'created_at')

@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ('cart', 'food', 'quantity')

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'restaurant', 'get_delivery_address', 'status', 'total', 'created_at')
    fields = ('user', 'restaurant', 'rider', 'address', 'delivery_location', 'items', 'subtotal', 'delivery_fee', 'total', 'payment_method', 'status', 'note', 'prep_time', 'eta')
    
    def get_delivery_address(self, obj):
        """Display delivery address in admin list"""
        return obj.get_delivery_address_display()
    get_delivery_address.short_description = 'Delivery Address'

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'message', 'is_read')

@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ('user', 'food', 'restaurant')

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('order', 'rating', 'created_at')

@admin.register(PaymentMethod)
class PaymentMethodAdmin(admin.ModelAdmin):
    list_display = ('user', 'type')

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('order', 'amount', 'status')

@admin.register(AIChatMessage)
class AIChatMessageAdmin(admin.ModelAdmin):
    list_display = ('user', 'message', 'response')

@admin.register(RiderLocation)
class RiderLocationAdmin(admin.ModelAdmin):
    list_display = ('rider', 'lat', 'lng', 'updated_at')

@admin.register(OrderChatMessage)
class OrderChatMessageAdmin(admin.ModelAdmin):
    list_display = ('order', 'sender', 'message', 'created_at')