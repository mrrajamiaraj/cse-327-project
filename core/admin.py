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
    list_display = ('get_order_info', 'get_sender_info', 'get_message_preview', 'created_at')
    list_filter = ('sender__role', 'order__status', 'created_at')
    search_fields = ('message', 'order__id', 'sender__email', 'order__restaurant__name')
    ordering = ('-created_at',)
    
    fieldsets = (
        ('Message Details', {
            'fields': ('order', 'sender', 'message', 'image'),
            'description': 'Select the order and sender, then type your message. Image is optional.'
        }),
        ('Participants Info', {
            'fields': (),
            'description': 'Order participants will be shown after selecting an order.'
        }),
    )
    
    def get_order_info(self, obj):
        """Display order info with participants"""
        participants = []
        if obj.order.user:
            participants.append(f"👤 {obj.order.user.email} (Customer)")
        if obj.order.restaurant.owner:
            participants.append(f"🏪 {obj.order.restaurant.owner.email} (Restaurant)")
        if obj.order.rider:
            participants.append(f"🚴 {obj.order.rider.email} (Rider)")
        
        return f"Order #{obj.order.id} - {obj.order.restaurant.name}\nParticipants: {', '.join(participants)}"
    get_order_info.short_description = 'Order & Participants'
    
    def get_sender_info(self, obj):
        """Display sender with role"""
        role_icons = {
            'customer': '👤',
            'restaurant': '🏪', 
            'rider': '🚴',
            'admin': '👑'
        }
        icon = role_icons.get(obj.sender.role, '👤')
        return f"{icon} {obj.sender.email} ({obj.sender.role.title()})"
    get_sender_info.short_description = 'Sender'
    
    def get_message_preview(self, obj):
        """Show message preview with image indicator"""
        preview = obj.message[:100] + "..." if len(obj.message) > 100 else obj.message
        if obj.image:
            preview += " 📷"
        return preview
    get_message_preview.short_description = 'Message'
    
    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        """Customize the dropdown options"""
        if db_field.name == "order":
            # Show orders with more context
            kwargs["queryset"] = Order.objects.select_related('user', 'restaurant', 'rider').order_by('-created_at')
        elif db_field.name == "sender":
            # Show users with role context
            kwargs["queryset"] = User.objects.all().order_by('role', 'email')
        return super().formfield_for_foreignkey(db_field, request, **kwargs)
    
    def save_model(self, request, obj, form, change):
        """Add helpful validation"""
        # Validate that sender is a participant in the order
        valid_senders = [obj.order.user, obj.order.restaurant.owner]
        if obj.order.rider:
            valid_senders.append(obj.order.rider)
        
        if obj.sender not in valid_senders:
            from django.contrib import messages
            messages.warning(request, 
                f"Warning: {obj.sender.email} is not a participant in Order #{obj.order.id}. "
                f"Valid participants are: {', '.join([u.email for u in valid_senders if u])}")
        
        super().save_model(request, obj, form, change)