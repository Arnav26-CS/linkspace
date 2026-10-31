
import { useEffect, useRef } from "react";

export default function Floating3DParticles({
  color = "#c4b5fd",
  quantity = 150,
  opacity = 0.48,
  depth = 0.8,
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !context) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let width = 0;
    let height = 0;
    let animationFrame;
    let particles = [];

    const pointer = { x: 0, y: 0 };
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const createParticles = () => {
      const count = Math.min(
        Math.max(30, quantity),
        window.innerWidth < 600 ? 65 : quantity
      );

      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        z: 0.2 + Math.random() * 0.8,
        radius: 0.6 + Math.random() * 1.5,
        speed: 0.12 + Math.random() * 0.35,
        phase: Math.random() * Math.PI * 2,
      }));
    };

    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect();

      width = rect.width;
      height = rect.height;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      createParticles();
      draw(0);
    };

    const draw = (time) => {
      context.clearRect(0, 0, width, height);

      particles.forEach((particle) => {
        const movement = reducedMotion ? 0 : time * 0.00035;

        const driftX = Math.sin(movement + particle.phase) * 13;
        const driftY = Math.cos(movement + particle.phase) * 10;

        const parallaxX = pointer.x * particle.z * 15;
        const parallaxY = pointer.y * particle.z * 15;

        const x = particle.x + driftX + parallaxX;
        const y = particle.y + driftY + parallaxY;

        const size = particle.radius * (0.55 + particle.z * depth);
        const alpha = opacity * particle.z;

        context.beginPath();
        context.arc(x, y, size, 0, Math.PI * 2);

        context.fillStyle = color;
        context.globalAlpha = alpha;
        context.shadowBlur = size * 9;
        context.shadowColor = color;
        context.fill();
      });

      context.globalAlpha = 1;
      context.shadowBlur = 0;
    };

    const animate = (time) => {
      draw(time);
      animationFrame = requestAnimationFrame(animate);
    };

    const handlePointerMove = (event) => {
      const rect = canvas.getBoundingClientRect();

      pointer.x = (event.clientX - rect.left) / width - 0.5;
      pointer.y = (event.clientY - rect.top) / height - 0.5;
    };

    const handlePointerLeave = () => {
      pointer.x = 0;
      pointer.y = 0;
    };

    resize();

    if (!reducedMotion) {
      animationFrame = requestAnimationFrame(animate);
    }

    window.addEventListener("resize", resize);
    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [color, quantity, opacity, depth]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        display: "block",
      }}
    />
  );
}
