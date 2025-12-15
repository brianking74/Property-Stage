import React, { useState, useRef } from 'react';
import { transformPropertyImage } from '../services/geminiService';
import { TransformationType } from '../types';
import { ImageCropper } from './ImageCropper';
import { useUser } from '../contexts/UserContext';

const TRANSFORMATION_TYPES: TransformationType[] = [
  { 
    id: 'stage_modern', 
    label: 'Modern Staging', 
    promptPrefix: 'Stage this empty room with modern, high-end furniture suitable for a luxury apartment. Neutral tones, warm lighting. Keep the original windows, walls, and flooring exactly as is.', 
    icon: '🛋️' 
  },
  { 
    id: 'declutter', 
    label: 'Declutter & Clean', 
    promptPrefix: 'Digitally remove all loose clutter, personal items, boxes, and trash. Leave the furniture and structural elements intact. Make the room look spotless. Do not change the room geometry.', 
    icon: '🧹' 
  },
  { 
    id: 'upscale_brighten', 
    label: 'Upscale & Light', 
    promptPrefix: 'Enhance this image to look like a professional real estate photo. Improve lighting, color balance, and sharpness. Do NOT change any furniture or structure. Just improve image quality.', 
    icon: '✨' 
  },
  {
    id: 'luxury_gold',
    label: 'Luxury Renovation',
    promptPrefix: 'Reimagine this room with luxury gold accents and marble textures. Keep the same perspective and room dimensions, but upgrade the materials.',
    icon: '🏆'
  }
];

export const Dashboard: React.FC = () => {
  const { user, deductCredit } = useUser();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>(TRANSFORMATION_TYPES[0].id);
  const [customPrompt, setCustomPrompt] = useState('');
  const [resolution, setResolution] = useState<string>('1K');
  
  // Cropper State
  const [isCropping, setIsCropping] = useState(false);
  const [tempImage, setTempImage] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setError(null);

      // 1. Validate File Type
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setError("Invalid file format. Please upload a JPG, PNG, or WEBP image.");
        // Reset input to allow selecting a new file immediately
        if (event.target) event.target.value = '';
        return;
      }

      // 2. Validate file size (max 5MB)
      const MAX_SIZE = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > MAX_SIZE) {
        setError("File is too large. Please upload an image smaller than 5MB.");
        if (event.target) event.target.value = '';
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempImage(reader.result as string);
        setIsCropping(true);
        setGeneratedImage(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
    // Reset input value to allow selecting the same file again if needed
    if (event.target) event.target.value = '';
  };

  const handleCropComplete = (croppedImage: string) => {
    setSelectedImage(croppedImage);
    setIsCropping(false);
    setTempImage(null);
  };

  const handleCropCancel = () => {
    setIsCropping(false);
    setTempImage(null);
  };

  const handleProcess = async () => {
    if (!selectedImage) return;

    // Check Credits
    if (user && user.credits === 0) {
      setError("You have run out of credits. Please upgrade your plan or wait for next month.");
      return;
    }

    // Check if user has selected an API key (Required for gemini-3-pro-image-preview)
    try {
      if ((window as any).aistudio) {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        if (!hasKey) {
          await (window as any).aistudio.openSelectKey();
          // We assume success after the dialog closes to mitigate race conditions
        }
      }
    } catch (e) {
      console.warn("AI Studio key check failed:", e);
    }

    setLoading(true);
    setGeneratedImage(null);
    setError(null);

    try {
      // Calculate aspect ratio of input image to prevent warping
      const img = new Image();
      img.src = selectedImage;
      await img.decode();
      
      const width = img.naturalWidth;
      const height = img.naturalHeight;
      const ratio = width / height;

      // Map to closest supported ratio: "1:1", "3:4", "4:3", "9:16", "16:9"
      const supportedRatios: Record<string, number> = {
        '16:9': 16/9,
        '4:3': 4/3,
        '1:1': 1,
        '3:4': 3/4,
        '9:16': 9/16
      };

      let targetRatio = '1:1';
      let minDiff = Infinity;
      
      for (const [key, val] of Object.entries(supportedRatios)) {
        const diff = Math.abs(ratio - val);
        if (diff < minDiff) {
          minDiff = diff;
          targetRatio = key;
        }
      }

      const typeConfig = TRANSFORMATION_TYPES.find(t => t.id === selectedType);
      const prompt = `${typeConfig?.promptPrefix} ${customPrompt}`;
      
      const result = await transformPropertyImage(
        selectedImage, 
        prompt, 
        targetRatio, 
        'gemini-3-pro-image-preview', 
        resolution
      );
      
      if (result) {
        setGeneratedImage(result);
        if (user) {
          deductCredit();
        }
      } else {
        throw new Error("No result returned from the service.");
      }
    } catch (error: any) {
      console.error(error);
      
      let errorMessage = "An unexpected error occurred. Please try again.";
      
      // Handle specific error case where key might be invalid or project not found
      if (error.toString().includes("Requested entity was not found") || error.toString().includes("permission denied")) {
        errorMessage = "API Key Permission Denied. Please ensure you have selected a valid API key linked to a GCP project with billing enabled.";
        try {
          if ((window as any).aistudio) {
            await (window as any).aistudio.openSelectKey();
          }
        } catch (e) {
          // ignore
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = () => {
    if (generatedImage) {
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = 'property-stage-enhanced.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {isCropping && tempImage && (
        <ImageCropper 
          imageSrc={tempImage}
          onCrop={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}

      <div className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Studio Dashboard</h2>
          <p className="text-gray-600 mt-2">Upload your property photos and apply AI magic.</p>
        </div>
        {user && (
          <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-100 text-blue-800 text-sm font-semibold">
            Credits: {user.credits === -1 ? 'Unlimited' : user.credits}
          </div>
        )}
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-red-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Sidebar - Controls */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">1. Upload Photo</label>
            <div 
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${selectedImage ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-blue-500'}`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/jpeg, image/png, image/webp"
              />
              <span className="text-4xl block mb-2">{selectedImage ? '✅' : '📸'}</span>
              <p className="text-sm text-gray-500">{selectedImage ? "Change Image" : "Click to upload"}</p>
              <p className="text-xs text-gray-400 mt-2">JPG, PNG, WEBP (Max 5MB)</p>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">2. Choose Style</label>
            <div className="grid grid-cols-2 gap-2">
              {TRANSFORMATION_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`p-3 text-left rounded-lg border transition-all ${
                    selectedType === type.id 
                      ? 'border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600' 
                      : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <span className="text-xl block mb-1">{type.icon}</span>
                  <span className="text-xs font-semibold">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">3. Output Resolution</label>
            <div className="flex gap-4">
              <button
                onClick={() => setResolution('1K')}
                className={`flex-1 py-2 px-4 rounded-lg border text-sm font-medium transition-all ${
                  resolution === '1K' 
                    ? 'border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600' 
                    : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                }`}
              >
                Standard (1K)
              </button>
              <button
                onClick={() => setResolution('4K')}
                className={`flex-1 py-2 px-4 rounded-lg border text-sm font-medium transition-all ${
                  resolution === '4K' 
                    ? 'border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600' 
                    : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                }`}
              >
                Ultra HD (4K)
              </button>
            </div>
          </div>

          <div className="mb-6">
             <label className="block text-sm font-medium text-gray-700 mb-2">4. Additional Instructions (Optional)</label>
             <textarea 
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="e.g., Use blue velvet sofa, make the lighting warmer..."
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
             />
          </div>

          <button
            onClick={handleProcess}
            disabled={!selectedImage || loading || (user && user.credits === 0)}
            className={`w-full py-3 px-4 rounded-xl text-white font-semibold text-lg shadow-lg transition-all ${
              !selectedImage || loading || (user && user.credits === 0)
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 hover:shadow-xl transform hover:-translate-y-0.5'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (user && user.credits === 0) ? 'No Credits Left' : 'Generate Transformation ✨'}
          </button>
        </div>

        {/* Right Area - Canvas */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gray-100 rounded-2xl p-4 min-h-[500px] flex items-center justify-center border border-gray-200">
            {!selectedImage ? (
              <div className="text-center text-gray-400">
                <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p>Upload an image to start</p>
              </div>
            ) : (
              <div className="relative w-full h-full flex flex-col gap-6">
                <div className="relative w-full rounded-xl overflow-hidden shadow-lg bg-white">
                   <img src={selectedImage} alt="Original" className="w-full h-auto object-cover" />
                   <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded text-sm backdrop-blur-sm">Original</div>
                </div>

                {generatedImage && (
                  <div className="relative w-full rounded-xl overflow-hidden shadow-lg bg-white ring-4 ring-blue-500/20">
                    <img src={generatedImage} alt="Generated" className="w-full h-auto object-cover" />
                    <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded text-sm shadow-lg">PropertyStage AI</div>
                  </div>
                )}
              </div>
            )}
          </div>

          {generatedImage && (
            <div className="flex justify-end gap-4">
              <button 
                onClick={() => setGeneratedImage(null)}
                className="px-6 py-2 rounded-lg text-gray-600 hover:bg-gray-100 font-medium"
              >
                Discard
              </button>
              <button 
                onClick={downloadImage}
                className="px-6 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 font-medium shadow-md flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                Download HD
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};