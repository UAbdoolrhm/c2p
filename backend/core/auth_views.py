from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User

def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
        'role': user.role,
        'username': user.username
    }

class CustomLoginView(APIView):
    """
    Authenticates a user using ONLY their username.
    """
    permission_classes = []

    def post(self, request):
        username = request.data.get('username')
        
        if not username:
            return Response({'error': 'Username is required'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            # Case insensitive lookup
            user = User.objects.get(username__iexact=username)
            tokens = get_tokens_for_user(user)
            return Response(tokens, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({'error': 'User not found. Please register.'}, status=status.HTTP_404_NOT_FOUND)

class CustomRegisterView(APIView):
    """
    Registers a new user with username, first_name, and last_name (surname).
    """
    permission_classes = []

    def post(self, request):
        username = request.data.get('username')
        first_name = request.data.get('first_name', '')
        last_name = request.data.get('last_name', '')
        
        if not username:
            return Response({'error': 'Username is required'}, status=status.HTTP_400_BAD_REQUEST)
            
        if User.objects.filter(username__iexact=username).exists():
            return Response({'error': 'Username is already taken.'}, status=status.HTTP_400_BAD_REQUEST)
            
        # If there are no admins yet, the first user becomes an admin automatically
        has_admin = User.objects.filter(role='ADMIN').exists()
        
        # Create user without a usable password
        user = User(
            username=username,
            first_name=first_name,
            last_name=last_name,
            role='STUDENT' if has_admin else 'ADMIN'
        )
        user.set_unusable_password()
        user.save()
        
        # Immediately return JWT tokens
        tokens = get_tokens_for_user(user)
        return Response(tokens, status=status.HTTP_201_CREATED)
