from rest_framework import serializers
from .models import User, PresentationSession, Evaluation, WeeklySession

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'student_id']


class WeeklySessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = WeeklySession
        fields = ['id', 'theme', 'created_at']

class PresentationSessionSerializer(serializers.ModelSerializer):
    presenter_details = UserSerializer(source='presenter', read_only=True)
    weekly_session_details = WeeklySessionSerializer(source='weekly_session', read_only=True)
    has_evaluated = serializers.SerializerMethodField()
    
    class Meta:
        model = PresentationSession
        fields = [
            'id', 'weekly_session', 'weekly_session_details', 'presenter', 'presenter_details',
            'status', 'start_time', 'end_time', 'has_evaluated'
        ]

    def get_has_evaluated(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Evaluation.objects.filter(session=obj, evaluator=request.user).exists()
        return False


class EvaluationSerializer(serializers.ModelSerializer):
    evaluator_details = UserSerializer(source='evaluator', read_only=True)
    
    class Meta:
        model = Evaluation
        fields = [
            'id', 'evaluator', 'evaluator_details', 'session',
            'content_knowledge', 'organization_structure', 'delivery_voice',
            'confidence_body_language', 'audience_engagement', 'time_management',
            'comments', 'timestamp'
        ]
        read_only_fields = ['evaluator', 'timestamp']

    def validate(self, data):
        session = data.get('session')
        # Evaluator is typically set in the view from the request.user
        evaluator = self.context['request'].user if 'request' in self.context else None

        if not evaluator:
            raise serializers.ValidationError("Evaluator is required.")
            
        if session and evaluator == session.presenter:
            raise serializers.ValidationError("You cannot evaluate your own presentation.")
            
        return data
