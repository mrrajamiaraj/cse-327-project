from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/order/(?P<order_id>\d+)/$', consumers.OrderConsumer.as_asgi()),
    re_path(r'ws/rider/$', consumers.RiderConsumer.as_asgi()),
    re_path(r'ws/restaurant/$', consumers.RestaurantConsumer.as_asgi()),
]