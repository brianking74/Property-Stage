
import React, { useState, useRef, useEffect } from 'react';

interface ImageCropperProps {
  imageSrc: string;
  onCrop: (croppedImage: string, aspectRatio: string) => void;
  onCancel: () => void;
}

type AspectRatioOption = 'Original' | '1:1' | '4:3' | '16:9' | '3:4' | '9:16';

export const ImageCropper: React.FC<ImageCropperProps> = ({ imageSrc, onCrop, onCancel }) => {
  const [selectedRatio, setSelectedRatio] = useState<AspectRatioOption>('Original');
  const [crop, setCrop] = useState<{x: number, y: number, width: number, height: number} | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const RATIO_VALUES: Record<string, number> = {
    '1:1': 1,
    '4:3': 4/3,
    '16:9': 16/9,
    '3:4': 3/4,
    '9:16': 9/16
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  // Update crop area when ratio changes
  useEffect(() => {
    if (imageLoaded && containerRef.current && imageRef.current) {
      const img = imageRef.current;
      
      if (selectedRatio === 'Original') {
        setCrop({
          x: 0,
          y: 0,
          width: img.width,
          height: img.height
        });
        return;
      }

      const targetRatio = RATIO_VALUES[selectedRatio];
      
      let width, height;
      const imgWidth = img.width;
      const imgHeight = img.height;

      if (imgWidth / imgHeight > targetRatio) {
        height = imgHeight * 0.9;
        width = height * targetRatio;
      } else {
        width = imgWidth * 0.9;
        height = width / targetRatio;
      }

      setCrop({
        x: (imgWidth - width) / 2,
        y: (imgHeight - height) / 2,
        width,
        height
      });
    }
  }, [selectedRatio, imageLoaded]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current || !imageLoaded || selectedRatio === 'Original') return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setStartPos({ x, y });
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current || !crop || selectedRatio === 'Original') return;
    const rect = containerRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    const dx = currentX - startPos.x;
    const dy = currentY - startPos.y;

    let newX = crop.x + dx;
    let newY = crop.y + dy;

    if (imageRef.current) {
        const img = imageRef.current;
        if (newX < 0) newX = 0;
        if (newY < 0) newY = 0;
        if (newX + crop.width > img.width) newX = img.width - crop.width;
        if (newY + crop.height > img.height) newY = img.height - crop.height;
    }

    setCrop({ ...crop, x: newX, y: newY });
    setStartPos({ x: currentX, y: currentY });
  };

  const completeCrop = () => {
    if (!imageRef.current || !crop) return;
    
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
    
    let finalRatio = selectedRatio;
    if (selectedRatio === 'Original') {
        const r = image.naturalWidth / image.naturalHeight;
        const supported = [
            { name: '1:1', val: 1 },
            { name: '4:3', val: 4/3 },
            { name: '16:9', val: 16/9 },
            { name: '3:4', val: 3/4 },
            { name: '9:16', val: 9/16 }
        ];
        const closest = supported.reduce((prev, curr) => 
            Math.abs(curr.val - r) < Math.abs(prev.val - r) ? curr : prev
        );
        finalRatio = closest.name as any;
    }
    
    onCrop(base64, finalRatio);
  };

  const ratios: AspectRatioOption[] = ['Original', '1:1', '4:3', '16:9', '3:4', '9:16'];

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col animate-in fade-in duration-200">
      <div className="flex flex-col md:flex-row justify-between items-center p-4 bg-gray-900 text-white border-b border-gray-800 gap-4">
         <div className="flex items-center gap-3">
            <span className="text-2xl">📐</span>
            <div>
                <h3 className="font-bold">Align to Architecture</h3>
                <p className="text-xs text-gray-400">Select "Original" to keep image as-is, or crop to standard</p>
            </div>
         </div>
         
         <div className="flex bg-gray-800 p-1 rounded-xl overflow-x-auto max-w-full">
            {ratios.map(ratio => (
              <button
                key={ratio}
                onClick={() => setSelectedRatio(ratio)}
                className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all whitespace-nowrap ${selectedRatio === ratio ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
              >
                {ratio}
              </button>
            ))}
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
                Confirm Selection
            </button>
         </div>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-8 overflow-hidden bg-gray-950/50">
          <div 
            ref={containerRef}
            className={`relative inline-block shadow-2xl overflow-hidden ${selectedRatio === 'Original' ? 'cursor-default' : 'cursor-move'}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
          >
            <img 
                ref={imageRef}
                src={imageSrc} 
                alt="Crop target" 
                className="max-h-[70vh] max-w-full object-contain block select-none"
                onLoad={() => setImageLoaded(true)}
                draggable={false}
            />
            
            {crop && (
                <div 
                    className="absolute z-10 box-border pointer-events-none transition-all duration-300"
                    style={{
                        left: crop.x,
                        top: crop.y,
                        width: crop.width,
                        height: crop.height,
                        boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)',
                        border: selectedRatio === 'Original' ? '2px dashed rgba(255,255,255,0.4)' : '2px solid white'
                    }}
                >
                    {selectedRatio !== 'Original' && (
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
                    )}
                    
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-bold text-white backdrop-blur-md uppercase tracking-widest">
                            {selectedRatio === 'Original' ? 'FULL IMAGE' : 'DRAG TO POSITION'}
                        </div>
                    </div>
                </div>
            )}
          </div>
      </div>
    </div>
  )
}
