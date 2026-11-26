# 🏛️ CU Jammu Campus Pulse - Notification, Vacancy & Reminder Alert Portal
**जम्मू केंद्रीय विश्वविद्यालय | Central University of Jammu (CUJ)**
*Established under Central Universities Act, 2009 | Rahya-Suchani (Bagla), Samba - 181143*

A full-featured, real-time campus notification portal with **smartphone push alert simulation**, **recurring deadline reminders ("Baar-Baar Reminder")**, **vacancy tracking**, **fee collection**, and **role-based panels** for **Admin, Seniors/Faculty, and Students**.

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
Each role has their own unique ID, email, and password:

| Role | Name & Designation | Login ID / Email | Default Password |
|---|---|---|---|
| **Admin** | Prof. Arvind Sharma (Controller of Exams & Dean) | `admin@cujammu.ac.in` or `CUJ-ADM-001` | `admin123` |
| **Senior / Lead** | Rahul Jamwal (Student Council President & Tech Club Lead) | `senior.rahul@cujammu.ac.in` or `CUJ/2023/CS/042` | `senior123` |
| **Senior / Faculty** | Dr. Meenakshi Rajput (Faculty Convener, Udaan Fest) | `faculty.meenakshi@cujammu.ac.in` or `CUJ-FAC-108` | `faculty123` |
| **Student (Default)** | Priya Sharma (MCA / B.Tech 4th Sem) | `student.priya@cujammu.ac.in` or `CUJ/2024/IT/019` | `student123` |
| **Student 2** | Aman Verma (MBA 2nd Sem) | `student.aman@cujammu.ac.in` or `CUJ/2023/MBA/084` | `student123` |

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

```bash
cd C:\Users\hp\.gemini\antigravity\scratch\cuj-notify-portal
npm install
npm run dev
```

Server will run at **http://localhost:3000**
