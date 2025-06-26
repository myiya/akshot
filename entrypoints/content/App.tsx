import { useState, useEffect, useRef } from "react";
import type { Message } from "@/messaging/types";
import { onMessage } from "@/messaging";

// 添加调试日志
console.log('Content script component initialized');

export default () => {
  const [count, setCount] = useState(1);
  // 使用ref跟踪最新的count值
  const countRef = useRef(count);
  
  // 更新ref值
  useEffect(() => {
    countRef.current = count;
  }, [count]);
  
  const increment = () => setCount((count) => count + 1);

  const ge = async () => {
    return 'ge'
  };

  useEffect(() =>{

    onMessage('test-to-content', message => {
      console.log('Content component received message via custom event:', message);
      // return message;
      // return 11;
    });
    onMessage('someMessage', async (message): Promise<string> => {
      console.log('Content component received message via custom event:', message);
      let res = await ge();
      return res;
    });

    return () => {
      
    }
  }, []);


  return (
    <div>
      <p style={{ color: '#FFF' }}>This is React. {count}</p>
      <button onClick={increment}>Increment</button>
    </div>
  );
};
