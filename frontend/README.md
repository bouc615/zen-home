# ZenHome 微信小程序（Taro）

智能厨房管家小程序 - 前端部分

## 技术栈

- **框架**: Taro 4.x
- **UI 库**: React 18
- **编译工具**: Webpack 5
- **样式**: SCSS
- **语言**: TypeScript

## 项目结构

```
frontend/
├── config/              # 构建配置
├── src/
│   ├── pages/          # 页面
│   │   ├── fridge/     # 冰箱管理页
│   │   ├── recipes/    # 食谱页
│   │   ├── settings/   # 设置页
│   │   └── chat/       # AI 聊天页
│   ├── services/       # API 服务层
│   ├── utils/          # 工具函数
│   ├── types.ts        # 类型定义
│   ├── constants.ts    # 常量
│   ├── config.ts       # 配置
│   ├── app.tsx         # 应用入口
│   ├── app.config.ts   # 应用配置
│   └── app.scss        # 全局样式
├── package.json
├── tsconfig.json
└── project.config.json # 微信小程序配置
```

## 开发指南

### 安装依赖

```bash
cd frontend
npm install
# 或
yarn install
```

### 开发

```bash
# 微信小程序
npm run dev:weapp

# H5
npm run dev:h5
```

### 构建

```bash
# 微信小程序
npm run build:weapp

# H5
npm run build:h5
```

### 微信开发者工具

1. 打开微信开发者工具
2. 导入项目，选择 `frontend` 目录
3. 项目配置中的 AppID 使用测试号或自己的 AppID

## 后端 API 配置

在 `src/config.ts` 中配置后端 API 地址：

```typescript
export const API_CONFIG = {
  BASE_URL: "http://localhost:3000/api", // 开发环境
  TIMEOUT: 10000,
};
```

## 功能特性

- ✅ 食材管理（添加、编辑、删除、搜索、分类过滤）
- ✅ 食谱管理（添加、编辑、删除、搜索）
- ✅ AI 聊天助手（需要后端支持）
- ✅ 图片识别（需要后端支持）
- ✅ 用户设置

## 注意事项

1. **合法域名配置**: 在微信公众平台配置 request 合法域名
2. **后端 API**: 需要配合后端服务使用
3. **图片上传**: 使用 `Taro.chooseImage` 选择图片
4. **本地调试**: 可以在微信开发者工具中开启"不校验合法域名"

## License

MIT
