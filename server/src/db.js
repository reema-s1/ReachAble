import Database from 'better-sqlite3';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import bcrypt from 'bcryptjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', 'data');
fs.mkdirSync(dataDir, { recursive: true });
const dbPath = path.join(dataDir, 'accessiboard.sqlite');

export const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    location TEXT NOT NULL,
    remote INTEGER NOT NULL DEFAULT 0,
    role_type TEXT NOT NULL,
    category TEXT NOT NULL,
    tags TEXT NOT NULL DEFAULT '[]',
    description TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'active',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    resume_filename TEXT,
    cover_letter TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL
  );
`);

const adminCount = db.prepare('SELECT COUNT(*) AS c FROM admins').get().c;
if (adminCount === 0) {
  const passwordHash = bcrypt.hashSync('AdminPass123!', 10);
  db.prepare('INSERT INTO admins (email, password_hash) VALUES (?, ?)').run(
    'admin@accessiboard.test',
    passwordHash
  );
}

const jobCount = db.prepare('SELECT COUNT(*) AS c FROM jobs').get().c;
if (jobCount === 0) {
  const seedJobs = [
    {
      title: 'Frontend Engineer, Accessibility',
      company: 'Lumen Digital',
      location: 'Remote',
      remote: 1,
      role_type: 'Full-time',
      category: 'Engineering',
      tags: JSON.stringify(['React', 'WCAG', 'ARIA']),
      description:
        'Own the accessibility of our design system. Work closely with design and QA to ensure every component meets WCAG 2.1 AA.',
      status: 'active',
    },
    {
      title: 'Backend Engineer, Node.js',
      company: 'Northwind Labs',
      location: 'Austin, TX',
      remote: 0,
      role_type: 'Full-time',
      category: 'Engineering',
      tags: JSON.stringify(['Node.js', 'PostgreSQL', 'APIs']),
      description:
        'Design and build REST APIs powering our job platform. Experience with relational databases required.',
      status: 'active',
    },
    {
      title: 'Accessibility QA Specialist',
      company: 'Clearpath Health',
      location: 'Remote',
      remote: 1,
      role_type: 'Contract',
      category: 'Quality Assurance',
      tags: JSON.stringify(['Screen Readers', 'Manual Testing', 'WCAG']),
      description:
        'Run manual and automated accessibility audits across our patient portal. NVDA/VoiceOver experience a must.',
      status: 'active',
    },
    {
      title: 'Product Designer',
      company: 'Lumen Digital',
      location: 'New York, NY',
      remote: 0,
      role_type: 'Full-time',
      category: 'Design',
      tags: JSON.stringify(['Figma', 'Design Systems', 'Inclusive Design']),
      description:
        'Design accessible, inclusive experiences for a national audience. Collaborate with engineering on ARIA patterns.',
      status: 'active',
    },
    {
      title: 'Junior Software Engineer',
      company: 'Northwind Labs',
      location: 'Remote',
      remote: 1,
      role_type: 'Full-time',
      category: 'Engineering',
      tags: JSON.stringify(['JavaScript', 'Entry Level']),
      description:
        'Great first role for a new grad. Mentorship provided. Work across the stack on our internal tools.',
      status: 'draft',
    },
    {
      title: 'Technical Program Manager',
      company: 'Clearpath Health',
      location: 'Chicago, IL',
      remote: 0,
      role_type: 'Full-time',
      category: 'Program Management',
      tags: JSON.stringify(['Roadmaps', 'Cross-functional']),
      description:
        'Drive cross-functional accessibility initiatives from planning through launch.',
      status: 'archived',
    },
  ];

  const insert = db.prepare(`
    INSERT INTO jobs (title, company, location, remote, role_type, category, tags, description, status)
    VALUES (@title, @company, @location, @remote, @role_type, @category, @tags, @description, @status)
  `);
  const insertMany = db.transaction((jobs) => {
    for (const job of jobs) insert.run(job);
  });
  insertMany(seedJobs);
}
