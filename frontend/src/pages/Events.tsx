import { useState } from 'react';
import Seo from '../components/Seo';
import EventBoard from '../components/board/EventBoard';
import PhoneEventList from '../components/board/PhoneEventList';
import LoadState from '../components/board/LoadState';
import { useApiList } from '../hooks/useApiList';
import { useIsPhone } from '../hooks/useIsPhone';
import type { Event } from '../services/api';
import { isUpcoming, sortEventsForBoard } from '../utils/events';

type Filter = 'all' | 'upcoming' | 'past';

const filters: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'past', label: 'Past' },
];

type FilterBarProps = { filter: Filter; onChange: (filter: Filter) => void };

const FilterBar = ({ filter, onChange }: FilterBarProps) => (
  <div className="seg" role="group" aria-label="Filter events">
    {filters.map((f) => (
      <button key={f.value} type="button" aria-pressed={filter === f.value} onClick={() => onChange(f.value)}>
        {f.label}
      </button>
    ))}
  </div>
);

const Events = () => {
  const { items, status, retry } = useApiList<Event>('/api/events');
  const [filter, setFilter] = useState<Filter>('all');
  const isPhone = useIsPhone();

  const sorted = sortEventsForBoard(items);
  const visible =
    filter === 'all' ? sorted : sorted.filter((e) => (filter === 'upcoming' ? isUpcoming(e) : !isUpcoming(e)));

  const seo = (
    <Seo
      title="Events"
      description="Upcoming and past Microsoft Club GIKI events, workshops, and hackathons at Ghulam Ishaq Khan Institute."
      path="/events"
    />
  );
  const loadState = (
    <LoadState
      status={status}
      isEmpty={!visible.length}
      what="events"
      onRetry={retry}
      emptyText={filter === 'all' ? 'No events posted yet.' : `No ${filter} events right now.`}
    />
  );

  if (isPhone) {
    return (
      <div className="ev-page">
        {seo}
        <section className="win ev-head" aria-labelledby="events-title">
          <div className="ev-head-title">
            <h1 id="events-title">Events</h1>
            {status === 'ready' && <span className="count">{visible.length}</span>}
          </div>
          <FilterBar filter={filter} onChange={setFilter} />
        </section>
        {status !== 'ready' || !visible.length ? <div className="win">{loadState}</div> : <PhoneEventList events={visible} />}
      </div>
    );
  }

  return (
    <section className="win win-enter" aria-labelledby="events-title">
      {seo}
      <div className="win-bar win-bar--lime">
        <p className="win-title">events.cal</p>
      </div>
      <div className="board-head">
        <h1 id="events-title">Events</h1>
        {status === 'ready' && <span className="count">{visible.length} results</span>}
        <FilterBar filter={filter} onChange={setFilter} />
      </div>
      {loadState}
      {status === 'ready' && visible.length > 0 && <EventBoard events={visible} />}
    </section>
  );
};

export default Events;
