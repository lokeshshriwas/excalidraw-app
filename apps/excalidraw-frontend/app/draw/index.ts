type Shapes =
  | {
      type: "rect";
      x: number;
      y: number;
      width: number;
      height: number;
    }
  | {
      type: "line";
      x1: number;
      y1: number;
      x2: number;
      y2: number;
    }
  | {
      type: "circle";
      x: number;
      y: number;
      radius: number;
    };

export function initDraw(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  roomId: number | null,
  socket: WebSocket
) {
  const canvas = canvasRef.current;
  let exisitingShapes: Shapes[] = [];
  if (canvas) {
    // Set canvas size to match viewport
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "chat") {
        const parsedMessage = JSON.parse(message.message);
        exisitingShapes.push(parsedMessage);
        clearCanvas(ctx, canvas, exisitingShapes);
      }
    };

    let clicked = false;
    let startX = 0;
    let startY = 0;

    canvas.addEventListener("mousedown", (e) => {
      clicked = true;
      startX = e.clientX;
      startY = e.clientY;
    });

    canvas.addEventListener("mousemove", (e) => {
      if (clicked) {
        const width = e.clientX - startX;
        const height = e.clientY - startY;
        clearCanvas(ctx, canvas, exisitingShapes);
        ctx.strokeStyle = "white";
        ctx.strokeRect(startX, startY, width, height);
      }
    });

    canvas.addEventListener("mouseup", (e) => {
      clicked = false;
      const width = e.clientX - startX;
      const height = e.clientY - startY;

      const shape: Shapes = {
        type: "rect",
        x: startX,
        y: startY,
        width: width,
        height: height,
      };
      exisitingShapes.push(shape);

      socket.send(
        JSON.stringify({
          roomId,
          type: "chat",
          message: JSON.stringify(shape),
        })
      );

      clearCanvas(ctx, canvas, exisitingShapes);
    });
  }
}

export function clearCanvas(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  exisitingShapes: Shapes[]
) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(0,0,0)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  exisitingShapes.forEach((shape) => {
    if (shape.type === "rect") {
      ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
    } else if (shape.type === "line") {
      ctx.beginPath();
      ctx.moveTo(shape.x1, shape.y1);
      ctx.lineTo(shape.x2, shape.y2);
      ctx.stroke();
    } else if (shape.type === "circle") {
      ctx.beginPath();
      ctx.arc(shape.x, shape.y, shape.radius, 0, 2 * Math.PI);
      ctx.stroke();
    }
  });
}
