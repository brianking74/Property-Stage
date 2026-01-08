
import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '../contexts/UserContext';
import { User } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type AuthStep = 'FORM' | 'VERIFY_2FA' | 'FORGOT_PASSWORD';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState<AuthStep>('FORM');
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);
  
  // 2FA States - Use array to maintain fixed positions
  const [verificationCode, setVerificationCode] = useState<string[]>(['', '', '', '', '', '']);
  const [generatedCode, setGeneratedCode] = useState('');
  const [tempUser, setTempUser] = useState<User | null>(null);
  const [resendTimer, setResendTimer] = useState(0);
  
  const { login, signup, completeLogin } = useUser();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let interval: any;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  if (!isOpen) return null;

  const generateAndSendCode = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    setResendTimer(30);
    setError(null);
    setVerificationCode(['', '', '', '', '', '']);
    console.log(`[SECURITY] 2FA code for ${email}: ${code}`);
  };

  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = isLogin 
        ? await login(email, password)
        : await signup(email, name, password);

      if (result.success && result.user) {
        setTempUser(result.user);
        generateAndSendCode();
        setStep('VERIFY_2FA');
      } else {
        setError(result.error || "Authentication failed");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    // Simulate API call for password reset
    await new Promise(resolve => setTimeout(resolve, 1500));
    setResetSent(true);
    setLoading(false);
  };

  const performVerification = (codeString: string) => {
    if (codeString === generatedCode) {
      if (tempUser) {
        completeLogin(tempUser);
        onSuccess();
        resetAndClose();
      }
    } else {
      setError("Invalid verification code. Please try again.");
      setVerificationCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  const handleVerify2FA = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const codeString = verificationCode.join('');
    performVerification(codeString);
  };

  const resetAndClose = () => {
    setStep('FORM');
    setEmail('');
    setName('');
    setPassword('');
    setShowPassword(false);
    setVerificationCode(['', '', '', '', '', '']);
    setGeneratedCode('');
    setTempUser(null);
    setError(null);
    setResetSent(false);
    onClose();
  };

  const handleCodeChange = (index: number, value: string) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;

    const newCode = [...verificationCode];
    newCode[index] = value.slice(-1);
    setVerificationCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    
    const codeString = newCode.join('');
    if (codeString.length === 6) {
      setTimeout(() => performVerification(codeString), 100);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const renderContent = () => {
    if (step === 'FORGOT_PASSWORD') {
      return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">
              🛡️
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Reset Password</h2>
            <p className="text-gray-500 mt-2 text-sm">
              Enter your email and we'll send you a link to reset your password.
            </p>
          </div>

          {resetSent ? (
            <div className="text-center py-4">
              <div className="bg-green-50 text-green-700 p-6 rounded-2xl text-sm font-medium mb-8 border border-green-100">
                Recovery email sent to <b>{email}</b>. Please check your inbox and follow the instructions.
              </div>
              <button
                onClick={() => { setStep('FORM'); setResetSent(false); }}
                className="text-blue-600 font-bold hover:text-blue-700 uppercase text-xs tracking-widest"
              >
                ← Back to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="jane@example.com"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-70 flex justify-center"
              >
                {loading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Send Reset Link'}
              </button>
              <button
                type="button"
                onClick={() => setStep('FORM')}
                className="w-full text-center text-xs font-bold text-gray-400 hover:text-gray-600 uppercase tracking-widest mt-4"
              >
                Cancel
              </button>
            </form>
          )}
        </div>
      );
    }

    if (step === 'VERIFY_2FA') {
      return (
        <div className="animate-in fade-in slide-in-from-right-4 duration-400">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">
              🛡️
            </div>
            <h2 className="text-2xl font-bold text-gray-900">2-Step Verification</h2>
            <p className="text-gray-500 mt-2 text-sm">
              We've sent a 6-digit security code to <br/>
              <span className="font-bold text-gray-900">{email}</span>
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-8 text-center animate-pulse">
            <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1">Simulated Email Received</p>
            <p className="text-lg font-black text-amber-900 tracking-[0.2em]">{generatedCode}</p>
            <p className="text-[9px] text-amber-500 mt-1">In a real app, this code arrives via email.</p>
          </div>

          <form onSubmit={handleVerify2FA} className="space-y-8">
            <div className="flex justify-between gap-2">
              {[0, 1, 2, 3, 4, 5].map((idx) => (
                <input
                  key={idx}
                  ref={(el) => (inputRefs.current[idx] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  className="w-12 h-14 text-center text-xl font-bold bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  value={verificationCode[idx]}
                  onChange={(e) => handleCodeChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                />
              ))}
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600 font-medium text-center">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <button
                type="submit"
                disabled={verificationCode.join('').length !== 6 || loading}
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg disabled:opacity-50"
              >
                Verify & Continue
              </button>
              
              <button
                type="button"
                onClick={() => {
                    if (resendTimer === 0) generateAndSendCode();
                }}
                disabled={resendTimer > 0}
                className="w-full text-sm font-bold text-gray-400 disabled:text-gray-300 transition-colors"
              >
                {resendTimer > 0 ? `Resend code in ${resendTimer}s` : 'Resend Code'}
              </button>
            </div>
          </form>

          <button 
            onClick={() => setStep('FORM')}
            className="mt-8 w-full text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-widest"
          >
            ← Back to Login
          </button>
        </div>
      );
    }

    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">
            {isLogin ? '🔑' : '✨'}
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            {isLogin ? 'Welcome Back' : 'Join PropertyStage'}
          </h2>
          <p className="text-gray-500 mt-2 text-sm">
            {isLogin ? 'Sign in to access your agent dashboard' : 'Start staging your listings like a pro today'}
          </p>
        </div>

        <form onSubmit={handleInitialSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Full Name</label>
              <input
                type="text"
                required
                placeholder="Jane Doe"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Email Address</label>
            <input
              type="email"
              required
              placeholder="jane@example.com"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1 ml-1">
              <label className="block text-xs font-bold text-gray-400 uppercase">Password</label>
              {isLogin && (
                <button
                  type="button"
                  onClick={() => setStep('FORGOT_PASSWORD')}
                  className="text-[10px] font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest"
                >
                  Forgot Password?
                </button>
              )}
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all pr-12"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                title={showPassword ? "Hide Password" : "Show Password"}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600 font-medium animate-shake">
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-70 flex justify-center"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              isLogin ? 'Sign In & Verify' : 'Create Account'
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-500">
            {isLogin ? "Don't have an account? " : "Already an agent? "}
            <button 
              onClick={() => { setIsLogin(!isLogin); setError(null); setShowPassword(false); }}
              className="text-blue-600 font-bold hover:text-blue-700 underline underline-offset-4"
            >
              {isLogin ? 'Sign up' : 'Log in'}
            </button>
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={resetAndClose} />
      
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden transition-all duration-300">
        <div className="p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};
