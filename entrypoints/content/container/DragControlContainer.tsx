import React, { useState, useEffect, useMemo, useContext, useCallback } from "react";
import { onMessage, sendActMessage, sendMessage } from "@/messaging";
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
    let dataUrl = await sendMessage('download-screenshot', {
      type: 'DOWNLOAD_SCREENSHOT',
    });
    console.log('dataUrl', dataUrl);
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = 'screenshot.png';
    a.click();
    // canvas 截取图片位置大小
    // if (rect) {
    //   const canvas = document.createElement('canvas');
    //   const ctx = canvas.getContext('2d');
    //   const img = new Image();
    //   img.src = dataUrl;
    //   img.onload = () => {
    //     canvas.width = rect.width;
    //     canvas.height = rect.height;
    //     ctx?.drawImage(img, rect.left, rect.top, rect.width, rect.height, 0, 0, rect.width, rect.height);
    //     const newDataUrl = canvas.toDataURL('image/png');
    //     console.log('newDataUrl', newDataUrl);
    //     // 下载图片
    //     const a = document.createElement('a');
    //     a.href = newDataUrl;
    //     a.download = 'screenshot.png';
    //     a.click();
    //   }
    // }
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