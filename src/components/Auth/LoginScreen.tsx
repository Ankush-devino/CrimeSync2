import React, { useState } from 'react';
import {
  Shield,
  Lock,
  Scale,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  X,
  PhoneCall,
  Mail,
  Building,
  KeyRound,
  FileKey,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LoginScreen: React.FC = () => {
  const { login } = useAuth();

  const [officerIdentifier, setOfficerIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!officerIdentifier.trim()) {
      setErrorMessage('Please enter your Officer ID, Badge Number, or Government Email.');
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    try {
      const result = await login(officerIdentifier, password, rememberDevice);
      if (!result.success) {
        setErrorMessage(result.error || 'Authentication failed. Please verify your credentials.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Connection to NIC Secure Gateway failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#020612] text-slate-100 flex flex-col justify-between select-none relative overflow-x-hidden font-sans">
      {/* ─── CYBER BACKGROUND GRID & AMBIENT GLOWS ────────────────────── */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e3a8a_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* ─── TOP GOVERNMENT BANNER ─────────────────────────────────────── */}
      <header className="relative z-10 w-full border-b border-slate-800/80 bg-[#04091a]/95 backdrop-blur-md px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-[#081534] border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-[0_0_15px_rgba(37,99,235,0.3)]">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-extrabold text-amber-400 tracking-wider uppercase flex items-center gap-1.5">
              <span>National Crime Records Bureau (NCRB)</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-300">Ministry of Home Affairs</span>
            </div>
            <h1 className="text-sm sm:text-base font-extrabold text-white tracking-wide">
              CRIMINALINK AI <span className="text-blue-400 font-mono text-xs font-semibold">/ National Intelligence Network</span>
            </h1>
          </div>
        </div>

        {/* Passive Security Badges */}
        <div className="hidden sm:flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>NIC Secure Gateway (Active)</span>
          </div>
          <div className="text-xs font-mono text-slate-400 border-l border-slate-800 pl-3 flex items-center gap-2">
            <span>ISO 27001 Certified</span>
            <span className="text-slate-600">•</span>
            <span className="text-cyan-400 font-bold">TLS 1.3 Encrypted</span>
          </div>
        </div>
      </header>

      {/* ─── MAIN SECURE AUTHENTICATION CONTAINER ──────────────────────── */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md bg-[#050e24]/95 border border-slate-700/80 rounded-2xl shadow-2xl backdrop-blur-xl p-7 sm:p-8 space-y-6">
          {/* Form Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-950/90 border border-blue-500/50 text-blue-400 mb-1 shadow-[0_0_20px_rgba(37,99,235,0.3)]">
              <Shield className="w-6 h-6" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Officer Portal Sign In
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Enter your official NCRB / Police credentials to establish an authenticated, RBAC-protected intelligence session.
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 rounded-lg bg-red-950/80 border border-red-500/60 text-red-200 text-xs flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="leading-snug">
                <span className="font-bold">Access Denied: </span>
                {errorMessage}
              </div>
            </div>
          )}

          {/* Secure Login Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {/* Officer ID / Email */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300">
                Officer ID / Badge Number / Email
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={officerIdentifier}
                  onChange={(e) => {
                    setOfficerIdentifier(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="e.g. DEL-IPS-8821 or officer@delhipolice.gov.in"
                  className="w-full bg-[#030818] border border-slate-700 focus:border-blue-400 rounded-lg pl-3.5 pr-10 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-400 font-sans transition-all"
                />
                <KeyRound className="absolute right-3 top-3 w-4 h-4 text-slate-500" />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="••••••••••••"
                  className="w-full bg-[#030818] border border-slate-700 focus:border-blue-400 rounded-lg pl-3.5 pr-10 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-400 font-mono transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Device Checkbox */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberDevice}
                  onChange={(e) => setRememberDevice(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-[#030818] text-blue-600 focus:ring-blue-500 focus:ring-offset-[#050e24]"
                />
                <span className="text-xs text-slate-300 font-medium">Remember this device</span>
              </label>

              <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                <Lock className="w-3 h-3 text-emerald-400" />
                <span>256-Bit Encrypted</span>
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !officerIdentifier.trim()}
              className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-[0_0_15px_rgba(37,99,235,0.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all mt-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Authenticating against PostgreSQL Registry...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Secure Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Security & Access Notice */}
          <div className="p-3 rounded-lg bg-[#030818] border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-300 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>Role-Based Case Access (RBAC)</span>
            </div>
            <p className="leading-relaxed">
              Upon login, the system validates credentials against PostgreSQL, issues a secure JWT token, and dynamically loads assigned investigation dockets.
            </p>
          </div>
        </div>
      </main>

      {/* ─── FORGOT PASSWORD ASSISTANCE MODAL ──────────────────────────── */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#050e24] border border-slate-700 rounded-xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <FileKey className="w-4 h-4 text-blue-400" />
                <span>Government Officer Password Assistance</span>
              </div>
              <button
                onClick={() => setShowForgotModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              In accordance with Ministry of Home Affairs security protocols, officer password resets require identity re-validation through your designated Department Security Officer (DSO).
            </p>

            <div className="space-y-2 p-3 bg-[#030818] border border-slate-800 rounded-lg text-xs">
              <div className="flex items-center gap-2 text-slate-200">
                <Building className="w-4 h-4 text-blue-400 shrink-0" />
                <span><strong>NCRB Cyber Helpdesk:</strong> Extension 8840 / 8841</span>
              </div>
              <div className="flex items-center gap-2 text-slate-200">
                <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
                <span><strong>NIC Nodal Officer:</strong> support.ncrb@nic.in</span>
              </div>
              <div className="flex items-center gap-2 text-slate-200">
                <PhoneCall className="w-4 h-4 text-emerald-400 shrink-0" />
                <span><strong>Toll-Free Cyber Helpline:</strong> 1930</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition-colors"
              >
                Close & Return to Sign In
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── BOTTOM STATUTORY FOOTER ───────────────────────────────────── */}
      <footer className="relative z-10 w-full border-t border-slate-800/80 bg-[#030716] px-6 py-3.5 text-center text-[10px] text-slate-400 space-y-1">
        <p className="font-mono text-slate-300 font-semibold tracking-wider">
          GOVERNMENT OF INDIA • NATIONAL CRIME RECORDS BUREAU • CYBER CRIME INVESTIGATION PLATFORM
        </p>
        <p className="text-slate-400 max-w-4xl mx-auto leading-relaxed">
          Authorized access only. Monitored and protected under Section 43, 66 & 66F of the Information Technology Act 2000.
          All login attempts, IP addresses, and session timestamps are cryptographically recorded in compliance with CERT-In guidelines.
        </p>
      </footer>
    </div>
  );
};
