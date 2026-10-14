import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  CalendarCheck,
  Users,
  ListOrdered,
  User,
  ClipboardList,
  CheckCircle,
  FileQuestion,
  HeartPulse,
  XCircle,
  FileText,
  Send,
  AlertCircle,
  Lock,
} from 'lucide-react';
import { DAFTAR_KELAS, KelasType, StatusKehadiran, AttendanceRecord } from '../types/attendance';
import { SignaturePad } from './SignaturePad';
import { getAccessToken } from '../services/auth';
import { directSaveToSpreadsheet } from '../services/sheetsService';

interface AttendanceFormProps {
  onSuccess: (record: AttendanceRecord) => void;
}

export const AttendanceForm: React.FC<AttendanceFormProps> = ({ onSuccess }) => {
  const [todayIso, setTodayIso] = useState<string>('');
  const [kelas, setKelas] = useState<KelasType | ''>('');
  const [absen, setAbsen] = useState<number | ''>('');
  const [nama, setNama] = useState<string>('');
  const [status, setStatus] = useState<StatusKehadiran>('Hadir');
  const [catatan, setCatatan] = useState<string>('');
  const [signatureData, setSignatureData] = useState<string | null>(null);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [resetKey, setResetKey] = useState<number>(0);

  useEffect(() => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    setTodayIso(`${yyyy}-${mm}-${dd}`);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!kelas) {
      setErrorMessage('Silakan pilih Kelas X Anda!');
      return;
    }

    if (!absen) {
      setErrorMessage('Silakan pilih Nomor Absen Anda!');
      return;
    }

    if (!nama.trim()) {
      setErrorMessage('Silakan isi Nama Lengkap Siswa sesuai daftar hadir!');
      return;
    }

    if ((status === 'Izin' || status === 'Sakit') && !catatan.trim()) {
      setErrorMessage(`Silakan sertakan keterangan / alasan untuk status ${status}!`);
      return;
    }

    if (!signatureData) {
      setErrorMessage('Tanda tangan digital siswa wajib dibubuhkan sebelum mengirim presensi!');
      return;
    }

    setIsSubmitting(true);

    const now = new Date();
    const timeFormatted =
      String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');

    const newRecord: AttendanceRecord = {
      id: 'presensi-' + Date.now(),
      timestamp: now.toISOString(),
      date: todayIso,
      time: timeFormatted,
      kelas: kelas as KelasType,
      absen: Number(absen),
      nama: nama.trim(),
      status: status,
      catatan: catatan.trim(),
      signature: signatureData,
    };

    setTimeout(async () => {
      onSuccess(newRecord);

      // Direct invisible save to Google Spreadsheet database
      try {
        const token = await getAccessToken();
        await directSaveToSpreadsheet(newRecord, token);
      } catch (sheetErr) {
        console.warn('Direct spreadsheet save:', sheetErr);
      }

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#22c55e', '#16a34a', '#facc15', '#15803d'],
        });
      } catch (err) {
        console.error('Confetti err', err);
      }

      setSuccessMessage(
        `Presensi berhasil dikirim & tersimpan di database spreadsheet! Siswa ${nama.trim()} (${kelas} - No. ${absen}) tercatat ${status}.`
      );

      // Reset form fields
      setNama('');
      setAbsen('');
      setCatatan('');
      setStatus('Hadir');
      setSignatureData(null);
      setResetKey((prev) => prev + 1);
      setIsSubmitting(false);

      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 400);
  };

  return (
    <div className="space-y-6">
      {/* Alert Notices */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3 shadow-sm animate-shake">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{errorMessage}</div>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm flex items-start gap-3 shadow-sm">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1 font-semibold">{successMessage}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tanggal Presensi (Locked) */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <CalendarCheck className="w-4 h-4 text-emerald-600" />
                <span>Tanggal Presensi</span>
              </span>
              <span className="text-[11px] bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                <Lock className="w-3 h-3 text-amber-700" />
                Otomatis Hari Ini
              </span>
            </label>
            <input
              type="date"
              value={todayIso}
              readOnly
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-100 text-slate-700 font-semibold shadow-inner outline-none cursor-not-allowed"
            />
          </div>

          {/* Kelas X Selector */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-emerald-600" />
              <span>Kelas X SMA Regina Pacis</span>
              <span className="text-rose-500">*</span>
            </label>
            <select
              value={kelas}
              onChange={(e) => setKelas(e.target.value as KelasType)}
              required
              className="w-full px-4 py-3 rounded-2xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:border-transparent outline-none transition bg-white font-semibold text-slate-800"
            >
              <option value="">-- Pilih Kelas X (A - J) --</option>
              {DAFTAR_KELAS.map((k) => (
                <option key={k} value={k}>
                  Kelas {k}
                </option>
              ))}
            </select>
          </div>

          {/* Nomor Absen (1 - 38) */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-1.5">
              <ListOrdered className="w-4 h-4 text-emerald-600" />
              <span>Nomor Presensi / Absen</span>
              <span className="text-rose-500">*</span>
            </label>
            <select
              value={absen}
              onChange={(e) => setAbsen(e.target.value ? Number(e.target.value) : '')}
              required
              className="w-full px-4 py-3 rounded-2xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:border-transparent outline-none transition bg-white font-semibold text-slate-800"
            >
              <option value="">-- Pilih Nomor Absen (1 - 38) --</option>
              {Array.from({ length: 38 }, (_, i) => i + 1).map((num) => (
                <option key={num} value={num}>
                  Nomor Absen {num}
                </option>
              ))}
            </select>
          </div>

          {/* Nama Siswa */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-1.5">
              <User className="w-4 h-4 text-emerald-600" />
              <span>Nama Lengkap Siswa</span>
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Sesuai nama terdaftar di buku presensi"
              required
              className="w-full px-4 py-3 rounded-2xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:border-transparent outline-none transition font-medium text-slate-800 placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Status Kehadiran Radio Options */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-1.5">
            <ClipboardList className="w-4 h-4 text-emerald-600" />
            <span>Status Kehadiran Hari Ini</span>
            <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {/* Hadir */}
            <button
              type="button"
              onClick={() => setStatus('Hadir')}
              className={`flex items-center justify-center p-3.5 border-2 rounded-2xl font-bold transition-all text-sm ${
                status === 'Hadir'
                  ? 'border-emerald-600 bg-emerald-100/90 text-emerald-950 shadow-sm ring-2 ring-emerald-500/30'
                  : 'border-slate-200 bg-white hover:bg-emerald-50/50 text-slate-700 hover:border-emerald-300'
              }`}
            >
              <CheckCircle
                className={`w-4 h-4 mr-2 ${status === 'Hadir' ? 'text-emerald-700' : 'text-emerald-500'}`}
              />
              <span>Hadir</span>
            </button>

            {/* Izin */}
            <button
              type="button"
              onClick={() => setStatus('Izin')}
              className={`flex items-center justify-center p-3.5 border-2 rounded-2xl font-bold transition-all text-sm ${
                status === 'Izin'
                  ? 'border-amber-500 bg-amber-100/90 text-amber-950 shadow-sm ring-2 ring-amber-400/30'
                  : 'border-slate-200 bg-white hover:bg-amber-50/50 text-slate-700 hover:border-amber-300'
              }`}
            >
              <FileQuestion
                className={`w-4 h-4 mr-2 ${status === 'Izin' ? 'text-amber-700' : 'text-amber-500'}`}
              />
              <span>Izin</span>
            </button>

            {/* Sakit */}
            <button
              type="button"
              onClick={() => setStatus('Sakit')}
              className={`flex items-center justify-center p-3.5 border-2 rounded-2xl font-bold transition-all text-sm ${
                status === 'Sakit'
                  ? 'border-sky-500 bg-sky-100/90 text-sky-950 shadow-sm ring-2 ring-sky-400/30'
                  : 'border-slate-200 bg-white hover:bg-sky-50/50 text-slate-700 hover:border-sky-300'
              }`}
            >
              <HeartPulse
                className={`w-4 h-4 mr-2 ${status === 'Sakit' ? 'text-sky-700' : 'text-sky-500'}`}
              />
              <span>Sakit</span>
            </button>

            {/* Alpha */}
            <button
              type="button"
              onClick={() => setStatus('Alpha')}
              className={`flex items-center justify-center p-3.5 border-2 rounded-2xl font-bold transition-all text-sm ${
                status === 'Alpha'
                  ? 'border-rose-500 bg-rose-100/90 text-rose-950 shadow-sm ring-2 ring-rose-400/30'
                  : 'border-slate-200 bg-white hover:bg-rose-50/50 text-slate-700 hover:border-rose-300'
              }`}
            >
              <XCircle
                className={`w-4 h-4 mr-2 ${status === 'Alpha' ? 'text-rose-700' : 'text-rose-500'}`}
              />
              <span>Alpha</span>
            </button>
          </div>
        </div>

        {/* Dynamic Notes Field if Izin or Sakit */}
        {(status === 'Izin' || status === 'Sakit') && (
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 animate-fade-in">
            <label className="block text-sm font-bold text-amber-950 mb-2 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-amber-700" />
              <span>
                Alasan / Keterangan {status === 'Sakit' ? 'Sakit (Surat Dokter)' : 'Izin Keperluan'}
              </span>
              <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={2}
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder={
                status === 'Sakit'
                  ? 'Contoh: Sakit tipes dan sedang istirahat dokter, surat menyusul.'
                  : 'Contoh: Izin mengikuti lomba debat ilmiah tingkat provinsi Jawa Tengah.'
              }
              required
              className="w-full px-4 py-3 rounded-xl border border-amber-300 focus:ring-2 focus:ring-emerald-600 focus:border-transparent outline-none bg-white font-medium text-slate-800 placeholder:text-slate-400"
            />
          </div>
        )}

        {/* Digital Signature Pad */}
        <div key={resetKey}>
          <SignaturePad onSignatureChange={setSignatureData} />
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-emerald-700 via-emerald-800 to-green-800 hover:from-emerald-800 hover:to-green-900 active:scale-[0.99] text-white font-extrabold py-4 px-6 rounded-2xl shadow-xl hover:shadow-2xl transition flex items-center justify-center gap-2 text-base cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span>Menyimpan Presensi...</span>
            ) : (
              <>
                <Send className="w-5 h-5 text-amber-300" />
                <span>Kirim Presensi Kelas X</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
