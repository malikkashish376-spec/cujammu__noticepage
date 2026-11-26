import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { getTimeRemaining, formatDeadline, formatCurrency } from '../utils/dateUtils';
import {
  Clock,
  Users,
  CheckCircle,
  Send,
  ArrowRight,
  Building2,
  FileCheck2,
  Share2,
  Check
} from 'lucide-react';

export default function NoticeCard({ notice, onOpenSubmitModal }) {
  // FIX 1: isFaculty and isOrganizer were used below but never destructured,
  // which threw a ReferenceError on render. Make sure AuthContext exposes them.
  const { currentUser, isStudent, isAdmin, isSenior, isFaculty, isOrganizer } = useAuth();
  const { submissions, broadcastManualReminder } = useNotifications();

  const [timeLeft, setTimeLeft] = useState(() => getTimeRemaining(notice.deadline));
  const [copied, setCopied] = useState(false);
  const [reminderSentNotice, setReminderSentNotice] = useState(false);

  // FIX 2: track one-off timeouts so they are cleared if the card unmounts.
  const timeouts = useRef([]);
  const later = (fn, ms) => {
    timeouts.current.push(setTimeout(fn, ms));
  };
  useEffect(() => {
    const pending = timeouts.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  // FIX 3: sync immediately when the deadline changes, and stop ticking once expired.
  useEffect(() => {
    let timer;
    const tick = () => {
      const t = getTimeRemaining(notice.deadline);
      setTimeLeft(t);
      if (t.isExpired) clearInterval(timer);
    };
    tick();
    timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [notice.deadline]);

  // Check if current logged in student has already submitted this form
  const studentSubmission =
    isStudent && currentUser
      ? submissions.find(s => s.noticeId === notice.id && s.studentId === currentUser.id)
      : null;

  // FIX 4: guard against missing values and division by zero (was NaN% when total = 0).
  const totalVacancies = Number(notice.totalVacancies) || 0;
  const filledVacancies = Number(notice.filledVacancies) || 0;
  const vacanciesLeft = Math.max(0, totalVacancies - filledVacancies);
  const percentFilled =
    totalVacancies > 0
      ? Math.min(100, Math.round((filledVacancies / totalVacancies) * 100))
      : 0;

  const handleSendReminder = () => {
    broadcastManualReminder(notice.id);
    setReminderSentNotice(true);
    later(() => setReminderSentNotice(false), 3000);
  };

  // FIX 5: writeText returns a promise that can reject (permissions, insecure
  // context). Only show the "copied" tick after it actually succeeds.
  const handleShare = async () => {
    const text = `CU Jammu Announcement: ${notice.title} | Deadline: ${new Date(
      notice.deadline
    ).toLocaleDateString()} | Vacancies: ${vacanciesLeft} | Fee: ${formatCurrency(notice.fee)}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      later(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable or blocked; nothing to confirm.
    }
  };

  // Category Color Map
  const getCategoryBadge = (category) => {
    switch (category) {
      case 'exams':
        return { label: 'Examinations', bg: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'events':
        return { label: 'Event / Fest', bg: 'bg-amber-100 text-amber-800 border-amber-200' };
      case 'vacancies':
        return { label: 'Vacancy / Job', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case 'activities':
        return { label: 'Activity / Club', bg: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'hostel':
        return { label: 'Hostel Allotment', bg: 'bg-cyan-100 text-cyan-800 border-cyan-200' };
      case 'scholarships':
        return { label: 'Scholarship', bg: 'bg-rose-100 text-rose-800 border-rose-200' };
      default:
        return { label: 'Notice', bg: 'bg-slate-100 text-slate-800 border-slate-200' };
    }
  };

  const catBadge = getCategoryBadge(notice.category);

  return (
    // FIX 6: shadow-xs only exists in Tailwind v4; shadow-sm works in v3 and v4.
    <div
      className={`bg-white rounded-3xl border transition-all duration-300 hover:shadow-xl flex flex-col justify-between overflow-hidden group ${
        notice.isUrgent || timeLeft.isUrgent
          ? 'border-red-300/80 shadow-md ring-1 ring-red-100'
          : 'border-slate-200 shadow-sm'
      }`}
    >
      {/* Top Header Card Info */}
      <div className="p-5 sm:p-6 pb-4">
        {/* Badges Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center space-x-2">
            <span
              className={`text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${catBadge.bg}`}
            >
              {catBadge.label}
            </span>
            {notice.isMandatory && (
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-600 text-white shadow-sm">
                Mandatory
              </span>
            )}
            {notice.remindersSent > 0 && (
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                🔔 {notice.remindersSent} Reminders Sent
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleShare}
            className="text-slate-400 hover:text-cuj-blue p-1 rounded-lg transition-colors"
            title="Copy Notice Details"
            aria-label="Copy notice details"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Title */}
        <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-cuj-blue transition-colors leading-snug mb-2">
          {notice.title}
        </h3>

        {/* Department & Author */}
        <div className="flex items-center space-x-2 text-xs text-slate-500 mb-3 font-medium">
          <Building2 className="w-3.5 h-3.5 text-cuj-accent flex-shrink-0" />
          <span className="truncate">{notice.department}</span>
          <span>•</span>
          <span className="truncate text-slate-400">{notice.postedBy}</span>
        </div>

        {/* Description Snippet */}
        <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed mb-4">
          {notice.description}
        </p>

        {/* METRICS BOX: Time Period Countdown, Vacancies, Fees */}
        <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/80 space-y-3">
          {/* Time Countdown Bar */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-1.5 text-slate-500 font-semibold">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>Submission Time Period:</span>
            </div>

            <div
              className={`font-mono font-black text-xs px-2.5 py-0.5 rounded-lg flex items-center space-x-1 ${
                timeLeft.isCritical
                  ? 'bg-red-100 text-red-700 animate-pulse'
                  : timeLeft.isUrgent
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-slate-200 text-slate-800'
              }`}
            >
              {timeLeft.isExpired ? (
                <span>EXPIRED</span>
              ) : (
                <span>
                  {timeLeft.days > 0 ? `${timeLeft.days}d ` : ''}
                  {String(timeLeft.hours).padStart(2, '0')}h : {String(timeLeft.minutes).padStart(2, '0')}m :{' '}
                  {String(timeLeft.seconds).padStart(2, '0')}s left
                </span>
              )}
            </div>
          </div>

          {/* Vacancies / Remaining Seats Progress */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1 font-semibold">
              <div className="flex items-center space-x-1.5 text-slate-700">
                <Users className="w-3.5 h-3.5 text-cuj-blue" />
                <span>Vacancies / Available Seats:</span>
              </div>
              <span className={`font-black ${vacanciesLeft < 15 ? 'text-red-600' : 'text-slate-900'}`}>
                {vacanciesLeft} / {totalVacancies} Remaining
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  percentFilled > 85 ? 'bg-red-500' : percentFilled > 60 ? 'bg-amber-500' : 'bg-cuj-blue'
                }`}
                style={{ width: `${percentFilled}%` }}
              ></div>
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
              <span>{percentFilled}% Seats Filled</span>
              <span>Deadline: {formatDeadline(notice.deadline)}</span>
            </div>
          </div>

          {/* Fee Display Banner */}
          <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Form Submission Fee:</span>
            <span
              className={`text-sm font-black px-2.5 py-0.5 rounded-lg ${
                notice.fee === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-cuj-navy'
              }`}
            >
              {formatCurrency(notice.fee)}
            </span>
          </div>
        </div>

        {/* Tags */}
        {notice.tags && notice.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {notice.tags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Card Actions Footer */}
      <div className="bg-slate-50/80 border-t border-slate-100 px-5 sm:px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-2.5">
        {/* Status for Student */}
        {studentSubmission ? (
          <div className="w-full sm:w-auto flex items-center space-x-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-xl text-xs font-bold">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Form Submitted ({studentSubmission.transactionId})</span>
          </div>
        ) : (
          <div className="text-[11px] text-slate-500 font-medium">
            {vacanciesLeft <= 0 ? (
              <span className="text-red-600 font-bold">Seats Exhausted</span>
            ) : (
              <span>Open for online submission</span>
            )}
          </div>
        )}

        {/* Buttons */}
        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          {/* Admin / Senior / Faculty / Organizer reminder trigger button */}
          {(isAdmin || isSenior || isFaculty || isOrganizer) && (
            <button
              type="button"
              onClick={handleSendReminder}
              disabled={reminderSentNotice}
              className="bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs px-3 py-2 rounded-xl transition-all flex items-center space-x-1 disabled:opacity-70"
              title="Send repeated push reminder to students"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{reminderSentNotice ? 'Sent to Phones!' : 'Remind Students'}</span>
            </button>
          )}

          {/* Form Fill CTA */}
          {notice.hasForm &&
            (studentSubmission ? (
              <button
                type="button"
                onClick={() => onOpenSubmitModal?.(notice, true)}
                className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs px-4 py-2 rounded-xl transition-all flex items-center space-x-1.5"
              >
                <FileCheck2 className="w-4 h-4 text-emerald-700" />
                <span>View Receipt</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onOpenSubmitModal?.(notice, false)}
                disabled={vacanciesLeft <= 0 || timeLeft.isExpired}
                className={`font-black text-xs px-4 py-2 rounded-xl shadow-sm transition-all flex items-center space-x-1.5 transform hover:scale-[1.02] active:scale-95 ${
                  vacanciesLeft <= 0 || timeLeft.isExpired
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-cuj-navy hover:bg-cuj-blue text-white'
                }`}
              >
                <span>Fill & Submit Form</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}
