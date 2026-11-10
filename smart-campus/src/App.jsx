import React, { useState } from 'react';
import { bookingIssue } from './booking.js';
import './styles.css';

export const NOW = 540;
export const SAMPLE_BOOKINGS = Object.freeze([Object.freeze({ start: 600, end: 660 })]);
export function toMinutes(value, allowDayEnd = false) {
  if (!/^\d{2}:\d{2}$/.test(value)) return NaN;
  const [hours, minutes] = value.split(':').map(Number);
  if (allowDayEnd && hours === 24 && minutes === 0) return 1440;
  return hours < 24 && minutes < 60 ? hours * 60 + minutes : NaN;
}

const issueMessages = {
  invalidTime: 'Enter both a valid start time and end time.',
  interval: 'End time must be later than start time on the same day.',
  past: 'Start time must be after the fixed current time, 09:00.',
  duration: 'Choose a duration of 120 minutes or less.',
  blocked: 'Room A-101 is blocked. Turn off the demo block to check it.',
  overlap: 'This time overlaps the existing 10:00–11:00 booking. Choose another time.',
};

export default function App() {
  const [start, setStart] = useState('11:00');
  const [end, setEnd] = useState('12:00');
  const [blocked, setBlocked] = useState(false);
  const [result, setResult] = useState(null);
  function change(setter, value) { setter(value); setResult(null); }
  function check(event) {
    event.preventDefault();
    const issue = bookingIssue({
      start: toMinutes(start),
      end: toMinutes(end, true),
      now: NOW,
      blocked,
      bookings: SAMPLE_BOOKINGS,
    });
    const available = issue === null;
    const detail = available
      ? `${start}–${end} is free. This check does not create a booking.`
      : issueMessages[issue];
    setResult({ available, detail });
  }
  return <div className="app-shell">
    <header className="topbar"><a className="brand" href="#main"><span className="brand-mark">SC</span>Smart Campus</a><span className="demo-label"><span/>Student demo</span></header>
    <main id="main">
      <div className="eyebrow">SPACES FOR YOUR NEXT IDEA</div>
      <h1>A little room<br/>for possibility.</h1>
      <p className="intro">Find a free moment in A-101. Pick your times and check the room before you plan.</p>
      <div className="workspace">
        <section className="room-panel" aria-labelledby="room-heading">
          <div className="room-top"><span className="label">YOUR SPACE</span><span className="room-type">Study room</span></div>
          <div className="room-art" aria-hidden="true"><div className="window"><i/><i/></div><div className="table"><span/><span/><span/></div><div className="plant">✳</div></div>
          <div className="room-info"><h2 id="room-heading">Room A-101</h2><p>North building · Ground floor</p><div className="amenities"><span>8 seats</span><span>Whiteboard</span><span>Wi-Fi</span></div></div>
          <div className="schedule"><div className="section-line"><h3>Today’s schedule</h3><span>Fictional day</span></div><div className="booking"><span className="booking-line"/><div><strong>10:00–11:00</strong><p>Study session · Existing booking</p></div><span className="reserved">Reserved</span></div></div>
        </section>
        <section className="check-panel" aria-labelledby="check-heading">
          <div className="section-line"><span className="label">PLAN YOUR VISIT</span><span className="clock">Now 09:00 · Fixed</span></div>
          <h2 id="check-heading">Check availability</h2><p className="form-intro">One room. Your time. Up to two hours.</p>
          <form onSubmit={check} noValidate>
            <div className="time-grid"><label htmlFor="start">Start time<input id="start" type="time" required value={start} onChange={e => change(setStart, e.target.value)} aria-describedby="time-hint"/></label><label htmlFor="end">End time<input id="end" type="text" inputMode="numeric" placeholder="HH:MM" maxLength={5} required value={end} onChange={e => change(setEnd, e.target.value)} aria-describedby="time-hint"/></label></div>
            <p id="time-hint" className="hint">After 09:00 · Up to 120 min · End 24:00 = midnight</p>
            <label className="block-toggle"><input type="checkbox" checked={blocked} onChange={e => change(setBlocked, e.target.checked)}/><span><strong>Room blocked</strong><small>Try the room’s unavailable state</small></span></label>
            <button type="submit">Check availability <span aria-hidden="true">↗</span></button>
          </form>
          <div role="status" aria-live="polite" className={`result ${result ? result.available ? 'available' : 'unavailable' : 'idle'}`}>
            <span className="result-icon" aria-hidden="true">{result ? result.available ? '✓' : '!' : '◷'}</span><div><h3>{result ? result.available ? 'Available' : 'Unavailable' : 'Ready when you are'}</h3><p>{result ? result.detail : 'Check a time to see whether the room is free.'}</p></div>
          </div>
          <div className="rule-note"><strong>A smooth handover.</strong><p>A session can start exactly when another ends. Your check leaves today’s schedule unchanged.</p></div>
        </section>
      </div>
      <footer><span>SMART CAMPUS / PRACTICE 08</span><span>Availability only · No reservation is saved</span></footer>
    </main>
  </div>;
}
