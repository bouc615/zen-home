# 微信小程序登录功能 - 配置 TODO List

## ✅ 已完成（代码部分）

### 后端

- ✅ 创建 `/api/auth/login` 登录接口
- ✅ 实现微信 `code2Session` 调用
- ✅ 实现用户创建/更新逻辑
- ✅ 实现 JWT token 生成和验证
- ✅ 添加环境变量配置

### 前端

- ✅ 创建 `authService` 登录服务
- ✅ 实现 `app.tsx` 自动登录逻辑
- ✅ Token 本地存储管理
- ✅ 请求拦截器自动携带 token

---

## 📋 需要手动完成的配置

### 1. 微信小程序配置

#### 1.1 获取微信小程序 AppID 和 AppSecret

1. 登录 [微信公众平台](https://mp.weixin.qq.com/)
2. 进入你的小程序后台
3. 点击左侧菜单：**开发** → **开发管理** → **开发设置**
4. 找到 **开发者 ID**：
   - **AppID (小程序 ID)**：复制这个值
   - **AppSecret (小程序密钥)**：点击"生成"或"重置"获取（注意保密！）

#### 1.2 配置服务器域名白名单

1. 在微信小程序后台，点击：**开发** → **开发管理** → **开发设置**
2. 找到 **服务器域名** 部分
3. 点击 **修改**，添加以下域名：
   - **request 合法域名**：添加你的后端 API 域名
     - 开发环境可以先跳过，使用开发者工具的"不校验合法域名"选项
     - 生产环境必须配置，例如：`https://your-api-domain.com`
   - **uploadFile 合法域名**：同上（用于图片上传）

---

### 2. 后端环境变量配置

#### 2.1 复制并编辑 `.env` 文件

```bash
cd backend
cp .env.example .env
```

#### 2.2 编辑 `.env` 文件，填入以下配置

打开 `backend/.env`，找到以下两行并替换为你的实际值：

```bash
# WeChat Mini Program
WECHAT_APPID=你的微信小程序AppID
WECHAT_APP_SECRET=你的微信小程序AppSecret

# JWT (可选：生产环境建议修改为更复杂的密钥)
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

**示例：**

```bash
WECHAT_APPID=wx1234567890abcdef
WECHAT_APP_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
JWT_SECRET=my-super-secret-key-2026-zen-home-production
```

---

### 3. Supabase 数据库配置

#### 3.1 创建 `users` 表

1. 登录你的 [Supabase Dashboard](https://app.supabase.com/)
2. 选择你的项目
3. 点击左侧菜单：**Table Editor**
4. 点击 **New Table**，创建名为 `users` 的表

#### 3.2 添加以下字段

| 字段名        | 类型          | 默认值              | 约束             | 说明                    |
| ------------- | ------------- | ------------------- | ---------------- | ----------------------- |
| `id`          | `uuid`        | `gen_random_uuid()` | Primary Key      | 用户唯一 ID             |
| `openid`      | `text`        | -                   | Unique, Not Null | 微信用户唯一标识        |
| `unionid`     | `text`        | `null`              | Nullable         | 微信开放平台 ID（可选） |
| `session_key` | `text`        | -                   | Not Null         | 微信会话密钥            |
| `created_at`  | `timestamptz` | `now()`             | Not Null         | 创建时间                |
| `updated_at`  | `timestamptz` | `now()`             | Not Null         | 更新时间                |

#### 3.3 SQL 快速创建（推荐）

你也可以直接在 Supabase 的 **SQL Editor** 中执行以下 SQL：

```sql
-- 创建 users 表
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  openid TEXT UNIQUE NOT NULL,
  unionid TEXT,
  session_key TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 创建索引以提高查询性能
CREATE INDEX idx_users_openid ON users(openid);

-- 添加更新时间自动触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

---

### 4. 测试登录功能

#### 4.1 启动后端服务

```bash
cd backend
npm run dev
```

确保没有报错，特别是检查环境变量是否正确加载。

#### 4.2 启动前端小程序

```bash
cd frontend
npm run dev:weapp
```

#### 4.3 使用微信开发者工具测试

1. 打开微信开发者工具
2. 导入项目，选择 `frontend/dist` 目录
3. 填入你的 AppID
4. 在 **详情** → **本地设置** 中：
   - ✅ 勾选 **不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书**
   - ✅ 勾选 **启用调试模式**
5. 点击 **编译**，查看控制台输出：
   - 应该看到 `"User not logged in, attempting WeChat login..."`
   - 然后看到 `"Login successful: { id: '...', openid: '...' }"`

#### 4.4 验证数据库

回到 Supabase Dashboard，查看 `users` 表，应该能看到新创建的用户记录。

---

### 5. 生产环境部署（可选）

#### 5.1 后端部署

- 将后端部署到服务器（如 Railway、Render、Vercel 等）
- 确保在生产环境设置正确的环境变量
- 修改 `JWT_SECRET` 为更安全的随机字符串

#### 5.2 前端配置

- 修改 `frontend/src/config.ts` 中的 `BASE_URL` 为生产环境 API 地址
- 在微信小程序后台配置服务器域名白名单

---

## 🔍 常见问题排查

### 问题 1: 登录失败，提示 "WeChat API Error"

**原因**：AppID 或 AppSecret 配置错误
**解决**：检查 `backend/.env` 文件中的配置是否正确

### 问题 2: 数据库报错 "relation 'users' does not exist"

**原因**：未创建 users 表
**解决**：按照步骤 3 在 Supabase 中创建 users 表

### 问题 3: 前端无法连接后端

**原因**：后端未启动或 CORS 配置问题
**解决**：

- 确保后端服务正在运行（`npm run dev`）
- 检查 `backend/.env` 中的 `ALLOWED_ORIGINS` 是否包含 `https://servicewechat.com`

### 问题 4: Token 无法保存

**原因**：小程序存储权限问题
**解决**：在微信开发者工具中清除缓存后重试

---

## 📞 需要帮助？

如果在配置过程中遇到问题，请提供以下信息：

1. 具体的错误信息（截图或日志）
2. 你正在执行的步骤
3. 后端和前端的控制台输出

祝配置顺利！🎉
