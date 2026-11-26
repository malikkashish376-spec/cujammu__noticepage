import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_USERS, CUJ_DEPARTMENTS } from '../data/initialData';

const AuthContext = createContext();

// localStorage can hold a truncated or hand-edited value; a bad JSON payload
// used to throw during the first render and leave a blank page.
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

export function AuthProvider({ children }) {
  const [users, setUsers] = useState(() => {
    const saved = readStorage('cuj_users_v2', null);
    return Array.isArray(saved) && saved.length > 0 ? saved : INITIAL_USERS;
  });

  // null = not logged in; object = logged in user
  const [currentUser, setCurrentUser] = useState(() =>
    readStorage('cuj_session_v2', null)
  );

  // Login state: 'idle' | 'pending_otp' | 'logged_in'
  const [authState, setAuthState] = useState('idle');

  // Pending email waiting for OTP confirmation
  const [pendingEmail, setPendingEmail] = useState('');

  useEffect(() => {
    localStorage.setItem('cuj_users_v2', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('cuj_session_v2', JSON.stringify(currentUser));
      setAuthState('logged_in');
    } else {
      localStorage.removeItem('cuj_session_v2');
      setAuthState('idle');
    }
  }, [currentUser]);

  /**
   * Step 1 — look up an email to see if it belongs to a known user (or allow registration).
   * Returns { found: bool, user?, needsRegistration: bool, role? }
   */
  const lookupEmail = (email) => {
    const normalised = email.trim().toLowerCase();
    const found = users.find(u => u.email.toLowerCase() === normalised);
    return found
      ? { found: true, user: found, role: found.role }
      : { found: false, needsRegistration: true };
  };

  /**
   * Step 2 — called after OTP is verified. Actually log in the user.
   */
  const confirmLogin = (email) => {
    const normalised = email.trim().toLowerCase();
    const user = users.find(u => u.email.toLowerCase() === normalised);
    if (user) {
      setCurrentUser(user);
      setPendingEmail('');
      return { success: true, user };
    }
    return { success: false, error: 'User not found after OTP verification.' };
  };

  /**
   * Register a new student / senior / faculty / organizer.
   * After registration they still need to verify their email via OTP.
   */
  const register = (formData) => {
    const normalised = formData.email.trim().toLowerCase();
    if (users.find(u => u.email.toLowerCase() === normalised)) {
      return { success: false, error: 'This email is already registered. Please sign in instead.' };
    }

    const year = new Date().getFullYear();
    const rand = Math.floor(100 + Math.random() * 900);
    let idNumber = '';
    switch (formData.role) {
      case 'admin':     idNumber = `CUJ-ADM-${rand}`;              break;
      case 'faculty':   idNumber = `CUJ-FAC-${rand}`;              break;
      case 'organizer': idNumber = `CUJ-ORG-${rand}`;              break;
      case 'senior':    idNumber = `CUJ/${year}/SR-${rand}`;       break;
      default:          idNumber = `CUJ/${year}/${formData.deptCode || 'STU'}-${rand}`; break;
    }

    const newUser = {
      id:          `user-${Date.now()}`,
      name:        formData.name.trim(),
      email:       normalised,
      role:        formData.role || 'student',
      designation: formData.designation || (formData.role === 'student' ? 'Student' : 'Campus Coordinator'),
      department:  formData.department || CUJ_DEPARTMENTS[0],
      idNumber,
      phone:       formData.phone || '',
      semester:    formData.semester || '1st Semester',
      avatar:      `https://i.pravatar.cc/150?u=${encodeURIComponent(normalised)}`,
      registeredAt: new Date().toISOString(),
      isVerified:  false, // becomes true after first OTP verification
    };

    setUsers(prev => [...prev, newUser]);
    return { success: true, user: newUser };
  };

  /**
   * Finalise first-time registration after OTP: mark isVerified = true and log in.
   */
  const confirmRegistration = (email) => {
    const normalised = email.trim().toLowerCase();
    setUsers(prev =>
      prev.map(u => u.email.toLowerCase() === normalised ? { ...u, isVerified: true } : u)
    );
    return confirmLogin(normalised);
  };

  const logout = () => {
    setCurrentUser(null);
    setPendingEmail('');
  };

  const isAdmin    = currentUser?.role === 'admin';
  const isSenior   = currentUser?.role === 'senior';
  const isFaculty  = currentUser?.role === 'faculty';
  const isOrganizer= currentUser?.role === 'organizer';
  const isStudent  = currentUser?.role === 'student';
  const isStaff    = isAdmin || isFaculty || isOrganizer; // management roles
  const canPost    = isAdmin || isSenior || isFaculty || isOrganizer;

  return (
    <AuthContext.Provider value={{
      currentUser,
      users,
      authState, setAuthState,
      pendingEmail, setPendingEmail,
      lookupEmail,
      confirmLogin,
      register,
      confirmRegistration,
      logout,
      isAdmin, isSenior, isFaculty, isOrganizer, isStudent, isStaff, canPost,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
