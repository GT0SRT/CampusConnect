import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Handshake, Sparkles } from 'lucide-react';
import { useUserStore } from '../store/useUserStore';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useUserStore();

  // useEffect(() => {
  //   if (user?.email) {
  //     navigate('/home', { replace: true });
  //   }
  // }, [user, navigate]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 700));

      if (!email || !password) {
        setError('Please enter email and password.');
        return;
      }

      const localUser = {
        uid: `local-${Date.now()}`,
        email,
        name: email.split('@')[0] || 'Campus User',
        github: 'your-github-username',
        linkedin: 'your-linkedin-profile',
        portfolio: 'https://your-portfolio.dev',
      };

      setUser(localUser);
      navigate('/home', { replace: true });
    } catch {
      setError('Unable to continue. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      setUser({
        uid: `local-google-${Date.now()}`,
        email: 'google-user@campusconnect.local',
        name: 'Google User',
        github: 'google-user-github',
        linkedin: 'google-user-linkedin',
        portfolio: 'https://google-user-portfolio.dev',
      });
      navigate('/home', { replace: true });
    } catch {
      setError('Google Sign-In failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-screen min-h-screen bg-slate-950 relative overflow-y-auto overflow-x-hidden px-4 py-8 [&::-webkit-scrollbar]:hidden">
      {/* Decorative glowing orbs */}
      <div className="absolute inset-0 z-0">
        <div className="absolute left-1/2 top-1/4 h-125 w-125 -translate-x-1/2 rounded-full bg-cyan-500/20 blur-[120px]" />
        <div className="absolute right-1/4 bottom-1/3 h-75 w-75 rounded-full bg-sky-500/10 blur-[100px]" />
      </div>
      <div className="absolute inset-0 bg-slate-950/30 z-0" />

      <div className="w-full flex flex-col items-center justify-center gap-6 relative z-10">
        <div className="w-full max-w-md">
          {/* Auth Card */}
          <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl shadow-2xl p-8 backdrop-blur-xl">

            <div className="flex flex-col items-center mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500 transition-transform group-hover:scale-110">
                <Handshake className="h-5 w-5 text-slate-50" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Campus Connect
              </h1>
              <p className="text-slate-400 text-sm">
                {isLogin ? 'Welcome back! Continue to campus connect' : 'Join our AI Powered Campus Community'}
              </p>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              {message && (
                <div className="bg-green-900/20 border border-green-700 text-green-300 text-sm p-3 rounded-xl">
                  {message}
                </div>
              )}

              {error && (
                <div className="bg-red-900/20 border border-red-700 text-red-300 text-sm p-3 rounded-xl">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-50 mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full bg-slate-800 border-2 border-slate-700 text-slate-50 pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:border-cyan-500 focus:bg-slate-700 transition-all placeholder-slate-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-50 mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full bg-slate-800 border-2 border-slate-700 text-slate-50 pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:border-cyan-500 focus:bg-slate-700 transition-all placeholder-slate-500"
                    />
                  </div>
                  {isLogin && (
                    <div className="mr-0 mt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => setMessage('Password reset link sent to your email.')}
                        className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                      >
                        Forgot password?
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-linear-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-slate-950 font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin"></div>
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
                  <div className="w-full border-t border-slate-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-slate-900/40 text-slate-400 font-medium">Or continue with</span>
                </div>
              </div>

              <button
                onClick={handleGoogleLogin}
                type="button"
                disabled={isLoading}
                className="mt-6 w-full bg-slate-800 border-2 border-slate-700 hover:border-slate-600 hover:bg-slate-700 text-slate-50 font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google logo" width="20" height="20" />
                Continue with Google
              </button>
            </div>

            <p className="text-center mt-6 text-sm text-slate-400">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                  setMessage('');
                }}
                className="font-bold text-cyan-400 hover:text-cyan-300 hover:underline transition-colors"
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-slate-500">
              By continuing, you agree to our Terms & Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;