# 🔍 CloudBase 云存储上传问题诊断指南

## 问题描述
图片没有保存到腾讯云存储（CloudBase Storage）

## 🛠️ 排查步骤

### 1. 检查 CloudBase 控制台配置

#### 1.1 存储权限设置
访问：https://console.cloud.tencent.com/tcb/storage

**检查项**：
- [ ] 云存储是否已开通
- [ ] 存储空间是否有配额
- [ ] **权限设置**：确保设置为"所有用户可读，仅创建者可写"或"所有用户可读写"

**如何设置权限**：
```
控制台 -> 云存储 -> 权限设置 -> 自定义安全规则
```

推荐规则（允许匿名用户上传）：
```json
{
  "read": true,
  "write": "auth.loginType == 'ANONYMOUS' || auth.loginType == 'CUSTOM'"
}
```

#### 1.2 检查环境 ID
确认 `services/cloudService.ts` 中的环境 ID 正确：
```typescript
env: 'zen-home-v1-1gm9o896f89db45f'  // 是否与控制台一致？
```

### 2. 浏览器控制台检查

打开浏览器开发者工具（F12），查看：

#### 2.1 Console 日志
上传时应该看到：
```
Upload result: { fileID: "cloud://...", ... }
Temp URL: https://...
```

#### 2.2 Network 请求
查找以下请求：
- `uploadFile` 相关的请求
- 状态码应该是 200
- 如果是 403，说明权限问题
- 如果是 401，说明认证问题

#### 2.3 错误信息
如果有错误，记录完整的错误堆栈

### 3. 代码层面检查

#### 3.1 匿名登录是否成功
在 `ensureAuth()` 函数中添加日志：
```typescript
async function ensureAuth() {
  const loginState = await auth.getLoginState();
  console.log('Login state:', loginState);
  if (!loginState) {
    console.log('Attempting anonymous login...');
    await auth.signInAnonymously();
    console.log('Anonymous login successful');
  }
}
```

#### 3.2 文件对象是否正确
在 `uploadFile` 开始处添加：
```typescript
console.log('File to upload:', {
  name: file.name,
  size: file.size,
  type: file.type
});
```

### 4. 常见问题和解决方案

#### 问题 1: 权限不足 (403 Forbidden)
**原因**：云存储权限配置不允许匿名用户上传
**解决**：
1. 进入 CloudBase 控制台
2. 云存储 -> 权限设置
3. 修改为允许匿名用户写入

#### 问题 2: 环境 ID 错误
**原因**：`env` 配置与实际环境不匹配
**解决**：
1. 检查控制台的环境 ID
2. 更新 `cloudService.ts` 中的配置

#### 问题 3: SDK 版本问题
**原因**：`@cloudbase/js-sdk` 版本不兼容
**解决**：
```bash
npm install @cloudbase/js-sdk@latest
```

#### 问题 4: CORS 问题
**原因**：跨域请求被阻止
**解决**：
1. 检查 CloudBase 控制台的域名白名单
2. 添加 `localhost:3000` 到允许列表

### 5. 测试代码

在浏览器控制台运行以下代码测试上传：

```javascript
// 创建一个测试文件
const testBlob = new Blob(['Hello, CloudBase!'], { type: 'text/plain' });
const testFile = new File([testBlob], 'test.txt', { type: 'text/plain' });

// 尝试上传
uploadFile(testFile)
  .then(url => console.log('Upload success:', url))
  .catch(err => console.error('Upload failed:', err));
```

### 6. 临时解决方案

如果云存储一直无法工作，可以临时使用 Base64 存储：

**优点**：
- 无需配置云存储
- 立即可用

**缺点**：
- 数据库存储压力大
- 图片加载慢

**实现**：
```typescript
// 在 EditItemModal.tsx 中
const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  setIsUploading(true);
  try {
    // 方案 1: 使用云存储（推荐）
    const url = await uploadFile(file);
    setFormData(prev => ({ ...prev, imageUrl: url }));
  } catch (error) {
    console.error("Upload failed, using base64 fallback", error);
    
    // 方案 2: 降级到 Base64（临时方案）
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
    };
    reader.readAsDataURL(file);
  } finally {
    setIsUploading(false);
  }
};
```

## 📊 诊断检查清单

- [ ] CloudBase 控制台：云存储已开通
- [ ] CloudBase 控制台：权限设置正确
- [ ] CloudBase 控制台：环境 ID 匹配
- [ ] 浏览器控制台：无 CORS 错误
- [ ] 浏览器控制台：无 403/401 错误
- [ ] 浏览器控制台：能看到 "Upload result" 日志
- [ ] 浏览器控制台：能看到 "Temp URL" 日志
- [ ] Network 面板：uploadFile 请求成功（200）

## 🎯 下一步行动

1. **立即检查**：打开浏览器控制台，尝试上传一张图片
2. **记录错误**：复制完整的错误信息
3. **检查权限**：访问 CloudBase 控制台确认权限配置
4. **反馈结果**：告诉我具体的错误信息，我可以进一步协助

## 📝 快速修复建议

如果您想快速验证其他功能，可以暂时注释掉图片上传，使用 emoji 或默认图标：

```typescript
// 在 EditItemModal.tsx 中临时禁用图片上传
{/* 暂时注释掉
{type === ItemType.WARDROBE && (
  <div className="flex justify-center mb-4">
    ...图片上传区域...
  </div>
)}
*/}
```

这样可以先测试其他功能，之后再专门解决云存储问题。
