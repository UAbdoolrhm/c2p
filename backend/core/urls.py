from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, PresentationSessionViewSet, EvaluationViewSet, WeeklySessionViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'weekly_sessions', WeeklySessionViewSet)
router.register(r'sessions', PresentationSessionViewSet)
router.register(r'evaluations', EvaluationViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
