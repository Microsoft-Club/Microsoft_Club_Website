import { ReactNode } from 'react';
import { motion } from 'framer-motion';

type WindowCardProps = {
  title: string;
  children: ReactNode;
  className?: string;
};

const WindowCard = ({ title, children, className = '' }: WindowCardProps) => {
  return (
    <motion.div
      className={`retro-window ${className}`}
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 260, damping: 18 }}
    >
      <div className="retro-window-header">
        <span className="retro-window-title truncate">{title}</span>
        <div className="retro-window-controls">
          <span className="retro-dot" />
          <span className="retro-dot" />
          <span className="retro-dot" />
        </div>
      </div>
      <div className="p-4 md:p-5 bg-white border-t-retro border-black">
        {children}
      </div>
    </motion.div>
  );
};

export default WindowCard;

