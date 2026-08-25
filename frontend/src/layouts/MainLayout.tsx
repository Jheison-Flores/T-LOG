import { Outlet } from "react-router-dom";

import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";

export function MainLayout() {
  return (
    <div className="flex h-screen overflow-hidden">

      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">

        <Navbar />

        <main className="flex-1 overflow-auto bg-[#F5F6F8]">

          <div className="w-full p-6 lg:p-8">

            <Outlet />

          </div>

        </main>

      </div>

    </div>
  );
}