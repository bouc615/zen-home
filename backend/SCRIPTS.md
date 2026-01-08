# 部署脚本使用说明

## 📦 可用脚本

### 1. deploy.sh - 基础部署

**用途**: 首次部署或完整重新部署

**使用方法**:

```bash
cd backend
chmod +x deploy.sh
./deploy.sh
```

**功能**:

- 检查 Docker 和 Docker Compose
- 检查 .env 配置
- 构建 Docker 镜像
- 启动容器
- 验证服务健康状态

**适用场景**: 开发环境、测试环境

---

### 2. update.sh - 快速更新

**用途**: 代码更新后快速重新部署

**使用方法**:

```bash
cd backend
chmod +x update.sh
./update.sh
```

**功能**:

- 拉取最新代码
- 重新构建镜像
- 重启服务

**适用场景**: 日常代码更新

---

### 3. deploy-production.sh - 生产环境部署

**用途**: 生产环境首次部署（包含 Nginx + SSL）

**使用方法**:

```bash
cd backend
chmod +x deploy-production.sh
sudo ./deploy-production.sh
```

**功能**:

- 安装 Nginx
- 配置反向代理
- 安装 SSL 证书
- 部署后端服务

**适用场景**: 生产环境首次部署

**需要准备**:

- 域名（已解析到服务器）
- 邮箱（用于 SSL 证书）

---

## 🚀 快速开始

### 开发环境

```bash
# 1. 配置环境变量
cp .env.example .env
# 编辑 .env，填写 Supabase 配置

# 2. 一键部署
./deploy.sh

# 3. 访问服务
# http://localhost:3000
```

### 生产环境

```bash
# 1. 配置环境变量
cp .env.example .env
# 编辑 .env，填写 Supabase 配置

# 2. 一键部署（包含 Nginx + SSL）
sudo ./deploy-production.sh
# 按提示输入域名和邮箱

# 3. 访问服务
# https://your-domain.com
```

---

## 🔧 常见问题

### Q: 脚本没有执行权限？

```bash
chmod +x deploy.sh update.sh deploy-production.sh
```

### Q: .env 文件配置错误？

检查以下必需项：

- SUPABASE_URL
- SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY

### Q: 端口 3000 被占用？

```bash
# 查看占用进程
sudo lsof -i :3000

# 或修改 docker-compose.yml 中的端口
```

### Q: SSL 证书配置失败？

确保：

- 域名已正确解析到服务器
- 80 和 443 端口已开放
- 邮箱地址有效

---

## 📝 部署后检查

```bash
# 1. 检查容器状态
docker-compose ps

# 2. 查看日志
docker-compose logs -f

# 3. 测试健康检查
curl http://localhost:3000/health
# 或
curl https://your-domain.com/health

# 4. 测试 API
curl http://localhost:3000/api/items
```

---

## 🔄 更新流程

```bash
# 1. 拉取最新代码
git pull

# 2. 快速更新
./update.sh

# 或手动更新
docker-compose down
docker-compose up -d --build
```

---

## 🛑 停止服务

```bash
# 停止容器
docker-compose down

# 停止并删除数据卷
docker-compose down -v
```

---

## 📊 监控

```bash
# 查看容器资源使用
docker stats

# 查看日志（实时）
docker-compose logs -f backend

# 查看最近 100 行日志
docker-compose logs --tail=100 backend
```
