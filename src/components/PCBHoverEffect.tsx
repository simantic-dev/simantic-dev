import { useRef, useEffect } from 'react';
import './PCBHoverEffect.css';

export default function PCBHoverEffect() {
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const overlay = overlayRef.current;
    if (!container || !overlay) return;

    const baseLayer = container.querySelector('.pcb-base-layer') as HTMLElement;
    if (!baseLayer) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Update spotlight position for both layers
      overlay.style.setProperty('--mouse-x', `${x}px`);
      overlay.style.setProperty('--mouse-y', `${y}px`);
      baseLayer.style.setProperty('--mouse-x', `${x}px`);
      baseLayer.style.setProperty('--mouse-y', `${y}px`);
    };

    const handleMouseEnter = () => {
      overlay.classList.add('active');
      baseLayer.classList.add('active');
    };

    const handleMouseLeave = () => {
      overlay.classList.remove('active');
      baseLayer.classList.remove('active');
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div className="pcb-hover-container" ref={containerRef}>
      {/* Base x-ray layer */}
      <div className="pcb-base-layer">
        <img src="/pcb_image.png" alt="PCB X-ray view" draggable="false" />
      </div>
      
      {/* Hover reveal layer with spotlight mask */}
      <div className="pcb-overlay-layer" ref={overlayRef}>
        <img src="/pcb_image_on_hover.png" alt="PCB filled view" draggable="false" />
      </div>
      
      {/* Invisible spacer to maintain container height */}
      <img src="/pcb_image.png" alt="" style={{ visibility: 'hidden', width: '95%', maxWidth: '900px', height: 'auto', display: 'block', margin: '0 auto' }} draggable="false" />
    </div>
  );
}
