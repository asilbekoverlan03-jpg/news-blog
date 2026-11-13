from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    ArticleViewSet,
    CategoryViewSet,
    CommentDetailView,
    CustomTokenObtainPairView,
    FeedView,
    MeView,
    RegisterView,
    TagViewSet,
    UserProfileViewSet,
)

router = DefaultRouter()
router.register(r'users', UserProfileViewSet, basename='user')
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'tags', TagViewSet, basename='tag')
router.register(r'articles', ArticleViewSet, basename='article')

urlpatterns = [
    # Auth
    path('auth/register/', RegisterView.as_view(), name='auth-register'),
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='auth-login'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='auth-refresh'),
    path('auth/me/', MeView.as_view(), name='auth-me'),

    # Feed
    path('feed/', FeedView.as_view(), name='feed'),

    # Standalone comment detail
    path('comments/<int:pk>/', CommentDetailView.as_view(), name='comment-detail'),

    # Router (users, categories, tags, articles + nested actions)
    path('', include(router.urls)),
]
