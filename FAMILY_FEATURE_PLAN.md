# 家庭协作功能 - 实施计划 (Implementation Plan)

基于已确认的 [PRD v1.2 (极简隐形家庭版)](./PRD_FAMILY_COLLABORATION.md)，我们将进行以下改造。

## 1. 数据库变更 (Supabase)

需要执行以下 SQL 脚本来调整数据模型。

### 1.1 修改 `users` 表

新增 `household_id` 字段，默认等于自己的 `id`。

```sql
-- 1. 添加 household_id 字段
ALTER TABLE users ADD COLUMN household_id UUID;

-- 2. 初始化旧数据：让每个人的 household_id 默认为自己的 id
UPDATE users SET household_id = id WHERE household_id IS NULL;

-- 3. 设置非空约束（可选，建议设为非空确保逻辑统一）
ALTER TABLE users ALTER COLUMN household_id SET NOT NULL;

-- 4. 添加索引加速查询
CREATE INDEX idx_users_household_id ON users(household_id);
```

### 1.2 修改 `items` 和 `recipes` 表

我们需要将物品归属权从“个人”改为“家庭”。

```sql
-- 1. 为 items 表添加 household_id
ALTER TABLE items ADD COLUMN household_id UUID;
-- 初始化：现有的 item 归属于创建者的家庭
UPDATE items SET household_id = (SELECT household_id FROM users WHERE users.id = items.user_id);
ALTER TABLE items ALTER COLUMN household_id SET NOT NULL;
CREATE INDEX idx_items_household_id ON items(household_id);

-- 2. 为 recipes 表添加 household_id
ALTER TABLE recipes ADD COLUMN household_id UUID;
UPDATE recipes SET household_id = (SELECT household_id FROM users WHERE users.id = recipes.user_id);
ALTER TABLE recipes ALTER COLUMN household_id SET NOT NULL;
CREATE INDEX idx_recipes_household_id ON recipes(household_id);
```

---

## 2. 后端代码开发 (Backend)

### 2.1 更新类型定义

- 修改 `User` 类型，增加 `household_id`。

### 2.2 修改现有业务逻辑

- **Items Service**: 查询、创建物品时，不再使用 `user_id`，而是使用用户的 `household_id`。
- **Recipes Service**: 同上。
- **目的**：确保同一家庭下的用户操作的是同一份数据。

### 2.3 新增家庭管理接口 (`routes/household.ts`)

- `POST /api/household/join`: 加入指定用户的家庭。
  - 入参: `targetUserId` (目标户主 ID)
  - 逻辑: 更新当前用户的 `household_id` = `targetUserId`。
- `POST /api/household/leave`: 退出家庭。
  - 逻辑: 更新当前用户的 `household_id` = 自己的 `user_id`。
- `GET /api/household/members`: 获取当前家庭成员列表。

---

## 3. 前端代码开发 (Frontend)

### 3.1 状态管理

- 在全局 User Store 中保存 `household_id`。

### 3.2 设置页改造 (`pages/settings`)

- **展示当前状态**：
  - 如果 `household_id == user_id`: 显示“单人模式”或“我的家”。
  - 如果 `household_id != user_id`: 显示“已加入 [xxx] 的家”。
- **成员列表**：调用 `GET members` 接口展示头像。
- **退出按钮**：仅当加入别人家庭时显示。

### 3.3 邀请与加入流程

- **邀请页**：展示当前用户的 `user_id` 二维码（或生成小程序码）。
- **扫码逻辑**：
  - 调用 `Taro.scanCode`。
  - 解析出目标 `user_id`。
  - 弹窗确认（显示 PRD 中的警告文案）。
  - 确认后调用 `POST join` 接口。
  - 刷新全量数据。

---

## 4. 执行顺序建议

1.  **手动执行 SQL** (Supabase Dashboard)。
2.  **后端开发**：更新 CRUD 逻辑适配 `household_id`。
3.  **前端开发**：设置页 UI 及扫码逻辑。
