import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, signOut } from 'firebase/auth';
import { Mail, Lock, User, ArrowRight, ShieldCheck, Coins } from 'lucide-react';
import { Handshake } from 'lucide-react';
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
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user && user.emailVerified) {
        navigate('/', { replace: true });
      } else {
        setChecking(false);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(255, 215, 0, 0.5)', borderTopColor: '#FFD700' }} />
          <span className="text-sm text-gray-400">Loading...</span>
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
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/app');
    } catch (err) {
      setError("Google Sign-In Failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden px-4 py-8">
      <div
        className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[120px]"
        style={{ background: 'radial-gradient(circle, rgba(255, 215, 0, 0.25) 0%, transparent 70%)' }}
      />
      <div
        className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[120px]"
        style={{ background: 'radial-gradient(circle, rgba(255, 215, 0, 0.2) 0%, transparent 70%)' }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[140px]"
        style={{ background: 'radial-gradient(circle, rgba(255, 215, 0, 0.15) 0%, transparent 70%)' }}
      />

      <div
        className="w-full max-w-md backdrop-blur-xl p-6 rounded-3xl relative z-10 bg-black/50"
        style={{
          border: '1px solid rgba(255, 215, 0, 0.3)',
          boxShadow: '0 0 50px rgba(255, 215, 0, 0.2)'
        }}
      >

        <div className="text-center mb-6">
          <div
            className="h-12 rounded-2xl mx-auto flex flex-col items-center justify-center mb-3 text-white/80"
          >
            <span className="text-2xl font-bold text-cyan-300 p-1"><Handshake size={32} /></span>
            Campus Connect
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-gray-400 text-xs">
            {isLogin ? 'Access your dashboard' : 'Join the future of connections'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-3">
          {message && (
            <div className="bg-green-500/10 border border-green-500/50 text-green-400 text-xs p-2 rounded-lg text-center">
              {message}
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-xs p-2 rounded-lg text-center">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <div className="relative">
              <Mail
                className="absolute left-4 top-3 w-4 h-4"
                style={{ color: '#FFD700' }}
              />
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-black/50 text-white pl-12 pr-4 py-2.5 rounded-xl focus:outline-none transition-all placeholder-gray-500 text-sm"
                style={{
                  border: '1px solid rgba(255, 215, 0, 0.3)',
                  boxShadow: '0 0 10px rgba(255, 215, 0, 0.1)'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#FFD700';
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 215, 0, 0.3)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 215, 0, 0.3)';
                  e.currentTarget.style.boxShadow = '0 0 10px rgba(255, 215, 0, 0.1)';
                }}
              />
            </div>

            <div className="relative">
              <Lock
                className="absolute left-4 top-3 w-4 h-4"
                style={{ color: '#FFD700' }}
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-black/50 text-white pl-12 pr-4 py-2.5 rounded-xl focus:outline-none transition-all placeholder-gray-500 text-sm"
                style={{
                  border: '1px solid rgba(255, 215, 0, 0.3)',
                  boxShadow: '0 0 10px rgba(255, 215, 0, 0.1)'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#FFD700';
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 215, 0, 0.3)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 215, 0, 0.3)';
                  e.currentTarget.style.boxShadow = '0 0 10px rgba(255, 215, 0, 0.1)';
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full text-black font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
            style={{
              backgroundColor: '#FFD700',
              boxShadow: '0 0 30px rgba(255, 215, 0, 0.4)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 0 40px rgba(255, 215, 0, 0.6)';
              e.currentTarget.style.transform = 'scale(1.02)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 0 30px rgba(255, 215, 0, 0.4)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : isLogin ? 'Sign In' : 'Sign Up'} <ArrowRight size={18} />
          </button>
        </form>

        <div className="mt-6 hidden md:block">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div
                className="w-full border-t"
                style={{ borderColor: 'rgba(255, 215, 0, 0.2)' }}
              ></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-black text-gray-400">Or continue with</span>
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            type="button"
            className="mt-6 w-full bg-white/95 text-black font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-3 hover:bg-white"
            style={{ boxShadow: '0 0 15px rgba(255, 255, 255, 0.1)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 0 25px rgba(255, 215, 0, 0.3)';
              e.currentTarget.style.transform = 'scale(1.02)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 0 15px rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
            Google Account
          </button>
        </div>

        <p className="text-center mt-8 text-sm text-gray-400">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setMessage('');
            }}
            className="font-semibold hover:underline transition-colors"
            style={{ color: '#FFD700' }}
          >
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;