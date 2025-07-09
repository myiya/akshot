import React, { useState } from "react";
import { CollectedRectType, DragResizableBox } from "../DragResize";
import "./index.css";

const DragContainer = React.memo(() => {
  const [rect, setRect] = useState<CollectedRectType>({
    width: 100,
    height: 150,
    left: 50,
    top: 50,
  });

  return (
    <div className="drag-container">
      <DragResizableBox
        onChange={(newRect) => setRect(newRect)}
        rect={rect}
        relative
        limit={{
          left: 0,
          top: 0,
          right: document.body.clientWidth,
          bottom: document.body.clientHeight,
        }}
      >
      </DragResizableBox>
    </div>
  );
});

export default DragContainer;
