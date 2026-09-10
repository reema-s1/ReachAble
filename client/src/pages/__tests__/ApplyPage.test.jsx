import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ApplyPage from '../ApplyPage.jsx';
import { api } from '../../api/client.js';

jest.mock('../../api/client.js', () => ({
  api: {
    getJob: jest.fn(),
    submitApplication: jest.fn(),
  },
}));

function renderApplyPage() {
  return render(
    <MemoryRouter initialEntries={['/jobs/1/apply']}>
      <Routes>
        <Route path="/jobs/:id/apply" element={<ApplyPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('ApplyPage', () => {
  beforeEach(() => {
    api.getJob.mockResolvedValue({ job: { id: 1, title: 'Frontend Engineer' } });
    api.submitApplication.mockResolvedValue({ id: 1, message: 'ok' });
  });

  it('shows an inline, linked error when a required field is left blank', async () => {
    const user = userEvent.setup();
    renderApplyPage();

    const nameInput = await screen.findByLabelText('Full name');
    await user.click(nameInput);
    await user.tab();

    const error = await screen.findByText('Enter your full name.');
    expect(nameInput).toHaveAttribute('aria-invalid', 'true');
    expect(nameInput.getAttribute('aria-describedby')).toBe(error.id);
  });

  it('validates email format', async () => {
    const user = userEvent.setup();
    renderApplyPage();

    const emailInput = await screen.findByLabelText('Email address');
    await user.type(emailInput, 'not-an-email');
    await user.tab();

    expect(await screen.findByText(/valid email address/i)).toBeInTheDocument();
  });

  it('submits successfully once required fields are valid', async () => {
    const user = userEvent.setup();
    renderApplyPage();

    await user.type(await screen.findByLabelText('Full name'), 'Ada Lovelace');
    await user.type(screen.getByLabelText('Email address'), 'ada@example.com');
    await user.click(screen.getByRole('button', { name: /submit application/i }));

    await waitFor(() => expect(api.submitApplication).toHaveBeenCalledTimes(1));
    expect(await screen.findByText(/application submitted/i)).toBeInTheDocument();
  });
});
