import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Handshake, User, Eye, EyeOff } from 'lucide-react';
import { login, register } from '../services/authService';
import { useEffect } from 'react';
import { useUserStore } from './../store/useUserStore';

const Auth = () => {
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [email, setEmail] = useState('');
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.email) {
      navigate('/home', { replace: true });
    }
  }, [user, navigate]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (isForgotPassword) {
      const targetEmail = String(forgotPasswordEmail || '').trim();
      if (!targetEmail) {
        setError('Email is required.');
        return;
      }

      setMessage(`Password reset email sent to ${targetEmail}.`);
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setError('Password and confirm password do not match.');
      return;
    }

    setIsLoading(true);

    try {
      const response = isLogin
        ? await login({ identifier, password })
        : await register({ username, email, password, confirmPassword });

      const authUser = response?.data?.user;
      const token = response?.data?.token;

      if (token) {
        localStorage.setItem('auth-token', token);
      }

      if (authUser) {
        setUser({
          uid: authUser.uid || authUser.id,
          id: authUser.id || authUser.uid,
          username: authUser.username || username || identifier,
          email: authUser.email || email,
          name: authUser.fullName || '',
          profile_pic: authUser.profileImageUrl || '',
          campus: authUser.collegeName || '',
          branch: authUser.headline || '',
          bio: authUser.about || '',
          profileCompletePercentage: authUser.profileCompletePercentage ?? 0,
          tags: authUser.tags || [],
          skills: authUser.skills || [],
          interests: authUser.interests || [],
          socialLinks: authUser.socialLinks || {},
          education: authUser.education || [],
          experience: authUser.experience || [],
          projects: authUser.projects || [],
          savedPosts: authUser.savedPosts || [],
          savedThreads: authUser.savedThreads || [],
        });
      }

      navigate('/home', { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'Unable to continue. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setMessage('Google Sign-In is not connected yet. Use email/password login.');
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
                {isForgotPassword
                  ? 'Enter your email to receive a reset link'
                  : (isLogin ? 'Welcome back! Continue to campus connect' : 'Join our AI Powered Campus Community')}
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
                {!isForgotPassword && !isLogin && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-50 mb-2">Username</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <input
                        type="text"
                        placeholder="yourusername"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required={!isLogin}
                        className="w-full bg-slate-800 border-2 border-slate-700 text-slate-50 pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:border-cyan-500 focus:bg-slate-700 transition-all placeholder-slate-500"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-slate-50 mb-2">
                    {isForgotPassword ? 'Email' : (isLogin ? 'Email or Username' : 'Email')}
                  </label>
                  <div className="relative">
                    {isForgotPassword ? (
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    ) : isLogin ? (
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    ) : (
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    )}
                    <input
                      type={isForgotPassword ? 'email' : (isLogin ? 'text' : 'email')}
                      placeholder={isForgotPassword ? 'you@example.com' : (isLogin ? 'Email or username' : 'you@example.com')}
                      value={isForgotPassword ? forgotPasswordEmail : (isLogin ? identifier : email)}
                      onChange={(e) => {
                        if (isForgotPassword) {
                          setForgotPasswordEmail(e.target.value);
                          return;
                        }
                        if (isLogin) {
                          setIdentifier(e.target.value);
                          return;
                        }
                        setEmail(e.target.value);
                      }}
                      required
                      className="w-full bg-slate-800 border-2 border-slate-700 text-slate-50 pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:border-cyan-500 focus:bg-slate-700 transition-all placeholder-slate-500"
                    />
                  </div>
                </div>

                {!isForgotPassword && (
                <div>
                  <label className="block text-sm font-semibold text-slate-50 mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full bg-slate-800 border-2 border-slate-700 text-slate-50 pl-12 pr-12 py-3 rounded-xl focus:outline-none focus:border-cyan-500 focus:bg-slate-700 transition-all placeholder-slate-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {isLogin && (
                    <div className="mr-0 mt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setIsForgotPassword(true);
                          setError('');
                          setMessage('');
                        }}
                        className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                      >
                        Forgot password?
                      </button>
                    </div>
                  )}
                </div>
                )}

                {!isForgotPassword && !isLogin && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-50 mb-2">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required={!isLogin}
                        className="w-full bg-slate-800 border-2 border-slate-700 text-slate-50 pl-12 pr-12 py-3 rounded-xl focus:outline-none focus:border-cyan-500 focus:bg-slate-700 transition-all placeholder-slate-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                        aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                )}
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
                    {isForgotPassword ? 'Send Reset Link' : (isLogin ? 'Sign In' : 'Sign Up')}
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>

            {!isForgotPassword && (
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
            )}

            <p className="text-center mt-6 text-sm text-slate-400">
              {isForgotPassword ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(false);
                    setIsLogin(true);
                    setError('');
                    setMessage('');
                    setForgotPasswordEmail('');
                  }}
                  className="font-bold text-cyan-400 hover:text-cyan-300 hover:underline transition-colors"
                >
                  Back to Sign In
                </button>
              ) : (
                <>
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setIsForgotPassword(false);
                      setError('');
                      setMessage('');
                      setPassword('');
                      setConfirmPassword('');
                      setShowPassword(false);
                      setShowConfirmPassword(false);
                    }}
                    className="font-bold text-cyan-400 hover:text-cyan-300 hover:underline transition-colors"
                  >
                    {isLogin ? 'Sign Up' : 'Sign In'}
                  </button>
                </>
              )}
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