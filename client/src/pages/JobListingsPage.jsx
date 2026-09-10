import { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client.js';
import JobCard from '../components/JobCard.jsx';
import CheckboxGroup from '../components/CheckboxGroup.jsx';

const ROLE_TYPES = ['Full-time', 'Part-time', 'Contract'];

export default function JobListingsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [roleTypes, setRoleTypes] = useState([]);
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [location, setLocationFilter] = useState('');

  const params = useMemo(
    () => ({
      q: query,
      roleType: roleTypes,
      remote: remoteOnly ? 'true' : undefined,
      location,
    }),
    [query, roleTypes, remoteOnly, location]
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .getJobs(params)
      .then((data) => {
        if (!cancelled) {
          setJobs(data.jobs);
          setError(null);
        }
      })
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [params]);

  return (
    <>
      <h1>Find your next accessible-first role</h1>
      <div className="listings-layout">
        <aside className="filters" aria-label="Filter jobs">
          <fieldset>
            <legend>Search</legend>
            <div className="field">
              <label htmlFor="job-search">Job title, company, or keyword</label>
              <input
                id="job-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </fieldset>
          <CheckboxGroup
            legend="Role type"
            name="roleType"
            options={ROLE_TYPES.map((t) => ({ value: t, label: t }))}
            selected={roleTypes}
            onChange={setRoleTypes}
          />
          <fieldset>
            <legend>Location</legend>
            <div className="checkbox-row">
              <input
                type="checkbox"
                id="remote-only"
                checked={remoteOnly}
                onChange={(e) => setRemoteOnly(e.target.checked)}
              />
              <label htmlFor="remote-only">Remote only</label>
            </div>
            <div className="field">
              <label htmlFor="location-filter">City or region</label>
              <input
                id="location-filter"
                type="text"
                value={location}
                onChange={(e) => setLocationFilter(e.target.value)}
              />
            </div>
          </fieldset>
        </aside>

        <div>
          <h2>Job listings</h2>
          <p className="results-count" role="status" aria-live="polite">
            {loading ? 'Searching…' : `${jobs.length} result${jobs.length === 1 ? '' : 's'} found`}
          </p>
          {error && <p className="form-status error" role="alert">{error}</p>}
          <ul className="job-grid">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
