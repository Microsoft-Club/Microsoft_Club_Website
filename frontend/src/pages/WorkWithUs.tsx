import Seo from '../components/Seo';
import WindowControls from '../components/desktop/WindowControls';
import '../styles/work.css';

const ways = [
  { title: 'Collaborate', text: 'Co-host a workshop, hackathon, or talk with us.' },
  { title: 'Sponsor or partner', text: 'Support our events and reach GIKI’s student developers.' },
  { title: 'Speak or mentor', text: 'Share your experience with our members.' },
];

const channels = [
  {
    label: 'Email',
    handle: 'microsoftclub@giki.edu.pk',
    description: 'Queries, collaborations, or anything else.',
    href: 'mailto:microsoftclub@giki.edu.pk',
    icon: 'icon-envelope',
    external: false,
  },
  {
    label: 'LinkedIn',
    handle: 'Microsoft Club GIKI',
    description: 'Connect with us professionally.',
    href: 'https://www.linkedin.com/company/microsoft-club-giki/',
    icon: 'icon-social-linkedin',
    external: true,
  },
  {
    label: 'Instagram',
    handle: '@microsoftclubgiki',
    description: 'Stay updated with our latest moments.',
    href: 'https://www.instagram.com/microsoftclubgiki/?hl=en',
    icon: 'icon-social-instagram',
    external: true,
  },
  {
    label: 'YouTube',
    handle: 'LOGIKAL GIKI',
    description: 'Watch our events, talks, and podcast episodes.',
    href: 'https://www.youtube.com/@LOGIKALGIKI',
    icon: 'icon-social-youtube',
    external: true,
  },
  {
    label: 'WhatsApp',
    handle: 'Join the community',
    description: 'Chat with members and get announcements first.',
    href: 'https://chat.whatsapp.com/IGUY9fBM2SRC5baqV5DvoH',
    icon: 'icon-bubbles',
    external: true,
  },
];

const WorkWithUs = () => (
  <section className="win work-page" aria-labelledby="work-title">
    <Seo
      title="Work with us"
      description="Collaborate, sponsor, or partner with Microsoft Club GIKI. Reach us by email, LinkedIn, Instagram, YouTube, or WhatsApp."
      path="/work-with-us"
    />
    <div className="win-bar win-bar--yellow">
      <p className="win-title">partner.exe</p>
      <WindowControls />
    </div>
    <div className="board-head">
      <h1 id="work-title">Work with us</h1>
    </div>
    <div className="win-body">
      <p className="work-lede">
        Microsoft Club GIKI is a student tech community. Whether you want to collaborate, sponsor, speak, or just say hello, pick a channel below and reach out. We reply as soon as we can.
      </p>
      <ul className="work-ways" aria-label="Ways to work with us">
        {ways.map((way) => (
          <li key={way.title}>
            <h2>{way.title}</h2>
            <p>{way.text}</p>
          </li>
        ))}
      </ul>
      <h2 className="work-channels-title">Get in touch</h2>
      <ul className="work-channels">
        {channels.map((channel) => (
          <li key={channel.label}>
            <a
              href={channel.href}
              {...(channel.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              aria-label={`${channel.label}: ${channel.handle}`}
            >
              <i className={channel.icon} aria-hidden="true" />
              <span>
                <strong>{channel.label}</strong>
                <small>{channel.handle}</small>
                <small>{channel.description}</small>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  </section>
);

export default WorkWithUs;
