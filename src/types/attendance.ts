export type KelasType =
  | 'X A'
  | 'X B'
  | 'X C'
  | 'X D'
  | 'X E'
  | 'X F'
  | 'X G'
  | 'X H'
  | 'X I'
  | 'X J';

export const DAFTAR_KELAS: KelasType[] = [
  'X A',
  'X B',
  'X C',
  'X D',
  'X E',
  'X F',
  'X G',
  'X H',
  'X I',
  'X J',
];

export type StatusKehadiran = 'Hadir' | 'Izin' | 'Sakit' | 'Alpha';

export interface AttendanceRecord {
  id: string;
  timestamp: string; // ISO format
  date: string;      // YYYY-MM-DD
  time: string;      // HH:mm WIB
  kelas: KelasType;
  absen: number;
  nama: string;
  status: StatusKehadiran;
  catatan?: string;
  signature?: string; // Data URL format image/png
}

export type ActiveTab = 'form' | 'rekap';
