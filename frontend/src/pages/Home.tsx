import { motion } from 'framer-motion';
import WindowCard from '../components/WindowCard';
import PixelButton from '../components/PixelButton';
import NotificationBox from '../components/NotificationBox';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="space-y-6">
      <section className="grid-layout">
        <WindowCard title="Featured Event">
          <p className="mb-3 text-sm">
            Stay tuned for the next Microsoft Club GIKI event. Join us for
            talks, workshops, and more.
          </p>
          <Link to="/events">
            <PixelButton label="View Events" />
          </Link>
        </WindowCard>

        <WindowCard title="Latest Projects">
          <p className="mb-3 text-sm">
            Explore projects built by club members across different tech
            stacks.
          </p>
          <Link to="/projects">
            <PixelButton label="View Projects" />
          </Link>
        </WindowCard>

        <WindowCard title="Logikal Podcast">
          <p className="mb-3 text-sm">
            Listen to Logikal, our podcast featuring guests from industry and
            academia.
          </p>
          <Link to="/podcasts">
            <PixelButton label="Listen Now" />
          </Link>
        </WindowCard>
      </section>

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex justify-center"
      >
        <NotificationBox
          title="Inductions"
          message="Induction details will be announced soon. Keep an eye on our socials!"
          icon="info"
        />
      </motion.section>
    </div>
  );
};

export default Home;

