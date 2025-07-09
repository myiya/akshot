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
    <div style={{ height: '400px', width: '400px', border: '1px solid red', position: 'relative', margin: '20px' }}>
      <DragResizableBox
        onChange={(newRect) => setRect(newRect)}
        rect={rect}
        relative
        limit={{
          left: 0,
          top: 0,
          right: 400,
          bottom: 400,
        }}
        style={{ backgroundColor: "#F00" }}
      >
        <div
          style={{
            padding: "10px",
            width: "100%",
          }}
        >
          move me!
        </div>
      </DragResizableBox>
    </div>
  );
});

export default DragContainer;
