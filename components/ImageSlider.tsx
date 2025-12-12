import React, { useState, useRef, useEffect } from 'react';

interface ImageSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  aspectRatio?: string; // e.g., "16/9", "4/3", "3/2"
}

export const ImageSlider: React.FC<ImageSliderProps> = ({ 
  beforeImage, 
  afterImage, 
  beforeLabel = "Original", 
  afterLabel = "Staged",
  aspectRatio = "16/9"
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = () => setIsResizing(true);
  const handleMouseUp = () => setIsResizing(false);
  const handleTouchEnd = () => setIsResizing(false);

  const handleMove = (clientX: number) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const percentage = (x / rect.width) * 100;
      setSliderPosition(percentage);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isResizing) handleMove(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchend', handleTouchEnd);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  return (
    <div className="flex flex-col gap-2 select-none">
      <div 
        ref={containerRef}
        className="relative w-full overflow-hidden rounded-xl cursor-ew-resize shadow-2xl bg-gray-200"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ 
          touchAction: 'none',
          aspectRatio: aspectRatio 
        }}
      >
        {/* AFTER Image (Background Layer - Right Side Visible) */}
        {/* Fills the entire container. When the top image is clipped, this reveals the "After" state on the right. */}
        <img 
          src={afterImage} 
          alt="After transformation" 
          className="absolute inset-0 w-full h-full object-cover" 
          draggable={false}
          loading="eager"
          referrerPolicy="no-referrer"
        />
        
        {/* AFTER Label (Right side) */}
        <div className="absolute top-4 right-4 bg-gray-900/70 text-white text-sm font-medium px-4 py-1.5 rounded-full backdrop-blur-md z-10 border border-white/10 shadow-sm pointer-events-none">
          {afterLabel}
        </div>

        {/* BEFORE Image (Foreground Layer - Left Side Visible) */}
        {/* Clipped based on slider position. As slider moves right, more of this image is revealed. */}
        <img 
          src={beforeImage} 
          alt="Before transformation" 
          className="absolute inset-0 w-full h-full object-cover z-20"
          style={{ 
            clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` 
          }}
          draggable={false}
          loading="eager"
          referrerPolicy="no-referrer"
        />

        {/* BEFORE Label (Left side) */}
         <div className="absolute top-4 left-4 bg-gray-900/70 text-white text-sm font-medium px-4 py-1.5 rounded-full backdrop-blur-md z-30 border border-white/10 shadow-sm pointer-events-none">
          {beforeLabel}
        </div>

        {/* Slider Handle */}
        <div 
          className="absolute top-0 bottom-0 w-[5px] bg-white cursor-ew-resize z-40 hover:bg-gray-100 transition-colors shadow-[0_0_10px_rgba(0,0,0,0.5)]"
          style={{ 
            left: `${sliderPosition}%`,
            transform: 'translateX(-50%)'
          }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-8 bg-gray-300 rounded-full opacity-50"></div>
        </div>
      </div>
    </div>
  );
};