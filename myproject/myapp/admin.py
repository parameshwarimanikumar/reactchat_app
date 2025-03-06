# myapp/admin.py


from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser
from django.utils.translation import gettext_lazy as _

class CustomUserAdmin(UserAdmin):
    model = CustomUser

    # Fields to be displayed in the user list view
    list_display = ('email', 'username', 'is_staff', 'is_active')
    list_filter = ('is_staff', 'is_active')

    # Fieldsets for displaying user details in the admin detail view
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        (_('Personal info'), {'fields': ('first_name', 'last_name', 'username', 'profile_picture')}),
        (_('Permissions'), {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        (_('Important dates'), {'fields': ('last_login', 'date_joined')}),
    )

    # Add fieldsets for the user creation form
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2', 'username', 'profile_picture', 'is_staff', 'is_active')}
        ),
    )

    # Fields to be used for searching in the admin panel
    search_fields = ('email', 'username', 'first_name', 'last_name')

    # Ordering of users in the list view
    ordering = ('email',)

admin.site.register(CustomUser, CustomUserAdmin)
