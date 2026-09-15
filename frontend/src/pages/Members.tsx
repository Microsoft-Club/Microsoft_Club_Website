import { useEffect, useMemo, useState } from 'react';
import WindowCard from '../components/WindowCard';
import type { Member } from '../services/api';
import { api } from '../services/api';
import { resolveImageUrl } from '../utils/image';

const Members = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'current' | 'alumni'>('all');

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await api.get<Member[]>('/api/members');
        setMembers(res.data);
      } catch {
        setError('Failed to load members.');
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const matchesSearch = (member: Member) => {
    if (!normalizedQuery) return true;
    const nameMatch = member.name.toLowerCase().includes(normalizedQuery);
    const roleMatch = member.role.toLowerCase().includes(normalizedQuery);
    const tenureMatch = member.tenure ? member.tenure.toLowerCase().includes(normalizedQuery) : false;
    return nameMatch || roleMatch || tenureMatch;
  };

  const currentMembers = useMemo(
    () =>
      members
        .filter((m) => m.isCurrent && matchesSearch(m))
        .slice()
        .sort((a, b) => {
          const ao = a.displayOrder ?? Number.POSITIVE_INFINITY;
          const bo = b.displayOrder ?? Number.POSITIVE_INFINITY;
          if (ao !== bo) return ao - bo;
          return b.id - a.id;
        }),
    [members, normalizedQuery]
  );

  const alumniMembers = useMemo(
    () =>
      members
        .filter((m) => !m.isCurrent && matchesSearch(m))
        .slice()
        .sort((a, b) => {
          const tenureA = a.tenure || '';
          const tenureB = b.tenure || '';
          if (tenureA !== tenureB) {
            return tenureB.localeCompare(tenureA, undefined, { numeric: true });
          }
          const ao = a.displayOrder ?? Number.POSITIVE_INFINITY;
          const bo = b.displayOrder ?? Number.POSITIVE_INFINITY;
          if (ao !== bo) return ao - bo;
          return b.id - a.id;
        }),
    [members, normalizedQuery]
  );

  const totalResults = currentMembers.length + alumniMembers.length;
  const showCurrent = selectedCategory === 'all' || selectedCategory === 'current';
  const showAlumni = selectedCategory === 'all' || selectedCategory === 'alumni';

  return (
    <div className="space-y-6">
      {/* Search Bar & Category Filters */}
      <div className="retro-window p-3 md:p-4 bg-white border-black space-y-3">
        <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search member by name, role, or batch (e.g. Lead, Batch 32)..."
              className="w-full pl-8 pr-8 py-1.5 text-xs md:text-sm border border-black rounded-none shadow-[2px_2px_0px_rgba(0,0,0,1)] focus:outline-none focus:ring-1 focus:ring-black bg-white"
            />
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 text-xs select-none">
              🔍
            </span>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black text-xs font-bold px-1"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-1">
            {(['all', 'current', 'alumni'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs border border-black transition-colors ${
                  selectedCategory === cat
                    ? 'bg-black text-white font-semibold'
                    : 'bg-lightBg hover:bg-gray-200 text-black'
                }`}
              >
                {cat === 'all'
                  ? `All (${members.length})`
                  : cat === 'current'
                  ? `Current EC (${members.filter((m) => m.isCurrent).length})`
                  : `Alumni (${members.filter((m) => !m.isCurrent).length})`}
              </button>
            ))}
          </div>
        </div>

        {searchQuery.trim() && (
          <div className="flex items-center justify-between text-xs text-gray-600 pt-1 border-t border-gray-200">
            <span>
              Found <strong>{totalResults}</strong> matching member{totalResults === 1 ? '' : 's'} for &quot;{searchQuery.trim()}&quot;
            </span>
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="underline text-blue-600 hover:text-blue-800"
            >
              Reset search
            </button>
          </div>
        )}
      </div>

      {loading && <p className="text-sm">Loading members...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* No results state */}
      {!loading && !error && totalResults === 0 && (
        <div className="retro-window p-8 text-center bg-white border-black space-y-3">
          <div className="text-2xl">🔍</div>
          <h3 className="font-heading text-sm md:text-base">No Members Found</h3>
          <p className="text-xs md:text-sm text-gray-600 max-w-md mx-auto">
            No club members matched &quot;{searchQuery.trim()}&quot;. Try checking for typos or searching by a different role or batch.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="px-3 py-1 text-xs border border-black bg-black text-white hover:bg-gray-800"
          >
            Clear Search & Filters
          </button>
        </div>
      )}

      {/* Current EC */}
      {!loading && !error && showCurrent && currentMembers.length > 0 && (
        <section>
          <h2 className="font-heading text-sm md:text-base mb-3 flex items-center justify-between">
            <span>Current Executive Council</span>
            <span className="text-xs font-normal text-gray-500 font-sans">
              ({currentMembers.length})
            </span>
          </h2>
          <div className="grid-layout">
            {currentMembers.map((member) => (
              <WindowCard key={member.id} title={member.role}>
                <div className="flex items-start gap-3">
                  {member.image ? (
                    <img
                      src={resolveImageUrl(member.image)}
                      alt={member.name}
                      className="w-16 h-16 rounded object-cover border border-black"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded bg-lightBg border border-black" />
                  )}
                  <div>
                    <p className="text-sm font-semibold">{member.name}</p>
                    <p className="text-xs text-gray-700">{member.tenure}</p>
                    {member.linkedin && (
                      <div className="mt-1">
                        <a
                          href={member.linkedin}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs underline text-blue-600"
                        >
                          LinkedIn
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </WindowCard>
            ))}
          </div>
        </section>
      )}

      {/* Alumni */}
      {!loading && !error && showAlumni && alumniMembers.length > 0 && (
        <section>
          <h2 className="font-heading text-sm md:text-base mb-3 flex items-center justify-between">
            <span>Alumni</span>
            <span className="text-xs font-normal text-gray-500 font-sans">
              ({alumniMembers.length})
            </span>
          </h2>
          <div className="grid-layout">
            {alumniMembers.map((member) => (
              <WindowCard key={member.id} title={member.role}>
                <div className="flex items-start gap-3">
                  {member.image ? (
                    <img
                      src={resolveImageUrl(member.image)}
                      alt={member.name}
                      className="w-16 h-16 rounded object-cover border border-black"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded bg-lightBg border border-black" />
                  )}
                  <div>
                    <p className="text-sm font-semibold">{member.name}</p>
                    <span className="inline-block mt-0.5 text-[11px] font-medium bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded border border-gray-300">
                      {member.tenure}
                    </span>
                    {member.linkedin && (
                      <div className="mt-1">
                        <a
                          href={member.linkedin}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs underline text-blue-600"
                        >
                          LinkedIn
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </WindowCard>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Members;
