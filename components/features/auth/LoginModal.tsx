import React, { useState, useEffect } from 'react';
import { sendPhoneCode, signInWithPhone } from '../../../services/cloudService';
import { Sparkles, X, ArrowRight, Smartphone, KeyRound } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState('');
  const [verificationInfo, setVerificationInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendCode = async () => {
    if (!phoneNumber) {
      setError('请输入手机号');
      return;
    }

    // Simple regex for phone number (China)
    if (!/^1[3-9]\d{9}$/.test(phoneNumber)) {
      setError('请输入有效的手机号');
      return;
    }

    setIsSending(true);
    setError('');
    try {
      const info = await sendPhoneCode(phoneNumber);
      setVerificationInfo(info);
      setCountdown(60);
    } catch (err: any) {
      setError(err.message || '发送失败');
    } finally {
      setIsSending(false);
    }
  };

  const handleLogin = async () => {
    if (!phoneNumber || !verifyCode) {
      setError('请输入手机号和验证码');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      await signInWithPhone(phoneNumber, verifyCode, verificationInfo);
      // Add a small delay for better UX
      setTimeout(() => {
        onLoginSuccess();
        onClose();
      }, 500);
    } catch (err: any) {
      setError(err.message || '登录失败');
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop with blur */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-[360px] mx-4 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-2xl rounded-[32px] shadow-2xl p-8 transform transition-all animate-zoom-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-zinc-900 to-zinc-700 dark:from-zinc-100 dark:to-zinc-400 rounded-2xl flex items-center justify-center shadow-lg mb-4 transform rotate-3">
            <Sparkles className="text-white dark:text-zinc-900" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">Zen Kitchen</h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">开启你的极简厨房生活</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 text-red-600 dark:text-red-400 rounded-2xl text-sm text-center font-medium animate-pulse">
            {error}
          </div>
        )}

        {/* Form */}
        <div className="space-y-4">
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Smartphone size={20} className="text-zinc-400 group-focus-within:text-zinc-900 dark:group-focus-within:text-white transition-colors" />
            </div>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full bg-zinc-100 dark:bg-zinc-800/50 border-none rounded-2xl py-4 pl-12 pr-4 text-zinc-900 dark:text-white placeholder-zinc-400 focus:ring-2 focus:ring-zinc-900/10 dark:focus:ring-white/10 transition-all outline-none font-medium"
              placeholder="手机号码"
            />
          </div>

          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <KeyRound size={20} className="text-zinc-400 group-focus-within:text-zinc-900 dark:group-focus-within:text-white transition-colors" />
            </div>
            <input
              type="text"
              value={verifyCode}
              onChange={(e) => setVerifyCode(e.target.value)}
              className="w-full bg-zinc-100 dark:bg-zinc-800/50 border-none rounded-2xl py-4 pl-12 pr-32 text-zinc-900 dark:text-white placeholder-zinc-400 focus:ring-2 focus:ring-zinc-900/10 dark:focus:ring-white/10 transition-all outline-none font-medium"
              placeholder="验证码"
            />
            <button
              onClick={handleSendCode}
              disabled={isSending || countdown > 0}
              className={`absolute right-2 top-2 bottom-2 px-4 rounded-xl text-sm font-semibold transition-all ${isSending || countdown > 0
                ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed dark:bg-zinc-700 dark:text-zinc-500'
                : 'bg-white text-zinc-900 shadow-sm hover:scale-105 active:scale-95 dark:bg-zinc-700 dark:text-white'
                }`}
            >
              {countdown > 0 ? `${countdown}s` : '获取'}
            </button>
          </div>

          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full mt-6 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold py-4 rounded-full shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>开始使用</span>
                <ArrowRight size={20} />
              </>
            )}
          </button>

          <p className="text-xs text-center text-zinc-400 mt-6 px-4 leading-relaxed">
            未注册手机号验证后将自动创建账号，登录即代表您同意
            <button className="text-zinc-900 dark:text-white font-medium hover:underline ml-1">用户协议</button>
            <span className="mx-1">&</span>
            <button className="text-zinc-900 dark:text-white font-medium hover:underline">隐私政策</button>
          </p>
        </div>
      </div>
    </div>
  );
};
