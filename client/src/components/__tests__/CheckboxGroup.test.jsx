import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CheckboxGroup from '../CheckboxGroup.jsx';

function Harness() {
  const [selected, setSelected] = useState([]);
  return (
    <CheckboxGroup
      legend="Role type"
      name="roleType"
      selected={selected}
      onChange={setSelected}
      options={[
        { value: 'Full-time', label: 'Full-time' },
        { value: 'Contract', label: 'Contract' },
      ]}
    />
  );
}

describe('CheckboxGroup', () => {
  it('groups checkboxes under a fieldset/legend and toggles via label click', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    expect(screen.getByRole('group', { name: 'Role type' })).toBeInTheDocument();
    const checkbox = screen.getByRole('checkbox', { name: 'Full-time' });
    expect(checkbox).not.toBeChecked();

    await user.click(screen.getByText('Full-time'));
    expect(checkbox).toBeChecked();

    await user.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  it('is operable by keyboard alone', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole('checkbox', { name: 'Full-time' }));
    await user.keyboard(' ');
    expect(screen.getByRole('checkbox', { name: 'Full-time' })).toBeChecked();
  });
});
