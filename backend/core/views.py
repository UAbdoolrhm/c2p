from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import User, PresentationSession, Evaluation, WeeklySession
from .serializers import UserSerializer, PresentationSessionSerializer, EvaluationSerializer, WeeklySessionSerializer
from django.db.models import Avg, Count
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import IntegrityError
from rest_framework.exceptions import ValidationError

class IsAdminUserOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.role == 'ADMIN'

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUserOrReadOnly]

class WeeklySessionViewSet(viewsets.ModelViewSet):
    queryset = WeeklySession.objects.all().order_by('-id')
    serializer_class = WeeklySessionSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUserOrReadOnly]

    def create(self, request, *args, **kwargs):
        theme = request.data.get('theme')
        presenter_ids = request.data.get('presenter_ids', [])
        
        if not theme:
            return Response({'detail': 'Theme is required'}, status=status.HTTP_400_BAD_REQUEST)
            
        weekly_session = WeeklySession.objects.create(theme=theme)
        
        # Create presentation sessions for all selected presenters
        for pid in presenter_ids:
            try:
                user = User.objects.get(id=pid)
                PresentationSession.objects.create(
                    weekly_session=weekly_session,
                    presenter=user,
                    status='SCHEDULED'
                )
            except User.DoesNotExist:
                continue
                
        serializer = self.get_serializer(weekly_session)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'])
    def leaderboard(self, request, pk=None):
        weekly_session = self.get_object()
        presentations = weekly_session.presentations.all()
        
        leaderboard_data = []
        
        for presentation in presentations:
            evals = presentation.evaluations.all()
            count = evals.count()
            
            if count == 0:
                leaderboard_data.append({
                    'presenter_id': presentation.presenter.id,
                    'presenter_name': f"{presentation.presenter.first_name} {presentation.presenter.last_name}",
                    'overall_score': 0,
                    'count': 0
                })
                continue
                
            averages = evals.aggregate(
                avg_content=Avg('content_knowledge'),
                avg_org=Avg('organization_structure'),
                avg_delivery=Avg('delivery_voice'),
                avg_confidence=Avg('confidence_body_language'),
                avg_engagement=Avg('audience_engagement'),
                avg_time=Avg('time_management')
            )
            
            overall = sum(filter(None, averages.values())) / len(averages)
            
            leaderboard_data.append({
                'presenter_id': presentation.presenter.id,
                'presenter_name': f"{presentation.presenter.first_name} {presentation.presenter.last_name}",
                'overall_score': round(overall, 2),
                'count': count,
                'averages': averages
            })
            
        # Sort by overall score descending
        leaderboard_data.sort(key=lambda x: x['overall_score'], reverse=True)
        
        return Response({
            'weekly_session': weekly_session.theme,
            'leaderboard': leaderboard_data
        })

class PresentationSessionViewSet(viewsets.ModelViewSet):
    queryset = PresentationSession.objects.all().order_by('-id')
    serializer_class = PresentationSessionSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUserOrReadOnly]

class EvaluationViewSet(viewsets.ModelViewSet):
    queryset = Evaluation.objects.all()
    serializer_class = EvaluationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        try:
            serializer.save(evaluator=self.request.user)
        except IntegrityError:
            raise ValidationError({"detail": "You have already submitted an evaluation for this presenter."})

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return Evaluation.objects.all()
        return Evaluation.objects.filter(evaluator=user)
