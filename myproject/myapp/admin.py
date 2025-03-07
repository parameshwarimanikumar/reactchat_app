from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, ChatGroup, GroupMessage, Message

# Custom User Admin
class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ("id", "email", "username", "is_staff", "is_active")
    list_filter = ("is_staff", "is_active")
    ordering = ("id",)
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Personal Info", {"fields": ("username", "profile_picture")}),
        ("Permissions", {"fields": ("is_staff", "is_active", "is_superuser", "groups", "user_permissions")}),
        ("Important dates", {"fields": ("last_login", "date_joined")}),
    )
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("email", "password1", "password2", "is_staff", "is_active"),
        }),
    )
    search_fields = ("email", "username")

# ChatGroup Admin
class ChatGroupAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "created_at")
    search_fields = ("name",)
    filter_horizontal = ("members",)

# GroupMessage Admin
class GroupMessageAdmin(admin.ModelAdmin):
    list_display = ("id", "group", "sender", "short_content", "timestamp")
    list_filter = ("group", "sender")
    search_fields = ("content", "sender__username", "group__name")

    def short_content(self, obj):
        if obj.content:
            return obj.content[:20] + "..." if len(obj.content) > 20 else obj.content
        return "File Attached"
    short_content.short_description = "Content Preview"

# Private Message Admin
class MessageAdmin(admin.ModelAdmin):
    list_display = ("id", "sender", "receiver", "short_content", "timestamp")
    list_filter = ("sender", "receiver")
    search_fields = ("content", "sender__username", "receiver__username")

    def short_content(self, obj):
        if obj.content:
            return obj.content[:20] + "..." if len(obj.content) > 20 else obj.content
        return "File Attached"
    short_content.short_description = "Content Preview"

# Registering Models in Django Admin
admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(ChatGroup, ChatGroupAdmin)
admin.site.register(GroupMessage, GroupMessageAdmin)
admin.site.register(Message, MessageAdmin)
