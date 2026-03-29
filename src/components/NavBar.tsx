import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutGrid, Edit } from 'lucide-react';

export default function NavBar() {
  return (
    <nav className="w-full bg-gradient-to-r from-slate-900 to-slate-950 border-b border-slate-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              EVGRAF1
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <NavLink to="/" end>
              {({ isActive }) => (
                <motion.button
                  className={`
                    flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium
                    transition-all duration-200
                    ${isActive 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
                    }
                  `}
                  whileHover={{ scale: 1.03, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <LayoutGrid size={18} />
                  <span>Gallery</span>
                </motion.button>
              )}
            </NavLink>

            <NavLink to="/editor/new">
              {({ isActive }) => (
                <motion.button
                  className={`
                    flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium
                    transition-all duration-200
                    ${isActive 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
                    }
                  `}
                  whileHover={{ scale: 1.03, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Edit size={18} />
                  <span>Editor</span>
                </motion.button>
              )}
            </NavLink>
          </div>

          <div className="w-20"></div>
        </div>
      </div>
    </nav>
  );
}