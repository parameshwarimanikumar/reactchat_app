from django.urls import re_path
from myapp.consumers import ChatConsumer, GroupChatConsumer

websocket_urlpatterns = [
    re_path(r'ws/chat/(?P<room_name>\w+)/$', ChatConsumer.as_asgi()),  # Private Chat
    re_path(r'ws/group_chat/(?P<group_id>\w+)/$', GroupChatConsumer.as_asgi()),  # Group Chat
]
