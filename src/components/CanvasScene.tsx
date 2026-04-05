import { useEffect, useRef, useState } from 'react';
import { RasterRenderer, type LineAlg, type RGBA, hexToRGBA } from '../lib/raster/RasterRenderer';

interface CanvasSceneProps {
  lineAlg: LineAlg;
}

export const CanvasScene = ({ lineAlg }: CanvasSceneProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<RasterRenderer | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [frameCount, setFrameCount] = useState(0);

  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.setLineAlgorithm(lineAlg);
    }
  }, [lineAlg]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new RasterRenderer(canvas);
    renderer.setLineAlgorithm(lineAlg);
    rendererRef.current = renderer;

    const ro = new ResizeObserver(() => {
      renderer.resize();
    });

    if (containerRef.current) {
      ro.observe(containerRef.current);
    } else {
      ro.observe(canvas);
    }

    let animationId = 0;
    let time = 0;

    const frame = () => {
      const r = rendererRef.current;
      if (r) {
        r.beginFrame(true); 

        const w = r.width;
        const h = r.height;
        const centerX = w / 2;
        const centerY = h / 2;


        const red: RGBA = { r: 255, g: 0, b: 0, a: 255 };
        const green: RGBA = { r: 0, g: 255, b: 0, a: 255 };
        const blue: RGBA = { r: 0, g: 0, b: 255, a: 255 };
        const yellow: RGBA = { r: 255, g: 255, b: 0, a: 255 };
        const orange: RGBA = { r: 255, g: 128, b: 0, a: 255 };
        const purple: RGBA = { r: 128, g: 0, b: 128, a: 255 };
        const cyan: RGBA = { r: 0, g: 255, b: 255, a: 200 }; 
        const pink: RGBA = { r: 255, g: 192, b: 203, a: 180 }; 
        const white: RGBA = { r: 255, g: 255, b: 255, a: 255 };
        const black: RGBA = { r: 0, g: 0, b: 0, a: 255 };

        r.drawLine(50, 50, 300, 80, red);
        r.drawLine(50, 100, 400, 100, green);
        r.drawLine(50, 120, 400, 120, blue);
        r.drawLine(450, 50, 450, 200, yellow);
        r.drawLine(470, 50, 470, 200, orange);
        r.drawLine(50, 150, 300, 250, purple);
        r.drawLine(50, 170, 300, 270, cyan);
        
        r.fillCircle(centerX - 150, centerY - 100, 60, red);
        r.strokeLine(centerX - 150, centerY - 100 - 60, centerX - 150, centerY - 100 + 60, black, 3);
        r.strokeLine(centerX - 150 - 60, centerY - 100, centerX - 150 + 60, centerY - 100, black, 3);
        
        r.fillCircle(centerX - 180, centerY - 70, 40, cyan);
        
        const pulseRadius = 30 + Math.sin(time * 0.005) * 10;
        r.fillCircle(centerX + 150, centerY - 100, pulseRadius, pink);
        r.strokeCircle?.(centerX + 150, centerY - 100, pulseRadius, white, 2);
        
        const triangle = [
          { x: centerX - 100, y: centerY + 50 },
          { x: centerX, y: centerY + 150 },
          { x: centerX - 200, y: centerY + 150 },
        ];
        r.fillPolygon(triangle, blue);
        r.strokePolygon(triangle, white, 3);
        
        const square = [
          { x: centerX + 50, y: centerY + 50 },
          { x: centerX + 200, y: centerY + 50 },
          { x: centerX + 200, y: centerY + 150 },
          { x: centerX + 50, y: centerY + 150 },
        ];
        r.fillPolygon(square, orange);
        r.strokePolygon(square, black, 4);
        
        const pentagon: { x: number; y: number }[] = [];
        const radius = 70;
        const angleOffset = time * 0.002;
        for (let i = 0; i < 5; i++) {
          const angle = (i * 72 * Math.PI / 180) + angleOffset;
          pentagon.push({
            x: centerX + 150 + Math.cos(angle) * radius,
            y: centerY + 50 + Math.sin(angle) * radius,
          });
        }
        r.fillPolygon(pentagon, purple);
        r.strokePolygon(pentagon, yellow, 3);
        
        r.strokeLine(50, 400, 300, 480, orange, 10);
        
        r.strokeLine(50, 430, 400, 510, cyan, 20);
        
        const polyline = [
          { x: 450, y: 400 },
          { x: 550, y: 480 },
          { x: 650, y: 420 },
          { x: 750, y: 500 },
        ];
        r.strokePolygon(polyline, pink, 8);
        
        const redSquare = [
          { x: centerX - 300, y: centerY + 200 },
          { x: centerX - 150, y: centerY + 200 },
          { x: centerX - 150, y: centerY + 320 },
          { x: centerX - 300, y: centerY + 320 },
        ];
        r.fillPolygon(redSquare, { r: 255, g: 0, b: 0, a: 200 });
        
        const blueSquare = [
          { x: centerX - 220, y: centerY + 200 },
          { x: centerX - 70, y: centerY + 200 },
          { x: centerX - 70, y: centerY + 320 },
          { x: centerX - 220, y: centerY + 320 },
        ];
        r.fillPolygon(blueSquare, { r: 0, g: 0, b: 255, a: 200 });
        
        r.fillCircle(centerX - 185, centerY + 260, 40, { r: 0, g: 255, b: 0, a: 180 });
        
        const hexColor = hexToRGBA('#44FFAA', 200);
        r.fillCircle(centerX + 200, centerY + 280, 35, hexColor);
        r.strokeCircle?.(centerX + 200, centerY + 280, 35, hexToRGBA('#FF44AA'), 3);
        
        const labelY = h - 30;
        const label = lineAlg === 'wu' ? 'Сглаженные линии (Ву)' : 'Чёткие линии (Брезенхем)';
        
        r.strokeLine(20, labelY - 10, 20 + label.length * 8, labelY - 10, white, 2);
        
        setFrameCount(prev => prev + 1);
      }
      
      r?.commit();
      time++;
      animationId = requestAnimationFrame(frame);
    };
    
    frame();
    
    return () => {
      cancelAnimationFrame(animationId);
      ro.disconnect();
      renderer.dispose();
    };
  }, []);
  
  const strokeCircle = (r: RasterRenderer, cx: number, cy: number, radius: number, color: RGBA, width: number) => {
    const segments = 36;
    const points: { x: number; y: number }[] = [];
    for (let i = 0; i <= segments; i++) {
      const angle = (i * 2 * Math.PI / segments);
      points.push({
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius,
      });
    }
    r.strokePolygon(points, color, width);
  };
  
  (RasterRenderer.prototype as any).strokeCircle = function(
    cx: number, cy: number, radius: number, color: RGBA, width: number
  ) {
    const segments = 48;
    const points: { x: number; y: number }[] = [];
    for (let i = 0; i <= segments; i++) {
      const angle = (i * 2 * Math.PI / segments);
      points.push({
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius,
      });
    }
    this.strokePolygon(points, color, width);
  };
  
  return (
    <div ref={containerRef} className="w-full h-full min-h-[600px] bg-slate-900 rounded-lg overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full" style={{ display: 'block' }} />
    </div>
  );
};