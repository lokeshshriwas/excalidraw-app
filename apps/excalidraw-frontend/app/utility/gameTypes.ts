export type Shapes =
  | {
      id: string;
      type: "rect";
      x: number;
      y: number;
      width: number;
      height: number;
    }
  | {
      id: string;
      type: "line";
      x1: number;
      y1: number;
      x2: number;
      y2: number;
    }
  | {
      id: string;
      type: "circle";
      x: number;
      y: number;
      radius: number;
    }
  | {
      id: string;
      type: "text";
      x: number;
      y: number;
      text: string;
    }
  | {
      id: string;
      type: "pencil";
      x1: number;
      y1: number;
      x2: number;
      y2: number;
    };


export type Tool =
  | "rect"
  | "line"
  | "circle"
  | "text"
  | "pencil"
  | "pan"
  | "erase";