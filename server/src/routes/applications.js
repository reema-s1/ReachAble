import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import { db } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, '..', '..', 'data', 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const safe = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    cb(null, safe);
  },
});

const ALLOWED_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_TYPES.has(file.mimetype)) {
      return cb(new Error('Resume must be a PDF or Word document'));
    }
    cb(null, true);
  },
});

const router = Router();

router.post('/', (req, res) => {
  upload.single('resume')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });

    const { jobId, name, email, coverLetter } = req.body || {};
    const errors = {};
    if (!name || !name.trim()) errors.name = 'Name is required';
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'A valid email is required';
    }
    if (!jobId) errors.jobId = 'jobId is required';

    if (Object.keys(errors).length > 0) {
      return res.status(422).json({ errors });
    }

    const job = db.prepare('SELECT id FROM jobs WHERE id = ?').get(jobId);
    if (!job) return res.status(404).json({ error: 'Job not found' });

    const info = db
      .prepare(
        `INSERT INTO applications (job_id, name, email, resume_filename, cover_letter)
         VALUES (?, ?, ?, ?, ?)`
      )
      .run(jobId, name.trim(), email.trim(), req.file ? req.file.filename : null, coverLetter || '');

    res.status(201).json({ id: info.lastInsertRowid, message: 'Application submitted' });
  });
});

router.get('/', requireAuth, (req, res) => {
  const { jobId } = req.query;
  const apps = jobId
    ? db.prepare('SELECT * FROM applications WHERE job_id = ? ORDER BY created_at DESC').all(jobId)
    : db.prepare('SELECT * FROM applications ORDER BY created_at DESC').all();
  res.json({ applications: apps });
});

export default router;
