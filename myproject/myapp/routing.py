from django.urls import re_path
from myapp.consumers import ChatConsumer, GroupChatConsumer

websocket_urlpatterns = [
    re_path(r"ws/chat/(?P<room_name>\w+)/$", ChatConsumer.as_asgi()),
    re_path(r"ws/group/(?P<group_id>\d+)/$", GroupChatConsumer.as_asgi()),  # Change to group_id
]
