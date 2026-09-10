import { Link, useLocation } from 'react-router-dom';

export default function JobCard({ job }) {
  const location = useLocation();
  return (
    <li className="job-card">
      <h3>
        <Link to={`/jobs/${job.id}`} state={{ background: location }}>
          {job.title}
        </Link>
      </h3>
      <p className="company">
        {job.company} &middot; {job.location}
        {job.remote ? ' (Remote)' : ''}
      </p>
      <p>{job.roleType}</p>
      {job.tags.length > 0 && (
        <ul className="tag-list" aria-label="Tags">
          {job.tags.map((tag) => (
            <li className="tag" key={tag}>
              {tag}
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}
