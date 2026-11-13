from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.text import slugify
from django.core.exceptions import ValidationError


class UserProfile(AbstractUser):
    """Расширенная модель пользователя."""
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    bio = models.TextField(max_length=500, blank=True)
    social_link = models.URLField(blank=True)
    date_register = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Пользователь'
        verbose_name_plural = 'Пользователи'

    @property
    def followers_count(self):
        """Количество подписчиков пользователя."""
        return self.followers.count()

    @property
    def following_count(self):
        """Количество подписок пользователя."""
        return self.following.count()

    @property
    def articles_count(self):
        """Количество опубликованных статей."""
        return self.articles.filter(is_published=True).count()

    def __str__(self):
        return self.username


class Category(models.Model):
    """Категория статьи."""
    name = models.CharField(max_length=100, unique=True, verbose_name='Название')
    slug = models.SlugField(max_length=100, unique=True, blank=True)
    image = models.ImageField(upload_to='categories/', blank=True, null=True)

    class Meta:
        verbose_name = 'Категория'
        verbose_name_plural = 'Категории'
        ordering = ['name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Tag(models.Model):
    """Тег статьи."""
    name = models.CharField(max_length=50, unique=True, verbose_name='Название')
    slug = models.SlugField(max_length=50, unique=True, blank=True)

    class Meta:
        verbose_name = 'Тег'
        verbose_name_plural = 'Теги'
        ordering = ['name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Article(models.Model):
    """Статья / пост блога."""
    title = models.CharField(max_length=255, verbose_name='Заголовок')
    content = models.TextField(verbose_name='Контент')
    thumbnail = models.ImageField(upload_to='articles/', blank=True, null=True, verbose_name='Обложка')
    excerpt = models.CharField(max_length=500, blank=True, verbose_name='Краткое описание')
    author = models.ForeignKey(
        UserProfile,
        on_delete=models.CASCADE,
        related_name='articles',
        verbose_name='Автор',
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='articles',
        verbose_name='Категория',
    )
    tags = models.ManyToManyField(Tag, blank=True, related_name='articles', verbose_name='Теги')
    is_published = models.BooleanField(default=False, verbose_name='Опубликовано')
    published_date = models.DateTimeField(null=True, blank=True, verbose_name='Дата публикации')
    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)
    views_count = models.PositiveIntegerField(default=0, verbose_name='Просмотры')

    class Meta:
        verbose_name = 'Статья'
        verbose_name_plural = 'Статьи'
        ordering = ['-published_date', '-created_date']

    def get_like_count(self):
        """Количество лайков статьи."""
        return self.likes.count()

    def get_comment_count(self):
        """Количество комментариев статьи."""
        return self.comments.count()

    def __str__(self):
        return self.title


class Comment(models.Model):
    """Комментарий к статье."""
    article = models.ForeignKey(
        Article,
        on_delete=models.CASCADE,
        related_name='comments',
        verbose_name='Статья',
    )
    author = models.ForeignKey(
        UserProfile,
        on_delete=models.CASCADE,
        related_name='comments',
        verbose_name='Автор',
    )
    text = models.TextField(verbose_name='Текст')
    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Комментарий'
        verbose_name_plural = 'Комментарии'
        ordering = ['-created_date']

    def __str__(self):
        return f'Комментарий {self.author.username} к "{self.article.title}"'


class Like(models.Model):
    """Лайк статьи (один пользователь — один лайк)."""
    article = models.ForeignKey(
        Article,
        on_delete=models.CASCADE,
        related_name='likes',
        verbose_name='Статья',
    )
    user = models.ForeignKey(
        UserProfile,
        on_delete=models.CASCADE,
        related_name='likes',
        verbose_name='Пользователь',
    )
    created_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Лайк'
        verbose_name_plural = 'Лайки'
        unique_together = ('article', 'user')

    def __str__(self):
        return f'{self.user.username} → {self.article.title}'


class Follow(models.Model):
    """Подписка одного пользователя на другого."""
    follower = models.ForeignKey(
        UserProfile,
        on_delete=models.CASCADE,
        related_name='following',   # follower.following.all() — на кого подписан
        verbose_name='Подписчик',
    )
    following = models.ForeignKey(
        UserProfile,
        on_delete=models.CASCADE,
        related_name='followers',   # following.followers.all() — подписчики
        verbose_name='Автор',
    )
    created_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Подписка'
        verbose_name_plural = 'Подписки'
        unique_together = ('follower', 'following')

    def clean(self):
        """Запрет подписки на самого себя."""
        if self.follower == self.following:
            raise ValidationError('Нельзя подписаться на самого себя.')

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.follower.username} → {self.following.username}'
