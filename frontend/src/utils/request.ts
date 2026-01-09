import Taro from "@tarojs/taro";
import { API_CONFIG } from "../config";

interface RequestOptions {
  url: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  data?: any;
  header?: Record<string, string>;
}

interface RequestResponse<T = any> {
  data: T;
  statusCode: number;
  header: Record<string, string>;
}

/**
 * HTTP 请求工具类
 * 封装 Taro.request，统一处理请求头、错误处理、token 管理
 */
class Request {
  private baseURL: string;
  private timeout: number;
  private token: string | null = null;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
    this.loadToken();
  }

  /**
   * 从本地存储加载 token
   */
  private loadToken() {
    try {
      this.token = Taro.getStorageSync("auth_token");
    } catch (error) {
      console.error("Failed to load token:", error);
    }
  }

  /**
   * 设置 token
   */
  setToken(token: string) {
    this.token = token;
    try {
      Taro.setStorageSync("auth_token", token);
    } catch (error) {
      console.error("Failed to save token:", error);
    }
  }

  /**
   * 清除 token
   */
  clearToken() {
    this.token = null;
    try {
      Taro.removeStorageSync("auth_token");
    } catch (error) {
      console.error("Failed to remove token:", error);
    }
  }

  /**
   * 通用请求方法
   */
  private async request<T = any>(options: RequestOptions): Promise<T> {
    const { url, method = "GET", data, header = {} } = options;

    // 构建完整 URL
    const fullURL = url.startsWith("http") ? url : `${this.baseURL}${url}`;

    // 构建请求头
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...header,
    };

    // 添加 token
    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    try {
      const response: RequestResponse<T> = await Taro.request({
        url: fullURL,
        method,
        data,
        header: headers,
        timeout: this.timeout,
      });

      // 检查响应状态码
      if (response.statusCode >= 200 && response.statusCode < 300) {
        return response.data;
      } else if (response.statusCode === 401) {
        // 未授权，清除 token
        this.clearToken();
        Taro.showToast({
          title: "登录已过期，请重新登录",
          icon: "none",
        });
        throw new Error("Unauthorized");
      } else {
        throw new Error(`Request failed with status ${response.statusCode}`);
      }
    } catch (error: any) {
      console.error("Request error:", error);

      // 显示错误提示
      Taro.showToast({
        title: error.message || "网络请求失败",
        icon: "none",
      });

      throw error;
    }
  }

  /**
   * GET 请求
   */
  get<T = any>(url: string, params?: any): Promise<T> {
    // 将 params 转换为查询字符串
    if (params) {
      const queryString = Object.keys(params)
        .map(
          (key) =>
            `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
        )
        .join("&");
      url = `${url}?${queryString}`;
    }

    return this.request<T>({ url, method: "GET" });
  }

  /**
   * POST 请求
   */
  post<T = any>(url: string, data?: any): Promise<T> {
    return this.request<T>({ url, method: "POST", data });
  }

  /**
   * PUT 请求
   */
  put<T = any>(url: string, data?: any): Promise<T> {
    return this.request<T>({ url, method: "PUT", data });
  }

  /**
   * DELETE 请求
   */
  delete<T = any>(url: string): Promise<T> {
    return this.request<T>({ url, method: "DELETE" });
  }

  /**
   * 上传文件
   */
  async uploadFile(filePath: string, name: string = "file"): Promise<string> {
    const fullURL = `${this.baseURL}/upload`;

    try {
      const response = await Taro.uploadFile({
        url: fullURL,
        filePath,
        name,
        header: this.token ? { Authorization: `Bearer ${this.token}` } : {},
      });

      if (response.statusCode >= 200 && response.statusCode < 300) {
        const data = JSON.parse(response.data);
        return data.url || data.fileUrl;
      } else {
        throw new Error(`Upload failed with status ${response.statusCode}`);
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      Taro.showToast({
        title: "上传失败",
        icon: "none",
      });
      throw error;
    }
  }
}

// 导出单例
export default new Request();
