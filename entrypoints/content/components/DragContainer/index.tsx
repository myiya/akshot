import React, { useState, useEffect, useCallback, useRef } from "react";
import { CollectedRectType, DragResizableBox } from "../DragResize";
import "./index.css";

const DragContainer = React.memo(() => {
  // 窗口大小状态
  const [documentSize, setDocumentSize] = useState(() => ({
    width: window.innerWidth,
    height: window.innerHeight,
  }));

  // 拖拽框的位置和大小
  const [rect, setRect] = useState<CollectedRectType>({
    width: 0,
    height: 0,
    left: 0,
    top: 0,
  });

  // 拖拽状态
  const [isDragging, setIsDragging] = useState(false);
  const [isBoxVisible, setIsBoxVisible] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 获取当前窗口大小的函数
  const getCurrentSize = useCallback(() => ({
    width: window.innerWidth,
    height: window.innerHeight,
  }), []);

  // 调整拖拽框位置以确保不超出边界
  const adjustRectPosition = useCallback((newSize: { width: number; height: number }) => {
    setRect(prevRect => {
      const { width: rectWidth, height: rectHeight } = prevRect;
      let { left, top } = prevRect;
      
      // 确保拖拽框不超出右边界
      if (left + rectWidth > newSize.width) {
        left = Math.max(0, newSize.width - rectWidth);
      }
      
      // 确保拖拽框不超出下边界
      if (top + rectHeight > newSize.height) {
        top = Math.max(0, newSize.height - rectHeight);
      }
      
      // 确保拖拽框不超出左边界和上边界
      left = Math.max(0, left);
      top = Math.max(0, top);
      
      return {
        ...prevRect,
        left,
        top,
      };
    });
  }, []);

  // 处理鼠标按下事件 - 开始拖拽
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // 只处理左键点击
    if (e.button !== 0) return;
    
    // 如果点击的是 DragResizableBox 内部，不处理
    if ((e.target as HTMLElement).closest('.resizable_box')) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return;
    
    const startX = e.clientX - containerRect.left;
    const startY = e.clientY - containerRect.top;
    
    dragStartRef.current = { x: startX, y: startY };
    setIsDragging(true);
    setIsBoxVisible(false);
    
    // 初始化拖拽框
    setRect({
      left: startX,
      top: startY,
      width: 0,
      height: 0,
    });
  }, []);

  // 处理鼠标移动事件 - 拖拽中
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !dragStartRef.current) return;
    
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return;
    
    const currentX = e.clientX - containerRect.left;
    const currentY = e.clientY - containerRect.top;
    const startX = dragStartRef.current.x;
    const startY = dragStartRef.current.y;
    
    // 计算拖拽框的位置和大小
    const left = Math.min(startX, currentX);
    const top = Math.min(startY, currentY);
    const width = Math.abs(currentX - startX);
    const height = Math.abs(currentY - startY);
    
    // 确保拖拽框在容器范围内
    const boundedLeft = Math.max(0, Math.min(left, documentSize.width - width));
    const boundedTop = Math.max(0, Math.min(top, documentSize.height - height));
    const boundedWidth = Math.min(width, documentSize.width - boundedLeft);
    const boundedHeight = Math.min(height, documentSize.height - boundedTop);
    
    setRect({
      left: boundedLeft,
      top: boundedTop,
      width: boundedWidth,
      height: boundedHeight,
    });
    
    // 如果拖拽距离足够大，显示拖拽框
    if (width > 10 || height > 10) {
      setIsBoxVisible(true);
    }
  }, [isDragging, documentSize]);

  // 处理鼠标释放事件 - 结束拖拽
  const handleMouseUp = useCallback(() => {
    if (!isDragging) return;
    
    setIsDragging(false);
    dragStartRef.current = null;
    
    // 如果拖拽框太小，隐藏它
    if (rect.width < 10 || rect.height < 10) {
      setIsBoxVisible(false);
      setRect({ left: 0, top: 0, width: 0, height: 0 });
    } else {
      setIsBoxVisible(true);
    }
  }, [isDragging, rect.width, rect.height]);

  // 监听窗口大小变化
  useEffect(() => {
    let resizeTimer: NodeJS.Timeout;
    
    const handleResize = () => {
      // 防抖处理，避免频繁触发
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const newSize = getCurrentSize();
        setDocumentSize(newSize);
        if (isBoxVisible) {
          adjustRectPosition(newSize);
        }
      }, 100);
    };

    // 初始化时检查窗口大小
    const initialSize = getCurrentSize();
    setDocumentSize(initialSize);

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimer);
    };
  }, [getCurrentSize, adjustRectPosition, isBoxVisible]);

  // 监听全局鼠标事件
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div 
      className="drag-container"
      ref={containerRef}
      onMouseDown={handleMouseDown}
      style={{ 
        cursor: isDragging ? 'crosshair' : 'crosshair',
        backgroundColor: isBoxVisible ? 'transparent' : 'rgba(0, 0, 0, 0.3)'
      }}
    >
      {isBoxVisible && (
        <DragResizableBox
          onChange={(newRect) => setRect(newRect)}
          rect={rect}
          relative
        ></DragResizableBox>
      )}
    </div>
  );
});

export default DragContainer;
