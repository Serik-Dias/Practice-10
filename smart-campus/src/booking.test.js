import { describe, expect, it } from 'vitest';
import { canBook } from './booking.js';

const fixture = (overrides = {}) => ({
  start: 660, end: 720, now: 540, blocked: false,
  bookings: [{ start: 600, end: 660 }], ...overrides,
});

describe('Lesson 07 reconstructed baseline: exact Boolean decisions', () => {
  it.each([
    ['T01 touching after', 660, 720, {}, true],
    ['T02 starts now', 540, 570, {}, false],
    ['T03 zero duration', 720, 720, {}, false],
    ['T04 reversed interval', 750, 720, {}, false],
    ['T05 beyond day end', 1380, 1441, {}, false],
    ['T06 exactly 120 minutes', 720, 840, {}, true],
    ['T07 duration 121 minutes', 720, 841, {}, false],
    ['T08 touching before', 570, 600, {}, true],
    ['T09 partial overlap', 630, 690, {}, false],
    ['T10 contains existing booking', 570, 690, {}, false],
    ['T11 inside existing booking', 615, 645, {}, false],
    ['T12 identical interval', 600, 660, {}, false],
    ['T13 blocked room', 660, 720, { blocked: true }, false],
    ['T14 empty bookings', 630, 690, { bookings: [] }, true],
    ['T16 starts in the past', 530, 560, {}, false],
    ['T17 exact day end', 1380, 1440, {}, true],
  ])('%s', (_id, start, end, overrides, expected) => {
    expect(canBook(fixture({ start, end, ...overrides }))).toBe(expected);
  });

  it('T15 preserves original booking contents, order and object identities', () => {
    const bookings = [{ start: 900, end: 960 }, { start: 600, end: 660 }];
    const before = structuredClone(bookings);
    const references = [...bookings];
    const input = fixture({ start: 720, end: 780, bookings });
    expect(canBook(input)).toBe(true);
    expect(bookings).toEqual(before);
    expect(bookings[0]).toBe(references[0]);
    expect(bookings[1]).toBe(references[1]);
    expect(canBook(input)).toBe(true);
    expect(canBook({ ...input, start: 630, end: 690 })).toBe(false);
    expect(bookings).toEqual(before);
  });
});

describe('Additional defensive and regression cases', () => {
  it.each([
    ['T18 negative start', { start: -10, end: 20, now: -20 }, false],
    ['T19 missing start', { start: NaN }, false],
    ['T20 infinite end', { end: Infinity }, false],
    ['T21 invalid supplied clock', { now: NaN }, false],
    ['T22 overlap with a later array element', { start: 900, end: 930, bookings: [{ start: 600, end: 660 }, { start: 910, end: 960 }] }, false],
    ['T23 one minute gap', { start: 661, end: 662 }, true],
    ['T24 numeric string rejected', { start: '660' }, false],
  ])('%s', (_id, overrides, expected) => {
    expect(canBook(fixture(overrides))).toBe(expected);
  });
  it('T25 supports frozen caller data without writing', () => {
    const bookings = Object.freeze([Object.freeze({ start: 900, end: 960 }), Object.freeze({ start: 600, end: 660 })]);
    expect(canBook(fixture({ start: 720, end: 780, bookings }))).toBe(true);
  });
  it('T26 preserves data on each early rejection path', () => {
    for (const overrides of [{ start: 540 }, { end: 900 }, { blocked: true }, { start: NaN }]) {
      const input = fixture(overrides);
      const before = structuredClone(input.bookings);
      expect(canBook(input)).toBe(false);
      expect(input.bookings).toEqual(before);
    }
  });
});
