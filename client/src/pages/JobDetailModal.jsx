import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import Modal from '../components/Modal.jsx';
import JobDetailContent from '../components/JobDetailContent.jsx';

export default function JobDetailModal() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .getJob(id)
      .then((data) => setJob(data.job))
      .catch((err) => setError(err.message));
  }, [id]);

  function close() {
    navigate(-1);
  }

  return (
    <Modal titleId="job-modal-title" title={job ? job.title : 'Job details'} onClose={close}>
      {error && <p role="alert">{error}</p>}
      {!job && !error && <p>Loading job details…</p>}
      {job && <JobDetailContent job={job} />}
    </Modal>
  );
}
