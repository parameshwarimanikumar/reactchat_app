from django.urls import path
from . import views

urlpatterns = [
    # ✅ User Endpoints
    path("users/", views.user_list, name="user_list"),
    path("current_user/", views.current_user, name="current_user"),
    path("login/", views.login_user, name="login_user"),
    path("create_user/", views.create_user, name="create_user"),

    # ✅ Messaging Endpoints
    path("messages/<int:user_id>/", views.get_messages, name="get_messages"),
    path("send_message/", views.send_message, name="send_message"),
    path("update_profile_picture/", views.update_profile_picture, name="update_profile_picture"),
    path("delete_message/<int:message_id>/", views.delete_message, name="delete_message"),

    # ✅ Group Chat Endpoints
    path("groups/", views.list_groups, name="list_groups"),
    path("groups/create/", views.create_group, name="create_group"),
    path("groups/<str:group_name>/delete/", views.delete_group, name="delete_group"),  
    path("groups/<int:group_id>/messages/", views.get_group_messages, name="get_group_messages"),
    path("groups/<int:group_id>/send_message/", views.send_group_message, name="send_group_message"),
    path("groups/<str:group_name>/update_icon/", views.update_group_icon, name="update_group_icon"),
    path("groups/remove_user/", views.remove_user_from_group, name="remove_user_from_group"),
    path("delete_group_message/<int:message_id>/", views.delete_group_message, name="delete-group-message"),  # 🔹 Fixed import
]

#add user in group 

from django.urls import path
from . import views

urlpatterns = [
    # ✅ User Endpoints
    path("users/", views.user_list, name="user_list"),
    path("current_user/", views.current_user, name="current_user"),
    path("login/", views.login_user, name="login_user"),
    path("create_user/", views.create_user, name="create_user"),

    # ✅ Messaging Endpoints
    path("messages/<int:user_id>/", views.get_messages, name="get_messages"),
    path("send_message/", views.send_message, name="send_message"),
    path("update_profile_picture/", views.update_profile_picture, name="update_profile_picture"),
    path("delete_message/<int:message_id>/", views.delete_message, name="delete_message"),

    # ✅ Group Chat Endpoints
    path("groups/", views.list_groups, name="list_groups"),
    path("groups/create/", views.create_group, name="create_group"),
    path("groups/add_user/", views.add_user_to_group, name="add_user_to_group"),
    path("groups/<str:group_name>/delete/", views.delete_group, name="delete_group"),  
    path("groups/<int:group_id>/messages/", views.get_group_messages, name="get_group_messages"),
    path("groups/<int:group_id>/send_message/", views.send_group_message, name="send_group_message"),
    path("groups/<str:group_name>/update_icon/", views.update_group_icon, name="update_group_icon"),
    path("groups/remove_user/", views.remove_user_from_group, name="remove_user_from_group"),
    path("delete_group_message/<int:message_id>/", views.delete_group_message, name="delete-group-message"),  # 🔹 Fixed import
]

