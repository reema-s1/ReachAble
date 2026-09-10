import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Modal from '../Modal.jsx';

function Harness() {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button onClick={() => setOpen(true)}>Open</button>
      {open && (
        <Modal titleId="test-title" title="Test dialog" onClose={() => setOpen(false)}>
          <button>Inside button</button>
        </Modal>
      )}
    </div>
  );
}

describe('Modal (Dialog pattern)', () => {
  it('exposes dialog role, aria-modal, and aria-labelledby', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByText('Open'));

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'test-title');
    expect(screen.getByText('Test dialog')).toBeInTheDocument();
  });

  it('moves focus into the dialog on open and returns it to the trigger on close', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const openButton = screen.getByText('Open');
    await user.click(openButton);

    expect(document.activeElement).toHaveAttribute('aria-label', 'Close dialog');

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(document.activeElement).toBe(openButton);
  });

  it('traps Tab focus inside the dialog', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByText('Open'));

    const closeButton = screen.getByLabelText('Close dialog');
    const insideButton = screen.getByText('Inside button');

    expect(document.activeElement).toBe(closeButton);
    await user.tab();
    expect(document.activeElement).toBe(insideButton);
    await user.tab();
    expect(document.activeElement).toBe(closeButton);
  });
});
