# myapp/backends.py

import logging
from django.contrib.auth.backends import BaseBackend
from django.contrib.auth import get_user_model

logger = logging.getLogger(__name__)

class EmailBackend(BaseBackend):
    def authenticate(self, request, email=None, password=None, **kwargs):
        UserModel = get_user_model()
        
        if email is None or password is None:
            logger.warning("Email or password not provided.")
            return None
        
        try:
            user = UserModel.objects.get(email=email)
            if user.check_password(password):
                logger.info(f"Authentication successful for email: {email}")
                return user
            else:
                logger.warning(f"Password mismatch for email: {email}")
        except UserModel.DoesNotExist:
            logger.warning(f"User not found with email: {email}")
        return None

    def get_user(self, user_id):
        UserModel = get_user_model()
        try:
            return UserModel.objects.get(pk=user_id)
        except UserModel.DoesNotExist:
            return None
