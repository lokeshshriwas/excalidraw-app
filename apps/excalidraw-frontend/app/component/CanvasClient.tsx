"use client"
import React from 'react'
import RoomCanvas from './RoomCanvas'

const CanvasClient = ({ roomId }: { roomId: number | null }) => {
  if (!roomId) {
    return <div>Room not found</div>;
  }

  return (
    <div>
      <RoomCanvas roomId={roomId} />
    </div>
  );
};

export default CanvasClient
