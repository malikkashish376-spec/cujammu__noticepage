import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { initialsAvatar } from '../utils/avatar';
import {
  Bell, Smartphone, Volume2, VolumeX,
  LogOut, Shield, GraduationCap, Users, ChevronDown,
  Radio, Briefcase, User as UserIcon
} from 'lucide-react';

const ROLE_META = {
  admin:     { label: 'Admin',          color: 'rose',   Icon: Shield },
  faculty:   { label: 'Faculty',        color: 'purple', Icon: Briefcase },
  senior:    { label: 'Senior',         color: 'amber',  Icon: Users },
  organizer: { label: 'Organizer',      color: 'teal',   Icon: UserIcon },
  student:   { label: 'Student',        color: 'blue',   Icon: GraduationCap },
};

const roleBg = {
  rose:   'bg-rose-50 border-rose-200 text-rose-800',
  purple: 'bg-purple-50 border-purple-200 text-purple-800',
  amber:  'bg-amber-50 border-amber-200 text-amber-800',
  teal:   'bg-teal-50 border-teal-200 text-teal-800',
  blue:   'bg-blue-50 border-blue-200 text-blue-800',
};

export default function Navbar({ onOpenAuthModal, onOpenPhoneModal, onOpenNotificationDrawer }) {
  const { currentUser, logout } = useAuth();
  const { unreadCount, reminderConfig, toggleSound } = useNotifications();
  const [profileOpen, setProfileOpen] = useState(false);

  const meta = currentUser ? ROLE_META[currentUser.role] || ROLE_META.student : null;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">

      {/* Govt ribbon */}
      <div className="bg-gradient-to-r from-cuj-navy via-cuj-blue to-cuj-dark text-white text-xs px-3 sm:px-4 py-1.5 flex flex-wrap justify-between items-center gap-y-1 border-b border-white/10">
        <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 font-medium">
          <span className="bg-amber-400 text-slate-900 px-1.5 py-0.5 rounded font-bold text-[10px] tracking-wider uppercase flex-shrink-0">
            Govt. of India
          </span>
          <span className="text-slate-200 text-[11px]">
            जम्मू केंद्रीय विश्वविद्यालय | Central University of Jammu
          </span>
          <span className="text-amber-300 font-semibold text-[10px] hidden sm:inline">
            • Rahya-Suchani (Bagla), Samba - 181143
          </span>
        </div>
        <div className="flex items-center space-x-2 text-[10px] sm:text-[11px] flex-shrink-0">
          <div className="flex items-center space-x-1.5 bg-red-500/20 text-red-200 border border-red-500/30 px-2 py-0.5 rounded-full animate-pulse">
            <Radio className="w-2.5 h-2.5 text-red-400 animate-spin" />
            <span className="font-semibold">LIVE NOTIFIER</span>
          </div>
          <span className="text-slate-300 hidden md:inline">Phone Alert & Recurring Reminder Active</span>
        </div>
      </div>

      {/* Main bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center min-h-[4rem] sm:min-h-[4.5rem] py-2 gap-2">

          {/* Logo */}
          <div
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-gradient-to-br from-cuj-navy to-cuj-blue p-0.5 shadow-md flex items-center justify-center flex-shrink-0 border-2 border-amber-400/80">
              <div className="w-full h-full bg-cuj-navy rounded-[14px] flex flex-col items-center justify-center text-center p-1 text-amber-400">
                <span className="text-lg">🏛️</span>
                <span className="text-[8px] font-black uppercase tracking-tighter text-amber-300">CUJ</span>
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-black text-slate-900 text-sm sm:text-lg tracking-tight leading-none">
                  CU JAMMU <span className="text-cuj-blue">CAMPUS PULSE</span>
                </h1>
                <span className="hidden lg:inline-block bg-blue-100 text-cuj-blue font-bold text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Official Portal
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5 hidden sm:block">
                Notices · Events · Exams · Vacancies · Instant Reminders
              </p>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center space-x-1.5 sm:space-x-2.5">

            {/* Phone Alert */}
            <button onClick={onOpenPhoneModal}
              className="flex items-center space-x-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold px-2.5 sm:px-3 py-2 rounded-xl text-xs shadow-md transition-all transform hover:scale-[1.03] active:scale-95">
              <div className="relative">
                <Smartphone className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-600 rounded-full animate-ping"></span>
              </div>
              <span className="hidden sm:inline font-extrabold">Phone Alerts</span>
            </button>

            {/* Sound toggle */}
            <button onClick={toggleSound}
              className={`p-2 rounded-xl border text-xs flex items-center transition-all ${
                reminderConfig.soundEnabled
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200'
              }`}>
              {reminderConfig.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Notification bell */}
            <button onClick={onOpenNotificationDrawer}
              className="relative p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all">
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center animate-bounce shadow-sm">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Profile / Sign-in */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className={`flex items-center space-x-2 px-2 sm:px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${roleBg[meta?.color || 'blue']}`}
                >
                  <meta.Icon className="w-3.5 h-3.5 flex-shrink-0" />
                  <div className="hidden sm:block text-left">
                    <div className="text-[9px] uppercase font-black tracking-wider opacity-70">{meta.label}</div>
                    <div className="font-bold text-[11px] leading-tight max-w-[90px] truncate">{currentUser.name}</div>
                  </div>
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-50 animate-slide-down">
                    <div className="flex items-center space-x-3 pb-3 mb-3 border-b border-slate-100">
                      <img src={currentUser.avatar || initialsAvatar(currentUser.name)} alt={currentUser.name}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = initialsAvatar(currentUser.name);
                        }}
                        className="w-10 h-10 rounded-xl object-cover ring-2 ring-cuj-blue/20" />
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 text-sm truncate">{currentUser.name}</div>
                        <div className={`text-[10px] font-black uppercase tracking-wider ${roleBg[meta?.color || 'blue']} inline-block px-1.5 py-0.5 rounded mt-0.5`}>
                          {meta?.label}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">{currentUser.idNumber}</div>
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-500 space-y-0.5 pb-3 mb-3 border-b border-slate-100">
                      <div className="truncate">📧 {currentUser.email}</div>
                      {currentUser.phone && <div>📞 {currentUser.phone}</div>}
                      <div className="truncate">🏛️ {currentUser.department}</div>
                    </div>
                    <button onClick={() => { logout(); setProfileOpen(false); }}
                      className="w-full text-xs font-bold text-red-600 hover:text-red-700 py-2 px-3 rounded-xl hover:bg-red-50 flex items-center space-x-2 transition-colors">
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={onOpenAuthModal}
                className="bg-cuj-navy hover:bg-cuj-blue text-white font-bold text-xs sm:text-sm px-3.5 py-2 rounded-xl transition-all shadow-sm">
                Sign In
              </button>
            )}

          </div>
        </div>
      </div>
    </header>
  );
}
