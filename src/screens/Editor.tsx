// src/screens/Editor.tsx
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Grid3x3, Brush, Eye } from 'lucide-react';
import { CanvasScene } from '../components/CanvasScene';
import type { LineAlg } from '../lib/raster/RasterRenderer';

export default function Editor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lineAlg, setLineAlg] = useState<LineAlg>('bresenham');
  const [showGrid, setShowGrid] = useState(false);

  const isNewProject = id === 'new';
  const projectTitle = isNewProject ? 'Новый проект' : `Проект ${id}`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="h-full flex flex-col"
    >
      {/* Верхняя панель */}
      <div className="flex items-center justify-between bg-slate-900 border-b border-slate-800 px-4 py-2">
        <div className="flex items-center gap-4">
          <motion.button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-300 hover:text-white px-3 py-2 rounded-lg hover:bg-slate-800"
            whileHover={{ x: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft size={18} />
            Назад
          </motion.button>
          <h2 className="text-lg font-semibold text-white">{projectTitle}</h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1">
            <button
              onClick={() => setLineAlg('bresenham')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-all ${
                lineAlg === 'bresenham'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Grid3x3 size={16} />
              Брезенхем
            </button>
            <button
              onClick={() => setLineAlg('wu')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-all ${
                lineAlg === 'wu'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Brush size={16} />
              Сяолинь Ву
            </button>
          </div>

          <motion.button
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Save size={18} />
            Сохранить
          </motion.button>
        </div>
      </div>

      <div className="flex-1 p-4 bg-slate-800">
        <div className="w-full h-full bg-slate-900 rounded-xl shadow-2xl overflow-hidden border border-slate-700">
          <CanvasScene lineAlg={lineAlg} />
        </div>
      </div>

      <div className="bg-slate-900 border-t border-slate-800 px-4 py-2 text-center">
        <p className="text-xs text-slate-400">
          🎨 Режим: <span className="text-blue-400 font-mono">
            {lineAlg === 'wu' ? 'Сглаженные линии (Xiaolin Wu)' : 'Чёткие линии (Bresenham)'}
          </span>
          {' — '}
          🔵 Красный треугольник (заливка+обводка) • 🟠 Квадрат • 🟣 Пятиугольник 
          {' — '}
          🟡 Тест прозрачности (фиолетовое перекрытие)
        </p>
      </div>
    </motion.div>
  );
}