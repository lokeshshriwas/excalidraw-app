import CanvasClient from "@/app/component/CanvasClient";
import React from "react";

type PageProps = {
  params: Promise<{ slug: string }>;
};

const Page = async ({ params }: PageProps) => {
  const { slug } = await params;
  return <CanvasClient slug={slug} />;
};

export default Page;
