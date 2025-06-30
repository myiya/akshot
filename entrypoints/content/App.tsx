import { useState, useEffect, useRef } from "react";
import { onMessage } from "@/messaging";
import Screenshots, { Bounds } from "react-screenshots";

// 添加调试日志
console.log("Content script component initialized");

export default () => {
  const [count, setCount] = useState(1);
  // 使用ref跟踪最新的count值
  const countRef = useRef(count);

  const [wrapImgUrl, setWrapImgUrl] = useState("");

  // 更新ref值
  useEffect(() => {
    countRef.current = count;
  }, [count]);

  const increment = () => setCount((count) => count + 1);

  const ge = async () => {
    increment();
    return countRef.current;
  };

  useEffect(() => {
    onMessage("test-to-content", (message) => {
      console.log(
        "Content component received message via custom event:",
        message
      );
      // return message;
      // return 11;
    });
    onMessage("send-screenshot-to-content", async (message) => {
      console.log(
        "Content component received message via custom event:",
        message
      );
      // let res = await ge();
      // return res;
      setWrapImgUrl(message.data.payload);
    });

    return () => {};
  }, []);

  const onSave = useCallback((blob: Blob, bounds: Bounds) => {
    console.log("save", blob, bounds);
    console.log(URL.createObjectURL(blob));
  }, []);
  const onCancel = useCallback(() => {
    console.log("cancel");
  }, []);
  const onOk = useCallback((blob: Blob, bounds: Bounds) => {
    console.log("ok", blob, bounds);
    console.log(URL.createObjectURL(blob));
  }, []);

  if (wrapImgUrl) {
    return (
      <div className="wrap">
        <Screenshots
          url={''}
          width={window.innerWidth}
          height={window.innerHeight}
          lang={{
            operation_undo_title: "Undo",
            operation_mosaic_title: "Mosaic",
            operation_text_title: "Text",
            operation_brush_title: "Brush",
            operation_arrow_title: "Arrow",
            operation_ellipse_title: "Ellipse",
            operation_rectangle_title: "Rectangle",
          }}
          onSave={onSave}
          onCancel={onCancel}
          onOk={onOk}
        />
      </div>
    );
  } else {
    return null;
  }
};
