import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App, { SAMPLE_BOOKINGS } from './App.jsx';

async function setup() {
  const user = userEvent.setup();
  render(<App />);
  return { user, submit: () => user.click(screen.getByRole('button', { name: /check availability/i })) };
}
describe('Real form and real booking logic integration', () => {
  it('UI01 allows 11:00–12:00 and preserves the displayed booking', async () => {
    const { submit } = await setup();
    await submit();
    expect(screen.getByRole('status')).toHaveTextContent(/^✓Available/);
    expect(screen.getByText('10:00–11:00')).toBeVisible();
    expect(SAMPLE_BOOKINGS).toEqual([{ start: 600, end: 660 }]);
  });
  it('UI02 clears stale feedback and rejects a blocked room', async () => {
    const { user, submit } = await setup();
    await submit();
    await user.click(screen.getByRole('checkbox'));
    expect(screen.getByRole('status')).toHaveTextContent('Ready when you are');
    await submit();
    expect(screen.getByRole('status')).toHaveTextContent('Unavailable');
    expect(screen.getByRole('status')).toHaveTextContent('Room A-101 is blocked');
  });
  it('UI03 gives clear feedback for a missing required time', async () => {
    const { user, submit } = await setup();
    await user.clear(screen.getByLabelText('Start time'));
    await submit();
    expect(screen.getByRole('status')).toHaveTextContent('Enter both a valid start time and end time');
  });
  it('UI04 explains an overlap', async () => {
    const { user, submit } = await setup();
    await user.clear(screen.getByLabelText('Start time'));
    await user.type(screen.getByLabelText('Start time'), '10:30');
    await submit();
    expect(screen.getByRole('status')).toHaveTextContent('Unavailable');
    expect(screen.getByRole('status')).toHaveTextContent('overlaps');
  });
  it('UI05 repeated checks never append bookings', async () => {
    const { submit } = await setup();
    await submit(); await submit();
    expect(screen.getByRole('status')).toHaveTextContent(/^✓Available/);
    expect(screen.getAllByText('Study session · Existing booking')).toHaveLength(1);
    expect(SAMPLE_BOOKINGS).toEqual([{ start: 600, end: 660 }]);
  });
  it('UI06 rejects a duration exceeding two hours', async () => {
    const { user, submit } = await setup();
    await user.clear(screen.getByLabelText('End time'));
    await user.type(screen.getByLabelText('End time'), '13:01');
    await submit();
    expect(screen.getByRole('status')).toHaveTextContent('120 minutes or less');
  });
  it('UI07 supports the exact midnight endpoint', async () => {
    const { user, submit } = await setup();
    await user.clear(screen.getByLabelText('Start time'));
    await user.type(screen.getByLabelText('Start time'), '23:00');
    await user.clear(screen.getByLabelText('End time'));
    await user.type(screen.getByLabelText('End time'), '24:00');
    await submit();
    expect(screen.getByRole('status')).toHaveTextContent(/^✓Available/);
  });
  it('UI08 rejects an end later than midnight', async () => {
    const { user, submit } = await setup();
    await user.clear(screen.getByLabelText('End time'));
    await user.type(screen.getByLabelText('End time'), '24:01');
    await submit();
    expect(screen.getByRole('status')).toHaveTextContent('Unavailable');
    expect(screen.getByRole('status')).toHaveTextContent('Enter both a valid start time and end time');
  });

});
