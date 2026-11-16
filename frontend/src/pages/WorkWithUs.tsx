import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import WindowCard from '../components/WindowCard';
import Seo from '../components/Seo';

const iconClass = 'w-6 h-6';

const EmailIcon = () => (
  <svg viewBox="0 0 24 24" className={iconClass} aria-hidden="true">
    <rect x="2" y="4" width="20" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
    <path d="M3 6l9 7 9-7" fill="none" stroke="currentColor" strokeWidth="2" />
  </svg>
);

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" className={iconClass} aria-hidden="true">
    <rect x="2" y="2" width="20" height="20" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
    <path
      fill="currentColor"
      d="M7.2 10.2h2.1v7.1H7.2zm1.05-3.4a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5zM11 10.2h2v1h.03c.28-.53.97-1.09 2-1.09 2.14 0 2.54 1.41 2.54 3.24v3.95h-2.1v-3.5c0-.84-.02-1.91-1.17-1.91-1.17 0-1.35.91-1.35 1.85v3.56H11z"
    />
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" className={iconClass} aria-hidden="true">
    <rect x="2" y="2" width="20" height="20" rx="6" fill="none" stroke="currentColor" strokeWidth="2" />
    <circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" strokeWidth="2" />
    <circle cx="17.4" cy="6.6" r="1.2" fill="currentColor" />
  </svg>
);

const YouTubeIcon = () => (
  <svg viewBox="0 0 24 24" className={iconClass} aria-hidden="true">
    <rect x="1.5" y="5.5" width="21" height="13" rx="3.5" fill="none" stroke="currentColor" strokeWidth="2" />
    <path fill="currentColor" d="M10.2 9.2v5.6l5.2-2.8z" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" className={iconClass} aria-hidden="true">
    <path
      d="M12 2.5a9.5 9.5 0 0 0-8.1 14.4L2.5 21.5l4.7-1.3A9.5 9.5 0 1 0 12 2.5z"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path
      fill="currentColor"
      d="M9.2 7.6c.2-.3.4-.3.6-.3h.4c.2 0 .3.1.4.3l.7 1.6c.1.2 0 .4-.1.5l-.5.6c-.1.1-.1.3 0 .4.5.9 1.3 1.6 2.3 2 .2.1.3 0 .4-.1l.6-.7c.1-.1.3-.2.5-.1l1.5.7c.2.1.3.2.3.4 0 .5-.2 1.1-.8 1.5-.5.3-1.2.4-2 .2-2.3-.6-4.2-2.3-5-4.4-.3-.8-.1-1.6.4-2.5z"
    />
  </svg>
);

type ContactChannel = {
  label: string;
  handle: string;
  description: string;
  href: string;
  icon: ReactNode;
  external: boolean;
};

const channels: ContactChannel[] = [
  {
    label: 'Email',
    handle: 'microsoftclub@giki.edu.pk',
    description: 'Queries, collaborations or anything else.',
    href: 'mailto:microsoftclub@giki.edu.pk',
    icon: <EmailIcon />,
    external: false,
  },
  {
    label: 'LinkedIn',
    handle: 'Microsoft Club GIKI',
    description: 'Connect with us professionally.',
    href: 'https://www.linkedin.com/company/microsoft-club-giki/',
    icon: <LinkedInIcon />,
    external: true,
  },
  {
    label: 'Instagram',
    handle: '@microsoftclubgiki',
    description: 'Stay updated with our latest moments.',
    href: 'https://www.instagram.com/microsoftclubgiki/?hl=en',
    icon: <InstagramIcon />,
    external: true,
  },
  {
    label: 'YouTube',
    handle: 'LOGIKAL GIKI',
    description: 'Watch our events, talks and podcast episodes.',
    href: 'https://www.youtube.com/@LOGIKALGIKI',
    icon: <YouTubeIcon />,
    external: true,
  },
  {
    label: 'WhatsApp',
    handle: 'Join the community',
    description: 'Chat with members and get announcements first.',
    href: 'https://chat.whatsapp.com/IGUY9fBM2SRC5baqV5DvoH?s=cl&p=a&iam=2',
    icon: <WhatsAppIcon />,
    external: true,
  },
];

const ways = [
  {
    title: 'Collaborate',
    text: 'Co-host a workshop, hackathon or talk with us.',
  },
  {
    title: 'Sponsor or partner',
    text: 'Support our events and reach GIKI’s student developers.',
  },
  {
    title: 'Speak or mentor',
    text: 'Share your experience with our members.',
  },
];

const WorkWithUs = () => {
  return (
    <div className="max-w-3xl mx-auto py-2 space-y-6">
      <Seo
        title="Work With Us"
        description="Collaborate, sponsor or partner with Microsoft Club GIKI. Reach us by email, LinkedIn, Instagram, YouTube or WhatsApp."
        path="/work-with-us"
      />
      <motion.div
        initial={false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <WindowCard title="Microsoft Club GIKI - Work With Us">
          <div className="p-2 md:p-4 space-y-6">
            <div className="space-y-2 text-center">
              <h1 className="font-heading text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 tracking-wide">
                Work With Us
              </h1>
              <p className="text-xs sm:text-sm text-gray-700 max-w-xl mx-auto leading-relaxed">
                Microsoft Club GIKI is a student tech community. Whether you
                want to collaborate, sponsor, speak or just say hello, pick a
                channel below and reach out. We reply as soon as we can.
              </p>
            </div>

            <ul className="grid gap-3 sm:grid-cols-3" aria-label="Ways to work with us">
              {ways.map((way) => (
                <li
                  key={way.title}
                  className="border-2 border-black bg-lightBg p-3 shadow-retro"
                >
                  <h2 className="font-heading text-[10px] text-gray-900 mb-2">
                    {way.title}
                  </h2>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    {way.text}
                  </p>
                </li>
              ))}
            </ul>

            <div className="pt-4 border-t-2 border-black space-y-3">
              <h2 className="font-heading text-xs text-gray-900 text-center">
                Get in touch
              </h2>
              <ul className="grid gap-3 sm:grid-cols-2">
                {channels.map((channel) => (
                  <li key={channel.label}>
                    <a
                      href={channel.href}
                      {...(channel.external
                        ? { target: '_blank', rel: 'noopener noreferrer' }
                        : {})}
                      aria-label={`${channel.label}: ${channel.handle}`}
                      className="flex items-center gap-3 h-full border-2 border-black bg-white p-3 shadow-retro hover:bg-gray-100 transition-colors"
                    >
                      <span className="inline-flex items-center justify-center w-11 h-11 shrink-0 border-2 border-black bg-primaryDark text-white">
                        {channel.icon}
                      </span>
                      <span className="min-w-0">
                        <span className="block font-heading text-[10px] text-gray-900">
                          {channel.label}
                        </span>
                        <span className="block text-xs font-semibold text-primaryDark break-words">
                          {channel.handle}
                        </span>
                        <span className="block text-[11px] text-gray-600 leading-snug">
                          {channel.description}
                        </span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </WindowCard>
      </motion.div>
    </div>
  );
};

export default WorkWithUs;
