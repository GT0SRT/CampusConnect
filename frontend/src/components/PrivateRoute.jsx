import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useUserStore } from "../store/useUserStore";

const PrivateRoute = ({ children }) => {
  const { user, setUser } = useUserStore();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    console.log('[Auth] Setting up Firebase auth listener...')
    try {
      const auth = getAuth();
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        console.log('[Auth] Auth state changed:', currentUser ? 'User logged in' : 'User logged out')
        if (currentUser) {
          setIsAuthenticated(true);
          if (!user) {
            setUser({
              uid: currentUser.uid,
              email: currentUser.email,
            });
            console.log('[Auth] User set in store:', currentUser.uid)
          }
        } else {
          setIsAuthenticated(false);
        }
        setLoading(false);
        console.log('[Auth] Loading state set to false')
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('[Auth] Error setting up auth listener:', error)
      setLoading(false)
    }
  }, [user, setUser]);

  if (loading) {
    console.log('[Auth] Still loading...')
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('[Auth] User not authenticated, redirecting to /auth')
    return <Navigate to="/auth" replace />;
  }

  console.log('[Auth] User authenticated, rendering children')
  return children;
};

export default PrivateRoute;