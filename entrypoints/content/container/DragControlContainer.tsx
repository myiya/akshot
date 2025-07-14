import React, { useState, useEffect, useMemo, useContext, useCallback } from "react";
import { onMessage } from "@/messaging";
import { CatContext } from "./CatContainer";
import { CollectedRectType } from "../components/DragResize";

export const DragControlContext = React.createContext<{
  activeControl: number | null;
  setActiveControl: (activeControl: number | null) => void;
  step: number;
  setStep: (step: number) => void;
  handleCaptureClose: () => void;
  handleDowloadCapture: () => void;
  rect: CollectedRectType;
  setRect: (rect: CollectedRectType) => void;
}>({
    activeControl: null,
    setActiveControl: (activeControl: number | null) => {},
    step: 0,
    setStep: (step: number) => {},
    handleCaptureClose: () => {},
    handleDowloadCapture: async () => {},
    rect: {
      width: 0,
      height: 0,
      left: 0,
      top: 0,
    },
    setRect: (rect: CollectedRectType) => {},
});

/**
 * @description 拖拽框容器
 */
const DragControlContainer = React.memo<React.PropsWithChildren>((props) => {
  const { children } = props;

  const { setIsTakeScreenshot } = useContext(CatContext);

  // 控制条选中操作
  const [activeControl, setActiveControl] = useState<number | null>(null);

  // canvas 操作步骤
  const [step, setStep] = useState<number>(0);

  // 截图框位置大小
  const [rect, setRect] = useState<CollectedRectType>({
    width: 0,
    height: 0,
    left: 0,
    top: 0,
  });

  console.log('???', rect);

  /**
   * @name 关闭截图
   */
  const handleCaptureClose = useCallback(() => {
    setIsTakeScreenshot(false);
  }, []);

  /**
   * @description 下载截图
   */
  const handleDowloadCapture = useCallback(async () => {

    console.log('rect', rect);

    // await sendActMessage('download-screenshot', {
    //   type: 'DOWNLOAD_SCREENSHOT',
    // });
  }, [rect]);

  const memoCtx = useMemo(() => {
    return {
      activeControl,
      setActiveControl,
      step,
      setStep,
      handleCaptureClose,
      handleDowloadCapture,
      rect,
      setRect,
    };
  }, [activeControl, setActiveControl, step, setStep, handleDowloadCapture, rect, setRect]);

  return (
    <DragControlContext.Provider value={memoCtx}>{children}</DragControlContext.Provider>
  );
});

export default DragControlContainer;