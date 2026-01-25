
import React, { useState } from 'react';
import Button from './Button';
import { MailIcon, CheckIcon, AthplanLogo, AppleIcon, GoogleIcon, CreditCardIcon } from './icons/Icons';
import { User } from '../lib/mockBackend';
import { supabase } from '../lib/supabase';

interface SignupProps {
  onBack: () => void;
  onLogin: () => void;
  onSuccess: (user: User) => void;
}

const Signup: React.FC<SignupProps> = ({ onBack, onLogin, onSuccess }) => {
  const [step, setStep] = useState<'details' | 'verification' | 'payment'>('details');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    team: '',
    email: '',
    password: ''
  });
  const [verificationCode, setVerificationCode] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<'apple' | 'google' | 'card'>('card');
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const validateDetails = (): boolean => {
    if (!formData.firstName || !formData.lastName || !formData.team || !formData.email || !formData.password) {
      setError('All fields are required.');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address.');
      return false;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return false;
    }

    return true;
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateDetails()) {
      return;
    }

    setIsLoading(true);

    try {
      // 1. Sign up with Supabase
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            team: formData.team
          }
        }
      });

      if (error) {
        setError(error.message);
      } else {
        // 2. Check if we have a session (Auto-confirm) or need verification
        if (data.session) {
          // Auto-confirmed? Move to payment or success
          setStep('payment');
        } else {
          // Needs email verification
          setStep('verification');
        }
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setStep('payment');
    } else {
      setError('Email not yet verified. Please click the link in your email, then click here.');
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Step 3: Finalize and Log In
      // In real app, we might save payment method to Stripe here via Edge Function
      // For now, we update the user metadata or DB record
      const { error: updateError } = await supabase.from('users').update({
        payment_method: selectedPayment,
        plan: 'starter' // default
      }).eq('email', formData.email);

      if (updateError) {
        console.warn("Could not update user metadata (likely RLS), but proceeding if auth valid.");
      }

      // Better: just fetch current user and call onSuccess
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        setIsSuccess(true);
        setTimeout(() => {
          onSuccess(user as any);
        }, 2000);
      } else {
        setError('Session lost. Please login again.');
      }
    } catch (err) {
      setError('An unexpected error occurred during checkout.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResendStatus('sending');
    // Using mock backend for resend simulation, or we could use supabase.auth.resend({ type: 'signup', email: formData.email })
    // Let's use real supabase
    await supabase.auth.resend({ type: 'signup', email: formData.email });
    setResendStatus('sent');
    setTimeout(() => setResendStatus('idle'), 3000);
  };

  const handleGoogleSignup = async () => {
    setIsLoading(true);
    setError('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Google sign-up failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderPaymentOption = (id: 'apple' | 'google' | 'card', label: string, icon: React.ReactNode) => (
    <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all duration-200 ${selectedPayment === id
        ? 'bg-indigo-500/10 border-indigo-500 ring-1 ring-indigo-500'
        : 'bg-slate-900/50 border-slate-700 hover:border-slate-600'
      }`}>
      <input
        type="radio"
        name="payment"
        value={id}
        checked={selectedPayment === id}
        onChange={() => setSelectedPayment(id)}
        className="sr-only"
      />
      <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-4 ${selectedPayment === id ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-slate-500 bg-transparent'
        }`}>
        {selectedPayment === id && <div className="w-2 h-2 rounded-full bg-white" />}
      </div>
      <div className="flex-1 flex items-center justify-between">
        <span className={`font-medium ${selectedPayment === id ? 'text-white' : 'text-slate-300'}`}>{label}</span>
        <div className={`${selectedPayment === id ? 'text-white' : 'text-slate-400'} w-6 h-6`}>
          {icon}
        </div>
      </div>
    </label>
  );

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center px-6 pt-20 pb-10 bg-slate-950 relative overflow-hidden">

      {/* Background Decoration */}
      <div className="absolute bottom-0 right-0 w-full max-w-lg h-[500px] bg-purple-500/10 blur-[100px] rounded-full pointer-events-none -z-10" />

      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div
            onClick={onBack}
            className="inline-flex items-center gap-2 cursor-pointer mb-8 hover:opacity-80 transition-opacity"
          >
            <AthplanLogo className="w-10 h-10" />
            <span className="font-bold text-xl text-white">Athplan</span>
          </div>

          {step === 'details' && (
            <>
              <h2 className="text-3xl font-bold text-white mb-2">Get Pilot Access</h2>
              <p className="text-slate-400">Join the 2026 season waiting list.</p>
            </>
          )}
          {step === 'verification' && (
            <>
              <h2 className="text-3xl font-bold text-white mb-2">Verify Email</h2>
              <p className="text-slate-400">Confirmation sent to <span className="text-white font-medium">{formData.email}</span></p>
            </>
          )}
          {step === 'payment' && (
            <>
              <h2 className="text-3xl font-bold text-white mb-2">Select Payment Method</h2>
              <p className="text-slate-400">You won't be charged today.</p>
            </>
          )}
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-xl relative overflow-hidden">

          {isSuccess && (
            <div className="absolute inset-0 bg-slate-900 z-50 flex flex-col items-center justify-center p-8 animate-fade-in">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 mb-4">
                <CheckIcon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Welcome to Athplan!</h3>
              <p className="text-slate-400 text-center">Account verified. Taking you to the dashboard...</p>
            </div>
          )}

          {step === 'details' && (
            <>
              <button
                type="button"
                onClick={handleGoogleSignup}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 bg-white text-slate-900 font-medium py-3 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-70 mb-6"
              >
                <GoogleIcon className="w-5 h-5" />
                Sign up with Google
              </button>

              <div className="relative flex py-2 items-center mb-6">
                <div className="flex-grow border-t border-slate-800"></div>
                <span className="flex-shrink-0 mx-4 text-slate-500 text-xs uppercase">Or sign up with email</span>
                <div className="flex-grow border-t border-slate-800"></div>
              </div>

              <form className="space-y-4" onSubmit={handleSignupSubmit}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      autoComplete="given-name"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                      placeholder="John"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      autoComplete="family-name"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                      placeholder="Doe"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Team / Organization</label>
                  <input
                    type="text"
                    name="team"
                    autoComplete="organization"
                    value={formData.team}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                    placeholder="e.g. West Side Lions"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Work Email</label>
                  <input
                    type="email"
                    name="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-slate-950 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 transition-colors ${error && error.includes('email') ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-800 focus:border-indigo-500 focus:ring-indigo-500'
                      }`}
                    placeholder="coach@team.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Create Password</label>
                  <input
                    type="password"
                    name="password"
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-slate-950 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 transition-colors ${error && error.includes('Password') ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-800 focus:border-indigo-500 focus:ring-indigo-500'
                      }`}
                    placeholder="Min 8 chars"
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

                <div className="pt-2">
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                  <p className="text-xs text-slate-500 text-center mt-3 leading-relaxed">
                    Start your 14-day free trial. No credit card required to sign up. <br />
                    By joining, you agree to our Terms of Service.
                  </p>
                </div>
              </form>
            </>
          )}

          {step === 'verification' && (
            <form className="space-y-6" onSubmit={handleVerifySubmit}>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 mb-4">
                  <MailIcon className="w-6 h-6" />
                </div>
                <p className="text-sm text-slate-400 text-center mb-6">
                  Check your inbox for a confirmation link.
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-300 text-center mb-4">
                  We sent a confirmation link to your email. Please click it to verify your account.
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Checking...' : 'I have verified my email'}
              </Button>

              <div className="flex flex-col items-center gap-3">
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resendStatus !== 'idle'}
                  className={`text-sm ${resendStatus === 'sent' ? 'text-green-400' : 'text-slate-400 hover:text-white'} transition-colors disabled:opacity-50`}
                >
                  {resendStatus === 'sending' ? 'Sending...' : resendStatus === 'sent' ? 'Link Sent!' : 'Resend Link'}
                </button>

                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="text-xs text-indigo-400 hover:text-indigo-300"
                >
                  Change Email
                </button>
              </div>
            </form>
          )}

          {step === 'payment' && (
            <form className="space-y-6" onSubmit={handlePaymentSubmit}>
              <div className="space-y-3">
                {renderPaymentOption('apple', 'Apple Pay', <AppleIcon className="w-full h-full" />)}
                {renderPaymentOption('google', 'Google Pay', <GoogleIcon className="w-full h-full" />)}
                {renderPaymentOption('card', 'Credit Card', <CreditCardIcon className="w-full h-full" />)}
              </div>

              <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-4 text-center">
                <p className="text-white font-medium text-sm">14-Day Free Trial</p>
                <p className="text-slate-400 text-xs mt-1">Total due today: $0.00</p>
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

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Setting up...' : 'Start Trial'}
              </Button>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-slate-800 text-center">
            <p className="text-slate-400 text-sm">
              Already have an account? {' '}
              <button
                onClick={onLogin}
                className="text-indigo-400 hover:text-indigo-300 font-medium"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
