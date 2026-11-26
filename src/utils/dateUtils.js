// Utility functions for dates, deadlines, and countdown calculations

export function getTimeRemaining(deadline) {
  const total = new Date(deadline).getTime() - new Date().getTime();
  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));

  return {
    total,
    days: Math.max(0, days),
    hours: Math.max(0, hours),
    minutes: Math.max(0, minutes),
    seconds: Math.max(0, seconds),
    isExpired: total <= 0,
    isUrgent: total > 0 && total <= 24 * 60 * 60 * 1000, // Less than 24 hours
    isCritical: total > 0 && total <= 6 * 60 * 60 * 1000, // Less than 6 hours
  };
}

export function formatDeadline(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function formatCurrency(amount) {
  if (amount === 0 || amount === '0' || amount === null || amount === undefined) {
    return 'FREE (₹0)';
  }
  return `₹${Number(amount).toLocaleString('en-IN')}`;
}
