from django.core.management.base import BaseCommand
from core.models import Order, User, OrderChatMessage

class Command(BaseCommand):
    help = 'Send a chat message for an order'

    def add_arguments(self, parser):
        parser.add_argument('order_id', type=int, help='Order ID')
        parser.add_argument('sender_email', type=str, help='Sender email')
        parser.add_argument('message', type=str, help='Message content')

    def handle(self, *args, **options):
        try:
            order = Order.objects.get(id=options['order_id'])
            sender = User.objects.get(email=options['sender_email'])
            
            # Validate sender is a participant
            valid_senders = [order.user, order.restaurant.owner]
            if order.rider:
                valid_senders.append(order.rider)
            
            if sender not in valid_senders:
                self.stdout.write(
                    self.style.ERROR(
                        f'Error: {sender.email} is not a participant in Order #{order.id}'
                    )
                )
                self.stdout.write(f'Valid participants: {", ".join([u.email for u in valid_senders if u])}')
                return
            
            # Create message
            message = OrderChatMessage.objects.create(
                order=order,
                sender=sender,
                message=options['message']
            )
            
            self.stdout.write(
                self.style.SUCCESS(
                    f'✅ Message sent successfully!\n'
                    f'Order: #{order.id} - {order.restaurant.name}\n'
                    f'From: {sender}\n'
                    f'Message: {options["message"]}'
                )
            )
            
        except Order.DoesNotExist:
            self.stdout.write(
                self.style.ERROR(f'Order #{options["order_id"]} not found')
            )
        except User.DoesNotExist:
            self.stdout.write(
                self.style.ERROR(f'User {options["sender_email"]} not found')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error: {e}')
            )