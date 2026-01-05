
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
  const [showCopyFeedback, setShowCopyFeedback] = useState(false);
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

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Create shareable URL
    // We use SB (Shared Before) and SA (Shared After) params.
    // For privacy/length we try to keep it simple. If they are large dataURIs, 
    // this won't work well without a backend, but for hosted URLs it's perfect.
    const url = new URL(window.location.origin);
    url.searchParams.set('sb', beforeImage);
    url.searchParams.set('sa', afterImage);
    const shareUrl = url.toString();

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check out this property staging!',
          text: 'See the before and after transformation on PropertyStage.',
          url: shareUrl,
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        setShowCopyFeedback(true);
        setTimeout(() => setShowCopyFeedback(false), 2000);
      } catch (err) {
        alert('Could not copy link to clipboard.');
      }
    }
  };

  return (
    <div className="flex flex-col gap-2 select-none">
      <div 
        ref={containerRef}
        className="relative w-full overflow-hidden rounded-xl cursor-ew-resize shadow-2xl bg-gray-200 group/slider"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ 
          touchAction: 'none',
          aspectRatio: aspectRatio 
        }}
      >
        {/* AFTER Image (Background Layer) */}
        <img 
          src={afterImage} 
          alt="After transformation" 
          className="absolute inset-0 w-full h-full object-cover" 
          draggable={false}
          loading="eager"
          referrerPolicy="no-referrer"
        />
        
        {/* Labels and Share Button Container */}
        <div className="absolute top-4 right-4 flex items-center gap-2 z-50">
          <button 
            onClick={handleShare}
            className="p-2 bg-white/90 hover:bg-white text-gray-900 rounded-full shadow-lg border border-white/20 backdrop-blur-md transition-all active:scale-90 flex items-center justify-center"
            title="Share Transformation"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
          
          <div className="bg-gray-900/70 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full backdrop-blur-md border border-white/10 shadow-sm pointer-events-none">
            {afterLabel}
          </div>
        </div>

        {/* Copy Feedback Toast inside Slider */}
        {showCopyFeedback && (
          <div className="absolute top-16 right-4 bg-green-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-lg shadow-xl animate-in fade-in slide-in-from-top-2 z-[60]">
            Link Copied!
          </div>
        )}

        {/* BEFORE Image (Foreground Layer) */}
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

        {/* BEFORE Label */}
         <div className="absolute top-4 left-4 bg-gray-900/70 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full backdrop-blur-md z-30 border border-white/10 shadow-sm pointer-events-none">
          {beforeLabel}
        </div>

        {/* Slider Handle */}
        <div 
          className="absolute top-0 bottom-0 w-[4px] bg-white cursor-ew-resize z-40 shadow-[0_0_15px_rgba(0,0,0,0.4)]"
          style={{ 
            left: `${sliderPosition}%`,
            transform: 'translateX(-50%)'
          }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-2xl flex items-center justify-center border border-gray-100 group-hover/slider:scale-110 transition-transform">
             <div className="flex gap-0.5">
                <div className="w-0.5 h-3 bg-gray-300 rounded-full"></div>
                <div className="w-0.5 h-3 bg-gray-300 rounded-full"></div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
