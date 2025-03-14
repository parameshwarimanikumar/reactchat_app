from channels.generic.websocket import AsyncWebsocketConsumer
import json

class GroupChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.group_id = self.scope['url_route']['kwargs']['group_id']
        self.group_name = f"group_{self.group_id}"

        # ✅ Join the group
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        # ✅ Leave the group
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message = data.get("message", "")
            sender_id = data.get("sender_id", "")

            if not message or not sender_id:
                return  # Ignore empty messages

            # ✅ Send message to group
            await self.channel_layer.group_send(
                self.group_name,
                {
                    "type": "group_message",
                    "message": message,
                    "sender_id": sender_id,
                }
            )
        except json.JSONDecodeError:
            print("Error: Invalid JSON received")

    async def group_message(self, event):
        # ✅ Send message to WebSocket
        await self.send(text_data=json.dumps({
            "message": event["message"],
            "sender_id": event["sender_id"],
        }))
