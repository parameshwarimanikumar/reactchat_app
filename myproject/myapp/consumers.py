from channels.generic.websocket import AsyncWebsocketConsumer
import json

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f"chat_{self.room_name}"

        # ✅ Join room group
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        # ✅ Leave room group
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        try:
            text_data_json = json.loads(text_data)
            message = text_data_json.get("message", "")
            sender_id = text_data_json.get("sender_id", "")
            recipient_id = text_data_json.get("recipient_id")  # Optional

            if not message or not sender_id:
                return  # Ignore empty messages

            # ✅ Send message to room group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "chat_message",
                    "message": message,
                    "sender_id": sender_id,
                    "recipient_id": recipient_id,
                }
            )
        except json.JSONDecodeError:
            print("Error: Invalid JSON received")

    async def chat_message(self, event):
        # ✅ Send message to WebSocket
        await self.send(text_data=json.dumps({
            "message": event["message"],
            "sender_id": event["sender_id"],
            "recipient_id": event.get("recipient_id"),  # Include recipient_id if exists
        }))
