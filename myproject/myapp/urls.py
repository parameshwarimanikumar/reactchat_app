from django.urls import path
from . import views

urlpatterns = [
    path('users/', views.user_list, name='user_list'),
    path('current_user/', views.current_user, name='current_user'),
    path('login/', views.login_user, name='login_user'),
    path('create_user/', views.create_user, name='create_user'),
    path('messages/<int:user_id>/', views.get_messages, name='get_messages'),
    path('send_message/', views.send_message, name='send_message'),
    path('update_profile_picture/', views.update_profile_picture, name='update_profile_picture'),
    path("delete_message/<int:message_id>/", views.delete_message, name="delete_message"),
]
