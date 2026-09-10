import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Tabs, { TabPanel } from '../Tabs.jsx';

const TABS = [
  { id: 'a', label: 'Active' },
  { id: 'b', label: 'Drafts' },
  { id: 'c', label: 'Archived' },
];

function Harness() {
  const [active, setActive] = useState('a');
  return (
    <div>
      <Tabs tabs={TABS} activeId={active} onChange={setActive} label="Postings" />
      <TabPanel id="a" activeId={active}>
        Active content
      </TabPanel>
      <TabPanel id="b" activeId={active}>
        Drafts content
      </TabPanel>
      <TabPanel id="c" activeId={active}>
        Archived content
      </TabPanel>
    </div>
  );
}

describe('Tabs (APG Tabs pattern)', () => {
  it('marks only the active tab as selected and shows its panel', () => {
    render(<Harness />);
    expect(screen.getByRole('tab', { name: 'Active' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Drafts' })).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByText('Active content')).toBeInTheDocument();
    expect(screen.queryByText('Drafts content')).not.toBeInTheDocument();
  });

  it('switches tabs on click', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole('tab', { name: 'Drafts' }));
    expect(screen.getByRole('tab', { name: 'Drafts' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Drafts content')).toBeInTheDocument();
  });

  it('supports arrow-key navigation between tabs', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    screen.getByRole('tab', { name: 'Active' }).focus();

    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toHaveAccessibleName('Drafts');
    expect(screen.getByText('Drafts content')).toBeInTheDocument();

    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toHaveAccessibleName('Archived');

    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toHaveAccessibleName('Active');
  });
});
