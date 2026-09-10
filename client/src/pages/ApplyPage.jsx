import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { api } from '../api/client.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx'];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

function validate(values) {
  const errors = {};
  if (!values.name.trim()) errors.name = 'Enter your full name.';
  if (!values.email.trim()) {
    errors.email = 'Enter your email address.';
  } else if (!EMAIL_RE.test(values.email)) {
    errors.email = 'Enter a valid email address, like name@example.com.';
  }
  if (values.resume) {
    const lower = values.resume.name.toLowerCase();
    if (!ALLOWED_EXTENSIONS.some((ext) => lower.endsWith(ext))) {
      errors.resume = 'Resume must be a PDF or Word document (.pdf, .doc, .docx).';
    } else if (values.resume.size > MAX_FILE_SIZE) {
      errors.resume = 'Resume must be smaller than 5MB.';
    }
  }
  return errors;
}

export default function ApplyPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [values, setValues] = useState({ name: '', email: '', resume: null, coverLetter: '' });
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    api.getJob(id).then((data) => setJob(data.job)).catch(() => setJob(null));
  }, [id]);

  const errors = validate(values);

  function handleChange(field, value) {
    setValues((v) => ({ ...v, [field]: value }));
  }

  function handleBlur(field) {
    setTouched((t) => ({ ...t, [field]: true }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setTouched({ name: true, email: true, resume: true });
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      const formData = new FormData();
      formData.append('jobId', id);
      formData.append('name', values.name);
      formData.append('email', values.email);
      formData.append('coverLetter', values.coverLetter);
      if (values.resume) formData.append('resume', values.resume);
      await api.submitApplication(formData);
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err.message || 'Something went wrong submitting your application.');
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <>
        <h1>Application submitted</h1>
        <p className="form-status success" role="status">
          Thanks{values.name ? `, ${values.name}` : ''}! Your application
          {job ? ` for ${job.title}` : ''} has been received.
        </p>
        <Link to="/">Back to job listings</Link>
      </>
    );
  }

  return (
    <>
      <h1>Apply{job ? ` for ${job.title}` : ''}</h1>
      <p>
        <Link to={`/jobs/${id}`}>&larr; Back to job details</Link>
      </p>
      {submitError && (
        <p className="form-status error" role="alert">
          {submitError}
        </p>
      )}
      <form onSubmit={handleSubmit} noValidate>
        <div className="field" data-invalid={touched.name && !!errors.name}>
          <label htmlFor="app-name">Full name</label>
          <input
            id="app-name"
            type="text"
            value={values.name}
            onChange={(e) => handleChange('name', e.target.value)}
            onBlur={() => handleBlur('name')}
            aria-invalid={touched.name && !!errors.name}
            aria-describedby={touched.name && errors.name ? 'app-name-error' : undefined}
            required
          />
          {touched.name && errors.name && (
            <p className="field-error" id="app-name-error">
              {errors.name}
            </p>
          )}
        </div>

        <div className="field" data-invalid={touched.email && !!errors.email}>
          <label htmlFor="app-email">Email address</label>
          <input
            id="app-email"
            type="email"
            value={values.email}
            onChange={(e) => handleChange('email', e.target.value)}
            onBlur={() => handleBlur('email')}
            aria-invalid={touched.email && !!errors.email}
            aria-describedby={touched.email && errors.email ? 'app-email-error' : undefined}
            required
          />
          {touched.email && errors.email && (
            <p className="field-error" id="app-email-error">
              {errors.email}
            </p>
          )}
        </div>

        <div className="field" data-invalid={touched.resume && !!errors.resume}>
          <label htmlFor="app-resume">Resume (PDF or Word, optional)</label>
          <input
            id="app-resume"
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => handleChange('resume', e.target.files[0] || null)}
            onBlur={() => handleBlur('resume')}
            aria-invalid={touched.resume && !!errors.resume}
            aria-describedby={touched.resume && errors.resume ? 'app-resume-error' : undefined}
          />
          {touched.resume && errors.resume && (
            <p className="field-error" id="app-resume-error">
              {errors.resume}
            </p>
          )}
        </div>

        <div className="field">
          <label htmlFor="app-cover-letter">Cover letter</label>
          <textarea
            id="app-cover-letter"
            value={values.coverLetter}
            onChange={(e) => handleChange('coverLetter', e.target.value)}
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Submitting…' : 'Submit application'}
        </button>
      </form>
    </>
  );
}
