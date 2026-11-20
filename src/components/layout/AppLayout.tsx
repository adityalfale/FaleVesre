"use client";

import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { UserRole } from "@/types";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [currentRole, setCurrentRole] = useState<UserRole>("society_admin");
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-navy-900 flex flex-col">
      <Sidebar
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <div className="lg:pl-64 flex flex-col flex-1 transition-all duration-300">
        <Header
          currentRole={currentRole}
          onOpenMobileSidebar={() => setMobileOpen(true)}
          communityName="Green Valley Eco Enclave"
        />
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-200">
          {children}
        </main>
      </div>
    </div>
  );
}

