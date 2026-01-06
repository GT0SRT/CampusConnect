import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, googleProvider, db } from '../firebase';
import { signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, signOut } from 'firebase/auth';
import { Mail, Lock, ArrowRight, Handshake, Sparkles } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { useUserStore } from '../store/useUserStore';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [checking, setChecking] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useUserStore();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user && user.emailVerified) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));

          if (userDoc.exists()) {
            const userData = {
              uid: user.uid,
              email: user.email,
              ...userDoc.data()
            };
            setUser(userData);
          } else {
            setUser({ uid: user.uid, email: user.email });
          }
          navigate('/', { replace: true });

        } catch (err) {
          console.error("Error fetching user data:", err);
        }
      }
      setChecking(false);
    });

    return () => unsubscribe();
  }, [navigate, setUser]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <span className="text-sm text-gray-600 font-medium">Loading...</span>
        </div>
      </div>
    );
  }

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));

        if (userDoc.exists()) {
          setUser({ uid: userCredential.user.uid, ...userDoc.data() });
          navigate('/');
        }
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(userCredential.user);
        await signOut(auth);

        setMessage("Verification link sent to your email! Please verify and log in.");
        setIsLogin(true);
        setEmail('');
        setPassword('');
      }
    } catch (err) {
      setError(err.message.replace('Firebase:', '').trim());
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));

      if (userDoc.exists()) {
        setUser({ uid: result.user.uid, email: result.user.email, ...userDoc.data() });
      } else {
        setUser({ uid: result.user.uid, email: result.user.email });
      }
      navigate('/');
    } catch (err) {
      console.error('Google Sign-In Error:', err);
      setError(err.message || "Google Sign-In Failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-screen min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-y-auto overflow-x-hidden px-4 py-8 [&::-webkit-scrollbar]:hidden">
      {/* Decorative elements */}
      <div className="fixed top-10 left-10 w-72 h-72 bg-blue-300/30 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="fixed bottom-10 right-10 w-96 h-96 bg-purple-300/30 rounded-full blur-3xl pointer-events-none -z-10"></div>

      <div className="w-full flex flex-col items-center justify-center gap-6">
        <div className="w-full max-w-md relative z-10">
          {/* Auth Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">

            <div className="flex flex-col items-center mb-4">
              <Handshake className="w-8 h-8" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-cyan-200 bg-clip-text text-transparent mb-2">
                Campus Connect
              </h1>
              <p className="text-gray-600 text-sm">
                {isLogin ? 'Welcome back! Sign in to continue' : 'Join our community today'}
              </p>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              {message && (
                <div className="bg-green-50 border border-green-200 text-green-700 text-sm p-3 rounded-xl">
                  {message}
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-xl">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full bg-gray-50 border-2 border-gray-200 text-gray-900 pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all placeholder-gray-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full bg-gray-50 border-2 border-gray-200 text-gray-900 pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all placeholder-gray-400"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    {isLogin ? 'Sign In' : 'Sign Up'}
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500 font-medium">Or continue with</span>
                </div>
              </div>

              <button
                onClick={handleGoogleLogin}
                type="button"
                disabled={isLoading}
                className="mt-6 w-full bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                Continue with Google
              </button>
            </div>

            <p className="text-center mt-6 text-sm text-gray-600">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                  setMessage('');
                }}
                className="font-bold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-400">
              By continuing, you agree to our Terms & Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;