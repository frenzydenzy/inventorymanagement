import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { ToastViewport } from "../common/Toast";

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell flex h-screen w-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="page-main flex-1 overflow-y-auto p-6">{children}</main>
      </div>
      <ToastViewport />
    </div>
  );
}
