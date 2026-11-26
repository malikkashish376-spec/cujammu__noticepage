import React, { useMemo, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider, useNotifications } from './context/NotificationContext';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import NotificationDrawer from './components/NotificationDrawer';
import PhoneSimulator from './components/PhoneSimulator';
import SubmitFormModal from './components/SubmitFormModal';
import NoticeCard from './components/NoticeCard';
import StudentDashboard from './components/StudentDashboard';
import SeniorPanel from './components/SeniorPanel';
import AdminPanel from './components/AdminPanel';
import { CUJ_CATEGORIES } from './data/initialData';
import { getTimeRemaining } from './utils/dateUtils';
import {
  Search, BellRing, LayoutGrid, Users, Clock, X, ArrowUpRight,
  GraduationCap, Sparkles, ShieldAlert
} from 'lucide-react';

const APP_VERSION = '1.0.0';

function Portal() {
  const { currentUser, isAdmin, isStudent, canPost } = useAuth();
  const {
    announcements,
    submissions,
    unreadCount,
    reminderConfig,
    lastUrgentReminder,
    reminderBannerActive,
    setReminderBannerActive,
  } = useNotifications();

  const [authOpen, setAuthOpen] = useState(false);
  const [phoneOpen, setPhoneOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [submitTarget, setSubmitTarget] = useState(null); // { notice, viewReceipt }
  const [category, setCategory] = useState('all');
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState('deadline');

  const openSubmitModal = (notice, viewReceipt = false) => {
    if (!notice) return;
    if (!currentUser) {
      setAuthOpen(true);
      return;
    }
    setSubmitTarget({ notice, viewReceipt });
  };

  const stats = useMemo(() => {
    const seatsLeft = announcements.reduce(
      (sum, a) => sum + Math.max(0, a.totalVacancies - a.filledVacancies),
      0
    );
    const pendingForMe = currentUser
      ? announcements.filter(
          (a) =>
            a.hasForm &&
            !submissions.some((s) => s.noticeId === a.id && s.studentId === currentUser.id) &&
            !getTimeRemaining(a.deadline).isExpired
        ).length
      : 0;
    return { seatsLeft, pendingForMe };
  }, [announcements, submissions, currentUser]);

  const visibleNotices = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = announcements.filter((a) => {
      const matchCategory = category === 'all' || a.category === category;
      if (!matchCategory) return false;
      if (!q) return true;
      return [a.title, a.description, a.department, (a.tags || []).join(' ')]
        .join(' ')
        .toLowerCase()
        .includes(q);
    });

    return [...list].sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.postedAt) - new Date(a.postedAt);
      if (sortBy === 'seats') {
        const leftA = a.totalVacancies - a.filledVacancies;
        const leftB = b.totalVacancies - b.filledVacancies;
        return leftA - leftB;
      }
      // deadline: urgent / closest first, expired last
      const ta = getTimeRemaining(a.deadline);
      const tb = getTimeRemaining(b.deadline);
      if (ta.isExpired !== tb.isExpired) return ta.isExpired ? 1 : -1;
      return ta.total - tb.total;
    });
  }, [announcements, category, query, sortBy]);

  const urgentTicker = announcements.filter(
    (a) => a.isUrgent || getTimeRemaining(a.deadline).isCritical
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar
        onOpenAuthModal={() => setAuthOpen(true)}
        onOpenPhoneModal={() => setPhoneOpen(true)}
        onOpenNotificationDrawer={() => setDrawerOpen(true)}
      />

      {/* Urgent ticker */}
      {urgentTicker.length > 0 && (
        <div className="bg-red-600 text-white text-xs py-1.5 overflow-hidden flex items-center">
          <span className="bg-slate-950/40 font-black uppercase tracking-wider px-2.5 py-0.5 mr-3 flex-shrink-0 text-[10px]">
            Urgent
          </span>
          <div className="overflow-hidden flex-1">
            <div className="marquee-track text-xs font-semibold">
              {[...urgentTicker, ...urgentTicker].map((a, i) => (
                <span key={`${a.id}-${i}`} className="pr-10">
                  🚨 {a.title} — deadline{' '}
                  {new Date(a.deadline).toLocaleString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6 sm:space-y-8">
        {/* Hero */}
        <section className="bg-gradient-to-br from-cuj-navy via-cuj-blue to-slate-900 text-white rounded-3xl p-6 sm:p-9 shadow-xl border border-white/10 relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-amber-400/10 rounded-full blur-2xl" />
          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
              <Sparkles className="w-3 h-3" /> Official Notice &amp; Reminder Portal
            </span>
            <h1 className="text-2xl sm:text-4xl font-black mt-3 leading-tight">
              Every CU Jammu notice, form and vacancy — with a reminder that does not stop.
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-2 max-w-2xl">
              Exam forms, fests, hostel allotment and recruitment in one place. Seats are tracked live and
              pending forms are pushed to your phone until you submit them.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
              <HeroStat icon={BellRing} label="Active notices" value={announcements.length} />
              <HeroStat icon={Users} label="Seats available" value={stats.seatsLeft} />
              <HeroStat icon={LayoutGrid} label="Applications" value={submissions.length} />
              <HeroStat
                icon={Clock}
                label={currentUser ? 'Pending for you' : 'Unread alerts'}
                value={currentUser ? stats.pendingForMe : unreadCount}
              />
            </div>

            {!currentUser && (
              <button
                onClick={() => setAuthOpen(true)}
                className="mt-5 inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-md"
              >
                <GraduationCap className="w-4 h-4" /> Sign in with your CU Jammu email
              </button>
            )}
          </div>
        </section>

        {/* Role dashboard */}
        {currentUser && isAdmin && <AdminPanel />}
        {currentUser && canPost && !isAdmin && (
          <SeniorPanel onSelectNotice={(notice) => openSubmitModal(notice, false)} />
        )}
        {currentUser && isStudent && (
          <StudentDashboard
            onOpenSubmitModal={openSubmitModal}
            onOpenPhoneModal={() => setPhoneOpen(true)}
          />
        )}

        {/* Filters */}
        <section className="space-y-3">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <h2 className="text-lg sm:text-xl font-black text-slate-900">
              Campus notice board
              <span className="ml-2 text-xs font-bold text-slate-400">
                {visibleNotices.length} of {announcements.length}
              </span>
            </h2>

            <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search notices, departments, tags…"
                  className="pl-9 pr-8 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-cuj-blue outline-none w-full sm:w-72"
                />
                {query && (
                  <button
                    onClick={() => setQuery('')}
                    aria-label="Clear search"
                    className="absolute right-2 top-2 text-slate-400 hover:text-slate-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="py-2 px-3 text-xs rounded-xl border border-slate-300 bg-white font-bold text-slate-700 focus:ring-2 focus:ring-cuj-blue outline-none"
              >
                <option value="deadline">Closing soonest</option>
                <option value="newest">Newest first</option>
                <option value="seats">Fewest seats left</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {CUJ_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`text-[11px] font-bold px-3 py-1.5 rounded-full border transition-all ${
                  category === cat.id
                    ? 'bg-cuj-navy text-white border-cuj-navy'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-cuj-blue hover:text-cuj-blue'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </section>

        {/* Notices */}
        <section>
          {visibleNotices.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center">
              <ShieldAlert className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h3 className="text-sm font-extrabold text-slate-900">No notices match your filters</h3>
              <p className="text-xs text-slate-500 mt-1">Try another category or clear the search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {visibleNotices.map((notice) => (
                <NoticeCard
                  key={notice.id}
                  notice={notice}
                  onOpenSubmitModal={openSubmitModal}
                />
              ))}
            </div>
          )}
        </section>

        <footer className="pt-4 pb-24 sm:pb-16 text-center text-[11px] text-slate-400">
          <p className="font-semibold text-slate-500">
            CU Jammu Campus Pulse · Central University of Jammu, Rahya-Suchani (Bagla), Samba — 181143
          </p>
          <p className="mt-1">
            Demo portal — notifications, payments and OTPs are simulated locally.
            {' '}v{APP_VERSION} · build {__BUILD_STAMP__}
          </p>
        </footer>
      </main>

      {/* Floating recurring reminder banner */}
      {reminderBannerActive && lastUrgentReminder && reminderConfig.enabled && (
        <ReminderBanner notice={lastUrgentReminder} onDismiss={() => setReminderBannerActive(false)}
          onSubmit={() => {
            const fresh = announcements.find((a) => a.id === lastUrgentReminder.id);
            if (fresh) openSubmitModal(fresh, false);
          }} />
      )}

      {/* Modals */}
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
      <NotificationDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSelectNotice={(notice) => openSubmitModal(notice, false)}
      />
      <PhoneSimulator
        isOpen={phoneOpen}
        onClose={() => setPhoneOpen(false)}
        onOpenSubmitModal={openSubmitModal}
      />
      {submitTarget && (
        <SubmitFormModal
          notice={submitTarget.notice}
          viewReceipt={submitTarget.viewReceipt}
          onClose={() => setSubmitTarget(null)}
        />
      )}
    </div>
  );
}

function ReminderBanner({ notice, onDismiss, onSubmit }) {
  const [now, setNow] = React.useState(() => getTimeRemaining(notice.deadline));

  React.useEffect(() => {
    const t = setInterval(() => setNow(getTimeRemaining(notice.deadline)), 1000);
    return () => clearInterval(t);
  }, [notice.deadline]);

  return (
    <div className="fixed bottom-3 left-3 right-3 sm:left-auto sm:right-5 sm:bottom-5 sm:max-w-sm z-40">
      <div className="pulse-glow-red bg-white border-2 border-red-400 rounded-2xl shadow-2xl p-3.5 animate-slide-up">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-red-700">
            <BellRing className="w-3.5 h-3.5 animate-pulse" />
            Form pending — repeated reminder
          </div>
          <button onClick={onDismiss} aria-label="Dismiss reminder" className="text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs font-extrabold text-slate-900 mt-1 line-clamp-2">{notice.title}</p>
        <div className="flex items-center justify-between mt-2 text-[11px] font-mono font-bold">
          <span className="text-red-600">
            {now.isExpired
              ? 'Deadline passed'
              : `${now.days}d ${String(now.hours).padStart(2, '0')}h : ${String(now.minutes).padStart(2, '0')}m : ${String(now.seconds).padStart(2, '0')}s left`}
          </span>
          <button
            onClick={onSubmit}
            className="bg-cuj-navy hover:bg-cuj-blue text-white text-[10px] font-black px-2.5 py-1.5 rounded-lg flex items-center gap-1"
          >
            Submit now <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

function HeroStat({ icon: Icon, label, value }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
      <Icon className="w-3.5 h-3.5 text-amber-300 mb-1" />
      <div className="text-lg font-black leading-none">{value}</div>
      <div className="text-[10px] text-slate-300 font-semibold mt-0.5">{label}</div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Portal />
      </NotificationProvider>
    </AuthProvider>
  );
}
