# 🏛️ CU Jammu Campus Pulse - Notification, Vacancy & Reminder Alert Portal

**जम्मू केंद्रीय विश्वविद्यालय | Central University of Jammu (CUJ)**
*Established under Central Universities Act, 2009 | Rahya-Suchani (Bagla), Samba - 181143*

[![Live Demo](https://img.shields.io/badge/%E2%96%B6%20LIVE%20DEMO-Open%20the%20portal-0B2545?style=for-the-badge&labelColor=EEB902)](https://malikkashish376-spec.github.io/cujammu__noticepage/)
[![GitHub Pages](https://img.shields.io/badge/hosted%20on-GitHub%20Pages-2ea44f?style=flat-square)](https://malikkashish376-spec.github.io/cujammu__noticepage/)
[![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-646cff?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind](https://img.shields.io/badge/Tailwind-3-38bdf8?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

## 🔗 Live Website

### 👉 **https://malikkashish376-spec.github.io/cujammu__noticepage/**

Open the link on any phone or laptop — no sign-up, no install. It is a public page, so you can
share it with classmates, faculty or on WhatsApp exactly as it is.

| | |
|---|---|
| **Live URL** | https://malikkashish376-spec.github.io/cujammu__noticepage/ |
| **Host** | GitHub Pages (free, HTTPS, public) |
| **Source branch** | `main` — the deployable build lives on `gh-pages` |
| **Runs on** | Any modern browser; installs nothing |

A full-featured campus notification portal with **smartphone push alert simulation**, **recurring deadline reminders ("Baar-Baar Reminder")**, **vacancy tracking**, **fee collection**, and **role-based panels** for **Admin, Seniors/Faculty, and Students**.

> **Demo data notice:** this is a front-end demo. Notices, applications and logins are stored in
> each visitor's own browser (`localStorage`), so a notice you publish is visible only in your
> browser. Payments and OTPs are simulated. See [Limitations](#limitations) below.

---

## 🌟 Key Features

### 1. 📱 Direct Phone Notification Simulator ("Sabko Phone Me Notify Hoje")
- Realistic smartphone device view (iOS/Android lockscreen & dynamic island).
- Displays live incoming notifications sliding down with synthesized audio chimes.
- One-click **"Open & Fill Form"** button from inside the phone notification.
- Toggle between rapid demo mode (every 15s/25s) and standard reminder intervals.
- Real Web Notification API support for desktop/mobile browser alerts.

### 2. 🔔 Baar-Baar Urgency Reminders ("Baar Baar Reminder Dede Form Ko Submit Karne K Liye")
- Continuous recurring reminder loop for pending mandatory forms (e.g. Even Semester Examination Form, Re-evaluation, Hostel Allotment).
- Visual warning badges, pulsating alert indicators, and synthesized dual-tone Web Audio chimes.
- Floating urgency banner with real-time ticking countdown clock (`00d : 14h : 22m : 15s`).

### 3. 👥 Vacancy & Available Seats Meter ("Kitni Vacancies Hai Us Form Me Submit Karne K Liye")
- Real-time seat tracking progress bar on every notice (e.g. `11 / 200 Seats Remaining (94% Filled)`).
- Automatically deducts an available vacancy upon verified student submission.
- Prevents oversubscription once vacancies reach 0.

### 4. 💳 Form Submission Fee & Payment Gateway ("Given Fees for Submit")
- Clear fee breakdown badge (`FREE (₹0)` or exact amount like `₹750`, `₹300`, `₹14,500`).
- Multi-step form fill modal with mock 256-bit encrypted Payment Gateway (UPI QR Code scanner, Debit/Credit Card, Net Banking with SBI/J&K Bank/PNB).
- Instant downloadable/printable official application receipt and hall ticket confirmation with unique Transaction ID (`TXN-CUJ-XXXX`).

### 5. 🛡️ Three Distinct Role-Based Panels ("Different Panels for Admin, Seniors, and Students")
Each role has its own seeded account and panel:

Login is passwordless: enter one of the seeded emails below and the OTP is verified
(email is sent through EmailJS when configured, otherwise shown on screen in dev mode).

| Role | Name & Designation | Login Email | Enrollment / Staff ID |
|---|---|---|---|
| **Admin** | Prof. Arvind Sharma (Controller of Exams & Dean) | `coe.admin@cujammu.ac.in` | `CUJ-ADM-001` |
| **Senior / Lead** | Rahul Jamwal (Student Council President & Tech Club Lead) | `rahul.jamwal@cujstudent.ac.in` | `CUJ/2023/CS/042` |
| **Faculty** | Dr. Meenakshi Rajput (Faculty Convener, Udaan Fest) | `meenakshi.rajput@cujammu.ac.in` | `CUJ-FAC-108` |
| **Organizer** | NSS / NCC Event Coordinator | `nss.organizer@cujammu.ac.in` | `CUJ-ORG-021` |
| **Student (Default)** | Priya Sharma (B.Tech / MCA 4th Sem) | `priya.sharma2024@cujstudent.ac.in` | `CUJ/2024/IT/019` |
| **Student 2** | Aman Verma (MBA 2nd Sem) | `aman.verma2023@cujstudent.ac.in` | `CUJ/2023/MBA/084` |

*(New users can also register with automatic generation of official CU Jammu enrollment IDs)*

#### **Admin Panel Features**:
- Create and publish new announcements and forms across 6 campus categories.
- Configure total vacancies/seats, application fee (₹), and countdown deadline.
- Broadcast manual push reminders and audio chimes to all student smartphones.
- Master applicant records table with real-time search, filter, and fee verification.

#### **Senior / Club Lead Panel Features**:
- Post department activities, youth cultural fests (Udaan), competitions, and sports meets.
- Set team vacancies and registration fees.
- Send targeted reminder alerts to junior students.
- Track registered juniors and teams.

#### **Student Panel Features**:
- Personalized hub with enrolled department, roll number, and semester.
- Filter pending forms requiring submission vs. completed applications.
- Instant downloadable receipt with transaction proof.
- Phone reminder preferences and notification center.

---

## 🚀 Running the Project

Requires Node.js 18 or newer.

```bash
npm install
npm run dev      # http://localhost:3000
```

Other scripts:

```bash
npm run build    # production bundle in dist/
npm run preview  # serve the production bundle on http://localhost:3000
```

### Project structure

```
index.html                 Vite entry, loads /src/main.jsx
tailwind.config.js         CU Jammu theme colours and animations
src/
  main.jsx                 React root
  App.jsx                  providers, notice board, filters, modals
  index.css                Tailwind layers + custom animations
  components/
    Navbar.jsx             header, sound toggle, notification bell, profile
    AuthModal.jsx          email + OTP sign in and registration
    NoticeCard.jsx         one notice with countdown, seats, fee, actions
    NotificationDrawer.jsx notification centre
    PhoneSimulator.jsx     mock lockscreen that receives the alerts
    SubmitFormModal.jsx    details → payment → printable receipt
    StudentDashboard.jsx   student hub (pending vs submitted forms)
    SeniorPanel.jsx        senior / faculty / organizer panel
    AdminPanel.jsx         admin console (publish notices, audit applicants)
  context/
    AuthContext.jsx        users, session, OTP login, roles
    NotificationContext.jsx announcements, submissions, reminder loop
  data/initialData.js      seeded users, notices and submissions
  utils/dateUtils.js       countdown and formatting helpers
  utils/emailOtp.js        OTP generation, EmailJS delivery, verification
  utils/soundAlerts.js     Web Audio chimes
  utils/avatar.js          initials fallback for avatar images
  config/emailjsConfig.js  EmailJS keys (placeholders by default)
```

All data lives in `localStorage`, so the portal runs without a backend. Clear the
site data to reset it to the seeded demo content.

---

## ⚠️ Limitations

This build is a **front-end demo**, not a multi-user service.

- **No backend.** Notices, submissions, accounts and sessions live in `localStorage` of the
  browser you are using. Publishing a notice or submitting a form affects only your browser.
  Clearing site data resets everything to the seeded demo content.
- **OTP is shown on screen.** Email delivery needs EmailJS keys in
  `src/config/emailjsConfig.js`; without them the OTP appears in a dev banner.
- **Payments are simulated.** The UPI / card / net-banking step generates a reference number
  locally and charges nothing.
- **Deadlines are relative.** Seed data uses `now + N hours`, so countdowns always look fresh.

To turn it into a real portal you need a small backend: a database for notices and applications,
server-side OTP/email, and a payment gateway (Razorpay or similar).

## 🚀 Updating the live site

GitHub Pages serves a built snapshot from the `gh-pages` branch, so a push to `main` does **not**
change the live site by itself.

```bash
npm run build -- --base=/cujammu__noticepage/
# copy dist/ to the gh-pages branch, add .nojekyll, commit and push
```

Alternatively, link the repo on Netlify — `netlify.toml` is already committed there, so every
push to `main` rebuilds automatically.
