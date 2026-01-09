import axios from "axios";
import { WECHAT_APPID, WECHAT_APP_SECRET } from "../config/env";
import { WeChatCode2SessionResponse } from "../types/auth";

/**
 * 调用微信 code2Session 接口获取 openid 和 session_key
 * @param code 小程序登录凭证
 * @returns openid 和 session_key
 */
export async function code2Session(
  code: string
): Promise<WeChatCode2SessionResponse> {
  const url = "https://api.weixin.qq.com/sns/jscode2session";

  const response = await axios.get<WeChatCode2SessionResponse>(url, {
    params: {
      appid: WECHAT_APPID,
      secret: WECHAT_APP_SECRET,
      js_code: code,
      grant_type: "authorization_code",
    },
  });

  const data = response.data;

  // 检查是否有错误
  if (data.errcode) {
    throw new Error(`WeChat API Error: ${data.errmsg} (code: ${data.errcode})`);
  }

  return data;
}
