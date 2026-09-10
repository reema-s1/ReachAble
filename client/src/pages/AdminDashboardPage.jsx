import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import Tabs, { TabPanel } from '../components/Tabs.jsx';
import DataTable from '../components/DataTable.jsx';

const TABS = [
  { id: 'active', label: 'Active Postings', status: 'active' },
  { id: 'drafts', label: 'Drafts', status: 'draft' },
  { id: 'archived', label: 'Archived', status: 'archived' },
];

const COLUMNS = [
  { key: 'title', label: 'Title', sortable: true },
  { key: 'company', label: 'Company', sortable: true },
  { key: 'location', label: 'Location', sortable: true },
  { key: 'role_type', label: 'Role type', sortable: true },
  { key: 'created_at', label: 'Posted', sortable: true },
  { key: 'actions', label: 'Actions', sortable: false },
];

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('active');
  const [jobs, setJobs] = useState([]);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortDir, setSortDir] = useState('desc');
  const [announcement, setAnnouncement] = useState('');
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    api
      .getAdminJobs(sortBy, sortDir)
      .then((data) => {
        setJobs(data.jobs);
        setError(null);
      })
      .catch((err) => setError(err.message));
  }, [sortBy, sortDir]);

  useEffect(() => {
    load();
  }, [load]);

  function handleSort(key) {
    const columnLabel = COLUMNS.find((c) => c.key === key)?.label || key;
    if (sortBy === key) {
      const nextDir = sortDir === 'asc' ? 'desc' : 'asc';
      setSortDir(nextDir);
      setAnnouncement(`Sorted by ${columnLabel}, ${nextDir === 'asc' ? 'ascending' : 'descending'}`);
    } else {
      setSortBy(key);
      setSortDir('asc');
      setAnnouncement(`Sorted by ${columnLabel}, ascending`);
    }
  }

  async function handleDelete(job) {
    if (!window.confirm(`Delete "${job.title}"? This cannot be undone.`)) return;
    await api.deleteJob(job.id);
    load();
  }

  const currentStatus = TABS.find((t) => t.id === activeTab)?.status;
  const filteredJobs = jobs.filter((job) => job.status === currentStatus);
  const sortColumnKey = sortBy === 'roleType' ? 'role_type' : sortBy;

  return (
    <>
      <h1>Admin dashboard</h1>
      <div className="admin-toolbar">
        <p>Manage every posting on AccessiBoard.</p>
        <Link className="btn btn-primary" to="/admin/jobs/new">
          Post a new job
        </Link>
      </div>
      <p className="visually-hidden" role="status" aria-live="polite">
        {announcement}
      </p>
      {error && (
        <p className="form-status error" role="alert">
          {error}
        </p>
      )}
      <Tabs tabs={TABS} activeId={activeTab} onChange={setActiveTab} label="Postings by status" />
      {TABS.map((tab) => (
        <TabPanel key={tab.id} id={tab.id} activeId={activeTab}>
          <DataTable
            caption={`${tab.label} (${filteredJobs.length})`}
            columns={COLUMNS}
            rows={filteredJobs}
            sortBy={sortColumnKey}
            sortDir={sortDir}
            onSort={handleSort}
            renderRow={(job) => (
              <tr key={job.id}>
                <td>{job.title}</td>
                <td>{job.company}</td>
                <td>{job.location}</td>
                <td>{job.roleType}</td>
                <td>{new Date(job.createdAt).toLocaleDateString()}</td>
                <td>
                  <div className="actions-row">
                    <Link className="btn btn-secondary" to={`/admin/jobs/${job.id}/edit`}>
                      Edit
                    </Link>
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => handleDelete(job)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            )}
          />
        </TabPanel>
      ))}
    </>
  );
}
