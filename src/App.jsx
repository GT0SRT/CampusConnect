import { Routes, Route } from "react-router-dom";
import MainLayout from "./layout/MainLayout";

import Home from "./pages/Home";
import Threads from "./pages/Threads";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import PrivateRoute from "./components/PrivateRoute";
import ThreadView from "./pages/ThreadView";

function App() {

  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />

      <Route
        element={
          <PrivateRoute>
            <MainLayout />
          </PrivateRoute>
        }
      >
        <Route path="/" element={<Home />} />
        <Route path="/threads" element={<Threads />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/threads/:thread_id" element={<ThreadView />} />
      </Route>
    </Routes>
  );
}

export default App;
