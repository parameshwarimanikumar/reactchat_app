from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models

# Custom User Manager
class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)

        if password:
            user.set_password(password)
        else:
            raise ValueError('The Password field must be set')

        user.save(using=self._db)
        return user

    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if not password:
            raise ValueError("Superuser must have a password.")

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)

# Custom User Model
class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)
    profile_picture = models.ImageField(upload_to='profile_pictures/', null=True, blank=True)
    username = models.CharField(max_length=150, blank=True, unique=True)  # Ensuring uniqueness

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []  # Removed 'username' since it's optional

    objects = CustomUserManager()

    def __str__(self):
        return self.username if self.username else self.email

# Message Model
class Message(models.Model):
    sender = models.ForeignKey(CustomUser, related_name='sent_messages', on_delete=models.CASCADE)
    receiver = models.ForeignKey(CustomUser, related_name='received_messages', on_delete=models.CASCADE)
    content = models.TextField(blank=True, null=True)  # Allow empty messages if only a file is sent
    file = models.FileField(upload_to='uploads/', blank=True, null=True)  # Accepts all file types
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        preview = (self.content[:20] + "...") if self.content else "File Attached"
        return f"{self.sender.username or self.sender.email} → {self.receiver.username or self.receiver.email}: {preview}"
