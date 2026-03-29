import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, AlertTriangle } from 'lucide-react';

export default function NotFound() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center py-20"
    >
      <AlertTriangle size={64} className="text-yellow-500 mb-4" />
      <h2 className="text-3xl font-bold text-white mb-2">404</h2>
      <p className="text-slate-400 mb-6">Page not found</p>
      <Link to="/">
        <motion.button
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Home size={18} />
          Back to gallery
        </motion.button>
      </Link>
    </motion.div>
  );
}