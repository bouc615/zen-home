# Docker 部署指南

## 🚀 一键部署（推荐）

### 方法 1: 快速部署（开发/测试环境）

```bash
cd backend
./deploy.sh
```

这个脚本会自动：
- ✅ 检查 Docker 和 Docker Compose
- ✅ 检查环境变量配置
- ✅ 构建 Docker 镜像
- ✅ 启动服务
- ✅ 验证服务健康状态

### 方法 2: 生产环境部署（包含 Nginx + SSL）

```bash
cd backend
sudo ./deploy-production.sh
```

这个脚本会自动：
- ✅ 安装 Nginx 和 Certbot
- ✅ 配置 Nginx 反向代理
- ✅ 配置 SSL 证书（Let's Encrypt）
- ✅ 部署后端服务

### 方法 3: 快速更新

代码更新后，快速重新部署：
```bash
cd backend
./update.sh
```

---

## 📋 手动部署

### 1. 准备服务器

确保服务器已安装：

- Docker
- Docker Compose

### 2. 克隆代码

```bash
git clone <your-repo-url>
cd zen-home/backend
```

### 3. 配置环境变量

编辑 `.env` 文件（或创建 `.env.production`）：

```env
# Server
PORT=3000
NODE_ENV=production

# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# AI
LLM_MODEL_ID=xiaomi/mimo-v2-flash-free
LLM_API_KEY=sk-ai-v1-xxx
LLM_BASE_URL=https://zenmux.ai/api/v1

# CORS（重要：添加你的域名）
ALLOWED_ORIGINS=https://servicewechat.com,https://your-domain.com
```

### 4. 启动服务

```bash
# 构建并启动
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

### 5. 配置 Nginx（推荐）

创建 `/etc/nginx/sites-available/zen-home-api`:

```nginx
server {
    listen 80;
    server_name api.your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

启用配置：

```bash
sudo ln -s /etc/nginx/sites-available/zen-home-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 6. 配置 HTTPS（必需）

使用 Let's Encrypt：

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.your-domain.com
```

### 7. 验证部署

```bash
# 健康检查
curl https://api.your-domain.com/health

# 测试 API
curl https://api.your-domain.com/api/items
```

## 常用命令

```bash
# 查看运行状态
docker-compose ps

# 重启服务
docker-compose restart

# 查看日志
docker-compose logs -f backend

# 更新代码
git pull
docker-compose down
docker-compose up -d --build

# 清理旧镜像
docker system prune -a
```

## 监控和维护

### 日志管理

```bash
# 限制日志大小
# 编辑 docker-compose.yml，添加：
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

### 自动重启

docker-compose.yml 中已配置 `restart: unless-stopped`

### 备份

定期备份 Supabase 数据库（在 Supabase 控制台操作）

## 故障排查

### 容器无法启动

```bash
docker-compose logs backend
```

### 端口被占用

```bash
sudo lsof -i :3000
```

### 内存不足

```bash
docker stats
```

部署完成后，你的 API 地址将是：
`https://api.your-domain.com`
