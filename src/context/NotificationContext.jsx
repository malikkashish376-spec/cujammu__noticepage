import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { INITIAL_ANNOUNCEMENTS, INITIAL_SUBMISSIONS } from '../data/initialData';
import { soundManager } from '../utils/soundAlerts';

const NotificationContext = createContext();

// A corrupt localStorage value used to throw on first render (blank page).
function readStorage(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch (err) {
    console.warn(`Ignoring unreadable localStorage entry "${key}"`, err);
    localStorage.removeItem(key);
    return fallback;
  }
}

export function NotificationProvider({ children }) {
  const [announcements, setAnnouncements] = useState(() => {
    const saved = readStorage('cuj_announcements', null);
    return Array.isArray(saved) && saved.length > 0 ? saved : INITIAL_ANNOUNCEMENTS;
  });

  const [submissions, setSubmissions] = useState(() => {
    const saved = readStorage('cuj_submissions', null);
    return Array.isArray(saved) ? saved : INITIAL_SUBMISSIONS;
  });

  const [notifications, setNotifications] = useState(() => {
    const saved = readStorage('cuj_notifications_queue', null);
    if (Array.isArray(saved)) return saved;
    // Initial notifications representing recent campus updates
    return [
      {
        id: 'notif-1',
        title: '🚨 CRITICAL DEADLINE: Re-evaluation Form',
        body: 'Only 6 hours remaining to submit Answer Script Scrutiny applications. 11 seats left! Fee: ₹500.',
        time: 'Just now',
        type: 'critical',
        noticeId: 'cuj-notice-008',
        read: false,
        formUrgency: true
      },
      {
        id: 'notif-2',
        title: '⚠️ REPEATED REMINDER: Even Semester Examination Form',
        body: 'Mandatory form submission pending! 14 hours left before ₹500 late fee penalty. Submit now.',
        time: '12m ago',
        type: 'reminder',
        noticeId: 'cuj-notice-001',
        read: false,
        formUrgency: true
      },
      {
        id: 'notif-3',
        title: '🎉 TechSangam 2026: Only 8 Team Slots Left',
        body: 'Dept of CS & IT announces ₹1 Lakh prize hackathon. Form fee ₹300/team. Register your team today.',
        time: '1 hour ago',
        type: 'event',
        noticeId: 'cuj-notice-002',
        read: true,
        formUrgency: false
      }
    ];
  });

  // Recurring reminder settings
  const [reminderConfig, setReminderConfig] = useState({
    enabled: true,
    intervalSeconds: 25, // For live presentation: frequent reminders ("baar baar reminder")
    soundEnabled: true,
    browserPushEnabled: false,
    phoneSimulatorOpen: false
  });

  const [lastUrgentReminder, setLastUrgentReminder] = useState(null);
  const [reminderBannerActive, setReminderBannerActive] = useState(true);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('cuj_announcements', JSON.stringify(announcements));
  }, [announcements]);

  useEffect(() => {
    localStorage.setItem('cuj_submissions', JSON.stringify(submissions));
  }, [submissions]);

  useEffect(() => {
    localStorage.setItem('cuj_notifications_queue', JSON.stringify(notifications));
  }, [notifications]);

  // Request browser native notification permission if supported
  const requestBrowserPush = useCallback(async () => {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission();
      setReminderConfig(prev => ({ ...prev, browserPushEnabled: perm === 'granted' }));
      return perm === 'granted';
    }
    return false;
  }, []);

  // Dispatch a notification to the system (and phone simulator)
  const dispatchNotification = useCallback((notifData) => {
    const newNotif = {
      id: `notif-${Date.now()}`,
      title: notifData.title,
      body: notifData.body,
      time: 'Just now',
      type: notifData.type || 'info',
      noticeId: notifData.noticeId || null,
      read: false,
      timestamp: Date.now()
    };

    setNotifications(prev => [newNotif, ...prev]);

    // Play synthesized sound alert
    if (reminderConfig.soundEnabled) {
      if (notifData.type === 'critical' || notifData.type === 'reminder') {
        soundManager.playUrgentAlert();
      } else {
        soundManager.playNotificationChime();
      }
    }

    // Native browser push if permitted
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(`CU Jammu Alert: ${notifData.title}`, {
          body: notifData.body,
          icon: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=100&auto=format&fit=crop&q=80',
          badge: '🏛️'
        });
      } catch (err) {
        console.warn('Native notification failed:', err);
      }
    }

    return newNotif;
  }, [reminderConfig.soundEnabled]);

  // "Baar Baar Reminder" - Recurring interval loop for pending forms
  useEffect(() => {
    if (!reminderConfig.enabled) return;

    const timer = setInterval(() => {
      // Find notices that have a form and are marked urgent or have tight deadlines
      const pendingUrgentNotices = announcements.filter(n => n.hasForm && (n.isUrgent || n.totalVacancies - n.filledVacancies < 20));
      
      if (pendingUrgentNotices.length > 0) {
        // Pick one to remind
        const target = pendingUrgentNotices[Math.floor(Math.random() * pendingUrgentNotices.length)];
        const vacanciesLeft = target.totalVacancies - target.filledVacancies;

        const reminderNotif = {
          title: `🔔 [URGENT REMINDER] Pending Form: ${target.title.substring(0, 35)}...`,
          body: `Form submission is pending! Only ${vacanciesLeft} vacancies left. Fee: ${target.fee ? `₹${target.fee}` : 'FREE'}. Submit before deadline!`,
          type: 'reminder',
          noticeId: target.id
        };

        dispatchNotification(reminderNotif);
        setLastUrgentReminder({
          ...target,
          reminderTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          vacanciesLeft
        });

        // Increment reminders sent count on announcement
        setAnnouncements(prev => prev.map(a => a.id === target.id ? { ...a, remindersSent: (a.remindersSent || 0) + 1 } : a));
      }
    }, reminderConfig.intervalSeconds * 1000);

    return () => clearInterval(timer);
  }, [reminderConfig.enabled, reminderConfig.intervalSeconds, announcements, dispatchNotification]);

  // Trigger manual broadcast reminder (e.g. from Admin or Senior panel)
  const broadcastManualReminder = (noticeId, customMessage) => {
    const notice = announcements.find(a => a.id === noticeId);
    if (!notice) return;

    const vacanciesLeft = notice.totalVacancies - notice.filledVacancies;
    const notif = {
      title: `⚡ OFFICIAL CU JAMMU REMINDER: ${notice.title}`,
      body: customMessage || `Action required! Form fee: ${notice.fee ? `₹${notice.fee}` : 'FREE'}. Remaining spots: ${vacanciesLeft}. Submit immediately to confirm your seat.`,
      type: 'critical',
      noticeId: notice.id
    };

    dispatchNotification(notif);
    setLastUrgentReminder({
      ...notice,
      reminderTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      vacanciesLeft
    });

    setAnnouncements(prev => prev.map(a => a.id === noticeId ? { ...a, remindersSent: (a.remindersSent || 0) + 1 } : a));
  };

  // Form submission handler with fee calculation and vacancy update
  const submitApplication = (formValues, studentUser) => {
    const notice = announcements.find(a => a.id === formValues.noticeId);
    if (!notice) return { success: false, error: 'Notice not found' };

    const vacanciesLeft = notice.totalVacancies - notice.filledVacancies;
    if (vacanciesLeft <= 0) {
      return { success: false, error: 'All vacancies have been filled for this form.' };
    }

    const txId = `TXN-CUJ-${Math.floor(10000000 + Math.random() * 90000000)}`;
    const newSubmission = {
      id: `sub-${Date.now()}`,
      noticeId: notice.id,
      noticeTitle: notice.title,
      studentId: studentUser.id,
      studentName: studentUser.name,
      studentRoll: studentUser.idNumber,
      studentEmail: studentUser.email,
      department: studentUser.department,
      submittedAt: new Date().toISOString(),
      feePaid: notice.fee,
      paymentStatus: notice.fee > 0 ? 'PAID' : 'FREE_SUBMISSION',
      transactionId: txId,
      status: 'Confirmed',
      additionalDetails: formValues.details || {},
      category: notice.category
    };

    // Update submissions list
    setSubmissions(prev => [newSubmission, ...prev]);

    // Decrease available vacancy by 1 (increase filledVacancies)
    setAnnouncements(prev => prev.map(a => {
      if (a.id === notice.id) {
        return {
          ...a,
          filledVacancies: a.filledVacancies + 1
        };
      }
      return a;
    }));

    // Play celebration sound
    soundManager.playSuccessChime();

    // Send confirmation notification
    dispatchNotification({
      title: `✅ Form Submitted & Verified: ${notice.title}`,
      body: `Your application has been received successfully! Ref: ${txId}. Fee Paid: ₹${notice.fee}.`,
      type: 'success',
      noticeId: notice.id
    });

    return { success: true, submission: newSubmission };
  };

  // Add / Edit Announcement (Admin or Senior)
  const addAnnouncement = (newNotice) => {
    const notice = {
      ...newNotice,
      id: `cuj-notice-${Date.now()}`,
      postedAt: new Date().toISOString(),
      filledVacancies: 0,
      remindersSent: 0
    };
    setAnnouncements(prev => [notice, ...prev]);

    // Dispatch campus-wide alert
    dispatchNotification({
      title: `📢 New Campus Notification: ${notice.title}`,
      body: `Category: ${notice.category.toUpperCase()} | Vacancies: ${notice.totalVacancies} | Fee: ${notice.fee ? `₹${notice.fee}` : 'FREE'} | Deadline: ${new Date(notice.deadline).toLocaleDateString()}`,
      type: 'info',
      noticeId: notice.id
    });

    return notice;
  };

  const deleteAnnouncement = (id) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id));
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const toggleSound = () => {
    const newState = soundManager.toggleSound();
    setReminderConfig(prev => ({ ...prev, soundEnabled: newState }));
    return newState;
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{
      announcements,
      submissions,
      notifications,
      unreadCount,
      reminderConfig,
      setReminderConfig,
      lastUrgentReminder,
      reminderBannerActive,
      setReminderBannerActive,
      dispatchNotification,
      broadcastManualReminder,
      submitApplication,
      addAnnouncement,
      deleteAnnouncement,
      markAllRead,
      toggleSound,
      requestBrowserPush
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);
