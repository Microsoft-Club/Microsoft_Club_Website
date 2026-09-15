import { motion } from 'framer-motion';
import WindowCard from '../components/WindowCard';
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
          <Link to="/events" className="pixel-button">
            View Events
          </Link>
        </WindowCard>

        <WindowCard title="Latest Projects">
          <p className="mb-3 text-sm">
            Explore projects built by club members across different tech
            stacks.
          </p>
          <Link to="/projects" className="pixel-button">
            View Projects
          </Link>
        </WindowCard>

        <WindowCard title="Logikal Podcast">
          <p className="mb-3 text-sm">
            Listen to Logikal, our podcast featuring guests from industry and
            academia.
          </p>
          <Link to="/podcasts" className="pixel-button">
            Listen Now
          </Link>
        </WindowCard>
      </section>

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex justify-center"
      >
        <div className="retro-window bg-white max-w-xl w-full">
          <div className="retro-window-header">
            <span className="retro-window-title">Inductions 2026</span>
            <div className="retro-window-controls">
              <span className="retro-dot" />
              <span className="retro-dot" />
              <span className="retro-dot" />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4">
            <div className="flex items-start gap-3">
              <div>
                <p className="font-heading text-xs font-bold mb-1">Inductions Waiting List is Open!</p>
                <p className="text-xs text-gray-700">
                  Batch 35 and Batch 36 freshers can now register on the official waiting list to get early updates and interview details.
                </p>
              </div>
            </div>
            <Link
              to="/waiting-list"
              className="pixel-button bg-purpleAccent text-white self-end sm:self-center shrink-0"
            >
              Join Waiting List
            </Link>
          </div>
        </div>
      </motion.section>

    </div>
  );
};

export default Home;

