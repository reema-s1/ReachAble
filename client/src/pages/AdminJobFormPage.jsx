import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { api } from '../api/client.js';
import Combobox from '../components/Combobox.jsx';
import { RadioGroup } from '../components/CheckboxGroup.jsx';

const ROLE_TYPES = ['Full-time', 'Part-time', 'Contract'];
const DEFAULT_CATEGORIES = ['Engineering', 'Design', 'Quality Assurance', 'Program Management'];

export default function AdminJobFormPage() {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();

  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [values, setValues] = useState({
    title: '',
    company: '',
    location: '',
    remote: false,
    roleType: 'Full-time',
    category: '',
    tags: '',
    description: '',
    status: 'draft',
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.getCategories().then((data) => {
      if (data.categories.length) setCategories(data.categories);
    });
  }, []);

  useEffect(() => {
    if (!isEditing) return;
    api
      .getJob(id)
      .then((data) => {
        const job = data.job;
        setValues({
          title: job.title,
          company: job.company,
          location: job.location,
          remote: job.remote,
          roleType: job.roleType,
          category: job.category,
          tags: job.tags.join(', '),
          description: job.description,
          status: job.status,
        });
      })
      .finally(() => setLoading(false));
  }, [id, isEditing]);

  function set(field, value) {
    setValues((v) => ({ ...v, [field]: value }));
  }

  function validate() {
    const next = {};
    if (!values.title.trim()) next.title = 'Title is required.';
    if (!values.company.trim()) next.company = 'Company is required.';
    if (!values.location.trim()) next.location = 'Location is required.';
    if (!values.category.trim()) next.category = 'Category is required.';
    return next;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    setSubmitError(null);
    const payload = {
      title: values.title.trim(),
      company: values.company.trim(),
      location: values.location.trim(),
      remote: values.remote,
      roleType: values.roleType,
      category: values.category.trim(),
      tags: values.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      description: values.description,
      status: values.status,
    };
    try {
      if (isEditing) {
        await api.updateJob(id, payload);
      } else {
        await api.createJob(payload);
      }
      navigate('/admin');
    } catch (err) {
      setSubmitError(err.message || 'Failed to save job posting.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p>Loading job…</p>;

  return (
    <>
      <h1>{isEditing ? 'Edit job posting' : 'Post a new job'}</h1>
      <p>
        <Link to="/admin">&larr; Back to dashboard</Link>
      </p>
      {submitError && (
        <p className="form-status error" role="alert">
          {submitError}
        </p>
      )}
      <form onSubmit={handleSubmit} noValidate>
        <div className="field" data-invalid={!!errors.title}>
          <label htmlFor="job-title">Job title</label>
          <input
            id="job-title"
            type="text"
            value={values.title}
            onChange={(e) => set('title', e.target.value)}
            aria-invalid={!!errors.title}
            aria-describedby={errors.title ? 'job-title-error' : undefined}
          />
          {errors.title && (
            <p className="field-error" id="job-title-error">
              {errors.title}
            </p>
          )}
        </div>

        <div className="field" data-invalid={!!errors.company}>
          <label htmlFor="job-company">Company</label>
          <input
            id="job-company"
            type="text"
            value={values.company}
            onChange={(e) => set('company', e.target.value)}
            aria-invalid={!!errors.company}
            aria-describedby={errors.company ? 'job-company-error' : undefined}
          />
          {errors.company && (
            <p className="field-error" id="job-company-error">
              {errors.company}
            </p>
          )}
        </div>

        <div className="field" data-invalid={!!errors.location}>
          <label htmlFor="job-location">Location</label>
          <input
            id="job-location"
            type="text"
            value={values.location}
            onChange={(e) => set('location', e.target.value)}
            aria-invalid={!!errors.location}
            aria-describedby={errors.location ? 'job-location-error' : undefined}
          />
          {errors.location && (
            <p className="field-error" id="job-location-error">
              {errors.location}
            </p>
          )}
        </div>

        <div className="field">
          <div className="checkbox-row">
            <input
              type="checkbox"
              id="job-remote"
              checked={values.remote}
              onChange={(e) => set('remote', e.target.checked)}
            />
            <label htmlFor="job-remote">This role is remote</label>
          </div>
        </div>

        <div className="field">
          <RadioGroup
            legend="Role type"
            name="roleType"
            value={values.roleType}
            onChange={(v) => set('roleType', v)}
            options={ROLE_TYPES.map((t) => ({ value: t, label: t }))}
          />
        </div>

        <Combobox
          label="Category"
          hint="Start typing to filter, or enter a new category."
          options={categories}
          value={values.category}
          onChange={(v) => set('category', v)}
        />
        {errors.category && <p className="field-error">{errors.category}</p>}

        <div className="field">
          <label htmlFor="job-tags">Tags (comma-separated)</label>
          <input
            id="job-tags"
            type="text"
            value={values.tags}
            onChange={(e) => set('tags', e.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="job-description">Description (Markdown supported)</label>
          <textarea
            id="job-description"
            value={values.description}
            onChange={(e) => set('description', e.target.value)}
            rows={10}
          />
        </div>

        <div className="field">
          <label htmlFor="job-status">Status</label>
          <select id="job-status" value={values.status} onChange={(e) => set('status', e.target.value)}>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Saving…' : isEditing ? 'Save changes' : 'Post job'}
        </button>
      </form>
    </>
  );
}
