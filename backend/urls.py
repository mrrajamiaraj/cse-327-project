from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework.routers import DefaultRouter
from core.views import *
from django.urls import path
from core.views import RegisterView, LoginView
from core.search_views import SearchView
from rest_framework_simplejwt.views import TokenRefreshView

router = DefaultRouter()
router.register(r'customer/restaurants', RestaurantViewSet, basename='restaurant')
router.register(r'customer/food', FoodViewSet, basename='food')
router.register(r'customer/cart', CartViewSet, basename='cart')
router.register(r'customer/addresses', AddressViewSet, basename='address')
router.register(r'customer/orders', OrderViewSet, basename='order')
router.register(r'customer/favorites', FavoriteViewSet, basename='favorite')
router.register(r'customer/notifications', NotificationViewSet, basename='notification')
router.register(r'customer/payments/methods', PaymentMethodViewSet, basename='payment-method')
router.register(r'customer/payments/transactions', TransactionViewSet, basename='transaction')
router.register(r'customer/ai-chat', AIChatViewSet, basename='ai-chat')
router.register(r'restaurant/menu/categories', CategoryViewSet, basename='category')
router.register(r'restaurant/menu/items', MenuItemViewSet, basename='menu-item')
router.register(r'restaurant/orders', RestaurantOrderViewSet, basename='restaurant-order')
router.register(r'restaurant/reviews', RestaurantReviewViewSet, basename='restaurant-review')
router.register(r'rider/orders/available', RiderAvailableOrderViewSet, basename='rider-available-order')
router.register(r'rider/orders/history', RiderOrderHistoryViewSet, basename='rider-order-history')
router.register(r'admin/login-logs', LoginLogViewSet, basename='login-log')

router.register(r'admin/users', AdminUserViewSet, basename='admin-user')
router.register(r'admin/restaurants', AdminRestaurantViewSet, basename='admin-restaurant')
router.register(r'admin/orders', AdminOrderViewSet, basename='admin-order')
router.register(r'admin/reviews', AdminReviewViewSet, basename='admin-review')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', include(router.urls)),
    path('api/v1/auth/register/', RegisterView.as_view()),
    path('api/v1/auth/login/', LoginView.as_view()),
    path('api/v1/auth/token/refresh/', TokenRefreshView.as_view()),
    path('api/v1/auth/profile/', ProfileView.as_view()),
    path('api/v1/customer/home/', HomeView.as_view({'get': 'list'})),
    path('api/v1/customer/search/', SearchView.as_view(), name='search'),
    path('api/v1/customer/checkout/', CheckoutView.as_view({'post': 'create'})),
    path('api/v1/restaurant/profile/', RestaurantProfileView.as_view()),
    path('api/v1/restaurant/analytics/', RestaurantAnalyticsView.as_view()),
    path('api/v1/restaurant/earnings/', RestaurantEarningsView.as_view()),
    path('api/v1/restaurant/withdrawals/', RestaurantWithdrawalsView.as_view()),
    path('api/v1/rider/availability/', RiderAvailabilityView.as_view()),
    path('api/v1/rider/location/', RiderLocationView.as_view()),
    path('api/v1/rider/profile/', RiderProfileView.as_view()),
    path('api/v1/admin/dashboard/', AdminDashboardView.as_view()),
    path('api/v1/admin/revenue/', AdminRevenueView.as_view()),
    path('api/v1/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/v1/docs/', SpectacularSwaggerView.as_view(url_name='schema')),
    path('api/v1/rider/earnings/', RiderEarningsView.as_view(), name='rider-earnings'),
    path('api/v1/auth/register/', RegisterView.as_view(), name='register'),
    path('api/v1/auth/login/', LoginView.as_view(), name='login'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)