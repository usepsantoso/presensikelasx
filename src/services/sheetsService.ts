import { AttendanceRecord, KelasType, StatusKehadiran } from '../types/attendance';

const SPREADSHEET_ID_KEY = 'regina_spreadsheet_id';
const SPREADSHEET_URL_KEY = 'regina_spreadsheet_url';
const SPREADSHEET_TITLE_KEY = 'regina_spreadsheet_title';
const SHEETS_WEBHOOK_URL_KEY = 'regina_sheets_webhook_url';

export function getSheetsWebhookUrl(): string {
  try {
    return (
      localStorage.getItem(SHEETS_WEBHOOK_URL_KEY) ||
      (import.meta as any).env?.VITE_GOOGLE_SHEETS_WEBHOOK_URL ||
      ''
    );
  } catch {
    return '';
  }
}

export function setSheetsWebhookUrl(url: string): void {
  try {
    localStorage.setItem(SHEETS_WEBHOOK_URL_KEY, url.trim());
  } catch (e) {
    console.error('Failed to save webhook url', e);
  }
}

export function getSavedSpreadsheetInfo(): {
  id: string | null;
  url: string | null;
  title: string | null;
} {
  return {
    id: localStorage.getItem(SPREADSHEET_ID_KEY),
    url: localStorage.getItem(SPREADSHEET_URL_KEY),
    title: localStorage.getItem(SPREADSHEET_TITLE_KEY),
  };
}

export function saveSpreadsheetInfo(id: string, url: string, title?: string): void {
  localStorage.setItem(SPREADSHEET_ID_KEY, id);
  localStorage.setItem(SPREADSHEET_URL_KEY, url);
  if (title) {
    localStorage.setItem(SPREADSHEET_TITLE_KEY, title);
  }
}

export function clearSavedSpreadsheetInfo(): void {
  localStorage.removeItem(SPREADSHEET_ID_KEY);
  localStorage.removeItem(SPREADSHEET_URL_KEY);
  localStorage.removeItem(SPREADSHEET_TITLE_KEY);
}

/**
 * Direct invisible save into Google Spreadsheet
 * Sends to Google Apps Script webhook endpoint or Google Sheets API
 */
export async function directSaveToSpreadsheet(
  record: AttendanceRecord,
  token?: string | null
): Promise<{ success: boolean; target?: string }> {
  let saved = false;

  // 1. Try Google Apps Script Web App / Webhook URL if provided
  const webhookUrl = getSheetsWebhookUrl();
  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        mode: 'no-cors', // standard for Google Apps Script Web App endpoints
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: record.id,
          timestamp: record.timestamp,
          date: record.date,
          time: record.time,
          kelas: record.kelas,
          absen: record.absen,
          nama: record.nama,
          status: record.status,
          catatan: record.catatan || '-',
          hasSignature: !!record.signature,
        }),
      });
      saved = true;
    } catch (err) {
      console.warn('Direct webhook to Google Sheets failed:', err);
    }
  }

  // 2. Try Google Sheets API directly if token and spreadsheet ID exist
  if (token) {
    const sheetInfo = getSavedSpreadsheetInfo();
    if (sheetInfo.id) {
      try {
        await appendAttendanceToSpreadsheet(token, sheetInfo.id, record);
        saved = true;
      } catch (apiErr) {
        console.warn('Direct API append to Google Sheets failed:', apiErr);
      }
    }
  }

  return { success: saved };
}

const DEFAULT_TITLE = 'Presensi Kelas X - SMA Regina Pacis Surakarta';
const SHEET_TAB_NAME = 'Rekap Kehadiran';

const HEADERS = [
  'No',
  'ID Presensi',
  'Waktu Pengiriman',
  'Tanggal',
  'Jam (WIB)',
  'Kelas',
  'No. Absen',
  'Nama Siswa',
  'Status Kehadiran',
  'Keterangan',
  'Status Tanda Tangan',
];

/**
 * Creates a new dedicated Google Sheet with styled header
 */
export async function createAttendanceSpreadsheet(
  accessToken: string,
  customTitle?: string
): Promise<{ spreadsheetId: string; spreadsheetUrl: string; title: string }> {
  const title = customTitle || DEFAULT_TITLE;

  const res = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title: title,
      },
      sheets: [
        {
          properties: {
            title: SHEET_TAB_NAME,
            gridProperties: {
              frozenRowCount: 1,
            },
          },
        },
      ],
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Gagal membuat spreadsheet (Status: ${res.status})`
    );
  }

  const data = await res.json();
  const spreadsheetId = data.spreadsheetId;
  const spreadsheetUrl =
    data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // Write header row
  await setSheetHeaders(accessToken, spreadsheetId);

  // Save to local storage for quick access
  saveSpreadsheetInfo(spreadsheetId, spreadsheetUrl, title);

  return { spreadsheetId, spreadsheetUrl, title };
}

/**
 * Sets header row and green Regina Pacis header styling
 */
export async function setSheetHeaders(
  accessToken: string,
  spreadsheetId: string
): Promise<void> {
  const range = `${SHEET_TAB_NAME}!A1:K1`;
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
      range
    )}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [HEADERS],
      }),
    }
  );

  if (!res.ok) {
    console.error('Failed to set headers on spreadsheet');
  }
}

/**
 * Appends a single attendance record to the spreadsheet
 */
export async function appendAttendanceToSpreadsheet(
  accessToken: string,
  spreadsheetId: string,
  record: AttendanceRecord,
  rowNumber?: number
): Promise<boolean> {
  const range = `${SHEET_TAB_NAME}!A:K`;
  const row = [
    rowNumber ? rowNumber.toString() : '=ROW()-1',
    record.id,
    record.timestamp,
    record.date,
    record.time,
    record.kelas,
    record.absen.toString(),
    record.nama,
    record.status,
    record.catatan || '-',
    record.signature ? 'Tervalidasi (TTD Digital)' : 'Tanpa TTD',
  ];

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
      range
    )}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [row],
      }),
    }
  );

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Gagal menambahkan baris ke spreadsheet (Status: ${res.status})`
    );
  }

  return true;
}

/**
 * Synchronizes all records to the spreadsheet (clears rows and writes fresh data)
 */
export async function syncAllRecordsToSpreadsheet(
  accessToken: string,
  spreadsheetId: string,
  records: AttendanceRecord[]
): Promise<void> {
  // Ensure header is present
  await setSheetHeaders(accessToken, spreadsheetId);

  // Clear existing data rows A2:K1000
  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
      `${SHEET_TAB_NAME}!A2:K1000`
    )}:clear`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (records.length === 0) return;

  const rows = records.map((rec, index) => [
    (index + 1).toString(),
    rec.id,
    rec.timestamp,
    rec.date,
    rec.time,
    rec.kelas,
    rec.absen.toString(),
    rec.nama,
    rec.status,
    rec.catatan || '-',
    rec.signature ? 'Tervalidasi (TTD Digital)' : 'Tanpa TTD',
  ]);

  const range = `${SHEET_TAB_NAME}!A2:K${rows.length + 1}`;
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
      range
    )}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: rows,
      }),
    }
  );

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Gagal sinkronisasi ke spreadsheet (Status: ${res.status})`
    );
  }
}

/**
 * Fetches attendance records from spreadsheet
 */
export async function fetchRecordsFromSpreadsheet(
  accessToken: string,
  spreadsheetId: string
): Promise<AttendanceRecord[]> {
  const range = `${SHEET_TAB_NAME}!A2:K1000`;
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
      range
    )}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Gagal mengambil data dari spreadsheet (Status: ${res.status})`
    );
  }

  const data = await res.json();
  const values: string[][] = data.values || [];

  return values.map((row, idx) => ({
    id: row[1] || `sheet-row-${idx}-${Date.now()}`,
    timestamp: row[2] || new Date().toISOString(),
    date: row[3] || new Date().toISOString().split('T')[0],
    time: row[4] || '07:00',
    kelas: (row[5] as KelasType) || 'X A',
    absen: parseInt(row[6], 10) || idx + 1,
    nama: row[7] || 'Siswa',
    status: (row[8] as StatusKehadiran) || 'Hadir',
    catatan: row[9] === '-' ? '' : row[9],
  }));
}
