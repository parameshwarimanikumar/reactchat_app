import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        """Handles WebSocket connection for private chat"""
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'chat_{self.room_name}'
        self.channel_layer = get_channel_layer()

        # Add to WebSocket group
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        """Handles WebSocket disconnection"""
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        """Handles incoming messages from WebSocket"""
        try:
            data = json.loads(text_data)
            message = data.get('message', '')
            username = data.get('username', '')

            if message and username:
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'chat_message',
                        'message': message,
                        'username': username,
                    }
                )
        except Exception as e:
            print(f"WebSocket error: {e}")  # Logs errors

    async def chat_message(self, event):
        """Sends chat messages to WebSocket"""
        await self.send(text_data=json.dumps({
            'message': event['message'],
            'username': event['username'],
        }))


class GroupChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        """Handles WebSocket connection for group chat"""
        self.group_id = self.scope['url_route']['kwargs']['group_id']
        self.room_group_name = f'group_chat_{self.group_id}'
        self.channel_layer = get_channel_layer()

        # Add to WebSocket group
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        """Handles WebSocket disconnection"""
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        """Handles incoming messages from WebSocket"""
        try:
            data = json.loads(text_data)
            message = data.get('message', '')
            username = data.get('username', '')

            if message and username:
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'group_chat_message',
                        'message': message,
                        'username': username,
                        'group_id': self.group_id,  # Send group ID for filtering
                    }
                )
        except Exception as e:
            print(f"WebSocket error: {e}")  # Logs errors

    async def group_chat_message(self, event):
        """Sends group chat messages to WebSocket"""
        await self.send(text_data=json.dumps({
            'message': event['message'],
            'username': event['username'],
            'group_id': self.group_id,
        }))
