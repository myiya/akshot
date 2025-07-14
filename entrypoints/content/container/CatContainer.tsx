import React, { useState, useEffect, useMemo } from "react";
import { onMessage } from "@/messaging";

export const CatContext = React.createContext<{
  isTakeScreenshot: boolean;
  setIsTakeScreenshot: (isTakeScreenshot: boolean) => void;
}>({
  isTakeScreenshot: false,
  setIsTakeScreenshot: () => {},
});

const CatContainer = React.memo<React.PropsWithChildren>((props) => {
  const { children } = props;

  // 触发截图状态
  const [isTakeScreenshot, setIsTakeScreenshot] = useState(false);

  useEffect(() => {
    // 截图
    onMessage("take-to-content", (message: any) => {
      console.log('take-to-content', message);
      setIsTakeScreenshot(true);
    });
  }, []);

  const memoCtx = useMemo(() => {
    return {
      isTakeScreenshot,
      setIsTakeScreenshot,
    };
  }, [isTakeScreenshot, setIsTakeScreenshot]);

  return (
    <CatContext.Provider value={memoCtx}>{children}</CatContext.Provider>
  );
});

export default CatContainer;