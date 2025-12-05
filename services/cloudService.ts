import cloudbase from '@cloudbase/js-sdk';
import { Recipe } from '../types';

// ============================================================================
// 初始化 CloudBase
// ============================================================================

const app = cloudbase.init({
  env: 'zen-home-v1-1gm9o896f89db45f', // 你的环境 ID
  region: 'ap-shanghai', // 你的环境地域
  persistence: 'local' // 保持登录状态
});

const db = app.database();
const auth = app.auth();

// 确保已登录
async function ensureAuth() {
  const loginState = await auth.getLoginState();

  if (!loginState) {
    throw new Error('未登录，请先登录');
  }
}

// ============================================================================
// 用户认证 (Auth)
// ============================================================================

/**
 * 发送手机验证码
 * @param phoneNumber 手机号
 * @returns verificationInfo 验证信息，需要在登录时传入
 */
/**
 * 格式化手机号，确保以 +86 开头
 */
function formatPhoneNumber(phone: string): string {
  // 移除所有非数字字符和加号
  let cleanPhone = phone.replace(/[^\d+]/g, '');

  // 如果已经以 +86 开头，直接返回
  if (cleanPhone.startsWith('+86')) {
    return cleanPhone;
  }

  // 如果以 86 开头（没有+），加上+
  if (cleanPhone.startsWith('86')) {
    return `+${cleanPhone}`;
  }

  // 否则，加上 +86
  return `+86${cleanPhone}`;
}

/**
 * 发送手机验证码
 * @param phoneNumber 手机号
 * @returns verificationInfo 验证信息，需要在登录时传入
 */
export async function sendPhoneCode(phoneNumber: string): Promise<any> {
  try {
    const verificationInfo = await (auth as any).getVerification({
      phone_number: phoneNumber,
    });
    return verificationInfo;
  } catch (error: any) {
    console.error("Failed to send phone code:", error);
    throw new Error(error.message || '发送验证码失败');
  }
}

/**
 * 手机号验证码登录
 * @param phoneNumber 手机号
 * @param code 验证码
 * @param verificationInfo 发送验证码时返回的验证信息
 */
export async function signInWithPhone(phoneNumber: string, code: string, verificationInfo: any): Promise<void> {
  try {
    if (!verificationInfo) {
      throw new Error('缺少验证信息，请重新发送验证码');
    }

    await (auth as any).signInWithSms({
      verificationInfo,
      verificationCode: code,
      phoneNum: phoneNumber
    });
  } catch (error: any) {
    console.error("Failed to sign in:", error);
    throw new Error(error.message || '登录失败');
  }
}

/**
 * 登出
 */
export async function signOut(): Promise<void> {
  await auth.signOut();
}

/**
 * 获取当前用户信息
 */
export async function getUserInfo() {
  const loginState = await auth.getLoginState();

  // 如果是匿名登录，视为未登录并清除状态
  if (loginState && ((loginState as any).loginType === 'ANONYMOUS' || (loginState as any).isAnonymous)) {
    await auth.signOut();
    return null;
  }

  return loginState ? loginState.user : null;
}

/**
 * 监听登录状态变化
 * @param callback 回调函数
 */
export function onLoginStateChanged(callback: (user: any) => void) {
  auth.onLoginStateChanged((loginState) => {
    callback(loginState ? loginState.user : null);
  });
}

// ============================================================================
// 物品管理 (Items)
// ============================================================================

const COLLECTION_ITEMS = 'items';

export async function fetchItems(): Promise<any[]> {
  try {
    await ensureAuth();
    const res = await db.collection(COLLECTION_ITEMS).limit(1000).get();
    console.log('#res', res);

    const dataList = Array.isArray(res.data) ? res.data : ((res.data as any) && (res.data as any).list ? (res.data as any).list : []);

    if (!dataList || dataList.length === 0) {
      console.warn('⚠️ fetchItems 返回为空。请检查云开发控制台 -> 数据库 -> items 集合 -> 权限设置。确保设置为“所有用户可读” (Read by all users) 或适当的自定义权限。');
      return [];
    }

    // Polyfill id with _id if id is missing
    return dataList.map((item: any) => ({
      ...item,
      id: item.id || item._id
    })) as any[];
  } catch (error) {
    console.error("Failed to fetch items:", error);
    return [];
  }
}

export async function addItem(item: any): Promise<string> {
  await ensureAuth();
  const res = await db.collection(COLLECTION_ITEMS).add(item);
  return (res as any).id;
}

export async function updateItem(item: any): Promise<void> {
  await ensureAuth();
  const { _id, _openid, ...data } = item;

  if (_id) {
    await db.collection(COLLECTION_ITEMS).doc(_id).update(data);
    return;
  }

  await db.collection(COLLECTION_ITEMS).where({ id: item.id }).update(data);
}

export async function deleteItem(item: any): Promise<void> {
  await ensureAuth();
  const { _id, id } = item as any;

  if (_id) {
    await db.collection(COLLECTION_ITEMS).doc(_id).remove();
    return;
  }

  if (id) {
    await db.collection(COLLECTION_ITEMS).where({ id }).remove();
    return;
  }

  throw new Error("Delete failed: Item has no ID");
}

// ============================================================================
// 菜谱管理 (Recipes)
// ============================================================================

const COLLECTION_RECIPES = 'recipes';

export async function fetchRecipes(): Promise<Recipe[]> {
  await ensureAuth();
  try {
    const res = await db.collection(COLLECTION_RECIPES).limit(1000).get();

    const dataList = Array.isArray(res.data) ? res.data : ((res.data as any) && (res.data as any).list ? (res.data as any).list : []);

    // Polyfill id with _id if id is missing
    return dataList.map((item: any) => ({
      ...item,
      id: item.id || item._id
    })) as Recipe[];
  } catch (error) {
    console.error("Failed to fetch recipes:", error);
    return [];
  }
}

export async function addRecipe(recipe: Recipe): Promise<string> {
  await ensureAuth();
  const res = await db.collection(COLLECTION_RECIPES).add(recipe);
  return (res as any).id;
}

export async function updateRecipe(recipe: Recipe): Promise<void> {
  await ensureAuth();
  // Exclude _id and _openid from the update payload
  const { _id, _openid, ...data } = recipe as any;

  if (_id) {
    await db.collection(COLLECTION_RECIPES).doc(_id).update(data);
    return;
  }

  if (!recipe.id) {
    throw new Error('Update failed: Recipe ID is missing');
  }
  await db.collection(COLLECTION_RECIPES).where({ id: recipe.id }).update(data);
}

export async function deleteRecipe(recipe: Recipe): Promise<void> {
  await ensureAuth();
  const { _id, id } = recipe as any;

  if (_id) {
    await db.collection(COLLECTION_RECIPES).doc(_id).remove();
    return;
  }

  if (id) {
    await db.collection(COLLECTION_RECIPES).where({ id }).remove();
    return;
  }

  throw new Error("Delete failed: Recipe has no ID");
}

// ... (previous code remains the same)

// ============================================================================
// AI 服务 (Cloud Functions)
// ============================================================================

/**
 * 调用 AI 对话云函数
 * @param history 聊天历史
 * @param message 用户消息
 * @param inventory 库存信息
 * @param recipes 菜谱信息
 */
export async function callAI(
  history: any[],
  message: string,
  inventory: any[],
  recipes: any[]
): Promise<string> {
  await ensureAuth();
  try {
    const res = await app.callFunction({
      name: 'ai-chat', // 云函数名称
      data: {
        history,
        message,
        inventory,
        recipes
      }
    });

    if (res.result && res.result.text) {
      return res.result.text;
    }
    throw new Error('AI response format error');
  } catch (error: any) {
    console.error("Cloud Function 'ai-chat' failed:", error);
    throw new Error(error.message || 'AI 服务暂时不可用');
  }
}

/**
 * 调用 AI 图像分析云函数
 * @param base64Image 图片 Base64 数据
 * @param type 物品类型
 */
export async function callImageAnalysis(base64Image: string, type: string): Promise<any> {
  await ensureAuth();
  try {
    const res = await app.callFunction({
      name: 'ai-vision', // 云函数名称
      data: {
        image: base64Image,
        type
      }
    });

    if (res.result) {
      return res.result;
    }
    throw new Error('Analysis response format error');
  } catch (error: any) {
    console.error("Cloud Function 'ai-vision' failed:", error);
    throw new Error(error.message || '图像识别服务暂时不可用');
  }
}

// ============================================================================
// 文件存储 (Storage)
// ============================================================================

/**
 * 上传文件到云存储
 * @param file 文件对象
 * @returns 下载链接 (File ID or HTTPS URL)
 */
export async function uploadFile(file: File): Promise<string> {
  await ensureAuth();

  const ext = file.name.split('.').pop();
  const cloudPath = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  try {
    // 在浏览器环境中，uploadFile 直接接受 File 对象
    const res = await app.uploadFile({
      cloudPath: cloudPath,
      filePath: file as any  // CloudBase SDK 类型定义问题，需要 any 断言
    });

    console.log('Upload result:', res);

    // 检查上传是否成功
    if (!res.fileID) {
      throw new Error('Upload failed: no fileID returned');
    }

    // 获取临时访问链接
    const { fileList } = await app.getTempFileURL({
      fileList: [res.fileID]
    });

    if (!fileList || fileList.length === 0 || !fileList[0].tempFileURL) {
      throw new Error('Failed to get temp file URL');
    }

    console.log('Temp URL:', fileList[0].tempFileURL);
    return fileList[0].tempFileURL;
  } catch (error) {
    console.error("Upload failed:", error);
    // 提供更详细的错误信息
    if (error instanceof Error) {
      throw new Error(`文件上传失败: ${error.message}`);
    }
    throw new Error('文件上传失败，请检查网络连接和云存储配置');
  }
}
