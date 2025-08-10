import { getExistingShapes } from "./http";
import { v4 as uuidv4 } from 'uuid';

export type Shapes =
  | {
      id : string,
      type: "rect";
      x: number;
      y: number;
      width: number;
      height: number;
    }
  | {
      id : string,
      type: "line";
      x1: number;
      y1: number;
      x2: number;
      y2: number;
    }
  | {
      id : string,
      type: "circle";
      x: number;
      y: number;
      radius: number;
    }
  | {
      id : string,
      type: "text";
      x: number;
      y: number;
      text: string;
    }
  | { id : string, type: "pencil"; x1: number; y1: number; x2: number; y2: number };

export type Tool = "rect" | "line" | "circle" | "text" | "pencil" | "pan";

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
  private previewShape: Shapes | null = null;
  private text = "";
  private newSegment: Shapes[] = [];
  private MAX_ZOOM = 5;
  private MIN_ZOOM = 0.1;
  private cameraZoom = 1;
  private SCROLL_SENSITIVITY = 0.0005;
  private isDragging = false;
  private dragStart = { x: 0, y: 0 };
  private cameraOffset = {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  };
  private pressedKey = new Set();
  private currentPencilStrokeId: string | null = null;
  private undoStack: Shapes[][] = [];
  private redoStack: Shapes[][] = [];

  constructor(
    canvas: HTMLCanvasElement,
    roomId: number | null,
    socket: WebSocket
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.roomId = roomId;
    this.socket = socket;
    this.existingShapes = [];
    this.clicked = false;

    this.canvas.tabIndex = 0; // Make canvas focusable for keyboard input

    this.init();
    this.initHandlers();
    this.initMouseHandlers();
    this.resizeHandler();
  }

  async init() {
    try {
      this.existingShapes = await getExistingShapes(this.roomId);
      this.draw();
    } catch (error) {
      console.log(error);
    }
  }

  destroy() {
    this.canvas.removeEventListener("mousedown", this.mouseDownHandler);
    this.canvas.removeEventListener("mouseup", this.mouseUpHandler);
    this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
    this.canvas.removeEventListener("keydown", this.onKeyDownHandler);
    this.canvas.removeEventListener("wheel", this.onWheelHandler);
    window.removeEventListener("resize", this.resizeHandler);
  }

  setTool(tool: Tool) {
    this.selectedTool = tool;
    this.clicked = false;
  }

  initHandlers() {
    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "chat") {
        const newMessage = JSON.parse(message.message);
        if(Array.isArray(newMessage)) {
          newMessage.map((shape) => {
            this.existingShapes.push(shape);
          })
          this.draw();
        } else {
          const parsedMessage = JSON.parse(message.message);
          this.existingShapes.push(parsedMessage);
          this.draw();
        }

      } else if (message.type === "undo") {
        const shapesToUndo = this.existingShapes.filter(
          (shape) => shape.id === message.id
        );
        this.redoStack.push(shapesToUndo);
        this.existingShapes = this.existingShapes.filter(
          (shape) => shape.id !== message.id
        );
        this.draw();
      } else if (message.type === "redo") {
        const shapesToRedo = this.redoStack.find(
          (shapes) => shapes[0].id === message.id
        );
        if (shapesToRedo) {
          this.existingShapes.push(...shapesToRedo);
          this.redoStack = this.redoStack.filter(
            (shapes) => shapes[0].id !== message.id
          );
          this.draw();
        }
      }
    };
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawShapes() {
    this.ctx.strokeStyle = "white";
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
      } else if (shape.type === "text") {
        this.ctx.font = "20px Arial";
        this.ctx.fillStyle = "white";
        this.ctx.fillText(shape.text, shape.x, shape.y);
      } else if (shape.type === "pencil") {
        this.ctx.beginPath();
        this.ctx.moveTo(shape.x1, shape.y1);
        this.ctx.lineTo(shape.x2, shape.y2);
        this.ctx.stroke();
      }
    });

    if (this.previewShape) {
      this.ctx.strokeStyle = "red";
      if (this.previewShape.type === "rect") {
        this.ctx.strokeRect(this.previewShape.x, this.previewShape.y, this.previewShape.width, this.previewShape.height);
      } else if (this.previewShape.type === "line") {
        this.ctx.beginPath();
        this.ctx.moveTo(this.previewShape.x1, this.previewShape.y1);
        this.ctx.lineTo(this.previewShape.x2, this.previewShape.y2);
        this.ctx.stroke();
      } else if (this.previewShape.type === "circle") {
        this.ctx.beginPath();
        this.ctx.arc(this.previewShape.x, this.previewShape.y, this.previewShape.radius, 0, 2 * Math.PI);
        this.ctx.stroke();
      } else if (this.previewShape.type === "text") {
        this.ctx.font = "20px Arial";
        this.ctx.fillStyle = "red";
        this.ctx.fillText(this.previewShape.text, this.previewShape.x, this.previewShape.y);
      }
    }
  }

  onPointerDown = (e : MouseEvent) => {
    if (this.selectedTool === "pan") {
      this.isDragging = true;
      this.dragStart.x = e.clientX / this.cameraZoom - this.cameraOffset.x;
      this.dragStart.y = e.clientY / this.cameraZoom - this.cameraOffset.y;
    }
  }

  onPointerUp = (e : MouseEvent)=> {
    this.isDragging = false;
  }

  mouseDownHandler = (e: MouseEvent) => {
    this.clicked = true;
    const worldCoords = this.getWorldCoordinates(e.clientX, e.clientY);
    this.startX = worldCoords.x;
    this.startY = worldCoords.y;

    if (this.selectedTool === "text") {
      this.text = "";
      this.canvas.focus(); // So we can capture keyboard input
    } else if (this.selectedTool === "pencil") {
      this.currentPencilStrokeId = uuidv4();
      const worldCoords = this.getWorldCoordinates(e.clientX, e.clientY);
      this.startX = worldCoords.x;
      this.startY = worldCoords.y;
    }
  };

  mouseUpHandler = (e: MouseEvent) => {
    if (this.selectedTool === "text") return;

    this.clicked = false;
    if (this.previewShape && this.selectedTool !== "pencil") {
      const milliSecondDate = Date.now();
      this.existingShapes.push(this.previewShape);
      this.socket.send(
        JSON.stringify({
          id : this.previewShape.id,
          roomId: this.roomId,
          type: "chat",
          message: JSON.stringify(this.previewShape),
          timeStamp: new Date(milliSecondDate),
        })
      );
      this.previewShape = null;
    } else if (this.selectedTool === "pencil") {
      const milliSecondDate = Date.now();
      this.socket.send(
        JSON.stringify({
          id : this.currentPencilStrokeId,
          roomId: this.roomId,
          type: "chat",
          message: JSON.stringify(this.newSegment),
          timeStamp: new Date(milliSecondDate),
        })
      );
      this.newSegment = [];
      this.currentPencilStrokeId = null;
      this.draw();
    }
  };

  mouseMoveHandler = (e: MouseEvent) => {
    if (this.isDragging && this.selectedTool === "pan") {
      this.cameraOffset.x = e.clientX / this.cameraZoom - this.dragStart.x;
      this.cameraOffset.y = e.clientY / this.cameraZoom - this.dragStart.y;
      this.draw();
    } else if (this.clicked && this.selectedTool !== "text") {
      const worldCoords = this.getWorldCoordinates(e.clientX, e.clientY);
      const width = worldCoords.x - this.startX;
      const height = worldCoords.y - this.startY;
      const id = uuidv4();
      if (this.selectedTool === "rect") {
        this.previewShape = {
          id,
          type: "rect",
          x: this.startX,
          y: this.startY,
          width: width,
          height: height,
        };
      } else if (this.selectedTool === "line") {
        this.previewShape = {
          id,
          type: "line",
          x1: this.startX,
          y1: this.startY,
          x2: worldCoords.x,
          y2: worldCoords.y,
        };
      } else if (this.selectedTool === "circle") {
        this.previewShape = {
          id,
          type: "circle",
          x: this.startX,
          y: this.startY,
          radius: Math.sqrt(width * width + height * height),
        };
      } else if (this.selectedTool === "pencil") {
        const newSegment: Shapes = {
          id : this.currentPencilStrokeId!,
          type: "pencil",
          x1: this.startX,
          y1: this.startY,
          x2: worldCoords.x,
          y2: worldCoords.y,
        };

        this.existingShapes.push(newSegment);
        this.newSegment.push(newSegment);

        // Update for next segment
        this.startX = worldCoords.x;
        this.startY = worldCoords.y;
      }
      this.draw();
    }
  };

  onKeyDownHandler = (e: KeyboardEvent) => {
    if (this.selectedTool !== "text") {
      this.pressedKey.add(e.key);
      if (
        e.ctrlKey &&
        this.pressedKey.has("z") &&
        this.existingShapes.length > 0
      ) {
        const lastShape = this.existingShapes[this.existingShapes.length - 1];
        const lastShapeId = lastShape.id;
        const shapesToUndo = this.existingShapes.filter(
          (shape) => shape.id === lastShapeId
        );
        this.undoStack.push(shapesToUndo);
        this.existingShapes = this.existingShapes.filter(
          (shape) => shape.id !== lastShapeId
        );
        this.socket.send(
          JSON.stringify({
            id: lastShapeId,
            roomId: this.roomId,
            type: "undo",
          })
        );
        this.pressedKey.clear();
        this.draw();
      } else if (
        e.ctrlKey &&
        this.pressedKey.has("y") &&
        this.undoStack.length > 0
      ) {
        const shapesToRedo = this.undoStack.pop();
        if (shapesToRedo) {
          this.redoStack.push(shapesToRedo);
          this.existingShapes.push(...shapesToRedo);
          this.socket.send(
            JSON.stringify({
              id: shapesToRedo[0].id,
              roomId: this.roomId,
              type: "redo",
            })
          );
        }
        this.pressedKey.clear();
        this.draw();
      }
    }

  
    if (this.selectedTool === "text" && this.clicked) {
      const id = uuidv4();
      if (e.key === "Enter") {
        const milliSecondDate = Date.now();
        const shape: Shapes = {
          id,
          type: "text",
          x: this.startX,
          y: this.startY,
          text: this.text,
        };
        this.existingShapes.push(shape);
        this.previewShape = null;
        this.socket.send(
          JSON.stringify({
            id : shape.id,
            roomId: this.roomId,
            type: "chat",
            message: JSON.stringify(shape),
            timeStamp: new Date(milliSecondDate)
          })
        );

        this.text = "";
        this.clicked = false;
        this.draw();
      } else if (e.key === "Backspace") {
        this.text = this.text.slice(0, -1);
      } else if (e.key.length === 1) {
        this.text += e.key;
      }
      this.previewShape= {
        id,
        type: "text",
        x: this.startX,
        y: this.startY,
        text: this.text
      }
      this.draw();
    }
  };

  onWheelHandler = (e: WheelEvent) => {
    e.preventDefault(); // Prevent page scrolling

    const zoomAmount = -e.deltaY * this.SCROLL_SENSITIVITY;

    // Apply zoom smoothly
    this.cameraZoom += zoomAmount;

    // Clamp zoom between MIN and MAX
    this.cameraZoom = Math.min(this.cameraZoom, this.MAX_ZOOM);
    this.cameraZoom = Math.max(this.cameraZoom, this.MIN_ZOOM);
    this.clearCanvas()
    this.draw(); // Re-render immediately
  };

  draw = () => {
    this.clearCanvas();

    // Translate to the canvas centre before zooming - so you'll always zoom on what you're looking directly at
    this.ctx.save();
    this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
    this.ctx.scale(this.cameraZoom, this.cameraZoom);
    this.ctx.translate(
      -this.canvas.width / 2 + this.cameraOffset.x,
      -this.canvas.height / 2 + this.cameraOffset.y
    );

    this.drawShapes();
    this.ctx.restore();
  };

  getWorldCoordinates(x: number, y: number) {
    const worldX = (x - this.canvas.width / 2) / this.cameraZoom - this.cameraOffset.x + this.canvas.width / 2;
    const worldY = (y - this.canvas.height / 2) / this.cameraZoom - this.cameraOffset.y + this.canvas.height / 2;
    return { x: worldX, y: worldY };
  }

  resizeHandler = () => {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.draw();
  };

  initMouseHandlers() {
    this.canvas.addEventListener("mousedown", (e) => {
      if (this.selectedTool === "pan") {
        this.onPointerDown(e);
      } else {
        this.mouseDownHandler(e);
      }
    });
    this.canvas.addEventListener("mouseup", (e) => {
      if (this.selectedTool === "pan") {
        this.onPointerUp(e);
      } else {
        this.mouseUpHandler(e);
      }
    });
    this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
    this.canvas.addEventListener("keydown", this.onKeyDownHandler);
    this.canvas.addEventListener("wheel", this.onWheelHandler, {
      passive: false,
    });
    window.addEventListener("resize", this.resizeHandler);
  }
}
