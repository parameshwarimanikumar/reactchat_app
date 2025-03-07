from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Message
from django.utils.translation import gettext_lazy as _

class CustomUserAdmin(UserAdmin):
    model = CustomUser

    list_display = ('email', 'username', 'is_staff', 'is_active', 'profile_picture_preview')
    list_filter = ('is_staff', 'is_active')

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        (_('Personal info'), {'fields': ('first_name', 'last_name', 'username', 'profile_picture')}),
        (_('Permissions'), {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        (_('Important dates'), {'fields': ('last_login', 'date_joined')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2', 'username', 'profile_picture', 'is_staff', 'is_active')},
        ),
    )

    search_fields = ('email', 'username', 'first_name', 'last_name')
    ordering = ('email',)

    def profile_picture_preview(self, obj):
        """Show profile picture preview in the admin panel"""
        if obj.profile_picture:
            return f'<img src="{obj.profile_picture.url}" width="50" height="50" style="border-radius:50%;">'
        return "No Image"
    
    profile_picture_preview.allow_tags = True
    profile_picture_preview.short_description = "Profile Picture"

class MessageAdmin(admin.ModelAdmin):
    list_display = ('sender', 'receiver', 'content', 'timestamp', 'file')
    search_fields = ('sender__email', 'receiver__email', 'content')
    list_filter = ('timestamp',)

admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(Message, MessageAdmin)
