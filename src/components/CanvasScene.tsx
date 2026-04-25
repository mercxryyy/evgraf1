import { useEffect, useRef, useState } from 'react';
import { RasterRenderer, type LineAlg } from '../lib/raster/RasterRenderer';
import { Rect, Line, Oval, type Shape } from '../lib/shapes';

interface CanvasSceneProps {
    lineAlg: LineAlg;
}

interface HitInfo {
    shape: Shape | null;
    localX: number;
    localY: number;
}

export const CanvasScene = ({ lineAlg }: CanvasSceneProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rendererRef = useRef<RasterRenderer | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [debug, setDebug] = useState('');
    const [hitInfo, setHitInfo] = useState<HitInfo>({ shape: null, localX: 0, localY: 0 });

    // Создаём фигуры один раз, чтобы они не пересоздавались в каждом кадре
    const shapesRef = useRef<Shape[]>([]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const renderer = new RasterRenderer(canvas);
        renderer.setLineAlgorithm(lineAlg);
        rendererRef.current = renderer;

        // Инициализируем фигуры
        const rect = new Rect(200, 150);
        rect.fillStyle = '#FF0000';
        rect.fillOpacity = 0.7;
        rect.strokeStyle = '#FFFFFF';
        rect.strokeWidth = 2;

        const oval = new Oval(140, 110);
        oval.fillStyle = '#0000FF';
        oval.fillOpacity = 0.6;
        oval.strokeStyle = '#FFFF00';
        oval.strokeWidth = 2;

        const line = new Line(0, 0, 200, 80);
        line.strokeStyle = '#00FF00';
        line.strokeWidth = 8;
        line.strokeOpacity = 0.9;

        shapesRef.current = [rect, oval, line];

        const doResize = () => {
            renderer.resize();
            const w = renderer.width;
            const h = renderer.height;
            setDebug(`w=${w}, h=${h}`);
            // Обновляем позиции фигур при изменении размера окна
            rect.transform.x = w / 2 - 80;
            rect.transform.y = h / 2 - 60;
            oval.transform.x = w / 2 + 20;
            oval.transform.y = h / 2 + 10;
            line.transform.x = w / 2 - 100;
            line.transform.y = h / 2 + 80;
        };
        doResize();
        setTimeout(doResize, 100);
        setTimeout(doResize, 500);

        const ro = new ResizeObserver(() => doResize());
        ro.observe(container);

        // Обработчик движения мыши
        const handleMouseMove = (e: MouseEvent) => {
            const r = rendererRef.current;
            if (!r || r.width === 0 || r.height === 0) return;

            // Получаем координаты мыши относительно canvas (в физических пикселях)
            const rectCanvas = canvas.getBoundingClientRect();
            const scaleX = r.width / rectCanvas.width;
            const scaleY = r.height / rectCanvas.height;
            const mouseX = (e.clientX - rectCanvas.left) * scaleX;
            const mouseY = (e.clientY - rectCanvas.top) * scaleY;

            // Проверяем попадание в каждую фигуру (сначала последние – визуально выше)
            let hitShape: Shape | null = null;
            let hitLocal = { x: 0, y: 0 };
            for (let i = shapesRef.current.length - 1; i >= 0; i--) {
                const shape = shapesRef.current[i];
                if (shape.hitTest(mouseX, mouseY)) {
                    const local = shape.transformPointToLocal(mouseX, mouseY);
                    hitShape = shape;
                    hitLocal = local;
                    break;
                }
            }
            setHitInfo({ shape: hitShape, localX: hitLocal.x, localY: hitLocal.y });
        };

        canvas.addEventListener('mousemove', handleMouseMove);

        let animationId: number;
        const frame = () => {
            const r = rendererRef.current;
            if (r && r.width > 0 && r.height > 0) {
                r.beginFrame(true);
                const w = r.width;
                const h = r.height;

                // Рисуем фигуры (их позиции уже обновлены в doResize)
                for (const shape of shapesRef.current) {
                    shape.drawRaster(r);
                }

                // Дополнительные линии для демонстрации алгоритмов (не участвуют в hit test)
                const lineColor = { r: 255, g: 255, b: 0, a: 255 };
                const x1 = 40, y1 = 40, x2 = w - 40, y2 = h - 40;
                if (lineAlg === 'wu') {
                    r.drawLineWu(x1, y1, x2, y2, lineColor);
                } else {
                    r.drawLineBrassenham(x1, y1, x2, y2, lineColor);
                }
            }
            rendererRef.current?.commit();
            animationId = requestAnimationFrame(frame);
        };
        frame();

        return () => {
            cancelAnimationFrame(animationId);
            ro.disconnect();
            canvas.removeEventListener('mousemove', handleMouseMove);
            renderer.dispose();
        };
    }, [lineAlg]);

    // Определяем тип фигуры для отображения
    const getShapeType = (shape: Shape | null): string => {
        if (!shape) return '';
        if (shape instanceof Rect) return 'Прямоугольник';
        if (shape instanceof Oval) return 'Овал';
        if (shape instanceof Line) return 'Линия';
        return 'Фигура';
    };

    return (
        <div ref={containerRef} className="relative w-full h-full bg-slate-950">
            <canvas ref={canvasRef} className="block w-full h-full" style={{ cursor: 'crosshair' }} />
            {/* Окно с информацией о попадании */}
            <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm rounded-lg p-3 text-sm font-mono z-20 w-64 border border-gray-700 shadow-xl pointer-events-none">
                <div className="text-white font-bold mb-2">Попадание курсора</div>
                {hitInfo.shape ? (
                    <>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-green-500"></span>
                            <span className="text-green-300">{getShapeType(hitInfo.shape)}</span>
                        </div>
                        <div className="text-gray-300 text-xs mt-1">
                            Локальные координаты: ({hitInfo.localX.toFixed(1)}, {hitInfo.localY.toFixed(1)})
                        </div>
                        <div className="text-gray-400 text-xs mt-1">
                            {hitInfo.shape instanceof Rect && `Ширина: ${(hitInfo.shape as Rect).w}, Высота: ${(hitInfo.shape as Rect).h}`}
                            {hitInfo.shape instanceof Oval && `Радиусы: ${(hitInfo.shape as Oval).rx} × ${(hitInfo.shape as Oval).ry}`}
                            {hitInfo.shape instanceof Line && `Длина линии: ${Math.hypot((hitInfo.shape as Line).x2 - (hitInfo.shape as Line).x1, (hitInfo.shape as Line).y2 - (hitInfo.shape as Line).y1).toFixed(1)}`}
                        </div>
                    </>
                ) : (
                    <div className="text-gray-400">Нет попадания</div>
                )}
            </div>
            <div className="absolute bottom-0 left-0 bg-black/70 text-lime-400 px-2 py-1 text-xs font-mono z-[100] pointer-events-none">
                {debug} | {lineAlg === 'wu' ? 'Сглаженные (Ву)' : 'Чёткие (Брезенхем)'}
            </div>
        </div>
    );
};