import { motion, type HTMLMotionProps } from 'framer-motion';

type PixelButtonProps = HTMLMotionProps<'button'> & {
  label: string;
};

const PixelButton = ({ label, className = '', ...rest }: PixelButtonProps) => {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      className={`pixel-button ${className}`}
      {...rest}
    >
      {label}
    </motion.button>
  );
};

export default PixelButton;

