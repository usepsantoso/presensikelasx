import { AttendanceRecord } from '../types/attendance';
import {
  getAttendanceRecords,
  saveAttendanceRecord,
  deleteAttendanceRecord,
  clearAllAttendanceRecords,
} from '../utils/storage';

const API_BASE = '/api/presensi';

export async function fetchSharedAttendanceRecords(): Promise<AttendanceRecord[]> {
  try {
    const res = await fetch(API_BASE);
    if (!res.ok) throw new Error('Network error');
    const data = await res.json();
    if (data.success && Array.isArray(data.records)) {
      return data.records;
    }
  } catch (err) {
    console.warn('Backend API unavailable, using local storage:', err);
  }
  return getAttendanceRecords();
}

export async function postSharedAttendanceRecord(
  record: AttendanceRecord
): Promise<AttendanceRecord[]> {
  // Always update local storage first
  const localUpdated = saveAttendanceRecord(record);

  // Send to central server database
  try {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        return await fetchSharedAttendanceRecords();
      }
    }
  } catch (err) {
    console.warn('Backend API save failed:', err);
  }

  return localUpdated;
}

export async function deleteSharedAttendanceRecord(
  id: string
): Promise<AttendanceRecord[]> {
  const localUpdated = deleteAttendanceRecord(id);

  try {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      return await fetchSharedAttendanceRecords();
    }
  } catch (err) {
    console.warn('Backend API delete failed:', err);
  }

  return localUpdated;
}

export async function clearAllSharedAttendanceRecords(): Promise<void> {
  clearAllAttendanceRecords();

  try {
    await fetch(API_BASE, {
      method: 'DELETE',
    });
  } catch (err) {
    console.warn('Backend API clear failed:', err);
  }
}
