import React, { useEffect } from "react";
import { initDraw } from "../draw";
import { Game, Tool } from "../draw/game";

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
};

export default Canvas;
