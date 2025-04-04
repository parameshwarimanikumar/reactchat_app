from rest_framework import serializers
from django.core.files.storage import default_storage
from django.db.models import Q
from django.utils.dateformat import format
import random
from django.contrib.auth.hashers import make_password
from .models import CustomUser, Message, ChatGroup, GroupMessage

# ✅ Chat Group Serializer
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
            validated_data["admin"] = request.user
        else:
            raise serializers.ValidationError("Only authenticated users can create groups.")

        members = validated_data.pop("members", [])
        chat_group = ChatGroup.objects.create(**validated_data)
        chat_group.members.add(chat_group.admin, *members)  # Add admin + members

        return chat_group


# ✅ Group Message Serializer
class GroupMessageSerializer(serializers.ModelSerializer):
    sender_id = serializers.ReadOnlyField(source="sender.id")  # ✅ Ensure sender ID is included
    sender_name = serializers.SerializerMethodField()
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = GroupMessage
        fields = ["id", "group", "sender", "sender_id", "sender_name", "content", "file", "file_url", "timestamp"]

    def get_sender_name(self, obj):
        return obj.sender.get_full_name().strip() or obj.sender.username

    def get_file_url(self, obj):
        if obj.file:
            request = self.context.get("request")
            file_url = obj.file.url
            return request.build_absolute_uri(file_url) if request else default_storage.url(obj.file.name)
        return None



# ✅ User Serializer
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

        # Ensure username uniqueness
        while CustomUser.objects.filter(username=username).exists():
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
                "timestamp": last_message.timestamp.strftime("%I:%M %p") if last_message.timestamp else "Unknown"
            }
        return None


# ✅ Update Profile Picture Serializer
class UpdateProfilePictureSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['profile_picture']


# ✅ Message Serializer
class MessageSerializer(serializers.ModelSerializer):
    sender_id = serializers.IntegerField(source='sender.id', read_only=True)  # ✅ Add sender_id
    receiver_id = serializers.IntegerField(source='receiver.id', read_only=True)  # ✅ Add receiver_id
    sender_username = serializers.CharField(source='sender.username', read_only=True)
    receiver_username = serializers.CharField(source='receiver.username', read_only=True)
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ["id", "sender", "sender_id", "receiver", "receiver_id", "content", "file", "timestamp", "sender_username", "receiver_username", "file_url"]

    def get_file_url(self, obj):
        if obj.file:
            request = self.context.get('request')
            file_url = obj.file.url
            return request.build_absolute_uri(file_url) if request else default_storage.url(obj.file.name)
        return None
