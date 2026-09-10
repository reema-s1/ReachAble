import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Combobox from '../Combobox.jsx';

const OPTIONS = ['Engineering', 'Design', 'Quality Assurance'];

function Harness() {
  const [value, setValue] = useState('');
  return <Combobox label="Category" options={OPTIONS} value={value} onChange={setValue} />;
}

describe('Combobox (APG Combobox pattern)', () => {
  it('exposes combobox role with expanded/activedescendant wiring', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const input = screen.getByRole('combobox', { name: 'Category' });
    expect(input).toHaveAttribute('aria-expanded', 'false');

    await user.type(input, 'des');
    expect(input).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('option', { name: 'Design' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Engineering' })).not.toBeInTheDocument();
  });

  it('selects a filtered option via ArrowDown + Enter and updates aria-activedescendant', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const input = screen.getByRole('combobox', { name: 'Category' });

    await user.type(input, 'a');
    await user.keyboard('{ArrowDown}');
    const activeId = input.getAttribute('aria-activedescendant');
    expect(activeId).toBeTruthy();
    const activeOption = document.getElementById(activeId);
    expect(activeOption).toHaveAttribute('aria-selected', 'true');
    const expectedValue = activeOption.textContent;

    await user.keyboard('{Enter}');
    expect(input).toHaveValue(expectedValue);
    expect(input).toHaveAttribute('aria-expanded', 'false');
  });
});
