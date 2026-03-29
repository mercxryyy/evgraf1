import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Layers, LayoutGrid, Edit } from "lucide-react";
import Gallery from "./screens/Gallery";
import Editor from "./screens/Editor";
import "./App.css";

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Gallery />} />
        <Route path="/editor/:id" element={<Editor />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-950 text-white flex flex-col">
        {/* Navbar */}
        <nav className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-800 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-3">
            <div className="flex items-center justify-between">
              {/* Левая часть с лого */}
              <Link 
                to="/" 
                className="flex items-center gap-3 group"
              >
                <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                  <Layers size={22} className="text-blue-400" />
                </div>
                <span className="text-lg font-bold bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent">
                  EVGRAF1
                </span>
              </Link>

              {/* Навигационные кнопки */}
              <div className="flex items-center gap-2">
                <Link
                  to="/"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-slate-800/50 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
                >
                  <LayoutGrid size={16} />
                  Галерея
                </Link>
                <Link
                  to="/editor/new"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition-all"
                >
                  <Edit size={16} />
                  Новый проект
                </Link>
              </div>

              {/* Пустой блок для баланса */}
              <div className="w-16"></div>
            </div>
          </div>
        </nav>

        {/* Основной контент */}
        <main className="flex-1 flex justify-center">
          <div className="w-full max-w-7xl px-6 py-8">
            <AnimatedRoutes />
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;