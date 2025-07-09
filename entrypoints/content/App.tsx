import { onMessage } from "@/messaging";
import DragContainer from "./components/DragContainer";
import Sidebar from "./components/Sidebar";
import "./style.css";

// 添加调试日志
console.log("Content script component initialized");

export default () => {
  const [isTakeScreenshot, setIsTakeScreenshot] = useState(false);

  useEffect(() => {
    // 截图
    onMessage("take-to-content", (message: any) => {
      setIsTakeScreenshot(true);
    });
  }, []);

  return (
    <>
      {/* drag Container */}
      {isTakeScreenshot && <DragContainer />}
      {/* Sidebar */}
      {/* <Sidebar /> */}
    </>
  );
};
