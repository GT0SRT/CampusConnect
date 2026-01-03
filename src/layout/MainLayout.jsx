import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import RightPanel from "./RightPannel";
import MobileNav from "./MobileNav";
import { Outlet } from "react-router-dom";

function MainLayout() {
  return (
    <div className="h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-7xl mx-auto w-full grid grid-cols-12 gap-6 px-4 py-4 overflow-hidden">
        <aside className="col-span-3 hidden md:block overflow-y-auto">
          <Sidebar />
        </aside>

        <main className="col-span-12 md:col-span-6 overflow-y-auto pr-2 [&::-webkit-scrollbar]:hidden">
          <Outlet />
        </main>

        <aside className="col-span-3 hidden md:block overflow-y-auto">
          <RightPanel />
        </aside>
      </div>

      <MobileNav />
    </div>
  );
}

export default MainLayout;