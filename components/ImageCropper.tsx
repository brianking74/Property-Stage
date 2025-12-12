import React, { useState, useRef, useEffect } from 'react';

interface ImageCropperProps {
  imageSrc: string;
  onCrop: (croppedImage: string) => void;
  onCancel: () => void;
}

export const ImageCropper: React.FC<ImageCropperProps> = ({ imageSrc, onCrop, onCancel }) => {
  const [crop, setCrop] = useState<{x: number, y: number, width: number, height: number} | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current || !imageLoaded) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setStartPos({ x, y });
    setCrop({ x, y, width: 0, height: 0 });
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    // Calculate raw dimensions
    let width = currentX - startPos.x;
    let height = currentY - startPos.y;
    
    // Normalize (handle dragging backwards/upwards)
    let newX = startPos.x;
    let newY = startPos.y;

    if (width < 0) {
        newX = currentX;
        width = Math.abs(width);
    }
    if (height < 0) {
        newY = currentY;
        height = Math.abs(height);
    }

    // Constrain to image bounds
    if (newX < 0) { width += newX; newX = 0; }
    if (newY < 0) { height += newY; newY = 0; }
    
    if (newX + width > rect.width) { width = rect.width - newX; }
    if (newY + height > rect.height) { height = rect.height - newY; }

    setCrop({
      x: newX,
      y: newY,
      width,
      height
    });
  };

  const completeCrop = () => {
    if (!imageRef.current) return;
    
    // If no crop defined or very small, return original
    if (!crop || crop.width < 10 || crop.height < 10) {
        onCrop(imageSrc);
        return;
    }

    const canvas = document.createElement('canvas');
    const image = imageRef.current;
    
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = crop.width * scaleX;
    canvas.height = crop.height * scaleY;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );

    const base64 = canvas.toDataURL('image/jpeg', 0.95);
    onCrop(base64);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-gray-900 text-white border-b border-gray-800">
         <div className="flex items-center gap-3">
            <span className="text-2xl">✂️</span>
            <div>
                <h3 className="font-bold">Crop Image</h3>
                <p className="text-xs text-gray-400">Click and drag to select area</p>
            </div>
         </div>
         <div className="flex gap-3">
            <button 
                onClick={onCancel} 
                className="px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors"
            >
                Cancel
            </button>
            <button 
                onClick={completeCrop} 
                className="px-6 py-2 rounded-lg bg-blue-600 font-semibold hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/20"
            >
                {crop && crop.width > 10 ? 'Apply Crop' : 'Skip Cropping'}
            </button>
         </div>
      </div>
      
      {/* Canvas Area */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-hidden bg-gray-950/50 cursor-crosshair">
          <div 
            ref={containerRef}
            className="relative inline-block shadow-2xl overflow-hidden"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
          >
            <img 
                ref={imageRef}
                src={imageSrc} 
                alt="Crop target" 
                className="max-h-[75vh] max-w-full object-contain block select-none"
                onLoad={() => setImageLoaded(true)}
                draggable={false}
            />
            
            {/* Selection Box & Darken Overlay */}
            {crop && crop.width > 0 && (
                <div 
                    className="absolute z-10 box-border pointer-events-none"
                    style={{
                        left: crop.x,
                        top: crop.y,
                        width: crop.width,
                        height: crop.height,
                        boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)', // Darkens everything outside the selection
                        border: '2px solid white'
                    }}
                >
                    {/* Grid of Thirds */}
                    <div className="absolute inset-0 flex flex-col">
                         <div className="flex-1 border-b border-white/30 flex">
                            <div className="flex-1 border-r border-white/30"></div>
                            <div className="flex-1 border-r border-white/30"></div>
                            <div className="flex-1"></div>
                         </div>
                         <div className="flex-1 border-b border-white/30 flex">
                            <div className="flex-1 border-r border-white/30"></div>
                            <div className="flex-1 border-r border-white/30"></div>
                            <div className="flex-1"></div>
                         </div>
                         <div className="flex-1 flex">
                            <div className="flex-1 border-r border-white/30"></div>
                            <div className="flex-1 border-r border-white/30"></div>
                            <div className="flex-1"></div>
                         </div>
                    </div>
                </div>
            )}
          </div>
      </div>
    </div>
  )
}