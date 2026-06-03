import { useEffect, useRef, useState } from 'react';
import { RasterRenderer, type LineAlg } from '../lib/raster/RasterRenderer';
import { Rect, Oval, Triangle, QuadraticBezier, CubicBezier, PathBezier } from '../lib/shape';
import { Shape } from '../lib/shape/shape';

interface CanvasSceneProps {
    lineAlg: LineAlg;
}

export const CanvasScene = ({ lineAlg }: CanvasSceneProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rendererRef = useRef<RasterRenderer | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [debug, setDebug] = useState('');
    const [hitInfo, setHitInfo] = useState<{ shape: Shape | null; localX: number; localY: number }>({ shape: null, localX: 0, localY: 0 });

    const shapesRef = useRef<Shape[]>([]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const renderer = new RasterRenderer(canvas);
        renderer.setLineAlgorithm(lineAlg);
        rendererRef.current = renderer;

        // 1. прямоугольник
        const rect = new Rect(180, 120);
        rect.fillStyle = '#FF3333';
        rect.fillOpacity = 0.7;
        rect.strokeStyle = '#FFFFFF';
        rect.strokeWidth = 2;

        // 2. овал
        const oval = new Oval(110, 70);
        oval.fillStyle = '#3399FF';
        oval.fillOpacity = 0.65;
        oval.strokeStyle = '#FFCC00';
        oval.strokeWidth = 3;

        // 3. треугольник (через точки)
        const triangle = new Triangle({ x: -60, y: -40 }, { x: 60, y: -40 }, { x: 0, y: 60 });
        triangle.fillStyle = '#FF8800';
        triangle.fillOpacity = 0.8;
        triangle.strokeStyle = '#FFFFFF';
        triangle.strokeWidth = 2;

        // 4. Квадратичная Безье 
        const quadBez = new QuadraticBezier({ x: 0, y: 0 }, { x: 80, y: -80 }, { x: 160, y: 0 });
        quadBez.strokeStyle = '#00FFCC';
        quadBez.strokeWidth = 4;

        // 5. Кубическая Безье
        const cubicBez = new CubicBezier({ x: 0, y: 0 }, { x: 50, y: 80 }, { x: 150, y: -80 }, { x: 200, y: 0 });
        cubicBez.strokeStyle = '#FF44FF';
        cubicBez.strokeWidth = 3;

        // 6. Ломаная (polyline, открытая)
        const pathPoly = new PathBezier([{ x: 0, y: 0 }, { x: 60, y: 40 }, { x: 120, y: 20 }, { x: 180, y: 60 }], 'polyline', false);
        pathPoly.strokeStyle = '#FFFFFF';
        pathPoly.strokeWidth = 3;

        // 7. Catmull-Rom замкнутый 
        const catmullPoints = [
            { x: 0, y: 0 }, { x: 60, y: -30 }, { x: 120, y: 10 }, { x: 180, y: -20 }, { x: 220, y: 20 }
        ];
        const catmullPath = new PathBezier(catmullPoints, 'catmull', true);
        catmullPath.strokeStyle = '#FFAA44';
        catmullPath.strokeWidth = 3;
        catmullPath.strokeOpacity = 0.9;

        // 11. Треугольник (зелёный, полупрозрачный) – через точки, чтобы соответствовать твоему конструктору
        const triangle2 = new Triangle({ x: -75, y: -60 }, { x: 75, y: -60 }, { x: 0, y: 60 });
        triangle2.fillStyle = '#00ffaa';
        triangle2.fillOpacity = 0.7;
        triangle2.strokeStyle = '#ffffff';
        triangle2.strokeWidth = 3;

        // 12. Квадратичная Безье (жёлтая)
        const quadBez2 = new QuadraticBezier({ x: 100, y: 400 }, { x: 250, y: 100 }, { x: 400, y: 400 });
        quadBez2.strokeStyle = '#ffaa00';
        quadBez2.strokeWidth = 4;
        quadBez2.fillOpacity = 0;


        // 14. Кубическая Безье 2 (петля, голубая)
        const cubicBez3 = new CubicBezier({ x: 800, y: 400 }, { x: 950, y: 200 }, { x: 650, y: 600 }, { x: 800, y: 500 });
        cubicBez3.strokeStyle = '#00aaff';
        cubicBez3.strokeWidth = 4;
        cubicBez3.fillOpacity = 0;

        // 15. PathBezier: открытая ломаная (зелёная)
        const polylineOpen = new PathBezier([], 'polyline', false);
        polylineOpen.addPointLocal(100, 200);
        polylineOpen.addPointLocal(200, 150);
        polylineOpen.addPointLocal(300, 220);
        polylineOpen.addPointLocal(400, 180);
        polylineOpen.addPointLocal(500, 250);
        polylineOpen.strokeStyle = '#00ff00';
        polylineOpen.strokeWidth = 3;
        polylineOpen.fillOpacity = 0;

        // 17. PathBezier: Catmull-Rom открытый (жёлто-зелёный)
        const catmullOpen = new PathBezier([], 'catmull', false);
        catmullOpen.addPointLocal(150, 500);
        catmullOpen.addPointLocal(250, 400);
        catmullOpen.addPointLocal(300, 600);
        catmullOpen.addPointLocal(400, 400);
        catmullOpen.strokeStyle = '#e1ff00';
        catmullOpen.strokeWidth = 3;
        catmullOpen.fillOpacity = 0;

        shapesRef.current = [
            rect, oval, triangle, quadBez, cubicBez, pathPoly, catmullPath,
            triangle2, quadBez2, cubicBez3,
            polylineOpen, catmullOpen
        ];

        // Функция обновления позиций при ресайзе
        const doResize = () => {
            renderer.resize();
            const w = renderer.width;
            const h = renderer.height;
            setDebug(`w=${w}, h=${h}`);

            // Размещаем фигуры по холсту (относительные координаты)
            // Твои фигуры
            rect.transform.x = w * 0.2;
            rect.transform.y = h * 0.3;
            oval.transform.x = w * 0.7;
            oval.transform.y = h * 0.3;
            triangle.transform.x = w * 0.4;
            triangle.transform.y = h * 0.7;
            triangle.transform.rotation = 0.2;
            quadBez.transform.x = w * 0.6;
            quadBez.transform.y = h * 0.65;
            cubicBez.transform.x = w * 0.25;
            cubicBez.transform.y = h * 0.55;
            pathPoly.transform.x = w * 0.75;
            pathPoly.transform.y = h * 0.8;
            catmullPath.transform.x = w * 0.5;
            catmullPath.transform.y = h * 0.2;

            triangle2.transform.x = w * 0.3;
            triangle2.transform.y = h * 0.2;
            triangle2.transform.rotation = Math.PI / 8;
            quadBez2.transform.x = w * 0.15;
            quadBez2.transform.y = h * 0.5;
            cubicBez3.transform.x = w * 0.65;
            cubicBez3.transform.y = h * 0.45;
            polylineOpen.transform.x = w * 0.15;
            polylineOpen.transform.y = h * 0.6;
            catmullOpen.transform.x = w * 0.25;
            catmullOpen.transform.y = h * 0.8;
        };

        doResize();
        setTimeout(doResize, 100);
        setTimeout(doResize, 500);

        const ro = new ResizeObserver(() => doResize());
        ro.observe(container);

        // Hit test
        const handleMouseMove = (e: MouseEvent) => {
            const r = rendererRef.current;
            if (!r || r.width === 0 || r.height === 0) return;

            const rectCanvas = canvas.getBoundingClientRect();
            const scaleX = r.width / rectCanvas.width;
            const scaleY = r.height / rectCanvas.height;
            const mouseX = (e.clientX - rectCanvas.left) * scaleX;
            const mouseY = (e.clientY - rectCanvas.top) * scaleY;

            let hitShape: Shape | null = null;
            let hitLocal = { x: 0, y: 0 };
            for (let i = shapesRef.current.length - 1; i >= 0; i--) {
                const shape = shapesRef.current[i];
                if (shape.hitTest(mouseX, mouseY)) {
                    hitShape = shape;
                    hitLocal = shape.transformPointToLocal(mouseX, mouseY);
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
                for (const shape of shapesRef.current) {
                    shape.drawRaster(r);
                }
            }
            r?.commit();
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

    const getShapeType = (shape: Shape | null): string => {
        if (!shape) return '';
        if (shape instanceof Rect) return 'Прямоугольник';
        if (shape instanceof Oval) return 'Овал';
        if (shape instanceof Triangle) return 'Треугольник';
        if (shape instanceof QuadraticBezier) return 'Квадр. Безье';
        if (shape instanceof CubicBezier) return 'Кубич. Безье';
        if (shape instanceof PathBezier) return 'Путь (Path)';
        return 'Фигура';
    };

    return (
        <div ref={containerRef} className="relative w-full h-full bg-slate-950">
            <canvas ref={canvasRef} className="block w-full h-full" style={{ cursor: 'crosshair' }} />
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
                            {hitInfo.shape instanceof Rect && `Размер: ${(hitInfo.shape as Rect).w}×${(hitInfo.shape as Rect).h}`}
                            {hitInfo.shape instanceof Oval && `Радиусы: ${(hitInfo.shape as Oval).rx}×${(hitInfo.shape as Oval).ry}`}
                            {hitInfo.shape instanceof Triangle && `Вершины: 3`}
                            {hitInfo.shape instanceof QuadraticBezier && `Упр. точек: 3`}
                            {hitInfo.shape instanceof CubicBezier && `Упр. точек: 4`}
                            {hitInfo.shape instanceof PathBezier && `Точек: ${(hitInfo.shape as PathBezier).getControlPoints().length}`}
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