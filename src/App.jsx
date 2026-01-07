import { Routes, Route } from "react-router-dom";
import MainLayout from "./layout/MainLayout";

import Home from "./pages/Home";
import Threads from "./pages/Threads";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import PrivateRoute from "./components/PrivateRoute";
import ThreadView from "./pages/ThreadView";
import { useUserStore } from "./store/useUserStore";
import { useEffect } from "react";

function App() {
  const theme = useUserStore((state) => state.theme);
  
   useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#111827';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '';
    }
  }, [theme]);

  return (
     <div className={theme === 'dark' ? 'dark' : ''}>
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
    </div>
  );
}

export default App;
