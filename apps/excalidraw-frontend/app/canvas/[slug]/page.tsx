import CanvasClient from "@/app/component/CanvasClient";
import { BASE_URL } from "@/app/config";
import axios from "axios";
import React from "react";

const getRoomId = async (slug: string) => {
  const response = await axios.get(`${BASE_URL}/room/${slug}`);
  if (response.status == 200) {
    return response?.data?.id
  }
  return <div>No chat found</div>
};

const Page = async ({ params }: { params: { slug: string } }) => {
  const slug = (await params).slug;
  const roomId : number | null = await getRoomId(slug); 

  return (
    <CanvasClient roomId={roomId}/>
  );
};

export default Page;
