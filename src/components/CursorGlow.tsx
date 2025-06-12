
import React, { useEffect } from 'react';

const CursorGlow: React.FC = () => {
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const glowElement = document.querySelector('.cursor-glow') as HTMLElement;
      if (glowElement) {
        glowElement.style.setProperty('--mouse-x', `${e.clientX}px`);
        glowElement.style.setProperty('--mouse-y', `${e.clientY}px`);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return <div className="cursor-glow" />;
};

export default CursorGlow;
