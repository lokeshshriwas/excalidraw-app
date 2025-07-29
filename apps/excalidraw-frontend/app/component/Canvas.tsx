import React, { useEffect } from "react";
import { GoPencil } from "react-icons/go";
import { Game, Tool } from "../draw/game";
import { IconButton } from "./IconButton";
import { LuRectangleHorizontal } from "react-icons/lu";
import { LuCircle } from "react-icons/lu";

const Canvas = ({
  roomId,
  socket,
}: {
  roomId: number | null;
  socket: WebSocket;
}) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [game, setGame] = React.useState<Game | null>(null);
  const [selectedTool, setSelectedTool] = React.useState<Tool>("circle");

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
    <div style={{
        height: "100vh",
        overflow: "hidden"
    }}>
      <canvas
        width={window.innerWidth} height={window.innerHeight}
        ref={canvasRef}
        style={{
          width: "100vw",
          height: "100vh",
          display: "block",
          background: "black",
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
            left: 10
        }}>
            <div  style={{display: "flex", gap: "10px"}}>
                <IconButton 
                    onClick={() => {
                        setSelectedTool("line")
                    }}
                    activated={selectedTool === "line"}
                    icon={<GoPencil />}
                />
                <IconButton onClick={() => {
                    setSelectedTool("rect")
                }} activated={selectedTool === "rect"} icon={<LuRectangleHorizontal />} ></IconButton>
                <IconButton onClick={() => {
                    setSelectedTool("circle")
                }} activated={selectedTool === "circle"} icon={<LuCircle />}></IconButton>
            </div>
        </div>
}