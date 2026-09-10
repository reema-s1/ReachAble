import express from 'express';
import cors from 'cors';
import './db.js';
import jobsRouter from './routes/jobs.js';
import applicationsRouter from './routes/applications.js';
import authRouter from './routes/auth.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use('/api/jobs', jobsRouter);
app.use('/api/applications', applicationsRouter);
app.use('/api/auth', authRouter);

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`AccessiBoard API listening on http://localhost:${PORT}`);
});
