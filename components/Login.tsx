
import React, { useState } from 'react';
import Button from './Button';
import { ArrowRightIcon, AthplanLogo, GoogleIcon } from './icons/Icons';
import { mockBackend, User } from '../lib/mockBackend';

interface LoginProps {
  onBack: () => void;
  onSignup: () => void;
  onSuccess: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onBack, onSignup, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const validateForm = (): boolean => {
    if (!email || !password) {
      setError('Please fill in all fields.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return false;
    }
    return true;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const result = await mockBackend.login(email, password);
      if (result.success && result.user) {
        onSuccess(result.user);
      } else {
        setError(result.message || 'Incorrect email or password.');
      }
    } catch (err) {
      setError('Network error. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await mockBackend.continueWithGoogle();
      if (result.success) {
        onSuccess(result.user);
      }
    } catch (err) {
      setError('Unable to connect to Google. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center px-6 pt-20 pb-10 bg-slate-950 relative overflow-hidden">
      
      {/* Background Decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-[500px] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none -z-10" />

      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div 
            onClick={onBack}
            className="inline-flex items-center gap-2 cursor-pointer mb-8 hover:opacity-80 transition-opacity"
          >
            <AthplanLogo className="w-10 h-10" />
            <span className="font-bold text-xl text-white">Athplan</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Welcome back</h2>
          <p className="text-slate-400">Enter your details to access your dashboard.</p>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-xl">
          
          <button 
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 bg-white text-slate-900 font-medium py-3 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-70 mb-6"
          >
            <GoogleIcon className="w-5 h-5" />
            Sign in with Google
          </button>

          <div className="relative flex py-2 items-center mb-6">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="flex-shrink-0 mx-4 text-slate-500 text-xs uppercase">Or continue with email</span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>

          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
              <input 
                type="email" 
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
                className={`w-full px-4 py-3 bg-slate-950 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 transition-colors ${
                  error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-800 focus:border-indigo-500 focus:ring-indigo-500'
                }`}
                placeholder="coach@team.com"
                required
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-medium text-slate-300">Password</label>
                <a href="#" className="text-xs text-indigo-400 hover:text-indigo-300">Forgot password?</a>
              </div>
              <input 
                type="password" 
                name="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                className={`w-full px-4 py-3 bg-slate-950 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 transition-colors ${
                  error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-800 focus:border-indigo-500 focus:ring-indigo-500'
                }`}
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 p-3 rounded-lg animate-fade-in">
                <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </div>
                <p className="text-sm text-red-400 font-medium">{error}</p>
              </div>
            )}

            <Button type="submit" className="w-full mt-2" disabled={isLoading}>
              {isLoading ? 'Signing in...' : (
                <>Sign In <ArrowRightIcon className="w-4 h-4 ml-2" /></>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-800 text-center">
            <p className="text-slate-400 text-sm">
              Don't have an account?{' '}
              <button onClick={onSignup} className="text-indigo-400 hover:text-indigo-300 font-medium">
                Sign up for pilot
              </button>
            </p>
          </div>
        </div>
        
        <button onClick={onBack} className="w-full text-center mt-8 text-slate-500 hover:text-slate-300 text-sm transition-colors">
          ← Back to Home
        </button>
      </div>
    </div>
  );
};

export default Login;
