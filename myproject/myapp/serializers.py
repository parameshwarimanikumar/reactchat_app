from rest_framework import serializers
from django.core.files.storage import default_storage
from django.db.models import Q
from .models import CustomUser, Message, ChatGroup, GroupMessage

class ChatGroupSerializer(serializers.ModelSerializer):
    members = serializers.PrimaryKeyRelatedField(queryset=CustomUser.objects.all(), many=True)

    class Meta:
        model = ChatGroup
        fields = ["id", "name", "members", "created_at"]

class GroupMessageSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(source="sender.username", read_only=True)

    class Meta:
        model = GroupMessage
        fields = ["id", "group", "sender", "sender_username", "content", "file", "timestamp"]

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    last_message = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'password', 'profile_picture', 'last_message']

    def create(self, validated_data):
        """Hash password before saving user."""
        profile_picture = validated_data.pop('profile_picture', None)
        username = validated_data.get('username') or validated_data['email'].split('@')[0]

        user = CustomUser(username=username, email=validated_data['email'])
        user.set_password(validated_data['password'])
        
        if profile_picture:
            user.profile_picture = profile_picture
        user.save()
        return user

    def get_last_message(self, obj):
        """Retrieve the latest message involving the user."""
        last_message = Message.objects.filter(Q(sender=obj) | Q(receiver=obj)).order_by('-timestamp').first()

        if last_message:
            return {
                "text": last_message.content if last_message.content else "File Attached",
                "timestamp": last_message.timestamp.strftime("%I:%M %p") if last_message.timestamp else None
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
        """Return the full file URL or None if no file is attached."""
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
            return default_storage.url(obj.file.name)
        return None
