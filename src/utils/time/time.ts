import {
  format, formatDistance, addMinutes, addHours, addDays,
  isAfter, isBefore, parseISO, startOfDay, endOfDay,
} from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';
import { th } from 'date-fns/locale';

const TZ = 'Asia/Bangkok';

// --- แปลง timezone ---

// UTC → Thai time (สำหรับแสดงผล)
export function toThaiTime(date: Date | string): Date {
  return toZonedTime(new Date(date), TZ);
}

// Thai time → UTC (สำหรับเก็บ DB)
export function fromThaiTime(date: Date | string): Date {
  return fromZonedTime(new Date(date), TZ);
}

// --- Format ---

// "10/03/2568 13:00:00" — Thai locale พุทธศักราช
export function formatThai(date: Date | string): string {
  return format(toThaiTime(date), 'dd/MM/yyyy HH:mm:ss', { locale: th });
}

// "10 มี.ค. 2568 13:00" — อ่านง่าย
export function formatThaiShort(date: Date | string): string {
  return format(toThaiTime(date), 'd MMM yyyy HH:mm', { locale: th });
}

// "2025-03-10T06:00:00.000Z" — ISO สำหรับ API response
export function formatISO(date: Date | string): string {
  return new Date(date).toISOString();
}

// "3 ชั่วโมงที่แล้ว" — relative time
export function formatRelative(date: Date | string): string {
  return formatDistance(new Date(date), new Date(), {
    addSuffix: true,
    locale: th,
  });
}

// --- Utility ---

export function nowUTC(): Date {
  return new Date();
}

export function isExpired(date: Date | string): boolean {
  return isAfter(new Date(), new Date(date));
}

// ช่วงเวลาของวัน (Thai timezone)
export function startOfThaiDay(date: Date | string): Date {
  return fromZonedTime(startOfDay(toThaiTime(date)), TZ);
}

export function endOfThaiDay(date: Date | string): Date {
  return fromZonedTime(endOfDay(toThaiTime(date)), TZ);
}

// re-export date-fns ที่ใช้บ่อย ไม่ต้อง import หลายที่
export { addMinutes, addHours, addDays, isAfter, isBefore, parseISO };