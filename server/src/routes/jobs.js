import { Router } from 'express';
import { db } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const SORTABLE_COLUMNS = new Set(['title', 'company', 'location', 'role_type', 'status', 'created_at']);

function serialize(job) {
  return {
    id: job.id,
    title: job.title,
    company: job.company,
    location: job.location,
    remote: !!job.remote,
    roleType: job.role_type,
    category: job.category,
    tags: JSON.parse(job.tags || '[]'),
    description: job.description,
    status: job.status,
    createdAt: job.created_at,
  };
}

// GET /api/jobs - public listing with search/filter, only active jobs
router.get('/', (req, res) => {
  const { q, roleType, remote, location, category } = req.query;
  let sql = 'SELECT * FROM jobs WHERE status = ?';
  const params = ['active'];

  if (q) {
    sql += ' AND (title LIKE ? OR company LIKE ? OR description LIKE ?)';
    const like = `%${q}%`;
    params.push(like, like, like);
  }
  if (roleType) {
    const types = Array.isArray(roleType) ? roleType : [roleType];
    sql += ` AND role_type IN (${types.map(() => '?').join(',')})`;
    params.push(...types);
  }
  if (category) {
    sql += ' AND category = ?';
    params.push(category);
  }
  if (remote === 'true') {
    sql += ' AND remote = 1';
  } else if (remote === 'false') {
    sql += ' AND remote = 0';
  }
  if (location) {
    sql += ' AND location LIKE ?';
    params.push(`%${location}%`);
  }
  sql += ' ORDER BY created_at DESC';

  const jobs = db.prepare(sql).all(...params);
  res.json({ jobs: jobs.map(serialize), total: jobs.length });
});

// GET /api/jobs/categories - distinct categories for combobox
router.get('/categories', (_req, res) => {
  const rows = db.prepare('SELECT DISTINCT category FROM jobs ORDER BY category ASC').all();
  res.json({ categories: rows.map((r) => r.category) });
});

// Admin listing (all statuses), supports sorting
router.get('/admin', requireAuth, (req, res) => {
  const { sortBy = 'created_at', sortDir = 'desc' } = req.query;
  const column = SORTABLE_COLUMNS.has(sortBy) ? sortBy : 'created_at';
  const direction = sortDir === 'asc' ? 'ASC' : 'DESC';
  const jobs = db.prepare(`SELECT * FROM jobs ORDER BY ${column} ${direction}`).all();
  res.json({ jobs: jobs.map(serialize), sortBy: column, sortDir: direction.toLowerCase() });
});

router.get('/:id', (req, res) => {
  const job = db.prepare('SELECT * FROM jobs WHERE id = ?').get(req.params.id);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  res.json({ job: serialize(job) });
});

router.post('/', requireAuth, (req, res) => {
  const { title, company, location, remote, roleType, category, tags, description, status } =
    req.body || {};
  if (!title || !company || !location || !roleType || !category) {
    return res.status(400).json({ error: 'title, company, location, roleType, category are required' });
  }
  const info = db
    .prepare(
      `INSERT INTO jobs (title, company, location, remote, role_type, category, tags, description, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      title,
      company,
      location,
      remote ? 1 : 0,
      roleType,
      category,
      JSON.stringify(tags || []),
      description || '',
      status || 'draft'
    );
  const job = db.prepare('SELECT * FROM jobs WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json({ job: serialize(job) });
});

router.put('/:id', requireAuth, (req, res) => {
  const existing = db.prepare('SELECT * FROM jobs WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Job not found' });
  const { title, company, location, remote, roleType, category, tags, description, status } =
    req.body || {};
  db.prepare(
    `UPDATE jobs SET title = ?, company = ?, location = ?, remote = ?, role_type = ?, category = ?, tags = ?, description = ?, status = ?
     WHERE id = ?`
  ).run(
    title ?? existing.title,
    company ?? existing.company,
    location ?? existing.location,
    remote === undefined ? existing.remote : remote ? 1 : 0,
    roleType ?? existing.role_type,
    category ?? existing.category,
    tags ? JSON.stringify(tags) : existing.tags,
    description ?? existing.description,
    status ?? existing.status,
    req.params.id
  );
  const job = db.prepare('SELECT * FROM jobs WHERE id = ?').get(req.params.id);
  res.json({ job: serialize(job) });
});

router.delete('/:id', requireAuth, (req, res) => {
  const info = db.prepare('DELETE FROM jobs WHERE id = ?').run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'Job not found' });
  res.status(204).end();
});

export default router;
