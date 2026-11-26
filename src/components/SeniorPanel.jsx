import React, { useState } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
// SeniorPanel is used for roles: 'senior' | 'faculty' | 'organizer'
import { CUJ_CATEGORIES, CUJ_DEPARTMENTS } from '../data/initialData';
import { formatCurrency, formatDeadline } from '../utils/dateUtils';
import { 
  Users, 
  Send, 
  PlusCircle, 
  Sparkles, 
  PartyPopper, 
  Trophy, 
  CheckCircle, 
  AlertCircle,
  Clock,
  ChevronRight,
  Flame
} from 'lucide-react';

export default function SeniorPanel({ onSelectNotice }) {
  const { announcements, submissions, addAnnouncement, broadcastManualReminder } = useNotifications();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState('my-events'); // 'my-events' | 'create-event' | 'applicants'
  const [reminderNoticeId, setReminderNoticeId] = useState('');
  const [reminderSentStatus, setReminderSentStatus] = useState(false);

  // Form state for Senior to post a new event / activity / contest
  const [eventForm, setEventForm] = useState({
    title: '',
    category: 'events',
    department: currentUser?.department || 'Computer Science & Information Technology',
    postedBy: `${currentUser?.name} (${currentUser?.designation})`,
    deadline: '',
    totalVacancies: 50,
    fee: 0,
    hasForm: true,
    isUrgent: false,
    description: '',
    tags: 'CampusFest, Competition, Certificates'
  });

  // Filter notices posted by seniors or related to clubs/events
  const seniorEvents = announcements.filter(
    a => a.category === 'events' || a.category === 'activities' || a.postedBy.includes(currentUser?.name)
  );

  const handleCreateEvent = (e) => {
    e.preventDefault();
    if (!eventForm.title || !eventForm.deadline) {
      alert('Please enter title and deadline');
      return;
    }

    addAnnouncement({
      ...eventForm,
      totalVacancies: Number(eventForm.totalVacancies),
      fee: Number(eventForm.fee),
      tags: eventForm.tags.split(',').map(t => t.trim()).filter(Boolean),
      isMandatory: false
    });

    alert('Event published successfully! Campus alert dispatched.');
    setActiveTab('my-events');
  };

  const handleSendReminder = (noticeId) => {
    broadcastManualReminder(noticeId, `Senior Council Reminder: Last call for registrations! Confirm your team slots before vacancies run out.`);
    setReminderNoticeId(noticeId);
    setReminderSentStatus(true);
    setTimeout(() => setReminderSentStatus(false), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Senior Portal Header */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-cuj-navy text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 bg-black/20 text-amber-200 border border-amber-400/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
              <Users className="w-3.5 h-3.5" />
              <span>{currentUser?.role === 'faculty' ? 'Faculty' : currentUser?.role === 'organizer' ? 'Event Organizer' : 'Senior Student Council'} Panel</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Welcome, {currentUser?.name}
            </h2>
            <p className="text-amber-100 text-xs sm:text-sm max-w-2xl mt-1">
              Organize campus fests, competitions, hackathons, and NSS activities. Keep junior students informed and trigger reminders for form submission.
            </p>
            <div className="text-[11px] font-mono text-amber-300 mt-2">
              Role: {currentUser?.designation} • ID: {currentUser?.idNumber}
            </div>
          </div>

          <button
            onClick={() => setActiveTab('create-event')}
            className="bg-white hover:bg-amber-100 text-slate-900 font-black text-xs sm:text-sm px-5 py-3 rounded-2xl shadow-lg transition-all flex items-center space-x-2 flex-shrink-0"
          >
            <PlusCircle className="w-4 h-4 text-amber-600" />
            <span>Host New Event / Competition</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-2 sm:space-x-4 text-xs sm:text-sm font-bold">
        <button
          onClick={() => setActiveTab('my-events')}
          className={`py-3 px-3 sm:px-4 border-b-2 transition-all flex items-center space-x-2 ${
            activeTab === 'my-events'
              ? 'border-amber-600 text-amber-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <PartyPopper className="w-4 h-4" />
          <span>Club & Campus Events ({seniorEvents.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('create-event')}
          className={`py-3 px-3 sm:px-4 border-b-2 transition-all flex items-center space-x-2 ${
            activeTab === 'create-event'
              ? 'border-amber-600 text-amber-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create Event Form</span>
        </button>

        <button
          onClick={() => setActiveTab('applicants')}
          className={`py-3 px-3 sm:px-4 border-b-2 transition-all flex items-center space-x-2 ${
            activeTab === 'applicants'
              ? 'border-amber-600 text-amber-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Registered Juniors & Teams</span>
        </button>
      </div>

      {/* TAB 1: Senior Events */}
      {activeTab === 'my-events' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {seniorEvents.map((event) => {
            const vacanciesLeft = event.totalVacancies - event.filledVacancies;

            return (
              <div key={event.id} className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                      {event.category}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-500">
                      Fee: {formatCurrency(event.fee)}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base leading-snug mb-1">
                    {event.title}
                  </h3>
                  <p className="text-xs text-slate-500 mb-3 line-clamp-2">
                    {event.description}
                  </p>

                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2 text-xs">
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-600">Remaining Vacancies:</span>
                      <span className="font-black text-amber-700">{vacanciesLeft} / {event.totalVacancies} Spots</span>
                    </div>
                    <div className="flex justify-between text-slate-500 text-[11px]">
                      <span>Deadline:</span>
                      <span className="font-mono">{formatDeadline(event.deadline)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    🔔 {event.remindersSent || 0} Reminders Sent
                  </span>

                  <button
                    onClick={() => handleSendReminder(event.id)}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-black text-xs px-3.5 py-1.5 rounded-xl transition-all flex items-center space-x-1.5 shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Reminder to Students</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: Create Event */}
      {activeTab === 'create-event' && (
        <form onSubmit={handleCreateEvent} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
          <div>
            <h3 className="text-lg font-black text-slate-900">
              Host a Club Activity / Cultural Event / Hackathon
            </h3>
            <p className="text-xs text-slate-500">
              Post an activity form for junior students and set vacancy limits and registration fees.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Event Title *</label>
              <input
                type="text"
                required
                value={eventForm.title}
                onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                placeholder="e.g. Inter-Department Tug of War & Cricket League 2026"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
              <select
                value={eventForm.category}
                onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none"
              >
                <option value="events">Events & Functions</option>
                <option value="activities">Clubs & Sports Activities</option>
                <option value="vacancies">Student Volunteer Recruitment</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Total Vacancies / Teams Limit *</label>
              <input
                type="number"
                min="1"
                required
                value={eventForm.totalVacancies}
                onChange={(e) => setEventForm({ ...eventForm, totalVacancies: e.target.value })}
                placeholder="40"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Entry / Participation Fee (₹) [0 for Free] *</label>
              <input
                type="number"
                min="0"
                required
                value={eventForm.fee}
                onChange={(e) => setEventForm({ ...eventForm, fee: e.target.value })}
                placeholder="0"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Registration Deadline *</label>
              <input
                type="datetime-local"
                required
                value={eventForm.deadline}
                onChange={(e) => setEventForm({ ...eventForm, deadline: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Description & Rules</label>
              <textarea
                rows="3"
                value={eventForm.description}
                onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                placeholder="Provide rules, prize pool, team size details..."
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none"
              ></textarea>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end">
            <button
              type="submit"
              className="bg-amber-600 hover:bg-amber-700 text-white font-black text-xs px-6 py-2.5 rounded-xl shadow-md transition-all flex items-center space-x-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Publish Event & Open Registration</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: Registered Applicants for Senior Events */}
      {activeTab === 'applicants' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs">
          <h3 className="font-extrabold text-slate-900 text-sm mb-3">
            Registered Applicants & Participants
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Student Name</th>
                  <th className="py-2.5 px-3">Roll No</th>
                  <th className="py-2.5 px-3">Event Applied</th>
                  <th className="py-2.5 px-3">Fee Status</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {submissions.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-bold text-slate-900">{s.studentName}</td>
                    <td className="py-3 px-3 font-mono text-cuj-blue">{s.studentRoll}</td>
                    <td className="py-3 px-3 text-slate-700">{s.noticeTitle}</td>
                    <td className="py-3 px-3 font-bold text-emerald-700">{formatCurrency(s.feePaid)}</td>
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

    </div>
  );
}
