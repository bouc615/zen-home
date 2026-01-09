# ZenHome - 智能厨房管家

一个基于 Taro + Node.js 的全栈智能家庭助手，帮助你协同管理食材库存和食谱。

## 核心特性

- ✅ **食材管理**：拍照识别、过期提醒、分类通过
- ✅ **食谱管理**：AI 推荐、烹饪步骤记录
- ✅ **家庭协作**：邀请家人加入家庭，共享库存与数据（新！）
- ✅ **AI 助手**：基于 ZenMux 的智能问答
- ✅ **多端同步**：基于 Supabase 的实时数据同步

## 快速开始

### 1. 环境准备

首次运行请参考详细文档：

- [数据库配置指南](docs/SUPABASE_SETUP.md)
- [登录与环境配置](docs/LOGIN_SETUP.md)

### 2. 启动前端（微信小程序）

```bash
cd frontend
npm install
npm run dev:weapp
```

### 3. 启动后端

```bash
cd backend
npm install
npm run dev
```

## 文档资源

- [上线检查清单](docs/LAUNCH_CHECKLIST.md)
- [前端说明](frontend/README.md)
- [后端说明](backend/README.md)

## 技术栈

- **Frontend**: Taro 4.x, React 18, TypeScript, SCSS
- **Backend**: Node.js, Express, Supabase (PostgreSQL)
- **AI**: ZenMux, OpenAI SDK

## License

MIT
