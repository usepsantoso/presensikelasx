import { AttendanceRecord, DAFTAR_KELAS } from '../types/attendance';

const STORAGE_KEY = 'regina_attendance_records_v2';
const LEGACY_STORAGE_KEY = 'regina_attendance_records_v1';
const PIN_KEY = 'regina_admin_pin_v1';
export const DEFAULT_ADMIN_PIN = 'admin123';

export function getAdminPin(): string {
  try {
    return localStorage.getItem(PIN_KEY) || DEFAULT_ADMIN_PIN;
  } catch {
    return DEFAULT_ADMIN_PIN;
  }
}

export function setAdminPin(newPin: string): void {
  try {
    localStorage.setItem(PIN_KEY, newPin);
  } catch (e) {
    console.error('Failed to set admin pin', e);
  }
}

export function getAttendanceRecords(): AttendanceRecord[] {
  try {
    // Clean up old sample data if present
    localStorage.removeItem(LEGACY_STORAGE_KEY);

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Start completely empty as requested by user
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      return [];
    }
    const parsed = JSON.parse(raw);
    // Filter out any sample placeholder IDs if any existed
    return Array.isArray(parsed)
      ? parsed.filter((r) => !['rec-1', 'rec-2', 'rec-3', 'rec-4', 'rec-5'].includes(r.id))
      : [];
  } catch (err) {
    console.error('Failed to load attendance records:', err);
    return [];
  }
}

export function saveAttendanceRecord(record: AttendanceRecord): AttendanceRecord[] {
  try {
    const existing = getAttendanceRecords();
    const updated = [record, ...existing];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to save attendance record:', err);
    return [];
  }
}

export function deleteAttendanceRecord(id: string): AttendanceRecord[] {
  try {
    const existing = getAttendanceRecords();
    const updated = existing.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to delete attendance record:', err);
    return [];
  }
}

export function clearAllAttendanceRecords(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear records:', err);
  }
}

function generateSampleRecords(): AttendanceRecord[] {
  const today = new Date().toISOString().split('T')[0];
  return [
    {
      id: 'rec-1',
      timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
      date: today,
      time: '06:45',
      kelas: 'X A',
      absen: 1,
      nama: 'Adrian Jonathan Wijaya',
      status: 'Hadir',
      catatan: '',
    },
    {
      id: 'rec-2',
      timestamp: new Date(Date.now() - 1000 * 60 * 28).toISOString(),
      date: today,
      time: '06:52',
      kelas: 'X A',
      absen: 14,
      nama: 'Clara Michelle Santoso',
      status: 'Hadir',
      catatan: '',
    },
    {
      id: 'rec-3',
      timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
      date: today,
      time: '07:05',
      kelas: 'X C',
      absen: 7,
      nama: 'Benedictus Bryan Nugroho',
      status: 'Sakit',
      catatan: 'Flu dan demam tinggi, surat dokter menyusul via WA Wali Kelas',
    },
    {
      id: 'rec-4',
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      date: today,
      time: '07:10',
      kelas: 'X B',
      absen: 22,
      nama: 'Maria Felicia Kusuma',
      status: 'Izin',
      catatan: 'Mengikuti seleksi Olimpiade Sains Kota Surakarta',
    },
    {
      id: 'rec-5',
      timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
      date: today,
      time: '07:15',
      kelas: 'X F',
      absen: 3,
      nama: 'Alexander Kevin Surya',
      status: 'Hadir',
      catatan: '',
    },
  ];
}
