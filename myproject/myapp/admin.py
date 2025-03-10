from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, ChatGroup, GroupMessage, Message

# Custom User Admin
class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ("id", "email", "username", "is_staff", "is_active")
    list_filter = ("is_staff", "is_active")
    ordering = ("id",)
    search_fields = ("email", "username")
    readonly_fields = ("id", "date_joined", "last_login")

    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Personal Info", {"fields": ("username", "profile_picture")}),
        ("Permissions", {"fields": ("is_staff", "is_active", "is_superuser", "groups", "user_permissions")}),
        ("Important Dates", {"fields": ("last_login", "date_joined")}),
    )

    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("email", "password1", "password2", "is_staff", "is_active"),
        }),
    )

# ChatGroup Admin
class ChatGroupAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "admin", "created_at")
    search_fields = ("name",)
    list_filter = ("created_at",)
    filter_horizontal = ("members",)
    readonly_fields = ("id", "created_at")
    actions = ["delete_selected"]

    fieldsets = (
        (None, {"fields": ("name", "admin")}),
        ("Details", {"fields": ("members", "created_at")}),
    )

# GroupMessage Admin
class GroupMessageAdmin(admin.ModelAdmin):
    list_display = ("id", "group", "sender", "short_content", "timestamp")
    list_filter = ("group", "sender", "timestamp")
    search_fields = ("content", "sender__username", "group__name")
    empty_value_display = "—"
    readonly_fields = ("id", "timestamp")

    @admin.display(description="Content Preview")
    def short_content(self, obj):
        content = obj.content or "File Attached"
        return content[:20] + "..." if len(content) > 20 else content

# Private Message Admin
class MessageAdmin(admin.ModelAdmin):
    list_display = ("id", "sender", "receiver", "short_content", "timestamp")
    list_filter = ("sender", "receiver", "timestamp")
    search_fields = ("content", "sender__username", "receiver__username")
    empty_value_display = "—"
    readonly_fields = ("id", "timestamp")

    @admin.display(description="Content Preview")
    def short_content(self, obj):
        content = obj.content or "File Attached"
        return content[:20] + "..." if len(content) > 20 else content

# Registering Models in Django Admin
admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(ChatGroup, ChatGroupAdmin)
admin.site.register(GroupMessage, GroupMessageAdmin)
admin.site.register(Message, MessageAdmin)
