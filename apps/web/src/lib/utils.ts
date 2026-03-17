import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = 'GHS') {
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions) {
  return new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...options,
  });
}

export function getInitials(firstName: string, lastName: string) {
  return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
}

export function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    VISITOR: 'bg-amber-100 text-amber-800',
    NEW_CONVERT: 'bg-emerald-100 text-emerald-800',
    MEMBER: 'bg-green-100 text-green-800',
    WORKER: 'bg-blue-100 text-blue-800',
    LEADER: 'bg-purple-100 text-purple-800',
    INACTIVE: 'bg-gray-100 text-gray-600',
    ARCHIVED: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-600';
}

export function getAvatarColor(name: string) {
  const colors = [
    'bg-blue-100 text-blue-700',
    'bg-purple-100 text-purple-700',
    'bg-pink-100 text-pink-700',
    'bg-teal-100 text-teal-700',
    'bg-amber-100 text-amber-700',
    'bg-rose-100 text-rose-700',
    'bg-indigo-100 text-indigo-700',
    'bg-emerald-100 text-emerald-700',
  ];
  const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  return colors[index];
}
