import CanvasClient from "@/app/component/CanvasClient";
import { BASE_URL } from "@/app/config";
import axios from "axios";
import React from "react";


const Page = async ({ params }: { params: { slug: string } }) => {
  const slug = (await params).slug;
  return <CanvasClient slug={slug} />;
};

export default Page;
