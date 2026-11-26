import React, { useMemo, useState } from 'react';
import { useNotifications } from '../context/NotificationContext';
import {
  X, Smartphone, BellRing, Volume2, VolumeX, Send, ArrowRight,
  Wifi, BatteryFull, Signal, Info, BellOff
} from 'lucide-react';

/**
 * Phone notification simulator — shows the same campus alerts that the
 * NotificationContext dispatches, inside a mock lockscreen.
 */
export default function PhoneSimulator({ isOpen, onClose, onOpenSubmitModal }) {
  const {
    notifications,
    announcements,
    dispatchNotification,
    requestBrowserPush,
    reminderConfig,
    setReminderConfig,
    toggleSound,
    broadcastManualReminder,
  } = useNotifications();

  const [pushState, setPushState] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  );

  const clock = useMemo(
    () =>
      new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }),
    // re-evaluated each time the simulator is opened
    [isOpen]
  );

  if (!isOpen) return null;

  const visible = notifications.slice(0, 8);

  const sendTestAlert = () => {
    const openNotice = announcements.find(
      (a) => a.hasForm && a.totalVacancies - a.filledVacancies > 0
    );
    dispatchNotification({
      title: openNotice
        ? `🔔 Form submission pending: ${openNotice.title.substring(0, 34)}…`
        : '🔔 CU Jammu Campus Pulse test alert',
      body: openNotice
        ? `Only ${openNotice.totalVacancies - openNotice.filledVacancies} seats left. Submit before the deadline to avoid the late fee.`
        : 'This is a test notification from the campus alert service.',
      type: 'reminder',
      noticeId: openNotice?.id || null,
    });
  };

  const askBrowserPush = async () => {
    const granted = await requestBrowserPush();
    setPushState(
      typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
    );
    if (!granted) {
      dispatchNotification({
        title: 'Browser alerts are blocked',
        body: 'Allow notifications for this site in your browser settings to receive desktop push alerts.',
        type: 'info',
      });
    }
  };

  const openNotice = (notif) => {
    const notice = announcements.find((a) => a.id === notif.noticeId);
    if (!notice) return;
    onClose();
    onOpenSubmitModal?.(notice, false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-start sm:items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between text-white mb-3 px-1">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-black">Phone Notification Simulator</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close phone simulator"
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Phone frame */}
        <div className="rounded-[2.5rem] bg-slate-900 p-2.5 shadow-2xl ring-1 ring-white/10">
          <div className="relative rounded-[2rem] overflow-hidden bg-gradient-to-b from-slate-800 via-slate-900 to-black">
            {/* Status bar + dynamic island */}
            <div className="relative px-5 pt-3 pb-2 text-white/90 text-[11px] font-semibold flex items-center justify-between">
              <span className="font-mono">{clock}</span>
              <div className="absolute left-1/2 -translate-x-1/2 top-2 w-20 h-5 bg-black rounded-full ring-1 ring-white/10" />
              <div className="flex items-center gap-1">
                <Signal className="w-3 h-3" />
                <Wifi className="w-3 h-3" />
                <BatteryFull className="w-4 h-4" />
              </div>
            </div>

            {/* Lockscreen body */}
            <div className="px-4 pb-4 pt-2 min-h-[26rem] max-h-[26rem] overflow-y-auto space-y-2">
              <div className="text-center text-white/70 mb-2">
                <p className="text-[10px] uppercase tracking-widest">Central University of Jammu</p>
                <p className="text-sm font-black text-white">Campus Pulse Alerts</p>
              </div>

              {visible.length === 0 ? (
                <div className="text-center text-white/50 py-16">
                  <BellOff className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-[11px]">No alerts on the lockscreen yet</p>
                </div>
              ) : (
                visible.map((notif, idx) => {
                  const notice = announcements.find((a) => a.id === notif.noticeId);
                  const isUrgent = notif.type === 'critical' || notif.type === 'reminder';
                  return (
                    <div
                      key={notif.id}
                      className={`animate-slide-down rounded-2xl p-3 border backdrop-blur-md ${
                        isUrgent
                          ? 'bg-red-500/15 border-red-400/40'
                          : 'bg-white/10 border-white/15'
                      }`}
                      style={{ animationDelay: `${Math.min(idx, 5) * 60}ms` }}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[9px] font-black uppercase tracking-wider text-amber-300">
                          CU Jammu · now
                        </span>
                        {isUrgent && (
                          <span className="text-[9px] font-black text-red-200 bg-red-500/30 px-1.5 rounded">
                            URGENT
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-bold text-white leading-snug">{notif.title}</p>
                      <p className="text-[10px] text-white/70 leading-snug mt-0.5">{notif.body}</p>

                      {notice && (
                        <button
                          onClick={() => openNotice(notif)}
                          className="mt-2 w-full bg-amber-400 hover:bg-amber-300 text-slate-950 text-[10px] font-black py-1.5 rounded-xl flex items-center justify-center gap-1 transition-colors"
                        >
                          Open &amp; Fill Form
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="mt-3 bg-white rounded-2xl border border-slate-200 p-3 space-y-2">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={sendTestAlert}
              className="flex-1 min-w-[9rem] bg-cuj-navy hover:bg-cuj-blue text-white text-[11px] font-black py-2 rounded-xl flex items-center justify-center gap-1.5"
            >
              <BellRing className="w-3.5 h-3.5" /> Send test alert
            </button>
            <button
              onClick={() => {
                const target = announcements.find((a) => a.hasForm);
                if (target) broadcastManualReminder(target.id);
                else sendTestAlert();
              }}
              className="flex-1 min-w-[9rem] bg-amber-500 hover:bg-amber-600 text-slate-950 text-[11px] font-black py-2 rounded-xl flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" /> Broadcast reminder
            </button>
            <button
              onClick={toggleSound}
              className="px-3 py-2 rounded-xl border border-slate-200 text-[11px] font-bold text-slate-700 flex items-center gap-1.5 hover:bg-slate-50"
            >
              {reminderConfig.soundEnabled ? (
                <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-slate-400" />
              )}
              {reminderConfig.soundEnabled ? 'Sound on' : 'Muted'}
            </button>
          </div>

          <div className="flex items-center justify-between gap-2 text-[11px]">
            <label className="flex items-center gap-1.5 font-semibold text-slate-600">
              <input
                type="checkbox"
                checked={reminderConfig.enabled}
                onChange={(e) => setReminderConfig((c) => ({ ...c, enabled: e.target.checked }))}
                className="w-3.5 h-3.5 accent-cuj-navy"
              />
              Recurring reminders
            </label>

            <label className="flex items-center gap-1.5 font-semibold text-slate-600">
              Every
              <select
                value={reminderConfig.intervalSeconds}
                onChange={(e) =>
                  setReminderConfig((c) => ({ ...c, intervalSeconds: Number(e.target.value) }))
                }
                className="px-1.5 py-1 rounded-lg border border-slate-300 text-[11px] font-bold text-slate-700"
              >
                <option value={15}>15s</option>
                <option value={25}>25s</option>
                <option value={60}>60s</option>
                <option value={300}>5 min</option>
              </select>
            </label>

            <button
              onClick={askBrowserPush}
              className="font-bold text-cuj-blue hover:text-cuj-navy flex items-center gap-1"
            >
              <Info className="w-3 h-3" />
              {pushState === 'granted' ? 'Browser alerts on' : 'Enable browser alerts'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
