import DragContainer from './components/DragContainer';
import Sidebar from './components/Sidebar';
import './style.css';

// 添加调试日志
console.log("Content script component initialized");

export default () => {

  return (
    <>
      {/* drag Container */}
      <DragContainer />
      {/* Sidebar */}
      {/* <Sidebar /> */}
    </>
  );
};
