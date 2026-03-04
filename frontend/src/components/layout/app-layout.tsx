"use client";

import React from "react";
import { UserNav } from "./user-nav";
import { MainNav } from "./main-nav";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-black">
      {/* Navbar */}
      <div className="border-b border-zinc-800 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex h-16 items-center px-4 md:px-8">
          <MainNav className="mx-6" />
          <div className="ml-auto flex items-center space-x-4">
            <UserNav />
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 space-y-4 p-8 pt-6 max-w-5xl mx-auto">
        {children}
      </main>
    </div>
  );
}
