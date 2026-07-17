import { motion } from 'framer-motion';
import { spatialItem } from '../../animations/variants';

export default function GlassCard({ children, className = '', variant = 'panel', onClick, ...props }) {
  const isPanel = variant !== 'inset';
  
  return (
    <motion.div
      variants={isPanel ? spatialItem : {}}
      whileHover={onClick && isPanel ? "hover" : undefined}
      whileTap={onClick && isPanel ? "tap" : undefined}
      className={`${variant === 'inset' ? 'inset-panel' : 'card-minimal'} p-6 ${onClick ? 'cursor-pointer card-minimal-hover' : ''} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </motion.div>
  );
}
