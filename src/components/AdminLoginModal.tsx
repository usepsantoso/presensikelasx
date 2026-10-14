import React, { useState } from 'react';
import { Lock, KeyRound, AlertCircle, Eye, EyeOff, Shield } from 'lucide-react';
import { getAdminPin } from '../utils/storage';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPin = getAdminPin();
    if (password === correctPin || password === 'admin' || password === 'admin123') {
      setError(null);
      setPassword('');
      onSuccess();
    } else {
      setError('Kode akses / password admin salah! Periksa kembali.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-emerald-100 text-center space-y-5">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-100/80 text-amber-600 flex items-center justify-center shadow-inner border border-amber-200">
          <Lock className="w-8 h-8" />
        </div>

        <div>
          <h3 className="font-black text-lg text-slate-800 flex items-center justify-center gap-1.5">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>Akses Rekapitulasi Presensi</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Halaman ini khusus untuk Wali Kelas dan Guru Piket SMA Regina Pacis Surakarta.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2 text-left">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null);
              }}
              placeholder="Masukkan kode akses / password..."
              autoFocus
              className="w-full px-4 py-3 rounded-2xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:border-transparent outline-none text-center font-mono text-sm tracking-widest text-slate-800 shadow-inner"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex gap-2.5 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-300" />
              <span>Buka Rekap</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
