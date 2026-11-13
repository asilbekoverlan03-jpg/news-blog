# Новостной блог

Новостной блог (аналог Medium): статьи, категории, теги, комментарии, лайки и подписки на авторов.

## Стек

| Backend | Frontend |
|---|---|
| Python 3.12 | React 18 |
| Django 5.1 | React Router 6 |
| Django REST Framework 3.15 | Axios |
| SimpleJWT | react-hook-form |
| django-cors-headers | date-fns |
| django-filter | Vite 6 |
| Pillow | |

## Запуск

### Backend (Windows PowerShell)

```powershell
# 1. Активировать виртуальное окружение
.\venv\Scripts\activate

# 2. Скопировать и заполнить конфиг
cp .env.example .env

# 3. Создать суперпользователя (один раз)
python manage.py createsuperuser

# 4. Запустить сервер на порту 8005
python manage.py runserver 8005
```

Django API: http://127.0.0.1:8005/api/  
Admin-панель: http://127.0.0.1:8005/admin/

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

React-приложение: http://localhost:5173

## API Endpoints

### Аутентификация
| Метод | URL | Описание |
|---|---|---|
| POST | /api/auth/register/ | Регистрация |
| POST | /api/auth/login/ | Получить JWT-токены |
| POST | /api/auth/refresh/ | Обновить токен |
| GET/PATCH | /api/auth/me/ | Текущий пользователь |

### Пользователи
| Метод | URL | Описание |
|---|---|---|
| GET | /api/users/{id}/ | Профиль автора |
| POST | /api/users/{id}/follow/ | Подписаться |
| DELETE | /api/users/{id}/follow/ | Отписаться |
| GET | /api/users/{id}/articles/ | Статьи автора |
| GET | /api/users/{id}/followers/ | Подписчики |
| GET | /api/users/{id}/following/ | Подписки |

### Статьи
| Метод | URL | Описание |
|---|---|---|
| GET | /api/articles/ | Список (фильтры: search, category__slug, tags__slug) |
| POST | /api/articles/ | Создать статью |
| GET | /api/articles/{id}/ | Детали статьи |
| PATCH | /api/articles/{id}/ | Обновить статью |
| DELETE | /api/articles/{id}/ | Удалить статью |
| POST | /api/articles/{id}/like/ | Поставить лайк |
| DELETE | /api/articles/{id}/like/ | Убрать лайк |
| GET/POST | /api/articles/{id}/comments/ | Комментарии |

### Прочее
| Метод | URL | Описание |
|---|---|---|
| GET | /api/feed/ | Лента подписок |
| GET | /api/categories/ | Список категорий |
| GET | /api/tags/ | Список тегов |
| PATCH | /api/comments/{id}/ | Редактировать комментарий |
| DELETE | /api/comments/{id}/ | Удалить комментарий |

## Что сделал я

- Модели статей (`Article`), категорий (`Category`), тегов (`Tag`),
  комментариев (`Comment`), лайков (`Like`) и подписок на авторов (`Follow`)
- Кастомная модель пользователя `UserProfile` на базе `AbstractUser`
  с аватаром, биографией и счётчиком подписчиков
- REST API на Django REST Framework: ViewSets, JWT-аутентификация,
  пагинация, поиск и фильтрация
- Подключение API к фронтенду на React:
  axios-клиент с авто-обновлением токена (interceptors),
  контекст авторизации, защищённые маршруты

## Структура проекта

```
news-blog/
├── blog/                   # Django-приложение
│   ├── models.py           # UserProfile, Article, Category, Tag, Comment, Like, Follow
│   ├── serializers.py      # DRF-сериализаторы
│   ├── views.py            # ViewSets и Auth-views
│   ├── permissions.py      # IsAuthorOrReadOnly, IsAdminOrReadOnly
│   └── urls.py             # Маршруты приложения
├── config/                 # Настройки Django
│   ├── settings.py
│   └── urls.py
├── frontend/               # React + Vite
│   └── src/
│       ├── api/            # axios-клиент и методы
│       ├── context/        # AuthContext
│       ├── components/     # Layout, UI-компоненты
│       ├── pages/          # Страницы: Auth, Articles, Profile
│       └── hooks/          # usePagination, useDebounce
├── requirements.txt
├── .env.example
└── manage.py
```
