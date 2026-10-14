import React, { useState, useMemo, useEffect } from 'react';
import {
  FileSpreadsheet,
  Printer,
  Trash2,
  Lock,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Eye,
  UserX,
  FileQuestion,
  HeartPulse,
  Database,
  ExternalLink,
  Copy,
  Check,
  X,
  Sparkles,
} from 'lucide-react';
import { AttendanceRecord, DAFTAR_KELAS, KelasType, StatusKehadiran } from '../types/attendance';
import { exportAttendanceToCsv } from '../utils/exportCsv';
import { getSheetsWebhookUrl, setSheetsWebhookUrl } from '../services/sheetsService';

interface AttendanceRekapProps {
  records: AttendanceRecord[];
  onDeleteRecord: (id: string) => void;
  onClearAll: () => void;
  onLockAdmin: () => void;
  onViewSignature: (record: AttendanceRecord) => void;
}

export const AttendanceRekap: React.FC<AttendanceRekapProps> = ({
  records,
  onDeleteRecord,
  onClearAll,
  onLockAdmin,
  onViewSignature,
}) => {
  const [filterKelas, setFilterKelas] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isDbModalOpen, setIsDbModalOpen] = useState<boolean>(false);
  const [webhookUrl, setWebhookUrl] = useState<string>('');
  const [isCopiedScript, setIsCopiedScript] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    setWebhookUrl(getSheetsWebhookUrl());
  }, []);

  const stats = useMemo(() => {
    return {
      total: records.length,
      hadir: records.filter((r) => r.status === 'Hadir').length,
      izin: records.filter((r) => r.status === 'Izin').length,
      sakit: records.filter((r) => r.status === 'Sakit').length,
      alpha: records.filter((r) => r.status === 'Alpha').length,
    };
  }, [records]);

  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      if (filterKelas !== 'ALL' && rec.kelas !== filterKelas) return false;
      if (filterStatus !== 'ALL' && rec.status !== filterStatus) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchName = rec.nama.toLowerCase().includes(query);
        const matchAbsen = String(rec.absen).includes(query);
        const matchKelas = rec.kelas.toLowerCase().includes(query);
        if (!matchName && !matchAbsen && !matchKelas) return false;
      }
      return true;
    });
  }, [records, filterKelas, filterStatus, searchQuery]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    exportAttendanceToCsv(filteredRecords, `Presensi_${filterKelas}_Regina_Pacis`);
  };

  const handleConfirmClearAll = () => {
    if (
      window.confirm(
        '⚠️ Apakah Anda yakin ingin menghapus SELURUH data presensi? Tindakan ini tidak dapat dibatalkan.'
      )
    ) {
      onClearAll();
    }
  };

  const handleDeleteItem = (id: string, name: string) => {
    if (window.confirm(`Hapus catatan presensi untuk siswa "${name}"?`)) {
      onDeleteRecord(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar with Admin Badge and Action Buttons */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-emerald-50/80 p-5 rounded-2xl border border-emerald-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-emerald-950">Rekapitulasi Presensi Siswa</h2>
            <span className="bg-emerald-600 text-white text-[11px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              Admin Aktif
            </span>
          </div>
          <p className="text-xs text-slate-600 font-medium mt-0.5">
            Menampilkan data tersimpan secara real-time. Anda dapat mengekspor atau mencetak laporan ini.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
          <button
            onClick={() => setIsDbModalOpen(true)}
            className="flex-1 md:flex-none px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Database className="w-4 h-4 text-amber-300" />
            <span>Database Spreadsheet</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="flex-1 md:flex-none px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
            <span>Ekspor CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 border border-slate-300 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Cetak</span>
          </button>

          <button
            onClick={handleConfirmClearAll}
            className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 border border-rose-200 cursor-pointer"
          >
            <Trash2 className="w-4 h-4 text-rose-600" />
            <span>Hapus Semua</span>
          </button>

          <button
            onClick={onLockAdmin}
            title="Kunci kembali mode admin"
            className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>Kunci</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm text-center">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Presensi</div>
          <div className="text-2xl font-black text-slate-800 mt-0.5">{stats.total}</div>
        </div>
        <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200 shadow-sm text-center">
          <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center justify-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Hadir
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-0.5">{stats.hadir}</div>
        </div>
        <div className="bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200 shadow-sm text-center">
          <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wider flex items-center justify-center gap-1">
            <FileQuestion className="w-3.5 h-3.5 text-amber-600" /> Izin
          </div>
          <div className="text-2xl font-black text-amber-700 mt-0.5">{stats.izin}</div>
        </div>
        <div className="bg-sky-50/70 p-3.5 rounded-2xl border border-sky-200 shadow-sm text-center">
          <div className="text-[11px] font-bold text-sky-800 uppercase tracking-wider flex items-center justify-center gap-1">
            <HeartPulse className="w-3.5 h-3.5 text-sky-600" /> Sakit
          </div>
          <div className="text-2xl font-black text-sky-700 mt-0.5">{stats.sakit}</div>
        </div>
        <div className="bg-rose-50/70 p-3.5 rounded-2xl border border-rose-200 shadow-sm text-center col-span-2 sm:col-span-1">
          <div className="text-[11px] font-bold text-rose-800 uppercase tracking-wider flex items-center justify-center gap-1">
            <UserX className="w-3.5 h-3.5 text-rose-600" /> Alpha
          </div>
          <div className="text-2xl font-black text-rose-700 mt-0.5">{stats.alpha}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-4">
          <div className="relative">
            <Filter className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={filterKelas}
              onChange={(e) => setFilterKelas(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white font-medium text-xs text-slate-700 outline-none focus:ring-2 focus:ring-emerald-600"
            >
              <option value="ALL">Semua Kelas X (A - J)</option>
              {DAFTAR_KELAS.map((k) => (
                <option key={k} value={k}>
                  Kelas {k}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="sm:col-span-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-medium text-xs text-slate-700 outline-none focus:ring-2 focus:ring-emerald-600"
          >
            <option value="ALL">Semua Status Kehadiran</option>
            <option value="Hadir">Hanya Hadir</option>
            <option value="Izin">Hanya Izin</option>
            <option value="Sakit">Hanya Sakit</option>
            <option value="Alpha">Hanya Alpha</option>
          </select>
        </div>

        <div className="sm:col-span-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama atau nomor absen..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white font-medium text-xs text-slate-700 outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="text-xs uppercase bg-emerald-100/70 border-b border-emerald-200 font-extrabold text-emerald-950">
              <tr>
                <th className="px-4 py-3.5">Waktu</th>
                <th className="px-4 py-3.5">Kelas</th>
                <th className="px-4 py-3.5 text-center">Absen</th>
                <th className="px-4 py-3.5">Nama Siswa</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Keterangan</th>
                <th className="px-4 py-3.5 text-center">Tanda Tangan</th>
                <th className="px-4 py-3.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400">
                    <div className="flex flex-col items-center justify-center">
                      <Clock className="w-8 h-8 text-slate-300 mb-2" />
                      <p className="font-semibold text-slate-500">Tidak ada data presensi yang sesuai</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Cobalah mengubah filter pencarian atau isi formulir presensi terlebih dahulu.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => {
                  let badge = (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> Hadir
                    </span>
                  );
                  if (rec.status === 'Izin') {
                    badge = (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span> Izin
                      </span>
                    );
                  } else if (rec.status === 'Sakit') {
                    badge = (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-900 border border-sky-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-600"></span> Sakit
                      </span>
                    );
                  } else if (rec.status === 'Alpha') {
                    badge = (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-900 border border-rose-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span> Alpha
                      </span>
                    );
                  }

                  return (
                    <tr key={rec.id} className="hover:bg-emerald-50/30 transition-colors">
                      <td className="px-4 py-3 text-xs font-mono text-slate-500">
                        <div>{rec.date}</div>
                        <div className="font-semibold text-slate-700">{rec.time} WIB</div>
                      </td>
                      <td className="px-4 py-3 font-extrabold text-slate-800">{rec.kelas}</td>
                      <td className="px-4 py-3 font-bold text-center text-slate-700">{rec.absen}</td>
                      <td className="px-4 py-3 font-semibold text-slate-900">{rec.nama}</td>
                      <td className="px-4 py-3">{badge}</td>
                      <td className="px-4 py-3 text-xs text-slate-500 max-w-xs truncate" title={rec.catatan}>
                        {rec.catatan || '-'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {rec.signature ? (
                          <button
                            onClick={() => onViewSignature(rec)}
                            title="Klik untuk melihat tanda tangan penuh"
                            className="inline-flex items-center gap-1 px-2 py-1 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition group cursor-pointer"
                          >
                            <img
                              src={rec.signature}
                              alt={`TTD ${rec.nama}`}
                              className="h-6 max-w-[50px] object-contain"
                            />
                            <Eye className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600" />
                          </button>
                        ) : (
                          <span className="text-slate-400 text-xs">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleDeleteItem(rec.id, rec.nama)}
                          title="Hapus data presensi"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Database Spreadsheet Config Modal */}
      {isDbModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 md:p-7 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto text-slate-800 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-800 text-amber-300 flex items-center justify-center text-lg shadow-sm">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900">
                    Pengaturan Database Google Spreadsheet
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Simpan seluruh presensi siswa langsung otomatis ke Google Sheets Anda
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsDbModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {saveSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl font-semibold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{saveSuccessMsg}</span>
              </div>
            )}

            {/* URL Input */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">
                URL Google Apps Script Web App (Webhook Database):
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs outline-none focus:ring-2 focus:ring-emerald-600"
                />
                <button
                  type="button"
                  onClick={() => {
                    setSheetsWebhookUrl(webhookUrl);
                    setSaveSuccessMsg('URL Spreadsheet tersimpan! Presensi akan langsung terkirim.');
                    setTimeout(() => setSaveSuccessMsg(null), 4000);
                  }}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold rounded-xl transition cursor-pointer shadow-sm shrink-0"
                >
                  Simpan
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                Data presensi siswa otomatis terkirim langsung ke URL ini setiap kali tombol "Kirim Presensi" ditekan.
              </p>
            </div>

            {/* Quick 3-Step Setup */}
            <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-3">
              <div className="flex items-center gap-1.5 font-extrabold text-emerald-950 text-xs">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Cara Menghubungkan Google Spreadsheet Anda (1 Menit):</span>
              </div>
              <ol className="list-decimal pl-4 space-y-1.5 text-slate-700 text-[11px] leading-relaxed">
                <li>Buka Google Spreadsheet baru di Google Drive Anda.</li>
                <li>
                  Klik menu <b>Ekstensi</b> &gt; <b>Apps Script</b>.
                </li>
                <li>Hapus kode bawaan, lalu salin dan tempel kode script di bawah ini.</li>
                <li>
                  Klik tombol biru <b>Terapkan (Deploy)</b> &gt; <b>Penerapan Baru</b> &gt; pilih jenis <b>Aplikasi Web</b>.
                </li>
                <li>
                  Atur <b>Siapa yang memiliki akses (Who has access)</b> menjadi: <b>Siapa saja (Anyone)</b>.
                </li>
                <li>Salin <i>URL Aplikasi Web</i> yang diberikan Google, lalu tempel pada kotak input di atas dan klik <b>Simpan</b>.</li>
              </ol>
            </div>

            {/* Script Code snippet */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-700">Kode Google Apps Script:</span>
                <button
                  type="button"
                  onClick={() => {
                    const scriptCode = `function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Timestamp", "Tanggal", "Jam (WIB)", "Kelas", "No. Absen", "Nama Siswa", "Status", "Keterangan", "Tanda Tangan"]);
  }
  var data = JSON.parse(e.postData.contents);
  sheet.appendRow([
    new Date(),
    data.date,
    data.time,
    data.kelas,
    data.absen,
    data.nama,
    data.status,
    data.catatan || "-",
    data.hasSignature ? "Tervalidasi TTD" : "Tanpa TTD"
  ]);
  return ContentService.createTextOutput(JSON.stringify({result: "success"})).setMimeType(ContentService.MimeType.JSON);
}`;
                    navigator.clipboard.writeText(scriptCode);
                    setIsCopiedScript(true);
                    setTimeout(() => setIsCopiedScript(false), 2500);
                  }}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-900 text-white font-bold text-[11px] rounded-lg transition flex items-center gap-1 cursor-pointer"
                >
                  {isCopiedScript ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin Script</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-3 bg-slate-900 text-emerald-300 font-mono text-[10.5px] rounded-xl overflow-x-auto border border-slate-800 leading-relaxed">
{`function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Timestamp", "Tanggal", "Jam (WIB)", "Kelas", "No. Absen", "Nama Siswa", "Status", "Keterangan", "Tanda Tangan"]);
  }
  var data = JSON.parse(e.postData.contents);
  sheet.appendRow([
    new Date(),
    data.date,
    data.time,
    data.kelas,
    data.absen,
    data.nama,
    data.status,
    data.catatan || "-",
    data.hasSignature ? "Tervalidasi TTD" : "Tanpa TTD"
  ]);
  return ContentService.createTextOutput(JSON.stringify({result: "success"})).setMimeType(ContentService.MimeType.JSON);
}`}
              </pre>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setIsDbModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
