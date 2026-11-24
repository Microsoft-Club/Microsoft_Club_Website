// Event helpers drive the home shelf, the "Installing/Installed" window and the Events page order.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  eventPath,
  normalizeEvents,
  isUpcoming,
  sortEventsForBoard,
  pickFeaturedEvent,
} from '../frontend/src/utils/events.ts';

const DAY = 24 * 60 * 60 * 1000;
const daysFromNow = (n) => new Date(Date.now() + n * DAY).toISOString();
const ev = (id, offsetDays, extra = {}) => ({ id, title: `Event ${id}`, date: daysFromNow(offsetDays), ...extra });

test('eventPath prefers the slug and falls back to the id', () => {
  assert.equal(eventPath({ id: 7, slug: 'micathon-2026' }), '/events/micathon-2026');
  assert.equal(eventPath({ id: 7 }), '/events/7');
});

test('normalizeEvents accepts a bare array or a { data } envelope', () => {
  const list = [ev(1, 1)];
  assert.deepEqual(normalizeEvents(list), list);
  assert.deepEqual(normalizeEvents({ data: list }), list);
  assert.deepEqual(normalizeEvents({ data: 'nope' }), []);
  assert.deepEqual(normalizeEvents(null), []);
});

test('isUpcoming uses the date, and the type field only when the date is invalid', () => {
  assert.equal(isUpcoming(ev(1, 3)), true);
  assert.equal(isUpcoming(ev(2, -3)), false);
  assert.equal(isUpcoming({ id: 3, date: 'TBA', type: 'upcoming' }), true);
  assert.equal(isUpcoming({ id: 4, date: 'TBA', type: 'past' }), false);
});

test('sortEventsForBoard lists soonest upcoming first, then most recent past', () => {
  const sorted = sortEventsForBoard([ev('past-old', -30), ev('soon', 2), ev('past-new', -2), ev('later', 20)]);
  assert.deepEqual(sorted.map((e) => e.id), ['soon', 'later', 'past-new', 'past-old']);
});

test('pickFeaturedEvent picks the next event, else the latest past one', () => {
  assert.equal(pickFeaturedEvent([ev('later', 20), ev('soon', 2), ev('past', -1)]).id, 'soon');
  assert.equal(pickFeaturedEvent([ev('old', -40), ev('recent', -4)]).id, 'recent');
  assert.equal(pickFeaturedEvent([]), undefined);
});
