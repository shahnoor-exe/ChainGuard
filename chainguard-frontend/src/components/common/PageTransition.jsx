import { motion } from 'framer-motion'

const pageVariants = {
  initial: { opacity: 0, x: 20, filter: 'blur(4px)' },
  animate: {
    opacity: 1, x: 0, filter: 'blur(0px)',
    transition: { duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }
  },
  exit: {
    opacity: 0, x: -20, filter: 'blur(4px)',
    transition: { duration: 0.2 }
  }
}

export function PageTransition({ children, pageKey }) {
  return (
    <motion.div key={pageKey} variants={pageVariants}
      initial="initial" animate="animate" exit="exit"
      style={{ width: '100%', height: '100%' }}
    >
      {children}
    </motion.div>
  )
}
