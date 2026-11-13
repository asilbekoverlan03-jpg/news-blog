from django.shortcuts import get_object_or_404
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import generics, mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, MultiPartParser, JSONParser
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter, SearchFilter

from .models import Article, Category, Comment, Follow, Like, Tag, UserProfile
from .permissions import IsAdminOrReadOnly, IsAuthorOrReadOnly, IsOwnerOrReadOnly
from .serializers import (
    ArticleDetailSerializer,
    ArticleListSerializer,
    ArticleWriteSerializer,
    CategorySerializer,
    CommentCreateSerializer,
    CommentSerializer,
    CustomTokenObtainPairSerializer,
    FollowSerializer,
    LikeSerializer,
    RegisterSerializer,
    TagSerializer,
    UserProfileSerializer,
    UserProfileUpdateSerializer,
)


# ─── Auth ─────────────────────────────────────────────────────────────────────

class RegisterView(generics.CreateAPIView):
    """POST /api/auth/register/"""
    queryset = UserProfile.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


class CustomTokenObtainPairView(TokenObtainPairView):
    """POST /api/auth/login/"""
    serializer_class = CustomTokenObtainPairSerializer


class MeView(generics.RetrieveUpdateAPIView):
    """GET / PATCH /api/auth/me/"""
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_object(self):
        return self.request.user

    def get_serializer_class(self):
        if self.request.method in ('PUT', 'PATCH'):
            return UserProfileUpdateSerializer
        return UserProfileSerializer

    def partial_update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)


# ─── Users ────────────────────────────────────────────────────────────────────

class UserProfileViewSet(
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    """GET /api/users/<id>/"""
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        """GET /api/users/me/ — алиас для /api/auth/me/"""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(detail=True, methods=['post', 'delete'], permission_classes=[IsAuthenticated])
    def follow(self, request, pk=None):
        """
        POST   /api/users/<id>/follow/ — подписаться
        DELETE /api/users/<id>/follow/ — отписаться
        """
        target = get_object_or_404(UserProfile, pk=pk)
        if request.method == 'POST':
            if target == request.user:
                return Response({'detail': 'Нельзя подписаться на самого себя.'}, status=400)
            _, created = Follow.objects.get_or_create(follower=request.user, following=target)
            if not created:
                return Response({'detail': 'Вы уже подписаны.'}, status=400)
            return Response({'detail': 'Подписка оформлена.'}, status=201)

        # DELETE
        deleted, _ = Follow.objects.filter(follower=request.user, following=target).delete()
        if not deleted:
            return Response({'detail': 'Подписка не найдена.'}, status=404)
        return Response({'detail': 'Подписка отменена.'}, status=204)

    @action(detail=True, methods=['get'])
    def articles(self, request, pk=None):
        """GET /api/users/<id>/articles/ — статьи автора"""
        user = get_object_or_404(UserProfile, pk=pk)
        qs = Article.objects.filter(author=user, is_published=True).select_related(
            'author', 'category'
        ).prefetch_related('tags', 'likes', 'comments')
        page = self.paginate_queryset(qs)
        serializer = ArticleListSerializer(page, many=True, context={'request': request})
        return self.get_paginated_response(serializer.data)

    @action(detail=True, methods=['get'])
    def followers(self, request, pk=None):
        """GET /api/users/<id>/followers/"""
        user = get_object_or_404(UserProfile, pk=pk)
        qs = UserProfile.objects.filter(following__following=user)
        page = self.paginate_queryset(qs)
        from .serializers import UserShortSerializer
        serializer = UserShortSerializer(page, many=True, context={'request': request})
        return self.get_paginated_response(serializer.data)

    @action(detail=True, methods=['get'])
    def following(self, request, pk=None):
        """GET /api/users/<id>/following/"""
        user = get_object_or_404(UserProfile, pk=pk)
        qs = UserProfile.objects.filter(followers__follower=user)
        page = self.paginate_queryset(qs)
        from .serializers import UserShortSerializer
        serializer = UserShortSerializer(page, many=True, context={'request': request})
        return self.get_paginated_response(serializer.data)


# ─── Categories ───────────────────────────────────────────────────────────────

class CategoryViewSet(viewsets.ModelViewSet):
    """GET /api/categories/, POST (admin), GET/PUT/PATCH/DELETE /api/categories/<id>/"""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = 'slug'
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['name']
    ordering_fields = ['name']


# ─── Tags ─────────────────────────────────────────────────────────────────────

class TagViewSet(viewsets.ModelViewSet):
    """GET /api/tags/, POST (admin), GET/PUT/PATCH/DELETE /api/tags/<id>/"""
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = 'slug'
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['name']


# ─── Articles ─────────────────────────────────────────────────────────────────

class ArticleViewSet(viewsets.ModelViewSet):
    """
    GET    /api/articles/          — список опубликованных
    POST   /api/articles/          — создать статью (auth)
    GET    /api/articles/<id>/     — детали
    PUT    /api/articles/<id>/     — полное обновление (автор)
    PATCH  /api/articles/<id>/     — частичное обновление (автор)
    DELETE /api/articles/<id>/     — удалить (автор)
    """
    permission_classes = [IsAuthenticatedOrReadOnly, IsAuthorOrReadOnly]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['category__slug', 'tags__slug', 'author__id', 'is_published']
    search_fields = ['title', 'excerpt', 'content', 'author__username']
    ordering_fields = ['published_date', 'views_count', 'created_date']
    ordering = ['-published_date']

    def get_queryset(self):
        qs = Article.objects.select_related('author', 'category').prefetch_related(
            'tags', 'likes', 'comments'
        )
        # Чужие черновики не показываем
        user = self.request.user
        if user.is_authenticated:
            return qs.filter(
                models_q(is_published=True) | models_q(author=user)
            )
        return qs.filter(is_published=True)

    def get_serializer_class(self):
        if self.action in ('list',):
            return ArticleListSerializer
        if self.action in ('create', 'update', 'partial_update'):
            return ArticleWriteSerializer
        return ArticleDetailSerializer

    def retrieve(self, request, *args, **kwargs):
        """Увеличиваем счётчик просмотров при каждом GET детали."""
        instance = self.get_object()
        Article.objects.filter(pk=instance.pk).update(views_count=instance.views_count + 1)
        instance.refresh_from_db()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    # ── Лайки ──────────────────────────────────────────────────────────────
    @action(detail=True, methods=['post', 'delete'], permission_classes=[IsAuthenticated])
    def like(self, request, pk=None):
        """
        POST   /api/articles/<id>/like/ — поставить лайк
        DELETE /api/articles/<id>/like/ — убрать лайк
        """
        article = self.get_object()
        if request.method == 'POST':
            _, created = Like.objects.get_or_create(article=article, user=request.user)
            if not created:
                return Response({'detail': 'Уже лайкнуто.'}, status=400)
            return Response({'detail': 'Лайк добавлен.', 'like_count': article.get_like_count() + 1}, status=201)

        deleted, _ = Like.objects.filter(article=article, user=request.user).delete()
        if not deleted:
            return Response({'detail': 'Лайк не найден.'}, status=404)
        return Response({'detail': 'Лайк убран.', 'like_count': article.get_like_count()}, status=204)

    # ── Комментарии ────────────────────────────────────────────────────────
    @action(detail=True, methods=['get', 'post'], permission_classes=[IsAuthenticatedOrReadOnly])
    def comments(self, request, pk=None):
        """
        GET  /api/articles/<id>/comments/ — список комментариев
        POST /api/articles/<id>/comments/ — добавить комментарий
        """
        article = self.get_object()
        if request.method == 'GET':
            qs = article.comments.select_related('author').order_by('-created_date')
            page = self.paginate_queryset(qs)
            serializer = CommentSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)

        serializer = CommentCreateSerializer(
            data=request.data,
            context={'request': request, 'article': article},
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=201)


def models_q(**kwargs):
    """Shortcut для django.db.models.Q."""
    from django.db.models import Q
    return Q(**kwargs)


# ─── Comments (standalone edit/delete) ───────────────────────────────────────

class CommentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/comments/<id>/
    PATCH  /api/comments/<id>/
    DELETE /api/comments/<id>/
    """
    queryset = Comment.objects.select_related('author', 'article')
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, IsAuthorOrReadOnly]


# ─── Feed ─────────────────────────────────────────────────────────────────────

class FeedView(generics.ListAPIView):
    """
    GET /api/feed/ — статьи авторов, на которых подписан текущий пользователь.
    """
    serializer_class = ArticleListSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [OrderingFilter]
    ordering = ['-published_date']

    def get_queryset(self):
        following_ids = Follow.objects.filter(
            follower=self.request.user
        ).values_list('following_id', flat=True)
        return Article.objects.filter(
            author_id__in=following_ids,
            is_published=True,
        ).select_related('author', 'category').prefetch_related('tags', 'likes', 'comments')
