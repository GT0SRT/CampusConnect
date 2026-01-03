import { Routes, Route } from "react-router-dom";
import Navbar from "./layout/Navbar";
import Sidebar from "./layout/Sidebar";
import RightPanel from "./layout/RightPannel";
import MobileNav from "./layout/MobileNav";

import Home from "./pages/Home";
import Threads from "./pages/Threads";
import Profile from "./pages/Profile";

function App() {
  return (
    <>
      <div className="h-screen flex flex-col">
        <Navbar />

        <div className="flex-1 max-w-7xl mx-auto w-full grid grid-cols-12 gap-6 px-4 py-4 overflow-hidden">
          
          <aside className="col-span-3 hidden md:block overflow-y-auto">
            <Sidebar />
          </aside>

          <main className="col-span-12 md:col-span-6 overflow-y-auto pr-2 [&::-webkit-scrollbar]:hidden">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/threads" element={<Threads />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </main>

          <aside className="col-span-3 hidden md:block overflow-y-auto">
            <RightPanel />
          </aside>
        </div>
        <MobileNav />
      </div>
    </>
  )
}

export default App
