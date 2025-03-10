from rest_framework import serializers
from django.core.files.storage import default_storage
from django.db.models import Q
from django.utils.dateformat import format
import random
from django.contrib.auth.hashers import make_password
from .models import CustomUser, Message, ChatGroup, GroupMessage

class ChatGroupSerializer(serializers.ModelSerializer):
    admin = serializers.PrimaryKeyRelatedField(queryset=CustomUser.objects.all(), required=False)
    members = serializers.PrimaryKeyRelatedField(queryset=CustomUser.objects.all(), many=True, required=False)
    icon = serializers.ImageField(required=False)
    updated_at = serializers.DateTimeField(read_only=True)

    class Meta:
        model = ChatGroup
        fields = ["id", "name", "icon", "members", "admin", "created_at", "updated_at"]

    def create(self, validated_data):
        request = self.context.get("request")
        if request and hasattr(request, "user") and request.user.is_authenticated:
            validated_data["admin"] = request.user  # Set the admin

        members = validated_data.pop("members", [])  
        chat_group = ChatGroup.objects.create(**validated_data)

        if validated_data.get("admin"):
            chat_group.members.add(validated_data["admin"])

        chat_group.members.add(*members)  
        return chat_group

class GroupMessageSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(source="sender.username", read_only=True)
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = GroupMessage
        fields = ["id", "group", "sender", "sender_username", "content", "file", "file_url", "timestamp"]

    def get_file_url(self, obj):
        if obj.file:
            request = self.context.get('request')
            return request.build_absolute_uri(obj.file.url) if request else obj.file.url
        return None

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    last_message = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'password', 'profile_picture', 'last_message']

    def create(self, validated_data):
        profile_picture = validated_data.pop('profile_picture', None)
        email = validated_data['email']
        username = validated_data.get('username') or email.split('@')[0]

        if CustomUser.objects.filter(username=username).exists():
            username = f"{username}{random.randint(1000, 9999)}"

        user = CustomUser(username=username, email=email)
        user.password = make_password(validated_data['password'])
        if profile_picture:
            user.profile_picture = profile_picture
        user.save()
        return user

    def get_last_message(self, obj):
        last_message = Message.objects.filter(Q(sender=obj) | Q(receiver=obj))\
            .select_related('sender', 'receiver').order_by('-timestamp').first()

        if last_message:
            return {
                "text": last_message.content if last_message.content else "File Attached",
                "timestamp": format(last_message.timestamp, "g:i A")
            }
        return None

class UpdateProfilePictureSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['profile_picture']

class MessageSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(source='sender.username', read_only=True)
    receiver_username = serializers.CharField(source='receiver.username', read_only=True)
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ['id', 'sender', 'receiver', 'content', 'file', 'timestamp', 'sender_username', 'receiver_username', 'file_url']

    def get_file_url(self, obj):
        if obj.file:
            request = self.context.get('request')
            return request.build_absolute_uri(obj.file.url) if request else default_storage.url(obj.file.name)
        return None

    def create(self, validated_data):
        return Message.objects.create(**validated_data)
