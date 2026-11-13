from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAuthorOrReadOnly(BasePermission):
    """
    Чтение разрешено всем.
    Запись (PUT/PATCH/DELETE) — только автору объекта.
    """
    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        # Поддерживаем модели с полем author или user
        owner = getattr(obj, 'author', None) or getattr(obj, 'user', None)
        return owner == request.user


class IsOwnerOrReadOnly(BasePermission):
    """
    Для UserProfile: редактировать профиль может только владелец.
    """
    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        return obj == request.user


class IsAdminOrReadOnly(BasePermission):
    """
    Управлять категориями и тегами могут только администраторы.
    """
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return request.user and request.user.is_staff
