# shaobuqi-server

Express + MySQL 后端服务（对应烧不起前端 MVP）。

## 1. 启动

```bash
cd server
cp .env.example .env
npm install
npm run dev
```

阿里云环境建议：

```bash
cd server
cp .env.aliyun.example .env
# 然后把 .env 里的 DB_HOST/DB_USER/DB_PASSWORD/DB_NAME 改成你的阿里云 RDS 信息
npm install
npm run dev
```

## 2. 环境变量

`.env` 关键字段：

- `PORT`
- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `CORS_ORIGIN`
- `MINIO_ENDPOINT`
- `MINIO_PORT`
- `MINIO_USE_SSL`
- `MINIO_ACCESS_KEY`
- `MINIO_SECRET_KEY`
- `MINIO_BUCKET`
- `MINIO_PUBLIC_BASE_URL`

## 3. 开发账号

```bash
mysql -u<user> -p <db_name> < server/sql/seed_dev.sql
```

如果你使用 phpMyAdmin（阿里云常见方式）：

1. 先在 phpMyAdmin 选择你的数据库（例如 `shaobuqi`）。
2. 导入 `server/sql/schema.sql`。
3. 再导入 `server/sql/seed_dev.sql`。
4. 确认 `users`、`skills`、`skill_contents` 等表已创建，并且有开发账号数据。

默认账号：

- mobile: `13800000000`
- password: `12345678`

## 4. API 基础路径

- `/h5api`
- `/api`

统一响应：

```json
{ "code": 200, "msg": "ok", "data": {} }
```

## 5. 核心接口（已实现）

### Auth

- `POST /h5api/auth/login/password`

### Skill

- `GET /h5api/skills`
- `GET /h5api/skills/:id`
- `POST /h5api/skills`
- `PUT /h5api/skills/:id`
- `POST /h5api/skills/:id/favorite`
- `DELETE /h5api/skills/:id/favorite`
- `POST /h5api/skills/:id/copies`
- `POST /h5api/skills/:id/feedbacks`
- `GET /h5api/skills/:id/feedbacks`
- `GET /h5api/skills/meta/categories`
- `GET /h5api/skills/meta/tags`

### Me

- `GET /h5api/me/profile`
- `PUT /h5api/me/avatar`
- `GET /h5api/me/skills`
- `GET /h5api/me/favorites`
- `GET /h5api/me/copies`

### Draft

- `GET /h5api/drafts`
- `GET /h5api/drafts/:id`
- `POST /h5api/drafts/save`
- `DELETE /h5api/drafts/:id`

### Stats

- `GET /h5api/stats/trends`

### Feed

- `GET /h5api/feed`
- `POST /h5api/feed`
- `PUT /h5api/feed/:id/images`
- `GET /h5api/feed/:id`
- `POST /h5api/feed/:id/like`
- `DELETE /h5api/feed/:id/like`
- `POST /h5api/feed/:id/meoo`
- `DELETE /h5api/feed/:id/meoo`
- `PUT /h5api/feed/:id/reaction`
- `GET /h5api/feed/:id/comments`
- `POST /h5api/feed/:id/comments`
- `POST /h5api/feed/comments/:id/like`
- `DELETE /h5api/feed/comments/:id/like`

### Upload

- `POST /h5api/uploads/image` (multipart/form-data, `file` + `usage`)

## 6. 健康检查

- `GET /healthz`
