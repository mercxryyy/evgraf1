import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Folder, Calendar } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  date: string;
}

export default function Gallery() {
  const [projects, setProjects] = useState<Project[]>([
    { id: '1', name: 'Мой проект', date: '2026-03-14' },
    { id: '2', name: 'Логотип', date: '2026-03-14' },
    { id: '3', name: 'Иконка приложения', date: '2026-03-14' },
  ]);

  const addProject = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      name: `Новый проект ${projects.length + 1}`,
      date: new Date().toISOString().split('T')[0],
    };
    setProjects([...projects, newProject]);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Заголовок и кнопка создания */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          Мои проекты
        </h2>
        <motion.button
          onClick={addProject}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-blue-600/30 transition-all"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus size={20} />
          Создать проект
        </motion.button>
      </div>

      {/* Сетка проектов */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
            whileHover={{ y: -8, transition: { type: "spring", stiffness: 300 } }}
          >
            <Link to={`/editor/${project.id}`}>
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700 hover:border-blue-500/50 transition-all shadow-xl hover:shadow-2xl hover:shadow-blue-500/10">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-blue-500/10 rounded-xl">
                    <Folder size={28} className="text-blue-400" />
                  </div>
                  <div className="flex items-center gap-1 text-sm text-slate-400">
                    <Calendar size={14} />
                    <span>{project.date}</span>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {project.name}
                </h3>
                <p className="text-sm text-slate-400">
                  ID: {project.id}
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}