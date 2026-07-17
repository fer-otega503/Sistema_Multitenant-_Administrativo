import { useRef, useEffect, useState } from 'react';
import './SpecularButton.css';

const SpecularButton = ({
  children,
  size = "lg",
  radius = 18,
  textColor = "#f5f5f5",
  lineColor = "#ffffff",
  baseColor = "#525252",
  intensity = 1,
  shineSize = 10,
  shineFade = 40,
  thickness = 1,
  followMouse = true,
  onClick,
}) => {
  const containerRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!followMouse || !containerRef.current) return;

    const handleMouseMove = (e) => {
      const rect = containerRef.current.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    };

    const container = containerRef.current;
    container.addEventListener('mousemove', handleMouseMove);
    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
    };
  }, [followMouse]);

  // Estilo base del botón usando los props del componente
  const buttonStyle = {
    color: textColor,
    backgroundColor: baseColor,
    borderRadius: `${radius}px`,
    border: `${thickness}px solid ${lineColor}`,
    fontSize: size === "lg" ? "1.1rem" : "0.9rem",
  };

  // Usamos 'shineSize', 'shineFade' e 'intensity' para armar el gradiente del brillo
  const glowStyle = {
    borderRadius: `${radius}px`,
    opacity: isHovered ? intensity : 0,
    background: followMouse
      ? `radial-gradient(${shineSize * 15}px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.0) ${shineFade}%)`
      : 'none',
  };

  return (
    <div 
      ref={containerRef} 
      className="specular-button-container"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="specular-glow" style={glowStyle} />
      <button
        style={buttonStyle}
        className="specular-button"
        onClick={onClick}
      >
        {children}
      </button>
    </div>
  );
};

export default SpecularButton;