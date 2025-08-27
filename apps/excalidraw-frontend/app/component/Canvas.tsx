import React, { useEffect } from "react";
import { LuMinus, LuRectangleHorizontal, LuCircle, LuPencil, LuEraser } from "react-icons/lu";
import { IoText } from "react-icons/io5";
import { TfiHandDrag } from "react-icons/tfi";
import { Game } from "../draw/game";
import { IconButton } from "./IconButton";
import { useRouter } from "next/navigation";
import { Tool } from "../utility/gameTypes";

const Canvas = ({
  roomId,
  socket,
  legitUser,
}: {
  roomId: number | null;
  socket: WebSocket;
  legitUser: boolean;
}) => {
  const router = useRouter();
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [game, setGame] = React.useState<Game | null>(null);
  const [selectedTool, setSelectedTool] = React.useState<Tool>("pan");

  // Handle navigation based on legitUser status
  useEffect(() => {
    if (!legitUser) {
      router.push("/login");
    }
  }, [legitUser, router]);

  useEffect(() => {
    game?.setTool(selectedTool);
  }, [selectedTool, game]);

  useEffect(() => {
    if (!canvasRef.current || roomId === null || !legitUser) return;

    const g = new Game(canvasRef.current, roomId, socket);
    setGame(g);

    return () => {
      g.destroy();
    };
  }, [canvasRef, roomId, socket, legitUser]);

  // Show loading while navigation is happening
  if (!legitUser) {
    return <div className="text-center p-4">Redirecting...</div>;
  }

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

function Topbar({
  selectedTool,
  setSelectedTool,
}: {
  selectedTool: Tool;
  setSelectedTool: (s: Tool) => void;
}) {
  return (
    <div
      style={{
        position: "fixed",
        top: 10,
        right: 10
      }}
    >
      <div style={{ display: "flex", gap: "10px" }}>
        <IconButton
          onClick={() => setSelectedTool("line")}
          activated={selectedTool === "line"}
          icon={<LuMinus />}
        />
        <IconButton
          onClick={() => setSelectedTool("rect")}
          activated={selectedTool === "rect"}
          icon={<LuRectangleHorizontal />}
        />
        <IconButton
          onClick={() => setSelectedTool("circle")}
          activated={selectedTool === "circle"}
          icon={<LuCircle />}
        />
        <IconButton
          onClick={() => setSelectedTool("text")}
          activated={selectedTool === "text"}
          icon={<IoText />}
        />
        <IconButton
          onClick={() => setSelectedTool("pencil")}
          activated={selectedTool === "pencil"}
          icon={<LuPencil />}
        />
        <IconButton
          onClick={() => setSelectedTool("pan")}
          activated={selectedTool === "pan"}
          icon={<TfiHandDrag />}
        />
        <IconButton
          onClick={() => setSelectedTool("erase")}
          activated={selectedTool === "erase"}
          icon={<LuEraser />}
        />
      </div>
    </div>
  );
}