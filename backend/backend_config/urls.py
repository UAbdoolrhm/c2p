from django.contrib import admin
from django.urls import path, include
from core.auth_views import CustomLoginView, CustomRegisterView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('core.urls')),
    path('api/auth/login/', CustomLoginView.as_view(), name='custom_login'),
    path('api/auth/register/', CustomRegisterView.as_view(), name='custom_register'),
]
