// components/ClientLayout.tsx
"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

interface ClientLayoutProps {
  children: React.ReactNode;
}

const ClientLayout: React.FC<ClientLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  
  // Pages where navbar should NOT be shown
  const excludedPages = ["/login", "/register"];
  
  const shouldShowNavbar = !excludedPages.includes(pathname);

  return (
    <div className="min-h-screen bg-[#0d0d0d]">
      {shouldShowNavbar && <Navbar />}
      <main className={shouldShowNavbar ? "" : ""}>
        {children}
      </main>
    </div>
  );
};

export default ClientLayout;