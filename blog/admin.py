from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import Article, Category, Comment, Follow, Like, Tag, UserProfile


@admin.register(UserProfile)
class UserProfileAdmin(UserAdmin):
    list_display = ('username', 'email', 'is_staff', 'date_register', 'followers_count')
    fieldsets = UserAdmin.fieldsets + (
        ('Профиль', {'fields': ('avatar', 'bio', 'social_link')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Профиль', {'fields': ('avatar', 'bio', 'social_link')}),
    )


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'category', 'is_published', 'published_date', 'views_count')
    list_filter = ('is_published', 'category')
    search_fields = ('title', 'author__username')
    filter_horizontal = ('tags',)
    readonly_fields = ('views_count', 'created_date', 'updated_date')


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('author', 'article', 'created_date')
    search_fields = ('author__username', 'article__title')


@admin.register(Like)
class LikeAdmin(admin.ModelAdmin):
    list_display = ('user', 'article', 'created_date')


@admin.register(Follow)
class FollowAdmin(admin.ModelAdmin):
    list_display = ('follower', 'following', 'created_date')
