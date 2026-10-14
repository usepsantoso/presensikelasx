import React, { useState } from 'react';
import { Share2, Copy, Check, ExternalLink, X, MessageSquare, Globe, Users, ShieldCheck } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  // Use Shared URL or current origin
  const shareUrl = typeof window !== 'undefined'
    ? (window.location.origin.includes('ais-dev')
        ? window.location.origin.replace('ais-dev', 'ais-pre')
        : window.location.origin)
    : 'https://ais-pre-kblqybgedrwiios7khh54r-838937529130.asia-east1.run.app';

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const shareText = `Halo! Silakan isi Formulir Presensi Siswa Kelas X SMA Regina Pacis Surakarta melalui tautan resmi berikut:\n${shareUrl}`;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 md:p-7 shadow-2xl border border-emerald-100 space-y-5 text-slate-800 text-xs">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-800 text-amber-300 flex items-center justify-center text-lg shadow-sm">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base text-slate-900">Bagikan Link Presensi</h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Kirim link ini ke siswa atau wali murid untuk uji coba input
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info card */}
        <div className="p-3.5 bg-emerald-50/80 rounded-2xl border border-emerald-200 space-y-1.5">
          <div className="flex items-center gap-1.5 font-extrabold text-emerald-950 text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>Terhubung Langsung ke Database Pusat</span>
          </div>
          <p className="text-slate-600 leading-relaxed text-[11px]">
            Setiap siswa yang membuka dan mengisi formulir presensi melalui tautan publik ini akan langsung tercatat ke dalam database pusat secara otomatis dan real-time.
          </p>
        </div>

        {/* Link Box */}
        <div className="space-y-1.5">
          <label className="font-bold text-slate-700 block text-[11px]">
            Tautan Publik untuk Pengisian Presensi:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 font-mono text-[11px] text-slate-700 outline-none select-all"
            />
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-sm shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin Link</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Direct Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm text-center"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Kirim via WhatsApp</span>
          </a>

          <a
            href={shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition flex items-center justify-center gap-1.5 text-center border border-slate-300"
          >
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            <span>Buka di Tab Baru</span>
          </a>
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
