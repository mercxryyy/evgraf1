import { useEffect, useRef, useState } from 'react';
import { RasterRenderer, type LineAlg, type RGBA } from '../lib/raster/RasterRenderer';

interface CanvasSceneProps {
    lineAlg: LineAlg;
}

export const CanvasScene = ({ lineAlg }: CanvasSceneProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rendererRef = useRef<RasterRenderer | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [debug, setDebug] = useState('');

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const renderer = new RasterRenderer(canvas);
        renderer.setLineAlgorithm(lineAlg);
        rendererRef.current = renderer;

        const doResize = () => {
            renderer.resize();
            setDebug(`w=${renderer.width}, h=${renderer.height}`);
        };

        doResize();
        setTimeout(doResize, 100);
        setTimeout(doResize, 500);

        const ro = new ResizeObserver(() => {
            doResize();
        });
        ro.observe(container);

        let animationId: number;

        const drawPolyline = (r: RasterRenderer, points: { x: number; y: number }[], color: RGBA, width: number) => {
            if (points.length < 2) return;
            for (let i = 0; i < points.length - 1; i++) {
                r.strokeLine(points[i].x, points[i].y, points[i + 1].x, points[i + 1].y, color, width);
            }
        };

        const frame = () => {
            const r = rendererRef.current;
            if (r && r.width > 0 && r.height > 0) {
                r.beginFrame(true);

                const w = r.width;
                const h = r.height;
                const cx = w / 2;
                const cy = h / 2;

                const red: RGBA = { r: 255, g: 0, b: 0, a: 255 };
                const semiRed: RGBA = { r: 255, g: 0, b: 0, a: 128 };
                const white: RGBA = { r: 255, g: 255, b: 255, a: 255 };
                const blue: RGBA = { r: 0, g: 0, b: 255, a: 255 };
                const solidBlue: RGBA = { r: 0, g: 0, b: 255, a: 255 };
                const purple: RGBA = { r: 128, g: 0, b: 128, a: 255 };
                const yellow: RGBA = { r: 255, g: 255, b: 0, a: 255 };
                const greenLine: RGBA = { r: 0, g: 255, b: 0, a: 255 };

                const radius = 80;

                for (let y = -radius; y <= radius; y++) {
                    for (let x = -radius; x <= radius; x++) {
                        if (x * x + y * y <= radius * radius) {
                            const px = cx + x;
                            const py = cy + y;
                            if (px >= 0 && px < w && py >= 0 && py < h) {
                                r.setPixel(px, py, red);
                            }
                        }
                    }
                }
                r.strokeCircle(cx, cy, radius, white, 5);

                const squareSize = 100;
                const squareX = 50;
                const squareY = 50;

                for (let y = 0; y < squareSize; y++) {
                    for (let x = 0; x < squareSize; x++) {
                        const px = squareX + x;
                        const py = squareY + y;
                        if (px >= 0 && px < w && py >= 0 && py < h) {
                            r.setPixel(px, py, solidBlue);
                        }
                    }
                }

                const testRadius = 40;
                const testCx = squareX + squareSize - 20;
                const testCy = squareY + squareSize / 2;

                for (let y = -testRadius; y <= testRadius; y++) {
                    for (let x = -testRadius; x <= testRadius; x++) {
                        if (x * x + y * y <= testRadius * testRadius) {
                            const px = testCx + x;
                            const py = testCy + y;
                            if (px >= 0 && px < w && py >= 0 && py < h) {
                                r.blendPixel(px, py, semiRed, 1);
                            }
                        }
                    }
                }

                const triangle = [
                    { x: 100, y: h - 150 },
                    { x: 200, y: h - 50 },
                    { x: 0, y: h - 50 },
                ];
                r.fillPolygon(triangle, blue);
                r.strokePolygon(triangle, white, 2);

                const greenPolyline = [
                    { x: w - 350, y: 80 },
                    { x: w - 270, y: 110 },
                    { x: w - 230, y: 50 },
                    { x: w - 170, y: 90 },
                    { x: w - 110, y: 40 },
                ];
                drawPolyline(r, greenPolyline, greenLine, 10);

                const pentagonRadius = 50;
                const pentagonCenterX = cx + 180;
                const pentagonCenterY = cy - 120;
                const pentagon: { x: number; y: number }[] = [];
                for (let i = 0; i < 5; i++) {
                    const angle = (i * 72 * Math.PI / 180);
                    pentagon.push({
                        x: pentagonCenterX + Math.cos(angle) * pentagonRadius,
                        y: pentagonCenterY + Math.sin(angle) * pentagonRadius,
                    });
                }
                r.fillPolygon(pentagon, purple);
                r.strokePolygon(pentagon, yellow, 2);
            }
            r?.commit();
            animationId = requestAnimationFrame(frame);
        };

        frame();

        return () => {
            cancelAnimationFrame(animationId);
            ro.disconnect();
            renderer.dispose();
        };
    }, [lineAlg]);

    return (
        <div
            ref={containerRef}
            className="relative w-full h-full bg-white"
        >
            <canvas
                ref={canvasRef}
                className="block w-full h-full"
            />
            <div className="absolute bottom-0 left-0 bg-black/70 text-lime-400 px-2 py-1 text-xs font-mono z-[100] pointer-events-none">
                {debug} | {lineAlg === 'wu' ? 'Сглаженные (Ву)' : 'Чёткие (Брезенхем)'}
            </div>
        </div>
    );
};