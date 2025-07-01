import { motion } from 'framer-motion';

const Spinner = ({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) => {
  const sizeClasses = {
    sm: 'h-5 w-5 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4'
  };

  return (
    <motion.div
      className={`inline-block ${sizeClasses[size]} rounded-full border-t-transparent border-purple-500 border-pink-500 animate-spin ${className}`}
      style={{
        background: 'conic-gradient(from 0deg at 50% 50%, transparent 0%, transparent 45%, #8B5CF6 50%, #EC4899 100%)',
        WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), #000 0)'
      }}
      animate={{ rotate: 360 }}
      transition={{
        duration: 0.8,
        repeat: Infinity,
        ease: 'linear'
      }}
    />
  );
};

export default Spinner;