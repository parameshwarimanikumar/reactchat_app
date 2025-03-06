from rest_framework import serializers
from django.conf import settings
from django.db.models import Q  # ✅ Import this for filtering queries
from .models import CustomUser, Message

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    last_message_time = serializers.DateTimeField(read_only=True, format="%I:%M %p", required=False)
    last_message = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'password', 'profile_picture', 'last_message_time', 'last_message']

    def create(self, validated_data):
        """Override create method to hash password before saving."""
        profile_picture = validated_data.pop('profile_picture', None)
        user = CustomUser(
            username=validated_data['username'],
            email=validated_data['email']
        )
        user.set_password(validated_data['password'])
        if profile_picture:
            user.profile_picture = profile_picture
        user.save()
        return user

    def get_last_message(self, obj):
        """Get the last message sent/received by the user."""
        last_message = Message.objects.filter(
            Q(sender=obj) | Q(receiver=obj)  # ✅ Use `Q` from `django.db.models`
        ).order_by('-timestamp').first()

        return {
            "text": last_message.content if last_message else None,
            "timestamp": last_message.timestamp.strftime("%I:%M %p") if last_message else None
        }

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
        fields = '__all__'

    def get_file_url(self, obj):
        """Return absolute file URL if attached, otherwise None."""
        if obj.file:
            request = self.context.get('request')
            return request.build_absolute_uri(obj.file.url) if request else f"{settings.MEDIA_URL}{obj.file.name}"
        return None
