# ZenHome 接口文档 (API Documentation)

✅ **所有接口的基础 URL**: `/api`
🔐 **认证方式**: 大部分接口需要在 HTTP Header 中携带 JWT Token

```
Authorization: Bearer <your_token>
```

---

## 1. 认证模块 (Auth)

### 1.1 小程序登录

- **URL**: `/auth/login`
- **Method**: `POST`
- **无需 Token**
- **描述**: 使用微信小程序的 code 获取/创建用户并返回 JWT token。
- **请求参数**:
  ```json
  {
    "code": "071xyz..." // 微信 login 获取的 code
  }
  ```
- **响应**:
  ```json
  {
    "token": "eyJhbGciOiJIUz...",
    "user": {
      "id": "uuid...",
      "openid": "...",
      "household_id": "uuid...", // 核心字段：当前所属家庭ID
      "created_at": "...",
      "updated_at": "..."
    }
  }
  ```

---

## 2. 家庭协作模块 (Household)

### 2.1 获取家庭成员

- **URL**: `/household/members`
- **Method**: `GET`
- **描述**: 获取当前家庭下的所有成员列表。
- **响应**:
  ```json
  {
    "members": [
      {
        "id": "uuid...",
        "openid": "wx_user_1",
        "created_at": "..."
      },
      ...
    ]
  }
  ```

### 2.2 加入家庭

- **URL**: `/household/join`
- **Method**: `POST`
- **描述**: 加入另一个用户的家庭（本质是将自己的 household_id 指向目标用户）。
- **请求参数**:
  ```json
  {
    "targetUserId": "uuid..." // 目标户主的 User ID
  }
  ```
- **响应**:
  ```json
  {
    "message": "Successfully joined household",
    "user": { "id": "...", "household_id": "..." }
  }
  ```

### 2.3 退出家庭

- **URL**: `/household/leave`
- **Method**: `POST`
- **描述**: 退出当前家庭，恢复为独立家庭（household_id 变回自己的 id）。
- **请求参数**: 无
- **响应**:
  ```json
  {
    "message": "Successfully left household",
    "user": { "id": "...", "household_id": "..." }
  }
  ```

---

## 3. 物品管理模块 (Items)

_注意：所有操作自动局限于当前 household_id，实现了数据隔离。_

### 3.1 获取物品列表

- **URL**: `/items`
- **Method**: `GET`
- **响应**:
  ```json
  {
    "data": [
      {
        "id": "...",
        "name": "苹果",
        "type": "fridge",
        "image_url": "...",
        "user_id": "...", // 创建者ID
        "added_at": 1704790000000
        ...
      }
    ]
  }
  ```

### 3.2 创建物品

- **URL**: `/items`
- **Method**: `POST`
- **请求参数**:
  ```json
  {
    "name": "牛奶",
    "type": "fridge", // fridge 或 freezer
    "category": "乳制品",
    "image_url": "...",
    "quantity": "1盒",
    "expiry_date": "2024-02-01"
  }
  ```

### 3.3 更新物品

- **URL**: `/items/:id`
- **Method**: `PUT`
- **请求参数**: (只需传要修改的字段)
  ```json
  {
    "quantity": "2盒",
    "status": "consumed" // active, consumed, wasted
  }
  ```

### 3.4 删除物品

- **URL**: `/items/:id`
- **Method**: `DELETE`

---

## 4. 菜谱管理模块 (Recipes)

_注意：所有操作自动局限于当前 household_id。_

### 4.1 获取菜谱列表

- **URL**: `/recipes`
- **Method**: `GET`

### 4.2 创建菜谱

- **URL**: `/recipes`
- **Method**: `POST`
- **请求参数**:
  ```json
  {
    "name": "红烧肉",
    "image_url": "...",
    "tags": ["肉类", "硬菜"],
    "ingredients": "五花肉500g...",
    "steps": "1. 焯水..."
  }
  ```

### 4.3 更新菜谱

- **URL**: `/recipes/:id`
- **Method**: `PUT`

### 4.4 删除菜谱

- **URL**: `/recipes/:id`
- **Method**: `DELETE`

---

## 5. AI 服务 (AI)

### 5.1 图像识别

- **URL**: `/ai/analyze-image`
- **Method**: `POST`
- **描述**: 识别图片中的食材信息。
- **请求参数**:
  ```json
  {
    "imageUrl": "https://..."
  }
  ```
- **响应**:
  ```json
  {
    "items": [{ "name": "西红柿", "category": "蔬菜", "quantity": "3个" }]
  }
  ```

### 5.2 智能对话

- **URL**: `/ai/chat`
- **Method**: `POST`
- **描述**: 与 AI 助手聊天（如询问菜谱）。
- **请求参数**:
  ```json
  {
    "message": "冰箱里有番茄和鸡蛋，能做什么菜？",
    "history": [] // 可选，历史对话上下文
  }
  ```

---

## 6. 文件上传 (Upload)

### 6.1 上传图片

- **URL**: `/upload`
- **Method**: `POST`
- **ContentType**: `multipart/form-data`
- **字段**: `file` (文件二进制)
- **响应**:
  ```json
  {
    "url": "https://supabase.../image.webp"
  }
  ```
