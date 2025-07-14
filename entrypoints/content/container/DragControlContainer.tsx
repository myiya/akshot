import React, { useState, useEffect, useMemo } from "react";
import { onMessage } from "@/messaging";
import { CatContext } from "./CatContainer";

export const DragControlContext = React.createContext<{
  activeControl: number | null;
  setActiveControl: (activeControl: number | null) => void;
  step: number;
  setStep: (step: number) => void;
  handleCaptureClose: () => void;
}>({
    activeControl: null,
    setActiveControl: (activeControl: number | null) => {},
    step: 0,
    setStep: (step: number) => {},
    handleCaptureClose: () => {},
});

/**
 * @description 拖拽框容器
 */
const DragControlContainer = React.memo<React.PropsWithChildren>((props) => {
  const { children } = props;

  const { setIsTakeScreenshot } = useContext(CatContext);

  // 控制条选中操作
  const [activeControl, setActiveControl] = React.useState<number | null>(null);
  const [step, setStep] = React.useState<number>(0);

  /**
   * @name 关闭截图
   */
  const handleCaptureClose = useCallback(() => {
    setIsTakeScreenshot(false);
  }, []);

  const memoCtx = useMemo(() => {
    return {
      activeControl,
      setActiveControl,
      step,
      setStep,
      handleCaptureClose,
    };
  }, [activeControl, setActiveControl, step, setStep]);

  return (
    <DragControlContext.Provider value={memoCtx}>{children}</DragControlContext.Provider>
  );
});

export default DragControlContainer;