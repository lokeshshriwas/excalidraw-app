"use client";

import React, { useEffect } from 'react'

const CanvasPage = () => {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (!ctx) {
               return;
            }

            canvas.addEventListener('mousedown', (e) => {
               console.log(e.clientX, e.clientY);
            });
            canvas.addEventListener('mouseup', (e) => {
               console.log("up", e.clientX, e.clientY);
            });
        }
    }, [canvasRef])
  return (
    <div className='w-100vw h-100vh bg-red-500'>
        <canvas ref={canvasRef} width={"100%"} height={"100%"}></canvas>
    </div>
  )
}

export default CanvasPage