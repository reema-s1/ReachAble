import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client.js';
import JobDetailContent from '../components/JobDetailContent.jsx';

export default function JobDetailPage() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setJob(null);
    setError(null);
    api
      .getJob(id)
      .then((data) => setJob(data.job))
      .catch((err) => setError(err.message));
  }, [id]);

  if (error) {
    return (
      <>
        <h1>Job not found</h1>
        <p>{error}</p>
        <Link to="/">Back to job listings</Link>
      </>
    );
  }

  if (!job) return <p>Loading job details…</p>;

  return (
    <article className="job-detail-header">
      <p>
        <Link to="/">&larr; Back to job listings</Link>
      </p>
      <h1>{job.title}</h1>
      <JobDetailContent job={job} />
    </article>
  );
}
