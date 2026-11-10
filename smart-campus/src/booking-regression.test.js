import { describe, expect, it } from 'vitest';
import { canBook } from './booking.js';

const request = { start: 630, end: 690, now: 540, blocked: false };

describe('Practice 10 regression: malformed existing bookings fail closed', () => {
  it.each([
    ['R3a NaN booking times', [{ start: NaN, end: NaN }]],
    ['R3b missing booking end', [{ start: 600 }]],
    ['R3c malformed booking next to a valid one', [{ start: 900, end: 960 }, { start: 700, end: NaN }]],
  ])('%s is not reported as free', (_id, bookings) => {
    expect(canBook({ ...request, bookings })).toBe(false);
  });
  it('R3d valid bookings keep the existing touching-endpoint rule', () => {
    expect(canBook({ ...request, start: 660, end: 720, bookings: [{ start: 600, end: 660 }] })).toBe(true);
  });
});
