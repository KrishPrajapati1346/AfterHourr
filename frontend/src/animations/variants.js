// Smooth, minimal transitions

export const spatialLayout = {
  initial: { opacity: 0, y: 10 },
  animate: { 
    opacity: 1, y: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } 
  },
  exit: { 
    opacity: 0, y: -10,
    transition: { duration: 0.3, ease: 'easeIn' } 
  }
};

export const staggerSpatialContainer = {
  initial: {},
  animate: {
    transition: { staggerChildren: 0.05 }
  }
};

export const spatialItem = {
  initial: { opacity: 0, y: 15 },
  animate: { 
    opacity: 1, y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } 
  }
};

export const hoverSpring = {
  rest: { scale: 1 },
  hover: { 
    scale: 1.01, 
    transition: { duration: 0.2, ease: 'easeOut' } 
  },
  tap: { 
    scale: 0.98,
    transition: { duration: 0.1, ease: 'easeOut' }
  }
};

export const floatingIsland = {
  initial: { y: 20, opacity: 0 },
  animate: { 
    y: 0, opacity: 1, 
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } 
  }
};

export const slideDownHUD = {
  initial: { y: -20, opacity: 0 },
  animate: { 
    y: 0, opacity: 1, 
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } 
  }
};

// Legacy aliases for components pending overhaul
export const fadeInUp = spatialItem;
export const staggerContainer = staggerSpatialContainer;
export const staggerItem = spatialItem;
