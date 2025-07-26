"use client"
import React from 'react'
import RoomCanvas from './RoomCanvas'

const CanvasClient = ({roomId} : {roomId : number | null})  => {
  return (
    <div>
        <RoomCanvas roomId={roomId}/>
    </div>
  )
}

export default CanvasClient