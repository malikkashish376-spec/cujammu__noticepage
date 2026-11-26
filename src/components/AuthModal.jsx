import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { sendOtp, verifyOtp, getOtpRemainingSeconds } from '../utils/emailOtp';
import { CUJ_DEPARTMENTS } from '../data/initialData';
import {
  X, Mail, KeyRound, ArrowRight, ArrowLeft,
  Loader2, CheckCircle2, AlertCircle, RefreshCw,
  User, Phone, Building, GraduationCap, Shield,
  Users, Briefcase, Eye, EyeOff, Info, Terminal
} from 'lucide-react';

const ROLE_OPTIONS = [
  { value: 'student',   label: 'Student',              icon: GraduationCap, color: 'blue',   desc: 'UG / PG / Ph.D. student enrolled at CUJ' },
  { value: 'senior',    label: 'Senior / Student Lead', icon: Users,         color: 'amber',  desc: 'Student Council, Club President, Head Boy/Girl' },
  { value: 'faculty',   label: 'Faculty / Professor',   icon: Briefcase,     color: 'purple', desc: 'Teaching or non-teaching staff member' },
  { value: 'organizer', label: 'Event Organizer',        icon: User,          color: 'teal',   desc: 'NSS, NCC, Sports & Cultural event coordinator' },
];

const colorMap = {
  blue:   { ring: 'ring-blue-500',   bg: 'bg-blue-50',   text: 'text-blue-800',   border: 'border-blue-200',   btn: 'bg-blue-600 hover:bg-blue-700' },
  amber:  { ring: 'ring-amber-500',  bg: 'bg-amber-50',  text: 'text-amber-800',  border: 'border-amber-200',  btn: 'bg-amber-600 hover:bg-amber-700' },
  purple: { ring: 'ring-purple-500', bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200', btn: 'bg-purple-600 hover:bg-purple-700' },
  teal:   { ring: 'ring-teal-500',   bg: 'bg-teal-50',   text: 'text-teal-800',   border: 'border-teal-200',   btn: 'bg-teal-600 hover:bg-teal-700' },
};

// Step machine:
// 'email'       → user enters email
// 'otp'         → user enters OTP
// 'register'    → new user fills registration form
// 'otp_reg'     → OTP for newly registered user
// 'success'     → done

export default function AuthModal({ isOpen, onClose }) {
  const { lookupEmail, confirmLogin, register, confirmRegistration } = useAuth();
  const { dispatchNotification } = useNotifications();

  const [step, setStep]           = useState('email');
  const [email, setEmail]         = useState('');
  const [otp, setOtp]             = useState(['', '', '', '', '', '']);
  const [regData, setRegData]     = useState({
    name: '', phone: '', role: 'student', department: CUJ_DEPARTMENTS[0], semester: '1st Semester', designation: ''
  });
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [devOtp, setDevOtp]       = useState(''); // shown only in dev mode
  const [countdown, setCountdown] = useState(0);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [pendingUser, setPendingUser] = useState(null); // found user from lookupEmail

  // OTP countdown
  useEffect(() => {
    if (step !== 'otp' && step !== 'otp_reg') return;
    const interval = setInterval(() => {
      const rem = getOtpRemainingSeconds(email);
      setCountdown(rem);
      if (rem === 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [step, email]);

  // Resend cooldown ticker
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const resetState = () => {
    setStep('email'); setEmail(''); setOtp(['', '', '', '', '', '']);
    setError(''); setDevOtp(''); setLoading(false); setPendingUser(null);
    setCountdown(0); setResendCooldown(0);
  };

  if (!isOpen) return null;

  // ── Helpers ──────────────────────────────────────────────────────────────

  const otpString = otp.join('');

  const handleOtpChange = (idx, val) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[idx] = val.slice(-1);
    setOtp(next);
    if (val && idx < 5) {
      document.getElementById(`otp-${idx + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      document.getElementById(`otp-${idx - 1}`)?.focus();
    }
  };

  // Paste handler — allows pasting full 6-digit OTP
  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      e.preventDefault();
    }
  };

  // ── Step: Email submit ────────────────────────────────────────────────────

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const trimmed = email.trim().toLowerCase();
    if (!trimmed.includes('@')) { setError('Please enter a valid email address.'); return; }

    setLoading(true);
    const lookup = lookupEmail(trimmed);

    if (lookup.found) {
      // Existing user → send OTP
      const res = await sendOtp(trimmed, lookup.user.name);
      setLoading(false);
      if (!res.success) { setError(res.error || 'Failed to send OTP. Please try again.'); return; }
      if (res.devMode) setDevOtp(res.otp);
      setPendingUser(lookup.user);
      setCountdown(600);
      setResendCooldown(30);
      setStep('otp');
    } else {
      // New user → registration form
      setLoading(false);
      setStep('register');
    }
  };

  // ── Step: OTP verify (existing user) ─────────────────────────────────────

  const handleOtpVerify = (e) => {
    e.preventDefault();
    setError('');
    const result = verifyOtp(email, otpString);
    if (!result.valid) { setError(result.error); return; }
    const login = confirmLogin(email);
    if (!login.success) { setError(login.error || 'Could not sign you in. Please try again.'); return; }
    if (login.success) {
      dispatchNotification({
        title: `✅ Welcome back, ${login.user.name}!`,
        body: `You are signed in as ${login.user.role.toUpperCase()} on CU Jammu Campus Pulse.`,
        type: 'success',
      });
      setStep('success');
      setTimeout(() => { resetState(); onClose(); }, 1500);
    }
  };

  // ── Step: Registration form submit ───────────────────────────────────────

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (!regData.name.trim()) { setError('Full name is required.'); return; }
    if (!regData.phone.trim()) { setError('Phone number is required.'); return; }

    const res = register({ ...regData, email });
    if (!res.success) { setError(res.error); return; }

    // Send OTP to newly registered email
    setLoading(true);
    const otpRes = await sendOtp(email, regData.name);
    setLoading(false);
    if (!otpRes.success) { setError(otpRes.error || 'Could not send verification OTP.'); return; }
    if (otpRes.devMode) setDevOtp(otpRes.otp);
    setPendingUser(res.user);
    setCountdown(600);
    setResendCooldown(30);
    setStep('otp_reg');
  };

  // ── Step: OTP verify (new registration) ──────────────────────────────────

  const handleRegOtpVerify = (e) => {
    e.preventDefault();
    setError('');
    const result = verifyOtp(email, otpString);
    if (!result.valid) { setError(result.error); return; }
    const login = confirmRegistration(email);
    if (!login.success) { setError(login.error || 'Could not activate your account. Please try again.'); return; }
    if (login.success) {
      dispatchNotification({
        title: `🎉 Welcome to CU Jammu Campus Pulse, ${login.user.name}!`,
        body: `Your account (ID: ${login.user.idNumber}) is verified. You will now receive real-time campus notifications.`,
        type: 'success',
      });
      setStep('success');
      setTimeout(() => { resetState(); onClose(); }, 1600);
    }
  };

  // ── Resend OTP ────────────────────────────────────────────────────────────

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError('');
    setOtp(['', '', '', '', '', '']);
    setLoading(true);
    const name = pendingUser?.name || regData.name || 'User';
    const res = await sendOtp(email, name);
    setLoading(false);
    if (res.devMode) setDevOtp(res.otp);
    setCountdown(600);
    setResendCooldown(30);
  };

  // ── Formatting ────────────────────────────────────────────────────────────

  const fmtCountdown = (s) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const roleInfo = ROLE_OPTIONS.find(r => r.value === regData.role) || ROLE_OPTIONS[0];
  const colors   = colorMap[roleInfo.color];

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-cuj-navy to-cuj-blue text-white p-5 sm:p-6 flex justify-between items-start">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-widest text-amber-300 mb-1">
              Central University of Jammu
            </div>
            <h2 className="text-xl font-black text-white leading-tight">
              {step === 'email'   && 'Sign In / Register'}
              {step === 'otp'     && 'Enter OTP Code'}
              {step === 'register'&& 'Create Your Account'}
              {step === 'otp_reg' && 'Verify Your Email'}
              {step === 'success' && 'Signed In!'}
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Secure Email OTP Authentication — No passwords stored
            </p>
          </div>
          <button onClick={() => { resetState(); onClose(); }}
            className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6">

          {/* ── SUCCESS ── */}
          {step === 'success' && (
            <div className="text-center py-6 space-y-3">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-lg font-black text-slate-900">You're in!</h3>
              <p className="text-xs text-slate-500">Redirecting to your dashboard…</p>
            </div>
          )}

          {/* ── STEP 1: Email Input ── */}
          {step === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Enter your <strong>official CU Jammu email address</strong>. We'll send a one-time verification code to it.
              </p>

              {error && <ErrorBanner msg={error} />}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Official CU Jammu Email *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="email" required autoFocus
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="yourname@cujammu.ac.in  or  yourname@cujstudent.ac.in"
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-cuj-blue outline-none"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Staff: @cujammu.ac.in &nbsp;|&nbsp; Students: @cujstudent.ac.in
                </p>
              </div>

              {/* Registered email directory hint */}
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3 text-[11px] text-blue-800 space-y-1">
                <p className="font-bold flex items-center space-x-1">
                  <Info className="w-3.5 h-3.5 text-blue-600" />
                  <span>Pre-registered demo accounts:</span>
                </p>
                <ul className="pl-2 space-y-0.5 text-blue-700 font-mono">
                  <li>🛡️ <strong>Admin:</strong> coe.admin@cujammu.ac.in</li>
                  <li>👨‍🏫 <strong>Faculty:</strong> meenakshi.rajput@cujammu.ac.in</li>
                  <li>🏅 <strong>Senior:</strong> rahul.jamwal@cujstudent.ac.in</li>
                  <li>📋 <strong>Organizer:</strong> nss.organizer@cujammu.ac.in</li>
                  <li>🎓 <strong>Student:</strong> priya.sharma2024@cujstudent.ac.in</li>
                  <li>🎓 <strong>Student:</strong> aman.verma2023@cujstudent.ac.in</li>
                </ul>
              </div>

              <button type="submit" disabled={loading}
                className="w-full bg-cuj-navy hover:bg-cuj-blue text-white font-black text-sm py-3 rounded-xl transition-all flex items-center justify-center space-x-2 shadow-sm disabled:opacity-60">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                <span>{loading ? 'Sending OTP…' : 'Send OTP to My Email'}</span>
              </button>
            </form>
          )}

          {/* ── STEP 2: OTP Entry (existing user) ── */}
          {(step === 'otp' || step === 'otp_reg') && (
            <form onSubmit={step === 'otp' ? handleOtpVerify : handleRegOtpVerify} className="space-y-4">

              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-xs text-emerald-800">
                <p className="font-bold">OTP sent to:</p>
                <p className="font-mono text-emerald-700 mt-0.5">{email}</p>
                {step === 'otp' && pendingUser && (
                  <p className="mt-1 text-[11px] text-emerald-600">
                    Welcome back, <strong>{pendingUser.name}</strong> ({pendingUser.role.toUpperCase()})
                  </p>
                )}
              </div>

              {/* DEV MODE banner */}
              {devOtp && <DevOtpBanner otp={devOtp} />}

              {error && <ErrorBanner msg={error} />}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 text-center">
                  Enter 6-digit OTP
                </label>
                <div className="flex justify-center space-x-2" onPaste={handleOtpPaste}>
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`otp-${idx}`}
                      type="text" inputMode="numeric" maxLength={1}
                      value={digit}
                      onChange={e => handleOtpChange(idx, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(idx, e)}
                      className="w-11 h-14 text-center text-xl font-black rounded-xl border-2 border-slate-300 focus:border-cuj-blue focus:ring-2 focus:ring-cuj-blue/30 outline-none transition-all bg-slate-50 focus:bg-white"
                    />
                  ))}
                </div>
                <p className="text-center text-[11px] text-slate-400 mt-2">
                  {countdown > 0 ? (
                    <>Code valid for <strong className="text-slate-700 font-mono">{fmtCountdown(countdown)}</strong></>
                  ) : (
                    <span className="text-red-600 font-bold">OTP expired — please resend</span>
                  )}
                </p>
              </div>

              <button type="submit" disabled={otpString.length < 6}
                className="w-full bg-cuj-navy hover:bg-cuj-blue text-white font-black text-sm py-3 rounded-xl transition-all flex items-center justify-center space-x-2 shadow-sm disabled:opacity-50">
                <KeyRound className="w-4 h-4" />
                <span>Verify OTP & Sign In</span>
              </button>

              <div className="flex items-center justify-between text-xs">
                <button type="button"
                  onClick={() => { setStep('email'); setOtp(['','','','','','']); setError(''); setDevOtp(''); }}
                  className="text-slate-500 hover:text-slate-800 flex items-center space-x-1">
                  <ArrowLeft className="w-3.5 h-3.5" /> <span>Change email</span>
                </button>
                <button type="button"
                  onClick={handleResend}
                  disabled={resendCooldown > 0 || loading}
                  className="text-cuj-blue hover:text-cuj-navy font-bold flex items-center space-x-1 disabled:opacity-50">
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span>{resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}</span>
                </button>
              </div>
            </form>
          )}

          {/* ── STEP 3: Registration Form ── */}
          {step === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                <strong>{email}</strong> is not registered yet. Fill in your details to create your CU Jammu account.
              </p>

              {error && <ErrorBanner msg={error} />}

              {/* Role Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Select Your Role *</label>
                <div className="grid grid-cols-2 gap-2">
                  {ROLE_OPTIONS.map(opt => {
                    const c = colorMap[opt.color];
                    const isSelected = regData.role === opt.value;
                    return (
                      <button
                        key={opt.value} type="button"
                        onClick={() => setRegData(d => ({ ...d, role: opt.value }))}
                        className={`flex items-center space-x-2 p-2.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? `${c.bg} ${c.border} ${c.text} ring-2 ${c.ring}`
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <opt.icon className={`w-4 h-4 flex-shrink-0 ${isSelected ? c.text : 'text-slate-400'}`} />
                        <div>
                          <div className="text-xs font-bold">{opt.label}</div>
                          <div className="text-[10px] text-slate-400 font-normal leading-tight">{opt.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                  <input type="text" required value={regData.name}
                    onChange={e => setRegData(d => ({ ...d, name: e.target.value }))}
                    placeholder="As per university records"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-cuj-blue outline-none" />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number (for Reminders) *</label>
                  <input type="tel" required value={regData.phone}
                    onChange={e => setRegData(d => ({ ...d, phone: e.target.value }))}
                    placeholder="+91 94190 00000"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-cuj-blue outline-none" />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Department *</label>
                  <select value={regData.department}
                    onChange={e => setRegData(d => ({ ...d, department: e.target.value }))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-cuj-blue outline-none">
                    {CUJ_DEPARTMENTS.map((dept, i) => <option key={i} value={dept}>{dept}</option>)}
                  </select>
                </div>

                {regData.role === 'student' && (
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Current Semester</label>
                    <input type="text" value={regData.semester}
                      onChange={e => setRegData(d => ({ ...d, semester: e.target.value }))}
                      placeholder="e.g. 3rd Semester"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-cuj-blue outline-none" />
                  </div>
                )}

                {(regData.role !== 'student') && (
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Designation</label>
                    <input type="text" value={regData.designation}
                      onChange={e => setRegData(d => ({ ...d, designation: e.target.value }))}
                      placeholder="e.g. Assistant Professor / Club Secretary"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-cuj-blue outline-none" />
                  </div>
                )}
              </div>

              <button type="submit" disabled={loading}
                className={`w-full text-white font-black text-sm py-3 rounded-xl transition-all flex items-center justify-center space-x-2 shadow-sm disabled:opacity-60 ${colors.btn}`}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                <span>{loading ? 'Creating account…' : 'Create Account & Send OTP'}</span>
              </button>

              <button type="button"
                onClick={() => { setStep('email'); setError(''); }}
                className="w-full text-xs text-slate-500 hover:text-slate-800 flex items-center justify-center space-x-1 py-1">
                <ArrowLeft className="w-3.5 h-3.5" /> <span>Back to email</span>
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function ErrorBanner({ msg }) {
  return (
    <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl flex items-start space-x-2">
      <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
      <span>{msg}</span>
    </div>
  );
}

function DevOtpBanner({ otp }) {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return (
    <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3 text-xs relative">
      <button onClick={() => setVisible(false)}
        className="absolute top-2 right-2 text-amber-400 hover:text-amber-700">
        <X className="w-3.5 h-3.5" />
      </button>
      <div className="flex items-center space-x-1.5 text-amber-800 font-bold mb-1">
        <Terminal className="w-3.5 h-3.5 text-amber-600" />
        <span>DEV MODE — EmailJS not configured yet</span>
      </div>
      <p className="text-amber-700 text-[11px] mb-2">
        Your OTP is shown here because real email sending requires EmailJS setup (see <code className="bg-amber-100 px-1 rounded">src/config/emailjsConfig.js</code>).
      </p>
      <div className="bg-white border border-amber-300 rounded-xl px-4 py-2 text-center">
        <span className="text-2xl font-black tracking-[0.3em] text-slate-900 font-mono">{otp}</span>
      </div>
    </div>
  );
}
