import { Routes, Route } from "react-router-dom";
import MainLayout from "./layout/MainLayout";

import Home from "./pages/Home";
import Threads from "./pages/Threads";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";

function App() {
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />

      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/threads" element={<Threads />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
    </Routes>
  );
}

export default App;