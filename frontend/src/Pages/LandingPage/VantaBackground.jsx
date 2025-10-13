import React, { useEffect, useRef } from 'react';
import '../styles/VantaBackground.css';

const VantaBackground = ({ children }) => {
  const vantaRef = useRef(null);

  useEffect(() => {
    if (window.VANTA && window.VANTA.GLOBE) {
      const effect = window.VANTA.GLOBE({
        el: vantaRef.current,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.00,
        minWidth: 200.00,
        scale: 1.00,
        scaleMobile: 1.00,
        color: 0x3a47d5,
        size: 1.10
      });

      return () => {
        if (effect && effect.destroy) {
          effect.destroy();
        }
      };
    }
  }, []);

  return (
    <div ref={vantaRef} className="vanta-container">
      <div className="vanta-content">
        {children}
      </div>
    </div>
  );
};

export default VantaBackground;
