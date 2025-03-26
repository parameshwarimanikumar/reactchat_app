import logging
from django.contrib.auth import authenticate
from django.shortcuts import get_object_or_404
from django.db.models import OuterRef, Subquery, Q, Value
from django.db.models.functions import Coalesce
from django.db.models import DateTimeField
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework_simplejwt.tokens import RefreshToken
from .models import CustomUser, Message, ChatGroup, GroupMessage
from .serializers import (
    UserSerializer,
    UpdateProfilePictureSerializer,
    MessageSerializer,
    ChatGroupSerializer,
    GroupMessageSerializer
)

logger = logging.getLogger(__name__)

def error_response(message, code=status.HTTP_400_BAD_REQUEST):
    """Helper function for returning error responses with logging."""
    logger.error(f"Error: {message}")
    return Response({"error": message}, status=code)


# ✅ User Registration
@api_view(["POST"])
@permission_classes([AllowAny])
def create_user(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return error_response(serializer.errors)


# ✅ User Login
@api_view(["POST"])
@permission_classes([AllowAny])
def login_user(request):
    email = request.data.get("email", "").strip().lower()
    password = request.data.get("password")

    if not email or not password:
        return error_response("Email and password are required.")

    user = authenticate(request, email=email, password=password)
    if user:
        refresh = RefreshToken.for_user(user)
        return Response({
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "username": user.username,
        }, status=status.HTTP_200_OK)

    return error_response("Invalid email or password.", status.HTTP_401_UNAUTHORIZED)


# ✅ List All Users
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def user_list(request):
    users = CustomUser.objects.exclude(id=request.user.id)

    last_message_subquery = Message.objects.filter(
        Q(sender=OuterRef("id"), receiver=request.user) |
        Q(sender=request.user, receiver=OuterRef("id"))
    ).order_by("-timestamp").values("timestamp")[:1]

    users = users.annotate(
        last_message_time=Coalesce(Subquery(last_message_subquery, output_field=DateTimeField()), Value(None, output_field=DateTimeField()))
    )

    serializer = UserSerializer(users, many=True, context={"request": request})
    return Response(serializer.data)


# ✅ Get Authenticated User Info
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def current_user(request):
    user = request.user
    profile_picture_url = request.build_absolute_uri(user.profile_picture.url) if user.profile_picture else None

    return Response({
        "id": user.id,  # 🔹 Add this line
        "username": user.username,
        "profile_picture": profile_picture_url,
    })

# ✅ Get Messages Between Users
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_messages(request, user_id):
    other_user = get_object_or_404(CustomUser, id=user_id)

    messages = Message.objects.filter(
        Q(sender=request.user, receiver=other_user) |
        Q(sender=other_user, receiver=request.user)
    ).select_related("sender", "receiver").order_by("-timestamp")[:50]

    serializer = MessageSerializer(messages, many=True, context={"request": request})
    return Response(serializer.data, status=status.HTTP_200_OK)


# ✅ Send Message

@api_view(["POST"])
@permission_classes([IsAuthenticated])  # Require authentication
def send_message(request):
    user = request.user  # Get the authenticated user
    data = request.data

    # Get recipient (group_id or recipient_id)
    group_id = data.get("group_id")  # If it's a group chat
    recipient_id = data.get("recipient_id")  # If it's a direct message
    message_content = data.get("content")
    file = request.FILES.get("file")

    # Ensure we have a valid recipient (either group or user)
    if not group_id and not recipient_id:
        return Response({"error": "Recipient is required (group_id or recipient_id)."}, status=status.HTTP_400_BAD_REQUEST)

    if not message_content and not file:
        return Response({"error": "Either message content or a file is required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        if group_id:
            # Handle group messages
            chat_group = ChatGroup.objects.get(id=group_id)
            message = GroupMessage.objects.create(
                group=chat_group,
                sender=user,
                content=message_content,
                file=file
            )
            serializer = GroupMessageSerializer(message, context={"request": request})
        else:
            # Handle direct messages
            recipient = CustomUser.objects.get(id=recipient_id)
            message = Message.objects.create(
                sender=user,
                receiver=recipient,
                content=message_content,
                file=file
            )
            serializer = MessageSerializer(message, context={"request": request})

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    except ChatGroup.DoesNotExist:
        return Response({"error": "Group not found."}, status=status.HTTP_404_NOT_FOUND)
    except CustomUser.DoesNotExist:
        return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
# ✅ Delete Message
@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_message(request, message_id):
    message = get_object_or_404(Message, id=message_id)

    if message.sender != request.user:
        return error_response("You can only delete messages that you sent.", status.HTTP_403_FORBIDDEN)

    message.delete()
    return Response({"message": "Message deleted successfully."}, status=status.HTTP_200_OK)


# ✅ Update Profile Picture
@api_view(["POST"])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def update_profile_picture(request):
    user = request.user
    serializer = UpdateProfilePictureSerializer(user, data=request.data, partial=True)

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)

    return error_response(serializer.errors)

# ✅ List All Groups the User is a Member Of
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_groups(request):
    """Retrieve groups where the user is a member."""
    name = request.GET.get("name", "").strip()
    groups = ChatGroup.objects.filter(members=request.user)

    if name:
        groups = groups.filter(name__icontains=name)
 
    serializer = ChatGroupSerializer(groups, many=True, context={"request": request})
    return Response(serializer.data, status=status.HTTP_200_OK)


# ✅ Create Group
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_group(request):
    serializer = ChatGroupSerializer(data=request.data)
    if serializer.is_valid():
        group = serializer.save(admin=request.user)  # Ensure the creator is set as admin
        group.members.add(request.user)  # Ensure the creator is in the group
        return Response(ChatGroupSerializer(group).data, status=status.HTTP_201_CREATED)
    return error_response(serializer.errors)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def update_group_icon(request, group_name):
    group = get_object_or_404(ChatGroup, name=group_name)

    # ✅ Only allow group members to update the icon
    if request.user not in group.members.all():
        return Response({"error": "Only group members can update the icon."}, status=status.HTTP_403_FORBIDDEN)

    icon = request.FILES.get("icon")
    if not icon:
        return Response({"error": "Group icon is required."}, status=status.HTTP_400_BAD_REQUEST)

    group.icon = icon
    group.save()
    return Response({"message": "Group icon updated successfully."}, status=status.HTTP_200_OK)


# ✅ Remove User from Group
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def remove_user_from_group(request):
    group_name = request.data.get("group_name", "").strip()
    username = request.data.get("username", "").strip()

    if not group_name or not username:
        return Response({"error": "Group name and username are required."}, status=status.HTTP_400_BAD_REQUEST)

    group = get_object_or_404(ChatGroup, name=group_name)
    user_to_remove = get_object_or_404(CustomUser, username=username)

    # ✅ Only group members can remove users
    if request.user not in group.members.all():
        return Response({"error": "Only group members can remove users."}, status=status.HTTP_403_FORBIDDEN)

    # ✅ Prevent removing the group admin
    if user_to_remove == group.admin:
        return Response({"error": "You cannot remove the group admin."}, status=status.HTTP_403_FORBIDDEN)

    if user_to_remove not in group.members.all():
        return Response({"error": "User is not a member of this group."}, status=status.HTTP_400_BAD_REQUEST)

    group.members.remove(user_to_remove)
    return Response({"message": f"User '{username}' removed from '{group_name}' successfully."}, status=status.HTTP_200_OK)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_group(request, group_name):  # ✅ Accepts group_name as a URL parameter
    group = get_object_or_404(ChatGroup, name=group_name)

    # ✅ Ensure the user is part of the group before allowing deletion
    if request.user not in group.members.all():
        return Response({"error": "You must be a group member to delete it."}, status=status.HTTP_403_FORBIDDEN)

    # ✅ Clear members and delete the group
    group.members.clear()
    group.delete()

    return Response({"message": f"Group '{group_name}' deleted successfully."}, status=status.HTTP_200_OK)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_group_messages(request, group_id):
    group = get_object_or_404(ChatGroup, id=group_id)

    if request.user not in group.members.all():
        return error_response("You are not a member of this group.", status.HTTP_403_FORBIDDEN)

    messages = GroupMessage.objects.filter(group=group).select_related("sender").order_by("-timestamp")
    serializer = GroupMessageSerializer(messages, many=True, context={"request": request})

    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def send_group_message(request, group_id):
    group = get_object_or_404(ChatGroup, id=group_id)

    if request.user not in group.members.all():
        return error_response("You are not a member of this group.", status.HTTP_403_FORBIDDEN)

    content = request.data.get("content", "").strip()
    file = request.FILES.get("file")

    if not content and not file:
        return error_response("Message content or file is required.")

    message = GroupMessage.objects.create(group=group, sender=request.user, content=content, file=file)
    serializer = GroupMessageSerializer(message, context={"request": request})

    return Response(serializer.data, status=status.HTTP_201_CREATED)  # ✅ Fixed missing return
