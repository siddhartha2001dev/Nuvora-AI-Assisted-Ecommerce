import React, { useEffect, useRef } from "react";

const HeroFabricBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let animationFrameId;
    let time = 0;

    // Handle canvas resize
    const handleResize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.offsetWidth;
        canvas.height = parent.offsetHeight;
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    const rows = 22;
    const cols = 45;

    // Animation loop
    const render = () => {
      time += 0.02;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      const cellW = w / (cols - 1);
      const cellH = h / (rows - 1);

      // Draw dots mesh
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const baseX = c * cellW;
          const baseY = r * cellH;

          // Wave calculations
          const wave1 = Math.sin(c * 0.22 + time + r * 0.15);
          const wave2 = Math.cos(r * 0.28 - time * 0.8 + c * 0.1);
          const elevation = (wave1 + wave2) * 16;

          const x = baseX + Math.sin(time * 0.5 + r * 0.2) * 6;
          const y = baseY + elevation;

          const depth = (elevation + 32) / 64;
          const radius = Math.max(1.0, 1.4 + depth * 2.2);
          const alpha = Math.max(0.18, 0.22 + depth * 0.48);

          // Dot
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
          ctx.fill();

          // Connect lines
          if (c < cols - 1) {
            const nextWave1 = Math.sin((c + 1) * 0.22 + time + r * 0.15);
            const nextWave2 = Math.cos(r * 0.28 - time * 0.8 + (c + 1) * 0.1);
            const nextElevation = (nextWave1 + nextWave2) * 16;
            const nextX = (c + 1) * cellW + Math.sin(time * 0.5 + r * 0.2) * 6;
            const nextY = baseY + nextElevation;

            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(nextX, nextY);
            ctx.lineWidth = 0.7;
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.35})`;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
    />
  );
};

export default HeroFabricBackground;
