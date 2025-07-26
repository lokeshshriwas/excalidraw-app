import React, { useEffect } from 'react'
import { initDraw } from '../draw';

const Canvas = ({roomId, socket} : {roomId : number | null, socket : WebSocket}) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  
    useEffect(() => {
      if(canvasRef.current === null && roomId === null) return
      
      initDraw(canvasRef, roomId, socket);
    }, []);
  
    return (
      <canvas
        ref={canvasRef}
        style={{
          width: "100vw",
          height: "100vh",
          display: "block",
          background: "black",
        }}
      />
    );
}

export default Canvas