import React from 'react';
import { X, UserCheck, Calendar, Clock, Download } from 'lucide-react';
import { AttendanceRecord } from '../types/attendance';

interface SignaturePreviewModalProps {
  record: AttendanceRecord | null;
  onClose: () => void;
}

export const SignaturePreviewModal: React.FC<SignaturePreviewModalProps> = ({ record, onClose }) => {
  if (!record) return null;

  const handleDownloadSignature = () => {
    if (!record.signature) return;
    const a = document.createElement('a');
    a.href = record.signature;
    a.download = `TTD_${record.kelas}_${record.absen}_${record.nama.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="font-black text-slate-800 text-base">Tanda Tangan Digital Siswa</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Student metadata */}
        <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-100 text-xs space-y-1.5">
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Nama Siswa:</span>
            <span className="font-extrabold text-slate-900">{record.nama}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Kelas / Absen:</span>
            <span className="font-bold text-slate-800">
              {record.kelas} (No. {record.absen})
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Status:</span>
            <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
              {record.status}
            </span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span className="font-medium flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Tanggal:
            </span>
            <span className="font-mono">{record.date}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span className="font-medium flex items-center gap-1">
              <Clock className="w-3 h-3" /> Waktu:
            </span>
            <span className="font-mono">{record.time} WIB</span>
          </div>
        </div>

        {/* Signature preview area */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Spesimen Tanda Tangan
          </div>
          {record.signature ? (
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-inner flex items-center justify-center">
              <img
                src={record.signature}
                alt={`Tanda tangan ${record.nama}`}
                className="max-h-40 max-w-full object-contain"
              />
            </div>
          ) : (
            <div className="py-8 text-xs text-slate-400">Tidak ada tanda tangan terlampir</div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-2.5">
          {record.signature && (
            <button
              onClick={handleDownloadSignature}
              className="flex-1 py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Unduh Berkas Gambar</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
