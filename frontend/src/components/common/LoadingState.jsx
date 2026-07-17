import { motion } from 'framer-motion';

export default function LoadingState({ text = 'Loading...', fullScreen = false }) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative w-10 h-10">
        <motion.div
          className="absolute inset-0 rounded-xl"
          style={{ border: '2.5px solid var(--border)' }}
        />
        <motion.div
          className="absolute inset-0 rounded-xl"
          style={{ border: '2.5px solid var(--accent)', borderTopColor: 'transparent', borderRightColor: 'transparent' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>
      <p className="text-[13px] font-medium" style={{ color: 'var(--ink-muted)' }}>{text}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        {content}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-20">
      {content}
    </div>
  );
}
