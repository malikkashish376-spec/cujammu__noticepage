import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { formatCurrency, formatDeadline } from '../utils/dateUtils';
import {
  X, CheckCircle2, CreditCard, Smartphone, Building, Loader2,
  Printer, ShieldCheck, FileText, AlertCircle, IndianRupee, ArrowRight, ArrowLeft
} from 'lucide-react';

const PAYMENT_METHODS = [
  { id: 'upi', label: 'UPI / QR', Icon: Smartphone, hint: 'GPay · PhonePe · Paytm · BHIM' },
  { id: 'card', label: 'Debit / Credit Card', Icon: CreditCard, hint: 'Visa · Mastercard · RuPay' },
  { id: 'netbanking', label: 'Net Banking', Icon: Building, hint: 'SBI · J&K Bank · PNB' },
];

/**
 * Multi-step form modal: details → (payment when fee > 0) → receipt.
 * `viewReceipt` opens straight on the receipt of an already submitted form.
 */
export default function SubmitFormModal({ notice, viewReceipt = false, onClose }) {
  const { currentUser } = useAuth();
  const { submitApplication, submissions } = useNotifications();

  const existingSubmission = useMemo(
    () =>
      submissions.find(
        (s) => s.noticeId === notice?.id && s.studentId === currentUser?.id
      ) || null,
    [submissions, notice, currentUser]
  );

  const [step, setStep] = useState(viewReceipt && existingSubmission ? 'receipt' : 'details');
  const [submission, setSubmission] = useState(existingSubmission);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [method, setMethod] = useState('upi');
  const [accepted, setAccepted] = useState(false);
  const [details, setDetails] = useState({
    fullName: currentUser?.name || '',
    rollNo: currentUser?.idNumber || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    semester: currentUser?.semester || '',
    teamName: '',
    remarks: '',
  });

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!notice) return null;

  const fee = Number(notice.fee) || 0;
  const vacanciesLeft = Math.max(0, notice.totalVacancies - notice.filledVacancies);
  const set = (key) => (e) => setDetails((d) => ({ ...d, [key]: e.target.value }));

  const handleDetailsNext = (e) => {
    e.preventDefault();
    setError('');
    if (!details.fullName.trim()) return setError('Please enter your full name.');
    if (!details.rollNo.trim()) return setError('Please enter your roll number / enrollment ID.');
    if (!details.phone.trim()) return setError('Please enter a mobile number for reminders.');
    if (!accepted) return setError('Please confirm the declaration before continuing.');
    if (fee > 0) setStep('payment');
    else finish();
  };

  const finish = () => {
    setBusy(true);
    setError('');
    const res = submitApplication(
      { noticeId: notice.id, details: { ...details, paymentMethod: fee > 0 ? method : 'FREE' } },
      currentUser
    );
    setBusy(false);
    if (!res.success) {
      setError(res.error || 'Could not submit the form. Please try again.');
      return;
    }
    setSubmission(res.submission);
    setStep('receipt');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-start sm:items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-cuj-navy to-cuj-blue text-white p-5 sm:p-6 flex justify-between items-start gap-3">
          <div className="min-w-0">
            <div className="text-[10px] font-black uppercase tracking-widest text-amber-300 mb-1">
              {step === 'receipt' ? 'Submission Receipt' : step === 'payment' ? 'Fee Payment' : 'Application Form'}
            </div>
            <h2 className="text-base sm:text-lg font-black leading-snug">{notice.title}</h2>
            <p className="text-[11px] text-slate-300 mt-1">
              {notice.department} · Deadline {formatDeadline(notice.deadline)}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step strip */}
        {step !== 'receipt' && (
          <div className="flex items-center gap-2 px-5 sm:px-6 py-3 bg-slate-50 border-b border-slate-200 text-[11px] font-bold">
            <StepDot active={step === 'details'} done={step === 'payment'} label="1. Details" />
            {fee > 0 && (
              <>
                <div className="h-px flex-1 bg-slate-200" />
                <StepDot active={step === 'payment'} done={false} label="2. Payment" />
              </>
            )}
            <div className="h-px flex-1 bg-slate-200" />
            <StepDot active={false} done={false} label={fee > 0 ? '3. Receipt' : '2. Receipt'} />
          </div>
        )}

        <div className="p-5 sm:p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* ── STEP 1: details ── */}
          {step === 'details' && (
            <form onSubmit={handleDetailsNext} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Full Name *" value={details.fullName} onChange={set('fullName')} />
                <Field label="Roll No / Enrollment ID *" value={details.rollNo} onChange={set('rollNo')} mono />
                <Field label="Email" value={details.email} onChange={set('email')} type="email" />
                <Field label="Mobile Number *" value={details.phone} onChange={set('phone')} type="tel" />
                {currentUser?.role === 'student' && (
                  <Field label="Semester" value={details.semester} onChange={set('semester')} />
                )}
                <Field label="Team Name (optional)" value={details.teamName} onChange={set('teamName')} />
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Remarks (optional)</label>
                  <textarea
                    rows={2}
                    value={details.remarks}
                    onChange={set('remarks')}
                    placeholder="Anything the office should know about your application"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-cuj-blue outline-none"
                  />
                </div>
              </div>

              {notice.documentsRequired?.length > 0 && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5">
                  <p className="text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" /> Carry these documents
                  </p>
                  <ul className="text-[11px] text-slate-600 space-y-0.5">
                    {notice.documentsRequired.map((doc) => (
                      <li key={doc}>• {doc}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-2xl p-3.5">
                <div className="text-xs">
                  <span className="text-slate-500 font-semibold">Seats left: </span>
                  <span className={`font-black ${vacanciesLeft < 15 ? 'text-red-600' : 'text-slate-900'}`}>
                    {vacanciesLeft} / {notice.totalVacancies}
                  </span>
                </div>
                <div className="text-xs">
                  <span className="text-slate-500 font-semibold">Fee: </span>
                  <span className="font-black text-cuj-navy">{formatCurrency(fee)}</span>
                </div>
              </div>

              <label className="flex items-start gap-2 text-[11px] text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={accepted}
                  onChange={(e) => setAccepted(e.target.checked)}
                  className="mt-0.5 w-3.5 h-3.5 accent-cuj-navy"
                />
                <span>
                  I declare that the information given above is correct and I accept the rules of this
                  application. I understand that the seat is confirmed only after payment and verification.
                </span>
              </label>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busy || vacanciesLeft <= 0}
                  className="bg-cuj-navy hover:bg-cuj-blue text-white font-black text-xs px-5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                  <span>{fee > 0 ? 'Continue to Payment' : 'Submit Form'}</span>
                </button>
              </div>
            </form>
          )}

          {/* ── STEP 2: payment ── */}
          {step === 'payment' && (
            <div className="space-y-4">
              <div className="bg-cuj-navy text-white rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-amber-300 font-black">Amount payable</p>
                  <p className="text-2xl font-black flex items-center gap-1">
                    <IndianRupee className="w-5 h-5" />
                    {fee.toLocaleString('en-IN')}
                  </p>
                </div>
                <ShieldCheck className="w-8 h-8 text-emerald-400" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {PAYMENT_METHODS.map(({ id, label, Icon, hint }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setMethod(id)}
                    className={`text-left p-3 rounded-2xl border transition-all ${
                      method === id
                        ? 'border-cuj-blue bg-blue-50 ring-2 ring-cuj-blue/30'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-cuj-blue mb-1" />
                    <div className="text-[11px] font-black text-slate-800">{label}</div>
                    <div className="text-[10px] text-slate-400 leading-tight">{hint}</div>
                  </button>
                ))}
              </div>

              <div className="bg-amber-50 border border-amber-200 text-amber-800 text-[11px] p-3 rounded-xl">
                Demo payment gateway — no real money is charged. A transaction reference is generated
                locally so the receipt flow can be tested end to end.
              </div>

              <div className="flex justify-between gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
                <button
                  type="button"
                  onClick={finish}
                  disabled={busy}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 disabled:opacity-60"
                >
                  {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  <span>Pay ₹{fee.toLocaleString('en-IN')} & Submit</span>
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: receipt ── */}
          {step === 'receipt' && submission && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-base font-black text-slate-900">Form submitted successfully</h3>
                <p className="text-[11px] text-slate-500">
                  Keep this receipt. Your seat is confirmed against the reference below.
                </p>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <div className="bg-slate-50 px-4 py-2.5 flex items-center justify-between border-b border-slate-200">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                    CU Jammu Campus Pulse
                  </span>
                  <span className="text-[10px] font-mono font-bold text-cuj-blue">{submission.transactionId}</span>
                </div>
                <dl className="divide-y divide-slate-100 text-xs">
                  <Row label="Notice" value={submission.noticeTitle} />
                  <Row label="Applicant" value={`${submission.studentName} (${submission.studentRoll})`} />
                  <Row label="Department" value={submission.department} />
                  <Row
                    label="Submitted on"
                    value={new Date(submission.submittedAt).toLocaleString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                    })}
                  />
                  <Row label="Fee paid" value={formatCurrency(submission.feePaid)} />
                  <Row label="Payment status" value={submission.paymentStatus} />
                  <Row label="Status" value={submission.status} />
                </dl>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" /> Print receipt
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl text-xs font-black bg-cuj-navy hover:bg-cuj-blue text-white"
                >
                  Done
                </button>
              </div>
            </div>
          )}

          {step === 'receipt' && !submission && (
            <div className="text-center py-8 text-xs text-slate-500">
              No submission found for this form yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', mono = false }) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-700 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        className={`w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-cuj-blue outline-none ${
          mono ? 'font-mono' : ''
        }`}
      />
    </div>
  );
}

function StepDot({ active, done, label }) {
  return (
    <span
      className={`flex items-center gap-1.5 px-2 py-1 rounded-full ${
        active
          ? 'bg-cuj-navy text-white'
          : done
          ? 'bg-emerald-100 text-emerald-800'
          : 'bg-slate-100 text-slate-500'
      }`}
    >
      {done ? <CheckCircle2 className="w-3 h-3" /> : null}
      {label}
    </span>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-4 px-4 py-2">
      <dt className="text-slate-500 font-semibold">{label}</dt>
      <dd className="text-slate-900 font-bold text-right break-words">{value}</dd>
    </div>
  );
}
