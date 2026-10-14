import React, { useState, useEffect } from 'react';
import { ShieldCheck, Calendar, MapPin, School } from 'lucide-react';

export const Header: React.FC = () => {
  const [currentDateStr, setCurrentDateStr] = useState<string>('');
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('');

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setCurrentDateStr(
        now.toLocaleDateString('id-ID', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      );
      setCurrentTimeStr(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }) + ' WIB'
      );
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-green-800 text-white p-6 md:p-8 border-b-4 border-amber-400">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        {/* School Crest & Title */}
        <div className="flex items-center space-x-5 text-center md:text-left flex-col md:flex-row">
          <div className="relative group">
            <div className="w-20 h-20 bg-white rounded-2xl p-2 flex items-center justify-center shadow-xl shrink-0 overflow-hidden border-2 border-amber-400 transition-transform group-hover:scale-105">
              <img
                src="https://santamaria.sch.id/wp-content/uploads/elementor/thumbs/serviamm-okh12qv8cxbul5a7f996o0eo25vsv4smcq92jahjgk.png"
                alt="Logo Serviam Ursulin"
                className="w-full h-full object-contain"
                onError={(e) => {
                  const target = e.currentTarget;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent && !parent.querySelector('.fallback-crest')) {
                    const fallback = document.createElement('div');
                    fallback.className =
                      'fallback-crest flex flex-col items-center justify-center text-center font-black text-emerald-950 text-xs';
                    fallback.innerHTML =
                      '<div class="text-sm font-extrabold text-amber-600">★</div><span>SERVIAM</span>';
                    parent.appendChild(fallback);
                  }
                }}
              />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-amber-400 text-emerald-950 text-[10px] font-black px-1.5 py-0.5 rounded-full shadow">
              URSU
            </div>
          </div>

          <div>
            <div className="flex items-center justify-center md:justify-start gap-2 mb-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-400 text-emerald-950 font-extrabold text-xs uppercase tracking-wider rounded-full shadow-sm">
                <School className="w-3.5 h-3.5" />
                SMA Regina Pacis Surakarta
              </span>
              <span className="text-[11px] bg-emerald-800/80 text-emerald-200 border border-emerald-600/50 px-2.5 py-0.5 rounded-full font-medium">
                T.A. 2026/2027
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white drop-shadow-sm">
              Formulir Presensi Siswa
            </h1>
            <p className="text-emerald-100 text-sm md:text-base font-medium">
              Kehadiran Kelas X (X A s.d X J) • Ursuline Education Network
            </p>
          </div>
        </div>

        {/* Date, Time & Security badge */}
        <div className="border-t md:border-t-0 md:border-l border-emerald-700/60 pt-4 md:pt-0 md:pl-6 text-center md:text-right shrink-0">
          <div className="text-[11px] uppercase tracking-wider text-emerald-300 font-semibold flex items-center justify-center md:justify-end gap-1">
            <Calendar className="w-3.5 h-3.5 text-amber-300" />
            Hari & Tanggal Aktif
          </div>
          <div className="text-base font-extrabold text-amber-300 mt-0.5">
            {currentDateStr || 'Memuat tanggal...'}
          </div>
          <div className="text-xs font-mono text-emerald-200 tracking-wider">
            {currentTimeStr}
          </div>
          <div className="mt-2 inline-flex items-center gap-1.5 text-xs text-emerald-100 bg-emerald-800/60 px-3 py-1 rounded-full border border-emerald-600/40 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Sistem Resmi Presensi</span>
          </div>
        </div>
      </div>
    </header>
  );
};
