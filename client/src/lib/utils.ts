import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";
import { ro } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | number): string {
  const dateObj = new Date(date);
  return format(dateObj, "d MMMM, yyyy", { locale: ro });
}

export function formatDateTime(date: Date | string | number): string {
  const dateObj = new Date(date);
  return format(dateObj, "d MMMM, yyyy • HH:mm", { locale: ro });
}

export function formatTime(date: Date | string | number): string {
  const dateObj = new Date(date);
  return format(dateObj, "HH:mm", { locale: ro });
}

export function formatRelativeTime(date: Date | string | number): string {
  const dateObj = new Date(date);
  const now = new Date();
  
  // If it's today
  if (dateObj.toDateString() === now.toDateString()) {
    return "Astăzi, " + format(dateObj, "HH:mm");
  }
  
  // If it's yesterday
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (dateObj.toDateString() === yesterday.toDateString()) {
    return "Ieri, " + format(dateObj, "HH:mm");
  }
  
  // If it's within the last 7 days
  const daysAgo = Math.floor((now.getTime() - dateObj.getTime()) / (1000 * 60 * 60 * 24));
  if (daysAgo < 7) {
    return `${daysAgo}d în urmă`;
  }
  
  // Otherwise, just show the date
  return format(dateObj, "d MMM, yyyy", { locale: ro });
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

export function generateInitials(name: string): string {
  if (!name) return "U";
  
  const parts = name.split(" ");
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export const serviceCategories = [
  "Toate",
  "Transport",
  "Construcții",
  "Medicale",
  "Educație",
  "Curățenie",
  "Juridice",
  "IT",
  "Financiare",
  "Gastronomie",
  "Imobiliare",
  "Altele"
];

export const eventCategories = [
  "Toate",
  "Culturale",
  "Sociale",
  "Educaționale",
  "Business",
  "Sport",
  "Religioase",
  "Altele"
];

export const newsCategories = [
  "Toate",
  "Romania",
  "Belgia",
  "Comunitate",
  "Europa",
  "Economie",
  "Cultură",
  "Politică",
  "Sport"
];

export function getRandomAvatar(seed: string | number): string {
  // Generate a consistent avatar URL based on seed
  const id = typeof seed === 'number' ? seed : Math.abs(seed.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0)) % 100;
  
  return `https://randomuser.me/api/portraits/${id % 2 === 0 ? 'men' : 'women'}/${id}.jpg`;
}
