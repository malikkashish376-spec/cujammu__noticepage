import React from 'react';
import { useNotifications } from '../context/NotificationContext';
import { 
  X, 
  Bell, 
  CheckCheck, 
  Volume2, 
  VolumeX, 
  Trash2, 
  ChevronRight, 
  AlertTriangle,
  Radio
} from 'lucide-react';

export default function NotificationDrawer({ isOpen, onClose, onSelectNotice }) {
  const { 
    notifications, 
    markAllRead, 
    unreadCount, 
    reminderConfig, 
    toggleSound, 
    announcements 
  } = useNotifications();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/40 backdrop-blur-xs flex justify-end animate-fade-in">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200">
        
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-cuj-navy text-white">
          <div className="flex items-center space-x-2.5">
            <div className="relative">
              <Bell className="w-5 h-5 text-amber-400" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
              )}
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base leading-tight">
                Campus Notifications
              </h3>
              <p className="text-[10px] text-slate-300">
                Official CU Jammu Push Alerts & Reminders
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Controls Toolbar */}
        <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-semibold">
            {unreadCount} Unread Alerts
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleSound}
              className="text-slate-600 hover:text-cuj-navy flex items-center space-x-1"
              title="Toggle Alert Chime"
            >
              {reminderConfig.soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-600" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
              <span className="text-[11px]">{reminderConfig.soundEnabled ? 'Chime ON' : 'Muted'}</span>
            </button>

            <span className="text-slate-300">|</span>

            <button
              onClick={markAllRead}
              className="text-cuj-blue hover:text-cuj-navy font-bold text-[11px] flex items-center space-x-1"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark all read</span>
            </button>
          </div>
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Bell className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-xs font-semibold">No notifications yet</p>
              <p className="text-[11px] text-slate-400">Campus alerts will appear here in real-time</p>
            </div>
          ) : (
            notifications.map((notif) => {
              const targetNotice = announcements.find(a => a.id === notif.noticeId);

              return (
                <div
                  key={notif.id}
                  className={`p-3.5 rounded-2xl border text-xs transition-all relative ${
                    notif.read ? 'bg-white border-slate-200' : 'bg-blue-50/70 border-cuj-blue/40 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                      notif.type === 'critical' || notif.type === 'reminder'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-cuj-blue'
                    }`}>
                      {notif.type === 'reminder' ? 'Baar-Baar Reminder' : notif.type}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{notif.time || 'recent'}</span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-xs mb-1">
                    {notif.title}
                  </h4>
                  <p className="text-slate-600 text-[11px] leading-relaxed mb-2">
                    {notif.body}
                  </p>

                  {targetNotice && (
                    <button
                      onClick={() => {
                        onSelectNotice(targetNotice);
                        onClose();
                      }}
                      className="w-full bg-slate-100 hover:bg-cuj-blue hover:text-white text-slate-800 font-bold text-[11px] py-1.5 px-2.5 rounded-xl transition-all flex items-center justify-between"
                    >
                      <span>View Form ({targetNotice.totalVacancies - targetNotice.filledVacancies} Seats Left)</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer Status */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-[10px] text-slate-400 font-medium">
          CU Jammu Automated Broadcast Service • Samba Campus
        </div>

      </div>
    </div>
  );
}
