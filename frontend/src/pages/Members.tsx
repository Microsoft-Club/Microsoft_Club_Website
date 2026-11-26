import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Seo from '../components/Seo';
import LoadState from '../components/board/LoadState';
import WindowControls from '../components/desktop/WindowControls';
import { useApiList } from '../hooks/useApiList';
import type { Member } from '../services/api';
import { resolveImageUrl } from '../utils/image';
import { safeExternalUrl } from '../utils/url';
import '../styles/members.css';

type Category = 'all' | 'current' | 'alumni';

const SEARCH_MAX = 100;
/** Role bars cycle through the club palette so a grid of cards reads like a desk of windows. */
const TONES = ['blue', 'lime', 'yellow', 'coral'] as const;

const byDisplayOrder = (a: Member, b: Member) => {
  const ao = a.displayOrder ?? Number.POSITIVE_INFINITY;
  const bo = b.displayOrder ?? Number.POSITIVE_INFINITY;
  return ao !== bo ? ao - bo : b.id - a.id;
};

/** Alumni: newest batch first, then display order. */
const byTenureThenOrder = (a: Member, b: Member) => {
  const byTenure = (b.tenure || '').localeCompare(a.tenure || '', undefined, { numeric: true });
  return byTenure !== 0 ? byTenure : byDisplayOrder(a, b);
};

const matches = (member: Member, query: string) =>
  !query ||
  member.name.toLowerCase().includes(query) ||
  member.role.toLowerCase().includes(query) ||
  (member.tenure ?? '').toLowerCase().includes(query);

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

type MemberCardProps = { member: Member; index: number };

/** A member as a small ID-card window: role in the title bar, photo, name, batch and LinkedIn. */
const MemberCard = ({ member, index }: MemberCardProps) => {
  const tone = TONES[index % TONES.length];
  const photo = member.image ? resolveImageUrl(member.image) : undefined;
  const linkedin = safeExternalUrl(member.linkedin);

  return (
    <li className="win mem-card">
      <div className={`win-bar win-bar--${tone}`}>
        <p className="win-title" title={member.role}>{member.role}</p>
        <WindowControls />
      </div>
      <div className="mem-card-body">
        {photo ? (
          <img className="mem-photo" src={photo} alt="" loading="lazy" />
        ) : (
          <span className={`mem-photo mem-photo--${tone}`} aria-hidden="true">{initials(member.name)}</span>
        )}
        <div className="mem-info">
          <h3 className="mem-name">{member.name}</h3>
          {member.tenure && <span className="tag tag--gray mem-tenure">{member.tenure}</span>}
          {linkedin && (
            <a className="btn btn--white btn--sm mem-link" href={linkedin} target="_blank" rel="noopener noreferrer">
              <i className="icon-social-linkedin" aria-hidden="true" />
              LinkedIn
              <span className="sr-only"> profile of {member.name}</span>
            </a>
          )}
        </div>
      </div>
    </li>
  );
};

type MemberSectionProps = { id: string; title: string; members: Member[] };

const MemberSection = ({ id, title, members }: MemberSectionProps) => (
  <section aria-labelledby={id} className="mem-section">
    <h2 id={id}>
      {title} <span className="mem-section-count">{members.length}</span>
    </h2>
    <ul className="mem-grid">
      {members.map((member, index) => (
        <MemberCard key={member.id} member={member} index={index} />
      ))}
    </ul>
  </section>
);

const Members = () => {
  const { items: members, status, retry } = useApiList<Member>('/api/members');
  const [searchParams] = useSearchParams();
  // Project contributor links arrive as /members?q=<name>.
  const [searchQuery, setSearchQuery] = useState(() => (searchParams.get('q') ?? '').slice(0, SEARCH_MAX));
  const [category, setCategory] = useState<Category>('all');

  const query = searchQuery.trim().toLowerCase();

  const currentMembers = useMemo(
    () => members.filter((m) => m.isCurrent && matches(m, query)).sort(byDisplayOrder),
    [members, query]
  );
  const alumniMembers = useMemo(
    () => members.filter((m) => !m.isCurrent && matches(m, query)).sort(byTenureThenOrder),
    [members, query]
  );

  const counts: Record<Category, number> = {
    all: members.length,
    current: members.filter((m) => m.isCurrent).length,
    alumni: members.filter((m) => !m.isCurrent).length,
  };
  const categories: { value: Category; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'current', label: 'Current EC' },
    { value: 'alumni', label: 'Alumni' },
  ];

  const showCurrent = category !== 'alumni' && currentMembers.length > 0;
  const showAlumni = category !== 'current' && alumniMembers.length > 0;
  const shownCount = (category !== 'alumni' ? currentMembers.length : 0) + (category !== 'current' ? alumniMembers.length : 0);
  const resetAll = () => {
    setSearchQuery('');
    setCategory('all');
  };

  return (
    <div className="mem-page">
      <Seo
        title="Members"
        description="Meet the current members and alumni of Microsoft Club GIKI at Ghulam Ishaq Khan Institute."
        path="/members"
      />

      <section className="win mem-head" aria-labelledby="members-title">
        <div className="win-bar win-bar--yellow">
          <p className="win-title">members.dir</p>
          <WindowControls />
        </div>
        <div className="mem-head-body">
          <div className="mem-head-title">
            <h1 id="members-title">Members</h1>
            {status === 'ready' && <span className="count">{shownCount}</span>}
          </div>

          <label className="mem-search">
            <span className="sr-only">Search members</span>
            <i className="icon-magnifier" aria-hidden="true" />
            <input
              className="input"
              type="search"
              value={searchQuery}
              maxLength={SEARCH_MAX}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search name, role or batch"
            />
            {searchQuery && (
              <button type="button" className="mem-search-clear" onClick={() => setSearchQuery('')} aria-label="Clear search">
                <i className="icon-close" aria-hidden="true" />
              </button>
            )}
          </label>

          <div className="seg mem-seg" role="group" aria-label="Filter members">
            {categories.map((c) => (
              <button key={c.value} type="button" aria-pressed={category === c.value} onClick={() => setCategory(c.value)}>
                {c.label}
                {status === 'ready' && <span className="mem-seg-count">{counts[c.value]}</span>}
              </button>
            ))}
          </div>

          {query && status === 'ready' && (
            <p className="mem-result" role="status">
              {shownCount === 1 ? '1 member matches' : `${shownCount} members match`} “{searchQuery.trim()}”
              <button type="button" className="mem-reset" onClick={() => setSearchQuery('')}>
                Clear search
              </button>
            </p>
          )}
        </div>
      </section>

      {status !== 'ready' && (
        <div className="win">
          <LoadState status={status} isEmpty={false} what="members" onRetry={retry} />
        </div>
      )}

      {status === 'ready' && shownCount === 0 && (
        <section className="win mem-empty" aria-live="polite">
          <div className="win-bar win-bar--coral">
            <p className="win-title">search.exe — 0 results</p>
            <WindowControls />
          </div>
          <div className="win-body">
            <i className="icon-magnifier mem-empty-icon" aria-hidden="true" />
            <h2>No members found</h2>
            <p>
              {query
                ? `Nobody matches “${searchQuery.trim()}”. Check the spelling, or search by role or batch instead.`
                : 'No members in this group yet.'}
            </p>
            <button type="button" className="btn btn--blue btn--sm" onClick={resetAll}>
              Clear search &amp; filters
            </button>
          </div>
        </section>
      )}

      {status === 'ready' && showCurrent && (
        <MemberSection id="members-current" title="Current Executive Council" members={currentMembers} />
      )}
      {status === 'ready' && showAlumni && <MemberSection id="members-alumni" title="Alumni" members={alumniMembers} />}
    </div>
  );
};

export default Members;
