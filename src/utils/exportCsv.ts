import { AttendanceRecord } from '../types/attendance';

export function exportAttendanceToCsv(records: AttendanceRecord[], filenamePrefix = 'Rekap_Presensi_Kelas_X'): void {
  if (records.length === 0) {
    alert('Tidak ada data presensi untuk diekspor.');
    return;
  }

  const headers = [
    'No',
    'Tanggal',
    'Waktu (WIB)',
    'Kelas',
    'No Absen',
    'Nama Lengkap Siswa',
    'Status Kehadiran',
    'Keterangan / Alasan',
    'Tanda Tangan Terlampir',
  ];

  const rows = records.map((rec, index) => [
    (index + 1).toString(),
    rec.date,
    rec.time,
    rec.kelas,
    rec.absen.toString(),
    `"${rec.nama.replace(/"/g, '""')}"`,
    rec.status,
    `"${(rec.catatan || '-').replace(/"/g, '""')}"`,
    rec.signature ? 'Ada' : 'Tidak Ada',
  ]);

  const csvContent =
    '\uFEFF' + // UTF-8 BOM for Microsoft Excel
    [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];

  link.setAttribute('href', url);
  link.setAttribute('download', `${filenamePrefix}_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
