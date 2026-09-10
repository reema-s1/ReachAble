import { Link } from 'react-router-dom';

export default function JobDetailContent({ job }) {
  return (
    <>
      <p className="job-detail-meta">
        {job.company} &middot; {job.location}
        {job.remote ? ' (Remote)' : ''} &middot; {job.roleType}
      </p>
      {job.tags.length > 0 && (
        <ul className="tag-list" aria-label="Tags">
          {job.tags.map((tag) => (
            <li className="tag" key={tag}>
              {tag}
            </li>
          ))}
        </ul>
      )}
      <p className="job-description">{job.description}</p>
      <Link className="btn btn-primary" to={`/jobs/${job.id}/apply`}>
        Apply for this job
      </Link>
    </>
  );
}
