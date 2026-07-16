from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator, MaxValueValidator

class User(AbstractUser):
    ROLE_CHOICES = (
        ('ADMIN', 'Admin'),
        ('STUDENT', 'Student'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='STUDENT')
    student_id = models.CharField(max_length=50, blank=True, null=True)

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"


class WeeklySession(models.Model):
    theme = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.theme

class PresentationSession(models.Model):
    STATUS_CHOICES = (
        ('SCHEDULED', 'Scheduled'),
        ('ACTIVE', 'Active'),
        ('COMPLETED', 'Completed'),
    )
    
    weekly_session = models.ForeignKey(WeeklySession, on_delete=models.CASCADE, related_name='presentations', null=True)
    presenter = models.ForeignKey(User, on_delete=models.CASCADE, related_name='presentations')
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='SCHEDULED')
    start_time = models.DateTimeField(null=True, blank=True)
    end_time = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        if self.weekly_session:
            return f"{self.presenter.username} - {self.weekly_session.theme}"
        return f"{self.presenter.username} - Unknown Session"

    def clean(self):
        super().clean()
        if self.status == 'ACTIVE':
            # Ensure only one active session exists
            active_sessions = PresentationSession.objects.filter(status='ACTIVE').exclude(pk=self.pk)
            if active_sessions.exists():
                raise ValidationError("Only one presentation session can be active at a time.")


class Evaluation(models.Model):
    evaluator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='evaluations_given')
    session = models.ForeignKey(PresentationSession, on_delete=models.CASCADE, related_name='evaluations')
    
    content_knowledge = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    organization_structure = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    delivery_voice = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    confidence_body_language = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    audience_engagement = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    time_management = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)], default=3)
    
    comments = models.TextField(blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['evaluator', 'session'], name='unique_evaluation_per_session')
        ]

    def __str__(self):
        return f"Evaluation by {self.evaluator.username} for {self.session.title}"

    def clean(self):
        super().clean()
        if self.evaluator == self.session.presenter:
            raise ValidationError("You cannot evaluate your own presentation.")
