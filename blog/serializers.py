from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import Article, Category, Comment, Follow, Like, Tag, UserProfile


# ─── Auth ─────────────────────────────────────────────────────────────────────

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    password2 = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})

    class Meta:
        model = UserProfile
        fields = ('id', 'username', 'email', 'password', 'password2')

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({'password': 'Пароли не совпадают.'})
        try:
            validate_password(attrs['password'])
        except DjangoValidationError as e:
            raise serializers.ValidationError({'password': list(e.messages)})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        user = UserProfile.objects.create_user(**validated_data)
        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Добавляем username и email в payload токена."""
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        token['email'] = user.email
        return token


# ─── User / Profile ───────────────────────────────────────────────────────────

class UserShortSerializer(serializers.ModelSerializer):
    """Краткая карточка автора — для вложенного отображения."""
    avatar = serializers.ImageField(read_only=True)

    class Meta:
        model = UserProfile
        fields = ('id', 'username', 'avatar')


class UserProfileSerializer(serializers.ModelSerializer):
    """Полный профиль: GET /api/auth/me/ и GET /api/users/<id>/."""
    followers_count = serializers.IntegerField(read_only=True)
    following_count = serializers.IntegerField(read_only=True)
    articles_count = serializers.IntegerField(read_only=True)
    is_following = serializers.SerializerMethodField()
    avatar = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = UserProfile
        fields = (
            'id', 'username', 'email', 'first_name', 'last_name',
            'avatar', 'bio', 'social_link', 'date_register',
            'followers_count', 'following_count', 'articles_count',
            'is_following',
        )
        read_only_fields = ('id', 'username', 'email', 'date_register',
                            'followers_count', 'following_count', 'articles_count')

    def get_is_following(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Follow.objects.filter(follower=request.user, following=obj).exists()
        return False


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    """PATCH /api/auth/me/ — только разрешённые поля."""
    avatar = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = UserProfile
        fields = ('first_name', 'last_name', 'bio', 'social_link', 'avatar')


# ─── Category ─────────────────────────────────────────────────────────────────

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ('id', 'name', 'slug', 'image')
        read_only_fields = ('slug',)


# ─── Tag ──────────────────────────────────────────────────────────────────────

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ('id', 'name', 'slug')
        read_only_fields = ('slug',)


# ─── Comment ──────────────────────────────────────────────────────────────────

class CommentSerializer(serializers.ModelSerializer):
    author = UserShortSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ('id', 'article', 'author', 'text', 'created_date', 'updated_date')
        read_only_fields = ('id', 'author', 'created_date', 'updated_date')

    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)


class CommentCreateSerializer(serializers.ModelSerializer):
    """Для создания комментария — article передаётся через URL."""
    class Meta:
        model = Comment
        fields = ('id', 'text')

    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        validated_data['article'] = self.context['article']
        return super().create(validated_data)


# ─── Article ──────────────────────────────────────────────────────────────────

class ArticleListSerializer(serializers.ModelSerializer):
    """Список статей — без полного контента."""
    author = UserShortSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    like_count = serializers.SerializerMethodField()
    comment_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()

    class Meta:
        model = Article
        fields = (
            'id', 'title', 'excerpt', 'thumbnail',
            'author', 'category', 'tags',
            'is_published', 'published_date', 'views_count',
            'like_count', 'comment_count', 'is_liked',
        )

    def get_like_count(self, obj):
        return obj.get_like_count()

    def get_comment_count(self, obj):
        return obj.get_comment_count()

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Like.objects.filter(article=obj, user=request.user).exists()
        return False


class ArticleDetailSerializer(ArticleListSerializer):
    """Детальная страница статьи — с полным контентом и комментариями."""
    comments = CommentSerializer(many=True, read_only=True)

    class Meta(ArticleListSerializer.Meta):
        fields = ArticleListSerializer.Meta.fields + (
            'content', 'created_date', 'updated_date', 'comments',
        )


class ArticleWriteSerializer(serializers.ModelSerializer):
    """Создание / редактирование статьи."""
    tags = serializers.PrimaryKeyRelatedField(
        queryset=Tag.objects.all(), many=True, required=False
    )
    category = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), required=False, allow_null=True
    )

    class Meta:
        model = Article
        fields = (
            'id', 'title', 'content', 'excerpt', 'thumbnail',
            'category', 'tags', 'is_published',
        )

    def create(self, validated_data):
        from django.utils import timezone
        tags = validated_data.pop('tags', [])
        if validated_data.get('is_published') and not validated_data.get('published_date'):
            validated_data['published_date'] = timezone.now()
        article = Article.objects.create(
            author=self.context['request'].user,
            **validated_data,
        )
        article.tags.set(tags)
        return article

    def update(self, instance, validated_data):
        from django.utils import timezone
        tags = validated_data.pop('tags', None)
        # При первой публикации фиксируем дату
        if validated_data.get('is_published') and not instance.published_date:
            validated_data['published_date'] = timezone.now()
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if tags is not None:
            instance.tags.set(tags)
        return instance


# ─── Like / Follow ────────────────────────────────────────────────────────────

class LikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Like
        fields = ('id', 'article', 'user', 'created_date')
        read_only_fields = ('id', 'user', 'created_date')


class FollowSerializer(serializers.ModelSerializer):
    follower = UserShortSerializer(read_only=True)
    following = UserShortSerializer(read_only=True)

    class Meta:
        model = Follow
        fields = ('id', 'follower', 'following', 'created_date')
        read_only_fields = ('id', 'follower', 'created_date')
