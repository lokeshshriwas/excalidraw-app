import { getExistingShapes } from "./http";

export type Shapes =
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

export type Tool = "rect" | "line" | "circle";

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private roomId: number | null;
  private socket: WebSocket;
  private existingShapes: Shapes[];
  private clicked: boolean;
  private startX = 0;
  private startY = 0;
  private selectedTool: Tool = "rect";

  constructor(
    canvas: HTMLCanvasElement,
    roomId: number | null,
    socket: WebSocket
  ) {
    ((this.canvas = canvas),
    this.ctx = canvas.getContext("2d")!,
      (this.roomId = roomId),
      (this.socket = socket));
    this.existingShapes = [];
    this.clicked = false;
    this.init();
    this.initHandlers();
    this.initMouseHandlers();
  }

  destroy() {
    this.canvas.removeEventListener("mousedown", this.mouseDownHandler);
    this.canvas.removeEventListener("mouseup", this.mouseUpHandler);
    this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
  }

  setTool(tool: Tool) {
    this.selectedTool = tool;
  }

  initHandlers() {
    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "chat") {
        const parsedMessage = JSON.parse(message.message);
        this.existingShapes.push(parsedMessage);
        this.clearCanvas();
      }
    };
  }

  async init() {
    try {
        const response = await getExistingShapes(this.roomId);
        if(response) {
            this.existingShapes = response
            console.log(this.existingShapes)
        }
        this.clearCanvas();
        
    } catch (error) {
        
    }
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = "rgba(0,0,0)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.existingShapes.forEach((shape) => {
      if (shape.type === "rect") {
        this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
      } else if (shape.type === "line") {
        this.ctx.beginPath();
        this.ctx.moveTo(shape.x1, shape.y1);
        this.ctx.lineTo(shape.x2, shape.y2);
        this.ctx.stroke();
      } else if (shape.type === "circle") {
        this.ctx.beginPath();
        this.ctx.arc(shape.x, shape.y, shape.radius, 0, 2 * Math.PI);
        this.ctx.stroke();
      }
    });
  }

  mouseDownHandler = (e: MouseEvent) => {
    this.clicked = true;
    this.startX = e.clientX;
    this.startY = e.clientY;
  };

  mouseUpHandler = (e: MouseEvent) => {
    this.clicked = false;
    const width = e.clientX - this.startX;
    const height = e.clientY - this.startY;

    const shape: Shapes = {
      type: "rect",
      x: this.startX,
      y: this.startY,
      width: width,
      height: height,
    };
    this.existingShapes.push(shape);

    this.socket.send(
      JSON.stringify({
        roomId: this.roomId,
        type: "chat",
        message: JSON.stringify(shape),
      })
    );

    this.clearCanvas();
  };

  mouseMoveHandler = (e: MouseEvent) => {
    if (this.clicked) {
      const width = e.clientX - this.startX;
      const height = e.clientY - this.startY;
      this.clearCanvas();
      this.ctx.strokeStyle = "white";
      this.ctx.strokeRect(this.startX, this.startY, width, height);
    }
  };

  initMouseHandlers() {
    this.canvas.addEventListener("mousedown", this.mouseDownHandler);

    this.canvas.addEventListener("mouseup", this.mouseUpHandler);

    this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
  }
}
