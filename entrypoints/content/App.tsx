import { useEffect } from "react";
import { onMessage } from "@/messaging";
import ScreenShot from "js-web-screen-shot";

// 添加调试日志
console.log("Content script component initialized");

export default () => {

  useEffect(() => {
    onMessage("test-to-content", (message) => {
      console.log(
        "Content component received message via custom event:",
        message
      );
      new ScreenShot({
        enableWebRtc: false,
        level: 99999,
        completeCallback: ({ base64, cutInfo }) => {
          console.log(base64, cutInfo);
        },
        closeCallback: () => {
          console.log('截图结束')
        }
      });
    });

    return () => {};
  }, []);

  return null;
};
