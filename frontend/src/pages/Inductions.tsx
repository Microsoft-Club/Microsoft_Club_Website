import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import WindowCard from '../components/WindowCard';

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" aria-hidden="true">
    <rect x="2" y="2" width="20" height="20" rx="6" fill="none" stroke="currentColor" strokeWidth="2" />
    <circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" strokeWidth="2" />
    <circle cx="17.4" cy="6.6" r="1.2" fill="currentColor" />
  </svg>
);

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" aria-hidden="true">
    <rect x="2" y="2" width="20" height="20" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
    <path
      fill="currentColor"
      d="M7.2 10.2h2.1v7.1H7.2zm1.05-3.4a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5zM11 10.2h2v1h.03c.28-.53.97-1.09 2-1.09 2.14 0 2.54 1.41 2.54 3.24v3.95h-2.1v-3.5c0-.84-.02-1.91-1.17-1.91-1.17 0-1.35.91-1.35 1.85v3.56H11z"
    />
  </svg>
);

const YouTubeIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" aria-hidden="true">
    <rect x="1.5" y="5.5" width="21" height="13" rx="3.5" fill="none" stroke="currentColor" strokeWidth="2" />
    <path fill="currentColor" d="M10.2 9.2v5.6l5.2-2.8z" />
  </svg>
);

const followLinks = [
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/microsoftclubgiki/?hl=en',
    icon: <InstagramIcon />,
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/company/microsoft-club-giki/',
    icon: <LinkedInIcon />,
  },
  {
    label: 'YouTube',
    href: 'https://www.youtube.com/@LOGIKALGIKI',
    icon: <YouTubeIcon />,
  },
];

const Inductions = () => {
  return (
    <div className="max-w-2xl mx-auto py-2">
      <motion.div
        initial={false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <WindowCard title="Microsoft Club GIKI - Inductions 2026">
          <div className="p-2 md:p-5 text-center space-y-6">
            <div className="flex items-center justify-center">
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 border-2 border-black text-gray-800 font-heading text-xs shadow-retro">
                Applications closed
              </span>
            </div>

            <div className="space-y-2">
              <h1 className="font-heading text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 tracking-wide">
                Inductions 2026 have concluded
              </h1>
              <p className="text-xs sm:text-sm text-gray-700 max-w-lg mx-auto leading-relaxed">
                Thank you to everyone who applied to Microsoft Club GIKI.
                Applications for Batch 35 and Batch 36 are now closed. Follow
                our socials for interview updates and future recruitment drives.
              </p>
            </div>

            <div className="pt-4 border-t-2 border-black space-y-3">
              <p className="font-heading text-xs text-gray-900">
                Follow us for announcements
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {followLinks.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Follow us on ${item.label}`}
                    className="inline-flex items-center justify-center w-11 h-11 border-2 border-black bg-white shadow-retro hover:bg-gray-100 transition-colors"
                  >
                    {item.icon}
                  </a>
                ))}
              </div>
              <div className="flex justify-center pt-2">
                <Link to="/" className="pixel-button bg-gray-800 text-white">
                  Return to Home
                </Link>
              </div>
            </div>
          </div>
        </WindowCard>
      </motion.div>
    </div>
  );
};

export default Inductions;
