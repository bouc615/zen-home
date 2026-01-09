# Supabase 数据库完整配置指南 - 家庭协作版

## 📋 执行步骤概览

1. 登录 Supabase Dashboard
2. 打开 SQL Editor
3. 依次执行下面的 SQL 脚本（按顺序）
4. 验证表结构

---

## 第一步：创建 users 表（用户与家庭）

```sql
-- ============================================
-- 1. 创建 users 表
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  openid TEXT UNIQUE NOT NULL,
  unionid TEXT,
  session_key TEXT NOT NULL,
  household_id UUID NOT NULL, -- 核心字段：指向当前所属的家庭
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 创建索引
CREATE INDEX idx_users_openid ON users(openid);
CREATE INDEX idx_users_household_id ON users(household_id);

-- 添加注释
COMMENT ON TABLE users IS '用户表：存储微信小程序用户信息';
COMMENT ON COLUMN users.household_id IS '家庭ID：默认等于自己的user_id，加入他人家庭后会指向户主的household_id';

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_users_updated_at();
```

---

## 第二步：修改 items 表（添加家庭归属）

```sql
-- ============================================
-- 2. 修改 items 表，添加 household_id
-- ============================================

-- 添加 household_id 字段（允许为空，稍后填充）
ALTER TABLE items ADD COLUMN IF NOT EXISTS household_id UUID;

-- 添加 user_id 字段（用于记录创建者，如果之前没有的话）
ALTER TABLE items ADD COLUMN IF NOT EXISTS user_id UUID;

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_items_household_id ON items(household_id);
CREATE INDEX IF NOT EXISTS idx_items_user_id ON items(user_id);

-- 添加注释
COMMENT ON COLUMN items.household_id IS '家庭ID：该物品归属的家庭';
COMMENT ON COLUMN items.user_id IS '创建者ID：记录是谁添加的这个物品';
```

---

## 第三步：修改 recipes 表（添加家庭归属）

```sql
-- ============================================
-- 3. 修改 recipes 表，添加 household_id
-- ============================================

-- 添加 household_id 字段
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS household_id UUID;

-- 添加 user_id 字段（记录创建者）
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS user_id UUID;

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_recipes_household_id ON recipes(household_id);
CREATE INDEX IF NOT EXISTS idx_recipes_user_id ON recipes(user_id);

-- 添加注释
COMMENT ON COLUMN recipes.household_id IS '家庭ID：该菜谱归属的家庭';
COMMENT ON COLUMN recipes.user_id IS '创建者ID：记录是谁创建的这个菜谱';
```

---

## 第四步：数据迁移（如果有旧数据）

**⚠️ 重要说明**：

- 如果你的 `items` 和 `recipes` 表中已经有数据，但没有 `user_id`，这些数据将无法自动关联到家庭。
- 建议在测试阶段直接清空旧数据，或手动为旧数据分配一个测试用户。

### 选项 A：清空旧数据（推荐用于开发测试）

```sql
-- 清空旧数据（谨慎操作！）
TRUNCATE TABLE items CASCADE;
TRUNCATE TABLE recipes CASCADE;
```

### 选项 B：为旧数据分配默认用户（如果需要保留）

```sql
-- 1. 先创建一个测试用户
INSERT INTO users (id, openid, session_key, household_id)
VALUES (
  '00000000-0000-0000-0000-000000000001'::UUID,
  'test_openid_default',
  'test_session_key',
  '00000000-0000-0000-0000-000000000001'::UUID
);

-- 2. 将所有旧的 items 和 recipes 归属到这个测试用户
UPDATE items
SET user_id = '00000000-0000-0000-0000-000000000001'::UUID,
    household_id = '00000000-0000-0000-0000-000000000001'::UUID
WHERE user_id IS NULL;

UPDATE recipes
SET user_id = '00000000-0000-0000-0000-000000000001'::UUID,
    household_id = '00000000-0000-0000-0000-000000000001'::UUID
WHERE user_id IS NULL;
```

---

## 第五步：添加约束（确保数据完整性）

```sql
-- ============================================
-- 5. 添加非空约束（在数据迁移完成后执行）
-- ============================================

-- 为 items 表添加约束
ALTER TABLE items ALTER COLUMN household_id SET NOT NULL;
ALTER TABLE items ALTER COLUMN user_id SET NOT NULL;

-- 为 recipes 表添加约束
ALTER TABLE recipes ALTER COLUMN household_id SET NOT NULL;
ALTER TABLE recipes ALTER COLUMN user_id SET NOT NULL;
```

---

## 第六步：验证表结构

执行以下查询，确认表结构正确：

```sql
-- 查看 users 表结构
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- 查看 items 表结构
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'items'
ORDER BY ordinal_position;

-- 查看 recipes 表结构
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'recipes'
ORDER BY ordinal_position;
```

---

## 第七步：测试数据（可选）

创建一些测试数据验证功能：

```sql
-- 创建测试用户 A
INSERT INTO users (id, openid, session_key, household_id)
VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::UUID,
  'wx_user_a',
  'session_key_a',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::UUID -- 自己的家庭
);

-- 创建测试用户 B
INSERT INTO users (id, openid, session_key, household_id)
VALUES (
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::UUID,
  'wx_user_b',
  'session_key_b',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::UUID -- 自己的家庭
);

-- 为用户 A 创建一个物品
INSERT INTO items (name, type, category, user_id, household_id, added_at)
VALUES (
  '苹果',
  'fridge',
  '水果',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::UUID,
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::UUID,
  EXTRACT(EPOCH FROM NOW())::BIGINT * 1000
);

-- 验证：查询用户 A 的家庭物品
SELECT i.*
FROM items i
JOIN users u ON i.household_id = u.household_id
WHERE u.id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::UUID;

-- 模拟用户 B 加入用户 A 的家庭
UPDATE users
SET household_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::UUID
WHERE id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::UUID;

-- 验证：现在用户 B 也能看到用户 A 的物品了
SELECT i.*
FROM items i
JOIN users u ON i.household_id = u.household_id
WHERE u.id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::UUID;
```

---

## ✅ 完成检查清单

执行完上述步骤后，请确认：

- [ ] `users` 表已创建，包含 `household_id` 字段
- [ ] `items` 表已添加 `household_id` 和 `user_id` 字段
- [ ] `recipes` 表已添加 `household_id` 和 `user_id` 字段
- [ ] 所有索引已创建
- [ ] 旧数据已迁移或清空
- [ ] 非空约束已添加
- [ ] 测试查询能正常返回结果

---

## 🚨 常见问题

### Q1: 执行 ALTER TABLE 时报错 "column already exists"

**A**: 这是正常的，说明该字段已经存在。可以忽略或使用 `IF NOT EXISTS` 语法。

### Q2: 添加非空约束时报错

**A**: 说明表中有数据的 `household_id` 或 `user_id` 为空。请先执行第四步的数据迁移。

### Q3: 如何回滚？

**A**: 如果需要撤销更改：

```sql
-- 删除新增的字段
ALTER TABLE items DROP COLUMN IF EXISTS household_id;
ALTER TABLE items DROP COLUMN IF EXISTS user_id;
ALTER TABLE recipes DROP COLUMN IF EXISTS household_id;
ALTER TABLE recipes DROP COLUMN IF EXISTS user_id;

-- 删除 users 表
DROP TABLE IF EXISTS users CASCADE;
```

---

执行完成后，请告诉我结果，我们就可以开始修改后端代码了！
