import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'presensi.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function getStoredRecords() {
  try {
    if (!fs.existsSync(DATA_FILE)) return [];
    const content = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(content) || [];
  } catch {
    return [];
  }
}

function saveStoredRecords(records: any[]) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(records, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write database file:', err);
  }
}

// REST API for shared database across all users
app.get('/api/presensi', (_req, res) => {
  const records = getStoredRecords();
  res.json({ success: true, records });
});

app.post('/api/presensi', (req, res) => {
  try {
    const record = req.body;
    if (!record || !record.nama || !record.kelas) {
      return res.status(400).json({ success: false, message: 'Data presensi tidak lengkap' });
    }
    const existing = getStoredRecords();
    const updated = [record, ...existing];
    saveStoredRecords(updated);
    res.json({ success: true, record, total: updated.length });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.delete('/api/presensi/:id', (req, res) => {
  try {
    const { id } = req.params;
    const existing = getStoredRecords();
    const updated = existing.filter((r: any) => r.id !== id);
    saveStoredRecords(updated);
    res.json({ success: true, total: updated.length });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.delete('/api/presensi', (_req, res) => {
  try {
    saveStoredRecords([]);
    res.json({ success: true, total: 0 });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Vite Middleware for dev server, or serve static dist in production
async function startServer() {
  if (process.env.NODE_ENV === 'production' && fs.existsSync(path.join(__dirname, 'dist'))) {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Presensi Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
