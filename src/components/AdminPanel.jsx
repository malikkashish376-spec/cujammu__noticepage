import React, { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { CUJ_CATEGORIES, CUJ_DEPARTMENTS } from '../data/initialData';
import { formatCurrency, formatDeadline } from '../utils/dateUtils';
import {
  Shield, PlusCircle, Send, Trash2, Search, Users, IndianRupee,
  CheckCircle2, ClipboardList, BellRing, AlertCircle
} from 'lucide-react';

const blankForm = (department, postedBy) => ({
  title: '',
  category: 'exams',
  department: department || CUJ_DEPARTMENTS[0],
  postedBy,
  deadline: '',
  totalVacancies: 100,
  fee: 0,
  isMandatory: false,
  hasForm: true,
  isUrgent: false,
  description: '',
  tags: '',
});

/** Admin console: publish notices and audit every application received. */
export default function AdminPanel() {
  const { currentUser } = useAuth();
  const { announcements, submissions, addAnnouncement, deleteAnnouncement, broadcastManualReminder } =
    useNotifications();

  const [tab, setTab] = useState('applicants');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState(null); // { type: 'ok' | 'error', msg }
  const [form, setForm] = useState(() =>
    blankForm(
      currentUser?.department,
      `${currentUser?.name} (${currentUser?.designation || 'Administrator'})`
    )
  );

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const filteredSubmissions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return submissions;
    return submissions.filter((s) =>
      [s.studentName, s.studentRoll, s.noticeTitle, s.transactionId, s.department]
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }, [submissions, query]);

  const totals = useMemo(() => {
    const collected = submissions.reduce((sum, s) => sum + (Number(s.feePaid) || 0), 0);
    const seats = announcements.reduce((sum, a) => sum + (Number(a.totalVacancies) || 0), 0);
    const filled = announcements.reduce((sum, a) => sum + (Number(a.filledVacancies) || 0), 0);
    return { collected, seats, filled };
  }, [submissions, announcements]);

  const handlePublish = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.deadline) {
      setStatus({ type: 'error', msg: 'Title and deadline are required.' });
      return;
    }
    const vacancies = Number(form.totalVacancies);
    if (!Number.isFinite(vacancies) || vacancies < 1) {
      setStatus({ type: 'error', msg: 'Total vacancies must be at least 1.' });
      return;
    }

    addAnnouncement({
      ...form,
      title: form.title.trim(),
      totalVacancies: vacancies,
      fee: Number(form.fee) || 0,
      isMandatory: Boolean(form.isMandatory),
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
    });

    setStatus({ type: 'ok', msg: 'Notice published and pushed to all students.' });
    setForm(blankForm(currentUser?.department, form.postedBy));
    setTab('notices');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-cuj-navy via-cuj-blue to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-white/10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-amber-300 mb-2">
              <Shield className="w-3.5 h-3.5" /> Administrator Console
            </div>
            <h2 className="text-2xl sm:text-3xl font-black">{currentUser?.name}</h2>
            <p className="text-xs text-slate-300 mt-1">{currentUser?.designation}</p>
          </div>
          <button
            onClick={() => setTab('publish')}
            className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm px-5 py-3 rounded-2xl shadow-lg flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" /> Publish New Notice
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10">
          <Metric label="Active Notices" value={announcements.length} />
          <Metric label="Applications" value={submissions.length} />
          <Metric label="Seats Filled" value={`${totals.filled} / ${totals.seats}`} />
          <Metric label="Fees Collected" value={formatCurrency(totals.collected)} />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap border-b border-slate-200 gap-2 sm:gap-4 text-xs sm:text-sm font-bold">
        <TabButton active={tab === 'applicants'} onClick={() => setTab('applicants')} Icon={ClipboardList}>
          Master Applicant Records ({submissions.length})
        </TabButton>
        <TabButton active={tab === 'notices'} onClick={() => setTab('notices')} Icon={BellRing}>
          Published Notices ({announcements.length})
        </TabButton>
        <TabButton active={tab === 'publish'} onClick={() => setTab('publish')} Icon={PlusCircle}>
          Create / Publish Notice
        </TabButton>
      </div>

      {status && (
        <div
          className={`text-xs p-3 rounded-xl flex items-start gap-2 border ${
            status.type === 'ok'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          {status.type === 'ok' ? (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          )}
          <span>{status.msg}</span>
        </div>
      )}

      {/* Applicants */}
      {tab === 'applicants' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h3 className="font-extrabold text-slate-900 text-sm">All applications received</h3>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, roll no, notice, TXN…"
                className="pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-cuj-blue outline-none w-full sm:w-72"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Student</th>
                  <th className="py-2.5 px-3">Roll No</th>
                  <th className="py-2.5 px-3">Notice</th>
                  <th className="py-2.5 px-3">Fee</th>
                  <th className="py-2.5 px-3">TXN</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSubmissions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No applications match this search.
                    </td>
                  </tr>
                )}
                {filteredSubmissions.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-bold text-slate-900">{s.studentName}</td>
                    <td className="py-3 px-3 font-mono text-cuj-blue">{s.studentRoll}</td>
                    <td className="py-3 px-3 text-slate-700 max-w-[18rem] truncate">{s.noticeTitle}</td>
                    <td className="py-3 px-3 font-bold text-emerald-700">{formatCurrency(s.feePaid)}</td>
                    <td className="py-3 px-3 font-mono text-slate-500">{s.transactionId}</td>
                    <td className="py-3 px-3">
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Published notices */}
      {tab === 'notices' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-3">
          <h3 className="font-extrabold text-slate-900 text-sm">Published notices</h3>
          {announcements.map((a) => {
            const left = Math.max(0, a.totalVacancies - a.filledVacancies);
            return (
              <div
                key={a.id}
                className="border border-slate-200 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="text-xs font-black text-slate-900 truncate">{a.title}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {a.department} · {formatDeadline(a.deadline)} · {left}/{a.totalVacancies} seats left ·{' '}
                    {formatCurrency(a.fee)}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => broadcastManualReminder(a.id)}
                    className="bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-[11px] px-3 py-1.5 rounded-xl flex items-center gap-1"
                  >
                    <Send className="w-3 h-3" /> Remind
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete "${a.title}"? This cannot be undone.`)) {
                        deleteAnnouncement(a.id);
                      }
                    }}
                    className="bg-red-50 hover:bg-red-100 text-red-700 font-bold text-[11px] px-3 py-1.5 rounded-xl flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                </div>
              </div>
            );
          })}
          {announcements.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-6">No notices published yet.</p>
          )}
        </div>
      )}

      {/* Publish form */}
      {tab === 'publish' && (
        <form
          onSubmit={handlePublish}
          className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4"
        >
          <div>
            <h3 className="text-lg font-black text-slate-900">Publish a campus notice / form</h3>
            <p className="text-xs text-slate-500">
              Students receive this instantly on their notification panel and phone simulator.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Label>Notice title *</Label>
              <input
                value={form.title}
                onChange={set('title')}
                required
                placeholder="e.g. Even Semester Examination Form 2026"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-cuj-blue outline-none"
              />
            </div>

            <div>
              <Label>Category</Label>
              <select
                value={form.category}
                onChange={set('category')}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-cuj-blue outline-none"
              >
                {CUJ_CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label>Department / Office</Label>
              <select
                value={form.department}
                onChange={set('department')}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-cuj-blue outline-none"
              >
                {CUJ_DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label>Total vacancies / seats *</Label>
              <input
                type="number"
                min="1"
                value={form.totalVacancies}
                onChange={set('totalVacancies')}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-cuj-blue outline-none"
              />
            </div>

            <div>
              <Label>Fee (₹) — 0 for free</Label>
              <input
                type="number"
                min="0"
                value={form.fee}
                onChange={set('fee')}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-cuj-blue outline-none"
              />
            </div>

            <div>
              <Label>Deadline *</Label>
              <input
                type="datetime-local"
                value={form.deadline}
                onChange={set('deadline')}
                required
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-cuj-blue outline-none font-mono"
              />
            </div>

            <div>
              <Label>Tags (comma separated)</Label>
              <input
                value={form.tags}
                onChange={set('tags')}
                placeholder="Mandatory, Hall Ticket, Urgent"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-cuj-blue outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <Label>Description</Label>
              <textarea
                rows={3}
                value={form.description}
                onChange={set('description')}
                placeholder="What students must do, fee details, late fee, instructions…"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-cuj-blue outline-none"
              />
            </div>

            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={form.isMandatory}
                onChange={(e) => setForm((f) => ({ ...f, isMandatory: e.target.checked }))}
                className="w-3.5 h-3.5 accent-cuj-navy"
              />
              Mandatory for all students
            </label>

            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={form.isUrgent}
                onChange={(e) => setForm((f) => ({ ...f, isUrgent: e.target.checked }))}
                className="w-3.5 h-3.5 accent-cuj-navy"
              />
              Mark as urgent (red highlight)
            </label>
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end">
            <button
              type="submit"
              className="bg-cuj-navy hover:bg-cuj-blue text-white font-black text-xs px-6 py-2.5 rounded-xl shadow-md flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" /> Publish &amp; Notify Students
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
      <span className="text-[11px] font-semibold text-slate-300 block">{label}</span>
      <span className="text-lg font-black text-amber-300">{value}</span>
    </div>
  );
}

function TabButton({ active, onClick, Icon, children }) {
  return (
    <button
      onClick={onClick}
      className={`py-3 px-3 sm:px-4 border-b-2 transition-all flex items-center gap-2 ${
        active
          ? 'border-cuj-navy text-cuj-navy'
          : 'border-transparent text-slate-500 hover:text-slate-800'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span>{children}</span>
    </button>
  );
}

function Label({ children }) {
  return <label className="block text-xs font-bold text-slate-700 mb-1">{children}</label>;
}
