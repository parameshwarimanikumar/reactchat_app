import logging
from django.contrib.auth import authenticate
from django.shortcuts import get_object_or_404
from django.db.models import OuterRef, Subquery, Q
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework_simplejwt.tokens import RefreshToken
from .models import CustomUser, Message
from .serializers import UserSerializer, UpdateProfilePictureSerializer, MessageSerializer

logger = logging.getLogger(__name__)

def error_response(message, code=status.HTTP_400_BAD_REQUEST):
    """Helper function to return error responses."""
    logger.error(f"Error: {message}")
    return Response({'error': message}, status=code)

# User Registration
@api_view(['POST'])
@permission_classes([AllowAny])
def create_user(request):
    """Handles user registration."""
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    return error_response(serializer.errors)

# User Login
@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    """Handles user login and returns JWT tokens."""
    email = request.data.get('email', '').strip().lower()
    password = request.data.get('password')

    if not email or not password:
        return error_response('Email and password are required.')

    user = authenticate(request, email=email, password=password)

    if user:
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'username': user.username,
        }, status=status.HTTP_200_OK)

    return error_response('Invalid email or password.', status.HTTP_401_UNAUTHORIZED)

# List All Users with Last Message Timestamp
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_list(request):
    """Returns a list of all registered users with last message timestamp."""
    users = CustomUser.objects.exclude(id=request.user.id)

    last_message_subquery = Message.objects.filter(
        Q(sender=OuterRef('id'), receiver=request.user) | Q(sender=request.user, receiver=OuterRef('id'))
    ).order_by('-timestamp').values('timestamp')[:1]

    users = users.annotate(last_message_time=Subquery(last_message_subquery))

    serializer = UserSerializer(users, many=True, context={'request': request})
    return Response(serializer.data)

# Get Authenticated User Info
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    """Returns the authenticated user's details."""
    user = request.user
    profile_picture_url = request.build_absolute_uri(user.profile_picture.url) if user.profile_picture else None

    return Response({
        'username': user.username,
        'profile_picture': profile_picture_url
    })

# Get Messages Between Users
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_messages(request, user_id):
    """Fetch messages between the authenticated user and another user."""
    other_user = get_object_or_404(CustomUser, id=user_id)

    messages = Message.objects.filter(
        Q(sender=request.user, receiver=other_user) | Q(sender=other_user, receiver=request.user)
    ).select_related('sender', 'receiver').order_by('timestamp')

    serializer = MessageSerializer(messages, many=True, context={'request': request})
    return Response(serializer.data, status=status.HTTP_200_OK)

# Send Message
@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def send_message(request):
    """Handles sending messages between users."""
    sender = request.user
    receiver_id = request.data.get('recipient_id')
    content = request.data.get('content', '').strip()
    file = request.FILES.get('file')

    if not receiver_id or (not content and not file):
        return error_response('Recipient and either message content or file are required.')

    receiver = get_object_or_404(CustomUser, id=receiver_id)

    if sender == receiver:
        return error_response('You cannot send messages to yourself.')

    message = Message.objects.create(sender=sender, receiver=receiver, content=content, file=file)
    
    serializer = MessageSerializer(message, context={'request': request})
    return Response(serializer.data, status=status.HTTP_201_CREATED)

# Delete Message
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_message(request, message_id):
    """Handles deleting a message if the user is the sender."""
    message = get_object_or_404(Message, id=message_id)

    if message.sender != request.user:
        return error_response("You can only delete messages that you sent.", status.HTTP_403_FORBIDDEN)

    message.delete()
    return Response({"message": "Message deleted successfully."}, status=status.HTTP_204_NO_CONTENT)

# Update Profile Picture
@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def update_profile_picture(request):
    """Handles updating the user's profile picture."""
    user = request.user
    serializer = UpdateProfilePictureSerializer(user, data=request.data, partial=True)

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)

    return error_response(str(serializer.errors))
