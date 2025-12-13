# core/models.py
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email is required')
        email = self.normalize_email(email)
        extra_fields.setdefault('username', email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'admin')
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        
        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    ROLE_CHOICES = (
        ('customer', 'Customer'),
        ('rider', 'Rider'),
        ('restaurant', 'Restaurant'),
        ('admin', 'Admin'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='customer')
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    phone = models.CharField(max_length=20, null=True, blank=True, help_text="Bangladesh phone number format: +880 1XXX-XXXXXX or 01XXX-XXXXXX")
    bio = models.TextField(max_length=500, null=True, blank=True, help_text="Short bio or description")
    is_online = models.BooleanField(default=False)  # for rider

    # Make username optional - we will use email as login
    username = models.CharField(
        max_length=150,
        unique=True,
        null=True,
        blank=True,
        help_text="Optional. Email will be used as login identifier.",
    )

    # Email is now required and unique
    email = models.EmailField(unique=True, db_index=True)

    # Tell Django to use email as the login field
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []  # No extra fields required
    
    objects = UserManager()

    def save(self, *args, **kwargs):
        # Automatically set username = email if not set
        if not self.username and self.email:
            self.username = self.email
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'

    def __str__(self):
        role_icons = {
            'customer': '👤',
            'restaurant': '🏪', 
            'rider': '🚴',
            'admin': '👑'
        }
        icon = role_icons.get(self.role, '👤')
        name = f"{self.first_name} {self.last_name}".strip()
        if name:
            return f"{icon} {name} ({self.email}) - {self.role.title()}"
        return f"{icon} {self.email} - {self.role.title()}"


# === All Other Models (unchanged, just kept full) ===

class Restaurant(models.Model):
    owner = models.OneToOneField(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    banner = models.ImageField(upload_to='banners/', null=True)
    cuisine = models.CharField(max_length=255, help_text="Restaurant cuisine type or description (e.g., Italian, Fast Food, Asian Fusion)")
    address = models.TextField(null=True, blank=True, help_text="Restaurant address")
    # rating is now calculated from reviews, not stored
    # delivery_time is now calculated based on distance
    is_approved = models.BooleanField(default=False)
    lat = models.FloatField(null=True)
    lng = models.FloatField(null=True)
    prep_time_minutes = models.IntegerField(default=20, help_text="Average food preparation time in minutes")

    def __str__(self):
        return self.name
    
    def get_average_rating(self):
        """Calculate average rating from all reviews for this restaurant's orders"""
        from django.db.models import Avg
        avg = Review.objects.filter(order__restaurant=self).aggregate(Avg('rating'))['rating__avg']
        return round(avg, 1) if avg else 0.0
    
    def calculate_delivery_time(self, customer_lat, customer_lng):
        """Calculate estimated delivery time based on distance"""
        if not self.lat or not self.lng:
            return "30 min"  # default fallback
        
        # Calculate distance using Haversine formula
        from math import radians, sin, cos, sqrt, atan2
        
        R = 6371  # Earth's radius in kilometers
        
        lat1 = radians(self.lat)
        lon1 = radians(self.lng)
        lat2 = radians(customer_lat)
        lon2 = radians(customer_lng)
        
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        
        a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
        c = 2 * atan2(sqrt(a), sqrt(1-a))
        distance_km = R * c
        
        # Estimate delivery time: prep time + travel time (assuming 30 km/h average speed)
        travel_time_minutes = (distance_km / 30) * 60
        total_time = self.prep_time_minutes + travel_time_minutes
        
        return f"{int(total_time)} min"


class Category(models.Model):
    """Global food categories shared across all restaurants (e.g., Pizza, Burger, Pasta)"""
    name = models.CharField(max_length=50, unique=True, help_text="e.g., Pizza, Burger, Pasta, Salad")
    icon = models.ImageField(upload_to='categories/', null=True, blank=True)
    description = models.TextField(null=True, blank=True, help_text="Optional description of this category")
    
    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name_plural = "Categories"
        ordering = ['name']


class Addon(models.Model):
    """Addon items that can be added to food (e.g., Extra Cheese, Bacon, etc.)"""
    name = models.CharField(max_length=100, help_text="e.g., Extra Cheese, Bacon, Avocado")
    price = models.DecimalField(max_digits=10, decimal_places=2, help_text="Additional price for this addon")
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, help_text="Restaurant that offers this addon")
    
    def __str__(self):
        return f"{self.name} (+৳{self.price})"
    
    class Meta:
        ordering = ['name']


class Food(models.Model):
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True)
    name = models.CharField(max_length=100)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.ImageField(upload_to='foods/')
    is_veg = models.BooleanField(default=True)
    ingredients = models.TextField(null=True)
    available_addons = models.ManyToManyField(Addon, blank=True, help_text="Select addons available for this food item")
    
    # Inventory Management
    stock_quantity = models.PositiveIntegerField(default=0, help_text="Available quantity in stock")
    is_available = models.BooleanField(default=True, help_text="Whether this item is currently available")

    def __str__(self):
        return self.name
    
    @property
    def stock_status(self):
        """Get stock status for admin display"""
        if not self.is_available:
            return "❌ Unavailable"
        elif self.stock_quantity == 0:
            return "🔴 Out of Stock"
        elif self.stock_quantity < 5:
            return f"🟡 Low Stock ({self.stock_quantity})"
        else:
            return f"🟢 In Stock ({self.stock_quantity})"
    
    def reduce_stock(self, quantity):
        """Reduce stock quantity when order is placed"""
        if self.stock_quantity >= quantity:
            self.stock_quantity -= quantity
            # Auto-disable if stock reaches 0
            if self.stock_quantity == 0:
                self.is_available = False
            self.save()
            return True
        return False


class Address(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=50)
    address = models.TextField()
    lat = models.FloatField()
    lng = models.FloatField()
    is_default = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.title} - {self.user.email}"


class Cart(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    food = models.ForeignKey(Food, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    variants = models.JSONField(default=list)
    addons = models.JSONField(default=list)


class Order(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('preparing', 'Preparing'),
        ('ready_for_pickup', 'Ready for Pickup'),
        ('rider_assigned', 'Rider Assigned'),
        ('picked_up', 'Picked Up'),
        ('out_for_delivery', 'Out for Delivery'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    )
    PAYMENT_METHODS = (
        ('cod', 'Cash on Delivery'),
        ('card', 'Card'),
        ('mobile_banking', 'Mobile Banking (bKash)'),
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='customer_orders')
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE)
    rider = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='rider_orders')
    address = models.ForeignKey(Address, on_delete=models.SET_NULL, null=True)
    delivery_location = models.JSONField(null=True, blank=True, help_text="Current location data when address is not saved")
    items = models.JSONField()
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    delivery_fee = models.DecimalField(max_digits=10, decimal_places=2)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS)
    payment_status = models.CharField(max_length=20, default='pending')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    note = models.TextField(null=True)
    prep_time = models.IntegerField(null=True)
    eta = models.CharField(max_length=20, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def get_delivery_address_display(self):
        """Get delivery address for display - either saved address or current location"""
        if self.address:
            return f"{self.address.title} - {self.address.address}"
        elif self.delivery_location:
            return f"Current Location - {self.delivery_location.get('address', 'Coordinates provided')}"
        return "No delivery address"
    
    def __str__(self):
        participants = []
        if self.user:
            participants.append(f"👤{self.user.email}")
        if self.restaurant and self.restaurant.owner:
            participants.append(f"🏪{self.restaurant.owner.email}")
        if self.rider:
            participants.append(f"🚴{self.rider.email}")
        
        return f"Order #{self.id} - {self.restaurant.name} - {self.status} - Participants: {', '.join(participants)}"


class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)


class Favorite(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    food = models.ForeignKey(Food, on_delete=models.CASCADE, null=True)
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, null=True)


class Review(models.Model):
    order = models.OneToOneField(Order, on_delete=models.CASCADE)
    rating = models.IntegerField(default=5)
    review = models.TextField(null=True)
    images = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)


class PaymentMethod(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    type = models.CharField(max_length=20, choices=(('card', 'Card'), ('bank', 'Bank')))
    details = models.JSONField()


class Transaction(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20)
    created_at = models.DateTimeField(auto_now_add=True)


class AIChatMessage(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    message = models.TextField()
    response = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)


class RiderLocation(models.Model):
    rider = models.OneToOneField(User, on_delete=models.CASCADE)
    lat = models.FloatField()
    lng = models.FloatField()
    updated_at = models.DateTimeField(auto_now=True)


class RestaurantEarnings(models.Model):
    """Track restaurant earnings and balance"""
    restaurant = models.OneToOneField(Restaurant, on_delete=models.CASCADE, related_name='earnings')
    total_earnings = models.DecimalField(max_digits=12, decimal_places=2, default=0.00, help_text="Total lifetime earnings")
    available_balance = models.DecimalField(max_digits=12, decimal_places=2, default=0.00, help_text="Available balance for withdrawal")
    pending_balance = models.DecimalField(max_digits=12, decimal_places=2, default=0.00, help_text="Pending balance (not yet available)")
    total_withdrawn = models.DecimalField(max_digits=12, decimal_places=2, default=0.00, help_text="Total amount withdrawn")
    commission_rate = models.DecimalField(max_digits=5, decimal_places=2, default=15.00, help_text="Platform commission percentage")
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.restaurant.name} - Balance: ৳{self.available_balance}"
    
    def add_earnings(self, order_total):
        """Add earnings from a completed order"""
        commission = (order_total * self.commission_rate) / 100
        restaurant_share = order_total - commission
        self.total_earnings += restaurant_share
        self.available_balance += restaurant_share
        self.save()
        return restaurant_share
    
    class Meta:
        verbose_name = "Restaurant Earnings"
        verbose_name_plural = "Restaurant Earnings"


class WithdrawalRequest(models.Model):
    """Track withdrawal requests from restaurants"""
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('rejected', 'Rejected'),
    )
    
    PAYMENT_METHODS = (
        ('bank_transfer', 'Bank Transfer'),
        ('mobile_banking', 'Mobile Banking (bKash/Nagad)'),
        ('check', 'Check'),
    )
    
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='withdrawals')
    amount = models.DecimalField(max_digits=10, decimal_places=2, help_text="Withdrawal amount")
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS, default='bank_transfer')
    payment_details = models.JSONField(help_text="Bank account or mobile banking details")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    requested_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(null=True, blank=True)
    processed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='processed_withdrawals')
    notes = models.TextField(null=True, blank=True, help_text="Admin notes or rejection reason")
    
    def __str__(self):
        return f"{self.restaurant.name} - ৳{self.amount} ({self.status})"
    
    class Meta:
        ordering = ['-requested_at']
        verbose_name = "Withdrawal Request"
        verbose_name_plural = "Withdrawal Requests"


class OrderChatMessage(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, help_text="Select the order this message belongs to")
    sender = models.ForeignKey(User, on_delete=models.CASCADE, help_text="Who is sending this message")
    message = models.TextField(help_text="Message content")
    image = models.ImageField(upload_to='chat_images/', null=True, blank=True, help_text="Optional image attachment")
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = "Order Chat Message"
        verbose_name_plural = "Order Chat Messages"
    
    def __str__(self):
        return f"Order #{self.order.id} - {self.sender.email}: {self.message[:50]}..."
    
    def get_participants(self):
        """Get all participants in this order for easy reference"""
        participants = [self.order.user]  # Customer
        if self.order.restaurant.owner:
            participants.append(self.order.restaurant.owner)  # Restaurant
        if self.order.rider:
            participants.append(self.order.rider)  # Rider
        return participants