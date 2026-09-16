import React, { useState, useEffect, useRef } from 'react';
import { Lock, ShieldCheck, AlertCircle, Delete, KeyRound } from 'lucide-react';
import { TravelCareLogo } from './TravelCareLogo';

interface PinLockScreenProps {
  onUnlock: (remember: boolean) => void;
  companyName?: string;
}

const CORRECT_PIN = '2030';

export const PinLockScreen: React.FC<PinLockScreenProps> = ({
  onUnlock,
  companyName = 'Travel Care Tours Pvt Ltd',
}) => {
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [rememberDevice, setRememberDevice] = useState<boolean>(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDigit = (digit: string) => {
    if (pin.length >= 4) return;
    setError('');
    const newPin = pin + digit;
    setPin(newPin);

    if (newPin.length === 4) {
      validatePin(newPin);
    }
  };

  const handleBackspace = () => {
    setError('');
    setPin((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setError('');
    setPin('');
  };

  const validatePin = (inputPin: string) => {
    if (inputPin === CORRECT_PIN) {
      setError('');
      onUnlock(rememberDevice);
    } else {
      setIsShaking(true);
      setError('Incorrect PIN. Please try again.');
      setTimeout(() => {
        setIsShaking(false);
        setPin('');
      }, 500);
    }
  };

  // Listen for physical keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Numbers 0-9
      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === 'Escape' || e.key === 'Delete') {
        e.preventDefault();
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pin, rememberDevice]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 flex flex-col justify-center items-center px-4 py-8 select-none text-slate-100 font-sans">
      <div 
        ref={containerRef}
        className={`w-full max-w-sm bg-slate-900/95 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl transition-all duration-200 ${
          isShaking ? 'animate-[shake_0.5s_ease-in-out]' : ''
        }`}
      >
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 bg-white rounded-2xl p-2 flex items-center justify-center shadow-lg shadow-blue-500/10 mb-4 ring-1 ring-white/10">
            <TravelCareLogo size="sm" showText={false} customLogoUrl="invoice/Logo/TC Logo.png" className="w-12 h-12" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-2">
            <Lock className="w-3.5 h-3.5" />
            <span>Staff Portal Access</span>
          </div>

          <h1 className="text-xl font-black tracking-tight text-white">
            {companyName}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Trip Billing, Ledger & Fleet Management
          </p>
        </div>

        {/* PIN Dots Display */}
        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center justify-center gap-4 my-2">
            {[0, 1, 2, 3].map((index) => {
              const hasDigit = pin.length > index;
              return (
                <div
                  key={index}
                  className={`w-4 h-4 rounded-full transition-all duration-200 ${
                    hasDigit
                      ? 'bg-blue-500 scale-125 shadow-lg shadow-blue-500/50'
                      : 'bg-slate-700/80 border border-slate-600'
                  }`}
                />
              );
            })}
          </div>

          {/* Feedback Message */}
          <div className="h-5 mt-2 flex items-center justify-center">
            {error ? (
              <div className="flex items-center gap-1 text-xs text-rose-400 font-semibold animate-in fade-in duration-200">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            ) : (
              <span className="text-[11px] text-slate-500">
                Enter your 4-digit staff PIN
              </span>
            )}
          </div>
        </div>

        {/* On-Screen Numeric Keypad */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3 mb-6">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleDigit(num)}
              className="h-14 sm:h-16 rounded-2xl bg-slate-800/80 hover:bg-slate-750 active:bg-blue-600 active:scale-95 text-xl font-bold text-white border border-slate-700/70 transition-all flex items-center justify-center shadow-xs cursor-pointer focus:outline-none"
            >
              {num}
            </button>
          ))}

          {/* Clear Button */}
          <button
            type="button"
            onClick={handleClear}
            className="h-14 sm:h-16 rounded-2xl bg-slate-800/40 hover:bg-slate-800 active:scale-95 text-xs font-semibold text-slate-400 hover:text-slate-200 border border-slate-800 transition-all flex items-center justify-center cursor-pointer focus:outline-none"
          >
            Clear
          </button>

          {/* Zero Button */}
          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="h-14 sm:h-16 rounded-2xl bg-slate-800/80 hover:bg-slate-750 active:bg-blue-600 active:scale-95 text-xl font-bold text-white border border-slate-700/70 transition-all flex items-center justify-center shadow-xs cursor-pointer focus:outline-none"
          >
            0
          </button>

          {/* Backspace Button */}
          <button
            type="button"
            onClick={handleBackspace}
            aria-label="Delete last digit"
            className="h-14 sm:h-16 rounded-2xl bg-slate-800/40 hover:bg-slate-800 active:scale-95 text-slate-400 hover:text-slate-200 border border-slate-800 transition-all flex items-center justify-center cursor-pointer focus:outline-none"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Remember Device Checkbox */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberDevice}
              onChange={(e) => setRememberDevice(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 bg-slate-800 border-slate-700 focus:ring-blue-500 focus:ring-offset-slate-900 cursor-pointer"
            />
            <span>Remember on this browser</span>
          </label>

          <div className="flex items-center gap-1 text-[11px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Encrypted</span>
          </div>
        </div>
      </div>

      {/* Security notice footer */}
      <div className="mt-6 text-center text-xs text-slate-500 flex items-center gap-1.5">
        <KeyRound className="w-3.5 h-3.5 text-slate-400" />
        <span>Restricted internal tool for Travel Care authorized staff only</span>
      </div>
    </div>
  );
};
