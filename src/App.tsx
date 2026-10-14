import React, { useState, useEffect } from 'react';
import {
  PenLine,
  Lock,
  MapPin,
  School,
  Share2,
} from 'lucide-react';
import { Header } from './components/Header';
import { AttendanceForm } from './components/AttendanceForm';
import { AttendanceRekap } from './components/AttendanceRekap';
import { AdminLoginModal } from './components/AdminLoginModal';
import { SignaturePreviewModal } from './components/SignaturePreviewModal';
import { ShareModal } from './components/ShareModal';
import {
  AttendanceRecord,
  ActiveTab,
} from './types/attendance';
import {
  fetchSharedAttendanceRecords,
  postSharedAttendanceRecord,
  deleteSharedAttendanceRecord,
  clearAllSharedAttendanceRecords,
} from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('form');
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [viewingRecord, setViewingRecord] = useState<AttendanceRecord | null>(null);

  // Initial fetch and auto-refresh shared database
  useEffect(() => {
    const loadRecords = async () => {
      const recs = await fetchSharedAttendanceRecords();
      setRecords(recs);
    };

    loadRecords();
    const interval = setInterval(loadRecords, 8000); // 8-second sync
    return () => clearInterval(interval);
  }, []);

  const handleFormSuccess = async (newRecord: AttendanceRecord) => {
    const updated = await postSharedAttendanceRecord(newRecord);
    setRecords(updated);
  };

  const handleDeleteRecord = async (id: string) => {
    const updated = await deleteSharedAttendanceRecord(id);
    setRecords(updated);
  };

  const handleClearAll = async () => {
    await clearAllSharedAttendanceRecords();
    setRecords([]);
  };

  const handleTabRekapClick = async () => {
    // Refresh records when opening rekap
    const recs = await fetchSharedAttendanceRecords();
    setRecords(recs);

    if (isAdminUnlocked) {
      setActiveTab('rekap');
    } else {
      setIsAdminModalOpen(true);
    }
  };

  const handleAdminSuccess = () => {
    setIsAdminUnlocked(true);
    setIsAdminModalOpen(false);
    setActiveTab('rekap');
  };

  const handleLockAdmin = () => {
    setIsAdminUnlocked(false);
    setActiveTab('form');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100 p-3 sm:p-6 md:p-8 text-slate-800">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border border-emerald-100 transition-all">
        {/* Official Header */}
        <Header />

        {/* Navigation & Action Bar */}
        <div className="bg-emerald-50/70 px-6 py-3.5 border-b border-emerald-100 flex justify-between items-center flex-wrap gap-3">
          <div className="flex items-center space-x-2 flex-wrap gap-y-2">
            {/* Tab 1: Isi Presensi */}
            <button
              onClick={() => setActiveTab('form')}
              className={`px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'form'
                  ? 'bg-emerald-700 text-white shadow-md'
                  : 'bg-white text-emerald-950 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              <PenLine className="w-4 h-4" />
              <span>Isi Presensi</span>
            </button>

            {/* Tab 2: Rekap Kehadiran (Admin Guarded) */}
            <button
              onClick={handleTabRekapClick}
              className={`px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'rekap'
                  ? 'bg-emerald-700 text-white shadow-md'
                  : 'bg-white text-emerald-950 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              <Lock className={`w-3.5 h-3.5 ${isAdminUnlocked ? 'text-emerald-400' : 'text-amber-600'}`} />
              <span>Rekap Kehadiran ({records.length})</span>
            </button>

            {/* Tab 3: Bagikan Link Siswa */}
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm border border-emerald-700 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-amber-300" />
              <span>Bagikan Link Siswa</span>
            </button>
          </div>

          <div className="text-xs font-semibold text-emerald-900 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-rose-500" />
            <span>Jl. Adi Sucipto No.45, Kerten, Surakarta</span>
          </div>
        </div>

        {/* Content Body */}
        <main className="p-6 md:p-8">
          {activeTab === 'form' && (
            <AttendanceForm onSuccess={handleFormSuccess} />
          )}

          {activeTab === 'rekap' && (
            <AttendanceRekap
              records={records}
              onDeleteRecord={handleDeleteRecord}
              onClearAll={handleClearAll}
              onLockAdmin={handleLockAdmin}
              onViewSignature={(rec) => setViewingRecord(rec)}
            />
          )}
        </main>

        {/* Footer */}
        <footer className="bg-slate-50 px-6 py-5 border-t border-slate-200 text-center text-xs text-slate-500 font-medium space-y-1">
          <div className="flex items-center justify-center gap-2 font-bold text-slate-700">
            <School className="w-4 h-4 text-emerald-700" />
            <span>SMA Regina Pacis Surakarta</span>
            <span className="text-slate-300">•</span>
            <span className="text-amber-700 italic">Serviam</span>
          </div>
          <p>&copy; 2026 Yayasan Winayabhakti Solo • Growing Meaningfully, Impacting Lives</p>
        </footer>
      </div>

      {/* Modals */}
      <AdminLoginModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onSuccess={handleAdminSuccess}
      />

      <SignaturePreviewModal
        record={viewingRecord}
        onClose={() => setViewingRecord(null)}
      />

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />
    </div>
  );
}
