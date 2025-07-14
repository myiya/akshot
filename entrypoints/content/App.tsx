import React, { useContext } from "react";
import { onMessage } from "@/messaging";
import DragContainer from "./components/DragContainer";
import Sidebar from "./components/Sidebar";
import "./style.css";

import CatContainer, { CatContext } from "./container/CatContainer";

// 添加调试日志
console.log("Content script component initialized");

// 内部组件，用于访问Context
const AppContent = () => {
  const { isTakeScreenshot } = useContext(CatContext);

  console.log('isTakeScreenshot:', isTakeScreenshot);

  return (
    <>
      {/* drag Container */}
      {isTakeScreenshot && <DragContainer />}
      {/* Sidebar */}
      {/* <Sidebar /> */}
    </>
  );
};

export default () => {
  return (
    <CatContainer>
      <AppContent />
    </CatContainer>
  );
};
