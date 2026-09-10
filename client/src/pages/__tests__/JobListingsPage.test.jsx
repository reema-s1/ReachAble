import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import JobListingsPage from '../JobListingsPage.jsx';
import { api } from '../../api/client.js';

jest.mock('../../api/client.js', () => ({
  api: {
    getJobs: jest.fn(),
  },
}));

const SAMPLE_JOBS = [
  {
    id: 1,
    title: 'Frontend Engineer',
    company: 'Lumen Digital',
    location: 'Remote',
    remote: true,
    roleType: 'Full-time',
    tags: ['React', 'WCAG'],
  },
];

describe('JobListingsPage', () => {
  it('announces the result count in a polite live region once jobs load', async () => {
    api.getJobs.mockResolvedValue({ jobs: SAMPLE_JOBS, total: 1 });

    render(
      <MemoryRouter>
        <JobListingsPage />
      </MemoryRouter>
    );

    const liveRegion = screen.getByRole('status');
    expect(liveRegion).toHaveAttribute('aria-live', 'polite');

    expect(await screen.findByText('1 result found')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Frontend Engineer' })).toBeInTheDocument();
  });

  it('renders search and filter controls with accessible labels', async () => {
    api.getJobs.mockResolvedValue({ jobs: [], total: 0 });

    render(
      <MemoryRouter>
        <JobListingsPage />
      </MemoryRouter>
    );

    expect(await screen.findByText('0 results found')).toBeInTheDocument();
    expect(screen.getByLabelText('Job title, company, or keyword')).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Role type' })).toBeInTheDocument();
    expect(screen.getByLabelText('Remote only')).toBeInTheDocument();
  });
});
