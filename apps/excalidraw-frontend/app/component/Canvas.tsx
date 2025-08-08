import React, { useEffect } from "react";
import { LuMinus } from "react-icons/lu";
import { Game, Tool } from "../draw/game";
import { IconButton } from "./IconButton";
import { LuRectangleHorizontal } from "react-icons/lu";
import { LuCircle } from "react-icons/lu";
import { IoText } from "react-icons/io5";
import { LuPencil } from "react-icons/lu";
import { TfiHandDrag } from "react-icons/tfi";

const Canvas = ({
  roomId,
  socket,
}: {
  roomId: number | null;
  socket: WebSocket;
}) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [game, setGame] = React.useState<Game | null>(null);
  const [selectedTool, setSelectedTool] = React.useState<Tool>("pan");

  useEffect(() => {
    game?.setTool(selectedTool);
  }, [selectedTool, game]);

  useEffect(() => {
    if (!canvasRef.current || roomId === null) return;

    const g = new Game(canvasRef.current, roomId, socket);
    setGame(g);

    return () => {
      g.destroy();
    };
  }, [canvasRef]);

  return (
    <div>
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          background: "black",
          cursor: selectedTool === "pan" ? "grab" : "default",
        }}
      />
      <Topbar setSelectedTool={setSelectedTool} selectedTool={selectedTool} />
    </div> 
  );
};

export default Canvas;

function Topbar({selectedTool, setSelectedTool}: {
    selectedTool: Tool,
    setSelectedTool: (s: Tool) => void
}) {
    return <div style={{
            position: "fixed",
            top: 10,
            left: 10,
        }}>
            <div  style={{display: "flex", gap: "10px"}}>
                <IconButton 
                    onClick={() => {
                        setSelectedTool("line")
                    }}
                    activated={selectedTool === "line"}
                    icon={<LuMinus />}
                />
                <IconButton onClick={() => {
                    setSelectedTool("rect")
                }} activated={selectedTool === "rect"} icon={<LuRectangleHorizontal />} ></IconButton>
                <IconButton onClick={() => {
                    setSelectedTool("circle")
                }} activated={selectedTool === "circle"} icon={<LuCircle />}></IconButton>
                <IconButton onClick={() => {
                    setSelectedTool("text")
                }} activated={selectedTool === "text"} icon={<IoText />}></IconButton>
                <IconButton onClick={() => {
                    setSelectedTool("pencil")
                }} activated={selectedTool === "pencil"} icon={<LuPencil />}></IconButton>
                <IconButton onClick={() => {
                    setSelectedTool("pan")
                }} activated={selectedTool === "pan"} icon={<TfiHandDrag />}></IconButton>
            </div>
        </div>
}
