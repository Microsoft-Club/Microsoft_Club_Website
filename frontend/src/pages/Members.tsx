import { useEffect, useMemo, useState } from 'react';
import WindowCard from '../components/WindowCard';
import type { Member } from '../services/api';
import { api } from '../services/api';

const resolveMemberImageUrl = (rawUrl?: string): string => {
  if (!rawUrl) return '';

  // Handle accidental quotes/backslashes from copied Windows-style paths.
  const cleaned = rawUrl.trim().replace(/^['"]+|['"]+$/g, '').replace(/\\/g, '/');
  if (!cleaned) return '';

  if (/^https?:\/\//i.test(cleaned)) {
    return cleaned;
  }

  // Normalize paths users may paste from local project structure.
  const withoutPublicPrefix = cleaned.replace(/^\/?(frontend\/)?public\//i, '');
  const normalizedPath = withoutPublicPrefix.replace(/^\/+/, '');

  return `${import.meta.env.BASE_URL}${normalizedPath}`.replace(/([^:]\/)\/+/g, '$1');
};

const Members = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const currentMembers = useMemo(
    () => members.filter((m) => m.isCurrent),
    [members]
  );
  const alumniMembers = useMemo(
    () => members.filter((m) => !m.isCurrent),
    [members]
  );

  return (
    <div className="space-y-6">
      <section>
        <h1 className="font-heading text-sm md:text-base mb-3">
          Current Executive Council
        </h1>
        {loading && <p className="text-sm">Loading members...</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {!loading && !error && (
          <div className="grid-layout">
            {currentMembers.map((member) => (
              <WindowCard key={member.id} title={member.role}>
                <div className="flex items-start gap-3">
                  {member.image ? (
                    <img
                      src={resolveMemberImageUrl(member.image)}
                      alt={member.name}
                      className="w-10 h-10 rounded object-cover border border-black"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded bg-lightBg border border-black" />
                  )}
                  <div>
                    <p className="text-sm font-semibold">{member.name}</p>
                    <p className="text-xs text-gray-700">{member.tenure}</p>
                    {member.linkedin && (
                      <a
                        href={member.linkedin}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs underline text-blue-600"
                      >
                        LinkedIn
                      </a>
                    )}
                  </div>
                </div>
              </WindowCard>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-heading text-sm md:text-base mb-3">Alumni</h2>
        {!loading && !error && (
          <div className="grid-layout">
            {alumniMembers.map((member) => (
              <WindowCard key={member.id} title={member.role}>
                <div className="flex items-start gap-3">
                  {member.image ? (
                    <img
                      src={resolveMemberImageUrl(member.image)}
                      alt={member.name}
                      className="w-10 h-10 rounded object-cover border border-black"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded bg-lightBg border border-black" />
                  )}
                  <div>
                    <p className="text-sm font-semibold">{member.name}</p>
                    <p className="text-xs text-gray-700">{member.tenure}</p>
                    {member.linkedin && (
                      <a
                        href={member.linkedin}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs underline text-blue-600"
                      >
                        LinkedIn
                      </a>
                    )}
                  </div>
                </div>
              </WindowCard>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Members;

