import { PropsWithChildren } from "react";
import { useLaunch } from "@tarojs/taro";
import { wechatLogin, saveToken, isLoggedIn } from "./services/authService";
import "./app.scss";

function App({ children }: PropsWithChildren<any>) {
  useLaunch(async () => {
    console.log("App launched.");

    // 检查是否已登录
    if (!isLoggedIn()) {
      try {
        console.log("User not logged in, attempting WeChat login...");
        const loginResult = await wechatLogin();
        saveToken(loginResult.token);
        console.log("Login successful:", loginResult.user);
      } catch (error) {
        console.error("Auto-login failed:", error);
        // 可以在这里显示错误提示或跳转到登录页面
      }
    } else {
      console.log("User already logged in");
    }
  });

  // children 是将要会渲染的页面
  return children;
}

export default App;
