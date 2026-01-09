# 后端家庭协作功能改造完成总结

## ✅ 已完成的改动

### 1. 类型定义更新

- **`src/types/auth.ts`**:

  - `User` 接口增加 `household_id` 字段
  - `LoginResponse` 增加 `household_id` 返回
  - 新增 `HouseholdMember` 接口

- **`src/types/index.ts`**:
  - `InventoryItem` 增加 `user_id` 和 `household_id`
  - `Recipe` 增加 `user_id` 和 `household_id`

### 2. 用户服务 (`src/services/user.ts`)

- ✅ `createUser`: 创建用户时自动设置 `household_id = user.id`（隐形家庭模型）
- ✅ `getHouseholdMembers`: 获取家庭成员列表
- ✅ `joinHousehold`: 加入指定用户的家庭
- ✅ `leaveHousehold`: 退出家庭，恢复独立状态

### 3. Items 服务与路由

- **`src/services/itemsService.ts`**:

  - `getAllItems(householdId)`: 按家庭 ID 筛选物品
  - `createItem(item, userId, householdId)`: 创建时记录创建者和家庭

- **`src/routes/items.ts`**:
  - 新增 `getUserInfo()` 中间件：从 JWT token 提取用户信息
  - 所有接口自动传递 `household_id` 进行数据隔离

### 4. Recipes 服务与路由

- **`src/services/recipesService.ts`**:

  - `getAllRecipes(householdId)`: 按家庭 ID 筛选菜谱
  - `createRecipe(recipe, userId, householdId)`: 创建时记录创建者和家庭

- **`src/routes/recipes.ts`**:
  - 同 items，增加 JWT 验证和家庭数据隔离

### 5. 家庭管理路由 (新增)

- **`src/routes/household.ts`** (全新文件):
  - `GET /api/household/members`: 获取当前家庭成员
  - `POST /api/household/join`: 加入指定用户的家庭
  - `POST /api/household/leave`: 退出当前家庭

### 6. 登录接口更新

- **`src/routes/auth.ts`**:
  - 登录响应中包含 `household_id`

### 7. 应用注册

- **`src/app.ts`**:
  - 注册 `/api/household` 路由

---

## 🔑 核心逻辑说明

### 隐形家庭模型

1.  **新用户注册**: `household_id` 自动设为自己的 `user_id`
2.  **查询数据**: 所有 items/recipes 查询都基于 `household_id`
3.  **加入家庭**: 更新 `household_id` 指向目标用户的 `household_id`
4.  **退出家庭**: 恢复 `household_id = user_id`

### 数据隔离

- 用户 A (household_id = A_id) 只能看到 household_id = A_id 的数据
- 用户 B 加入 A 后 (household_id = A_id)，也能看到相同数据
- 用户 B 退出后 (household_id = B_id)，又回到自己的数据视图

---

## 📝 注意事项

### TypeScript Lint 警告

目前有一些 `Parameter 'req' implicitly has an 'any' type` 的警告。这些是 TypeScript 严格模式的提示，不影响功能运行。如需修复，可以：

```typescript
import { Request, Response } from 'express';
router.get('/', asyncHandler(async (req: Request, res: Response) => { ... }));
```

### 认证要求

- 除了 `/api/auth/login` 外，所有接口都需要在 Header 中携带 JWT token:
  ```
  Authorization: Bearer <token>
  ```

---

## 🧪 测试建议

### 1. 测试用户创建

```bash
# 登录用户 A
POST /api/auth/login
{ "code": "wx_code_a" }
# 返回: { token, user: { id, household_id } }
# 验证: household_id === user.id
```

### 2. 测试数据隔离

```bash
# 用户 A 创建物品
POST /api/items
Header: Authorization: Bearer <token_a>
Body: { name: "苹果", ... }

# 用户 B 查询（应该看不到 A 的苹果）
GET /api/items
Header: Authorization: Bearer <token_b>
# 返回: { data: [] }
```

### 3. 测试加入家庭

```bash
# 用户 B 加入用户 A 的家庭
POST /api/household/join
Header: Authorization: Bearer <token_b>
Body: { targetUserId: "<user_a_id>" }

# 用户 B 再次查询（现在能看到 A 的苹果了）
GET /api/items
Header: Authorization: Bearer <token_b>
# 返回: { data: [{ name: "苹果", ... }] }
```

### 4. 测试退出家庭

```bash
# 用户 B 退出
POST /api/household/leave
Header: Authorization: Bearer <token_b>

# 用户 B 查询（苹果又消失了）
GET /api/items
Header: Authorization: Bearer <token_b>
# 返回: { data: [] }
```

---

## 🚀 下一步

后端改造已完成！接下来需要：

1.  **前端改造**: 更新小程序端以支持家庭功能
2.  **测试**: 使用 Postman/Yaak 测试所有接口
3.  **部署**: 重启后端服务使改动生效
