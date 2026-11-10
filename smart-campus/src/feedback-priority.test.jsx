import React from 'react';
import { it, expect } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import App from './App.jsx';

it.each([
  ['reversed interval before past start', '08:00', '07:00', 'End time must be later than start time on the same day.'],
  ['past start before duration and room block', '08:00', '12:00', 'Start time must be after the fixed current time, 09:00.'],
  ['121 minutes before room block', '11:00', '13:01', 'Choose a duration of 120 minutes or less.'],
  ['room block before overlapping booking', '10:15', '10:45', 'Room A-101 is blocked. Turn off the demo block to check it.'],
])('Preserves feedback priority: %s', (_, start, end, expectedMessage) => {
  render(<App />);
  fireEvent.change(screen.getByLabelText('Start time'), { target: { value: start } });
  fireEvent.change(screen.getByLabelText('End time'), { target: { value: end } });
  fireEvent.click(screen.getByRole('checkbox'));
  fireEvent.click(screen.getByRole('button', { name: /check availability/i }));
  const status = screen.getByRole('status');
  expect(status).toHaveTextContent('Unavailable');
  expect(status).toHaveTextContent(expectedMessage);
  expect(screen.getByText('10:00–11:00')).toBeVisible();
});
