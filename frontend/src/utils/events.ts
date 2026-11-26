import type { Event } from '../services/api';

export const eventPath = (event: Event) => `/events/${event.slug || event.id}`;

export const normalizeEvents = (payload: unknown): Event[] => {
  if (Array.isArray(payload)) return payload as Event[];
  if (payload && typeof payload === 'object' && Array.isArray((payload as { data?: unknown }).data)) {
    return (payload as { data: Event[] }).data;
  }
  return [];
};

const startOfToday = () => new Date(new Date().setHours(0, 0, 0, 0));

export const isUpcoming = (event: Event) => {
  const date = new Date(event.date);
  if (Number.isNaN(date.getTime())) return event.type === 'upcoming';
  return date >= startOfToday();
};

export const isRegistrationOpen = (event: Event) => new Date(event.date) >= startOfToday();

export const sortEventsForBoard = (events: Event[]): Event[] => {
  const upcoming = events.filter(isUpcoming).sort((a, b) => +new Date(a.date) - +new Date(b.date));
  const past = events.filter((e) => !isUpcoming(e)).sort((a, b) => +new Date(b.date) - +new Date(a.date));
  return [...upcoming, ...past];
};

/** Next upcoming event, or the most recent past one when nothing is scheduled. */
export const pickFeaturedEvent = (events: Event[]): Event | undefined => {
  const dated = events.filter((e) => !Number.isNaN(new Date(e.date).getTime()));
  const next = dated.filter(isUpcoming).sort((a, b) => +new Date(a.date) - +new Date(b.date))[0];
  return next ?? [...dated].sort((a, b) => +new Date(b.date) - +new Date(a.date))[0];
};
