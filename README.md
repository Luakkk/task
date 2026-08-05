# OpKit — мини-CRM с real-time обновлением задач

Тестовое задание Fullstack Developer для Circle Creative Buro (`React + NestJS + PostgreSQL + WebSocket`).

Регистрация/вход по JWT, CRUD задач, привязанных к пользователю, и обновление статуса задачи в реальном времени через WebSocket — открытые у одного аккаунта вкладки/браузеры видят изменения друг друга без перезагрузки страницы.

## Стек

- **Backend:** NestJS, Prisma ORM, PostgreSQL, Redis (адаптер Socket.IO), Passport-JWT, class-validator
- **Frontend:** React + TypeScript (Vite), React Router, TanStack Query, socket.io-client, axios
- **Инфраструктура:** Docker Compose (Postgres + Redis) для локального окружения

## Структура проекта

```
.
├── backend/                    # NestJS API
│   ├── prisma/schema.prisma    # модели User, Task + enum TaskStatus
│   └── src/
│       ├── auth/                # регистрация/вход, JWT-стратегия, guard
│       ├── tasks/                # CRUD задач + WebSocket-шлюз (TasksGateway)
│       ├── prisma/               # PrismaService (глобальный модуль)
│       └── common/adapters/      # Redis-адаптер для Socket.IO
├── frontend/                   # React SPA
│   └── src/
│       ├── api/                  # axios-клиент, запросы auth/tasks
│       ├── context/AuthContext.tsx
│       ├── hooks/useTaskSocket.ts # подписка на WebSocket-события
│       ├── components/           # TaskColumn, TaskCard, ProtectedRoute
│       └── pages/                 # Login, Register, Tasks (канбан)
└── docker-compose.yml           # Postgres + Redis для локальной разработки
```

## Требования

- Node.js 20+
- Docker и Docker Compose

## Быстрый старт

### 1. Поднять базу данных и Redis

```bash
docker compose up -d
```

### 2. Backend

```bash
cd backend
cp .env.example .env
npm install
npx prisma migrate dev
npm run start:dev
```

API поднимется на `http://localhost:3000`.

### 3. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Приложение — на `http://localhost:5173`.

### 4. Проверить real-time

1. Зарегистрируйтесь на `http://localhost:5173/register`.
2. Откройте `http://localhost:5173` во втором браузере (или окне инкогнито) и войдите под тем же аккаунтом.
3. Создайте задачу в одном окне и смените её статус — во втором окне список обновится сам, без перезагрузки страницы.

## API

Все роуты, кроме `/auth/*`, требуют заголовок `Authorization: Bearer <accessToken>`.

| Метод | Роут | Описание |
|---|---|---|
| POST | `/auth/register` | `{ email, password }` → создаёт пользователя (bcrypt-хеш), возвращает `accessToken` |
| POST | `/auth/login` | `{ email, password }` → возвращает `accessToken` |
| GET | `/tasks` | список задач текущего пользователя |
| POST | `/tasks` | `{ title, description? }` → создаёт задачу |
| PATCH | `/tasks/:id` | `{ title?, description?, status? }` → обновляет задачу |
| DELETE | `/tasks/:id` | удаляет задачу |

Валидация через `class-validator`: пустой `title` возвращает `400`. Изменение чужой задачи — `403`.

## WebSocket

Подключение: `io(API_URL, { auth: { token: accessToken } })`.

Сервер кладёт каждый сокет в комнату `user:<userId>`, поэтому событие уходит всем клиентам, залогиненным в один аккаунт, а не всем подряд. Socket.IO использует Redis pub/sub адаптер — если когда-нибудь понадобится несколько инстансов API, real-time события всё равно будут доходить до всех клиентов.

События: `task:created`, `task:updated`, `task:deleted`. Payload:

```json
{ "id": "task-uuid", "status": "IN_PROGRESS", "timestamp": "2026-08-05T12:56:48.882Z" }
```

## Тесты

```bash
cd backend
npm test
```

Unit-тесты покрывают `AuthService` (хеширование пароля, дубликат email, неверный пароль) и `TasksService` (владение задачей, генерация событий).

## Что дальше можно улучшить

Это рабочий каркас, а не финальная реализация — сознательно оставлено пространство для доработки:

- refresh-токены / логаут по истечении access-токена
- оптимистичные обновления на фронте вместо полного рефетча по каждому WebSocket-событию
- e2e-тесты (Supertest на backend, Playwright/Cypress на frontend)
- пагинация и фильтрация в `GET /tasks`
- rate-limiting на `/auth/*`
