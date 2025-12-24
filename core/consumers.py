import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser

class OrderConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.order_id = self.scope['url_route']['kwargs']['order_id']
        self.group_name = f'order_{self.order_id}'
        
        # Check if user is authenticated
        user = self.scope.get('user')
        if user and not isinstance(user, AnonymousUser):
            # Verify user has access to this order
            has_access = await self.check_order_access(user, self.order_id)
            if has_access:
                await self.channel_layer.group_add(self.group_name, self.channel_name)
                await self.accept()
            else:
                await self.close(code=4003)  # Forbidden
        else:
            await self.close(code=4001)  # Unauthorized

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data):
        """Handle incoming WebSocket messages"""
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            if message_type == 'ping':
                await self.send(text_data=json.dumps({'type': 'pong'}))
            elif message_type == 'location_update' and self.scope['user'].role == 'rider':
                # Handle rider location updates
                await self.handle_location_update(data)
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({'error': 'Invalid JSON'}))

    async def order_update(self, event):
        """Send order status updates to connected clients"""
        await self.send(text_data=json.dumps({
            'type': 'order_update',
            'data': event['data']
        }))

    async def location_update(self, event):
        """Send rider location updates to connected clients"""
        await self.send(text_data=json.dumps({
            'type': 'location_update',
            'data': event['data']
        }))

    @database_sync_to_async
    def check_order_access(self, user, order_id):
        """Check if user has access to this order"""
        from .models import Order
        try:
            order = Order.objects.get(id=order_id)
            # Customer, restaurant owner, or assigned rider can access
            return (
                order.user == user or 
                order.restaurant.owner == user or 
                order.rider == user or
                user.role == 'admin'
            )
        except Order.DoesNotExist:
            return False

    @database_sync_to_async
    def handle_location_update(self, data):
        """Handle rider location updates"""
        from .models import RiderLocation
        try:
            location, created = RiderLocation.objects.get_or_create(
                rider=self.scope['user'],
                defaults={
                    'lat': data.get('lat'),
                    'lng': data.get('lng'),
                    'heading': data.get('heading'),
                    'speed': data.get('speed'),
                    'accuracy': data.get('accuracy'),
                    'is_moving': data.get('is_moving', False)
                }
            )
            if not created:
                location.lat = data.get('lat', location.lat)
                location.lng = data.get('lng', location.lng)
                location.heading = data.get('heading', location.heading)
                location.speed = data.get('speed', location.speed)
                location.accuracy = data.get('accuracy', location.accuracy)
                location.is_moving = data.get('is_moving', location.is_moving)
                location.save()
        except Exception as e:
            print(f"Error updating rider location: {e}")


class RiderConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for rider-specific updates"""
    
    async def connect(self):
        user = self.scope.get('user')
        if user and user.role == 'rider':
            self.rider_id = user.id
            self.group_name = f'rider_{self.rider_id}'
            await self.channel_layer.group_add(self.group_name, self.channel_name)
            await self.accept()
        else:
            await self.close(code=4003)

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def new_order(self, event):
        """Send new order notifications to rider"""
        await self.send(text_data=json.dumps({
            'type': 'new_order',
            'data': event['data']
        }))


class RestaurantConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for restaurant-specific updates"""
    
    async def connect(self):
        user = self.scope.get('user')
        if user and user.role == 'restaurant':
            self.restaurant_id = user.id
            self.group_name = f'restaurant_{self.restaurant_id}'
            await self.channel_layer.group_add(self.group_name, self.channel_name)
            await self.accept()
        else:
            await self.close(code=4003)

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def new_order(self, event):
        """Send new order notifications to restaurant"""
        await self.send(text_data=json.dumps({
            'type': 'new_order',
            'data': event['data']
        }))

    async def rider_assigned(self, event):
        """Send rider assignment notifications to restaurant"""
        await self.send(text_data=json.dumps({
            'type': 'rider_assigned',
            'data': event['data']
        }))