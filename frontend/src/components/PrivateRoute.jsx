import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useUserStore } from "../store/useUserStore";

const PrivateRoute = ({ children }) => {
  const { user } = useUserStore();

  useEffect(() => {
    document.title = user ? "CampusConnect" : "CampusConnect - Sign In";
  }, [user]);

  if (!user?.uid) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};

export default PrivateRoute;