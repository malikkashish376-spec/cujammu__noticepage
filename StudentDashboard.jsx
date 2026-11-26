import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { formatCurrency, formatDeadline, getTimeRemaining } from '../utils/dateUtils';
import { 
  GraduationCap, 
  FileCheck2, 
  Clock, 
  Users, 
  IndianRupee, 
  AlertCircle, 
  Download, 
  ArrowRight, 
  Bell, 
  Smartphone, 
  CheckCircle2, 
  ShieldCheck,
  Building,
  Sparkles
} from 'lucide-react';

export default function StudentDashboard({ onOpenSubmitModal, onOpenPhoneModal }) {
  const { currentUser } = useAuth();
  const { announcements, submissions, reminderConfig } = useNotifications();

  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'submitted'

  // Student's submissions
  const mySubmissions = submissions.filter(s => s.studentId === currentUser?.id);

  // Notices student has NOT submitted yet
  const pendingNotices = announcements.filter(
    a => a.hasForm && !submissions.some(s => s.noticeId === a.id && s.studentId === currentUser?.id)
  );

  return (
    <div className="space-y-6">
      
      {/* Student Welcome & Profile Card */}
      <div className="bg-gradient-to-r from-cuj-navy via-cuj-blue to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-white/10 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center space-x-4">
            <img
              src={currentUser?.avatar}
              alt={currentUser?.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-4 ring-amber-400/80 shadow-lg flex-shrink-0"
            />
            <div>
              <div className="inline-flex items-center space-x-1.5 bg-amber-400 text-slate-950 font-black text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full mb-1">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Verified CU Jammu Student</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                {currentUser?.name}
              </h2>
              <div className="text-xs text-slate-300 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="font-mono bg-white/10 px-2 py-0.5 rounded text-amber-300 font-bold">
                  Roll No: {currentUser?.idNumber}
                </span>
                <span>•</span>
                <span>{currentUser?.department}</span>
                <span>•</span>
                <span className="text-amber-200">{currentUser?.semester}</span>
              </div>
            </div>
          </div>

          {/* Quick Phone Alerts Status */}
          <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 flex items-center space-x-3">
            <button
              onClick={onOpenPhoneModal}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl transition-all flex items-center space-x-1.5 shadow-md transform active:scale-95"
            >
              <Smartphone className="w-4 h-4 text-slate-950" />
              <span>Open Phone Alert Screen</span>
            </button>
          </div>
        </div>

        {/* Student Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mt-6 pt-6 border-t border-white/10">
          <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
            <span className="text-[11px] font-semibold text-slate-300 block">Submitted Forms</span>
            <span className="text-2xl font-black text-emerald-400">{mySubmissions.length}</span>
          </div>
          <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
            <span className="text-[11px] font-semibold text-slate-300 block">Pending Forms & Deadlines</span>
            <span className="text-2xl font-black text-amber-300">{pendingNotices.length}</span>
          </div>
          <div className="bg-white/5 p-3 rounded-2xl border border-white/10 col-span-2 sm:col-span-1">
            <span className="text-[11px] font-semibold text-slate-300 block">Mobile Reminders</span>
            <span className="text-xs font-bold text-slate-200">
              {reminderConfig.enabled ? 'Active (Every 25s)' : 'Paused'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-2 sm:space-x-4 text-xs sm:text-sm font-bold">
        <button
          onClick={() => setActiveTab('pending')}
          className={`py-3 px-3 sm:px-4 border-b-2 transition-all flex items-center space-x-2 ${
            activeTab === 'pending'
              ? 'border-cuj-navy text-cuj-navy'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4 text-amber-500" />
          <span>Pending Forms Requiring Action ({pendingNotices.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('submitted')}
          className={`py-3 px-3 sm:px-4 border-b-2 transition-all flex items-center space-x-2 ${
            activeTab === 'submitted'
              ? 'border-cuj-navy text-cuj-navy'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileCheck2 className="w-4 h-4 text-emerald-600" />
          <span>My Submitted Forms & Receipts ({mySubmissions.length})</span>
        </button>
      </div>

      {/* TAB 1: Pending Forms for Student */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          {pendingNotices.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-slate-200">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
              <h3 className="text-base font-extrabold text-slate-900">All Forms Submitted!</h3>
              <p className="text-xs text-slate-500 mt-1">You have submitted all active forms for this session.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingNotices.map((notice) => {
                const vacanciesLeft = notice.totalVacancies - notice.filledVacancies;
                const timeLeft = getTimeRemaining(notice.deadline);

                return (
                  <div key={notice.id} className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-lg transition-all">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-black uppercase tracking-wider bg-blue-100 text-cuj-blue px-2.5 py-0.5 rounded-full">
                          {notice.category}
                        </span>
                        <span className="text-xs font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                          Fee: {formatCurrency(notice.fee)}
                        </span>
                      </div>

                      <h4 className="font-extrabold text-slate-900 text-sm sm:text-base leading-snug mb-1">
                        {notice.title}
                      </h4>
                      <p className="text-xs text-slate-500 mb-3 line-clamp-2">
                        {notice.description}
                      </p>

                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-1.5 text-xs">
                        <div className="flex justify-between font-semibold">
                          <span className="text-slate-600 flex items-center space-x-1">
                            <Users className="w-3.5 h-3.5 text-cuj-blue" />
                            <span>Available Vacancies:</span>
                          </span>
                          <span className="font-black text-red-600">{vacanciesLeft} / {notice.totalVacancies} Remaining</span>
                        </div>
                        <div className="flex justify-between text-[11px] font-mono text-slate-600">
                          <span>Deadline:</span>
                          <span className="text-amber-700 font-bold">
                            {timeLeft.days > 0 ? `${timeLeft.days}d ` : ''}
                            {timeLeft.hours}h : {timeLeft.minutes}m left
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
                      <span className="text-[11px] text-amber-700 font-bold animate-pulse">
                        ⚠️ Reminder Sent to Phone
                      </span>

                      <button
                        onClick={() => onOpenSubmitModal(notice, false)}
                        className="bg-cuj-navy hover:bg-cuj-blue text-white font-black text-xs px-4 py-2 rounded-xl transition-all flex items-center space-x-1 shadow-sm"
                      >
                        <span>Fill & Submit Form</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Submitted Forms & Receipts */}
      {activeTab === 'submitted' && (
        <div className="space-y-4">
          {mySubmissions.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-slate-200">
              <FileCheck2 className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <h3 className="text-base font-extrabold text-slate-900">No Forms Submitted Yet</h3>
              <p className="text-xs text-slate-500 mt-1">Submit your exam, event, or hostel forms to view receipts here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mySubmissions.map((sub) => {
                const targetNotice = announcements.find(a => a.id === sub.noticeId);

                return (
                  <div key={sub.id} className="bg-white rounded-3xl p-5 border border-emerald-200 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                          Seat Confirmed
                        </span>
                        <span className="text-[11px] font-mono font-bold text-slate-500">
                          {sub.transactionId}
                        </span>
                      </div>

                      <h4 className="font-extrabold text-slate-900 text-sm sm:text-base leading-snug mb-1">
                        {sub.noticeTitle}
                      </h4>

                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-1.5 text-xs font-mono mt-3">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Submitted On:</span>
                          <span className="text-slate-800">
                            {new Date(sub.submittedAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Fee Amount Paid:</span>
                          <span className="font-bold text-emerald-700">{formatCurrency(sub.feePaid)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Payment Status:</span>
                          <span className="font-bold text-slate-900">{sub.paymentStatus}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                      <button
                        onClick={() => {
                          if (targetNotice) {
                            onOpenSubmitModal(targetNotice, true);
                          } else {
                            window.print();
                          }
                        }}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-3.5 py-1.5 rounded-xl transition-all flex items-center space-x-1.5"
                      >
                        <Download className="w-3.5 h-3.5 text-cuj-blue" />
                        <span>View / Print Receipt</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
