
import React, { useState, useRef, useEffect } from 'react';
import { transformPropertyImage } from '../services/geminiService';
import { TransformationType, RoomType, GenerationHistory } from '../types';
import { ImageCropper } from './ImageCropper';
import { ImageSlider } from './ImageSlider';
import { useUser } from '../contexts/UserContext';

const STYLES: TransformationType[] = [
  { 
    id: 'modern', 
    label: 'Modern', 
    description: 'Clean lines, neutral palette',
    promptPrefix: 'Stage with sleek modern furniture, minimal decor, and a neutral color scheme. High-end aesthetic.', 
    icon: '🏢' 
  },
  { 
    id: 'scandi', 
    label: 'Scandinavian', 
    description: 'Light wood, cozy, functional',
    promptPrefix: 'Stage with Scandinavian style: light oak woods, "hygge" cozy textures, and functional minimalist furniture.', 
    icon: '🌲' 
  },
  { 
    id: 'industrial', 
    label: 'Industrial', 
    description: 'Raw metal, brick, leather',
    promptPrefix: 'Stage with industrial loft style: dark metal accents, leather seating, and reclaimed wood elements.', 
    icon: '🧱' 
  },
  { 
    id: 'luxury', 
    label: 'Luxury Gold', 
    description: 'Marble, gold, velvet',
    promptPrefix: 'Stage with premium luxury elements: gold accents, marble surfaces, and velvet fabrics for an upscale look.', 
    icon: '💎' 
  },
  { 
    id: 'declutter', 
    label: 'Clean Up', 
    description: 'Remove mess & clutter',
    promptPrefix: 'Digitally remove all trash, clutter, and personal items. Clean the space while keeping existing fixed furniture.', 
    icon: '🧹' 
  }
];

const ROOM_TYPES: RoomType[] = ['Living Room', 'Bedroom', 'Dining Room', 'Kitchen', 'Office', 'Bathroom', 'Exterior'];

const QUICK_FEEDBACK = [
  "Make it brighter",
  "Add more plants",
  "More minimalist",
  "Change the rug",
  "Warm lighting",
  "Blue accents"
];

const ASPECT_RATIOS = [
  { id: 'Auto', label: 'Auto', icon: '📐' },
  { id: '1:1', label: '1:1', icon: '⬛' },
  { id: '4:3', label: '4:3', icon: '📺' },
  { id: '16:9', label: '16:9', icon: '🎞️' }
];

export const Dashboard: React.FC = () => {
  const { user, deductCredit } = useUser();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState<{width: number, height: number} | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [history, setHistory] = useState<GenerationHistory[]>([]);
  
  // Feedback states
  const [feedback, setFeedback] = useState('');
  const [refining, setRefining] = useState(false);
  
  // Undo/Redo Stacks
  const [pastResults, setPastResults] = useState<string[]>([]);
  const [futureResults, setFutureResults] = useState<string[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedStyle, setSelectedStyle] = useState<string>(STYLES[0].id);
  const [selectedRoom, setSelectedRoom] = useState<RoomType>('Living Room');
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<string>('Auto');
  const [resolution, setResolution] = useState<string>('1K');
  
  const [isCropping, setIsCropping] = useState(false);
  const [tempImage, setTempImage] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempImage(reader.result as string);
        setIsCropping(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const calculateAutoAspectRatio = () => {
    if (!imageDimensions) return '4:3';
    const ratio = imageDimensions.width / imageDimensions.height;
    
    const targets = [
      { id: '1:1', val: 1 },
      { id: '3:4', val: 0.75 },
      { id: '4:3', val: 1.33 },
      { id: '9:16', val: 0.5625 },
      { id: '16:9', val: 1.7777 }
    ];

    const closest = targets.reduce((prev, curr) => {
      return (Math.abs(curr.val - ratio) < Math.abs(prev.val - ratio) ? curr : prev);
    });

    return closest.id;
  };

  const handleProcess = async () => {
    if (!selectedImage) return;
    if (user && user.credits === 0) {
      setError("No credits left.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const styleConfig = STYLES.find(s => s.id === selectedStyle);
      const prompt = styleConfig?.promptPrefix || '';
      
      const finalAspectRatio = selectedAspectRatio === 'Auto' 
        ? calculateAutoAspectRatio() 
        : selectedAspectRatio;

      const result = await transformPropertyImage(
        selectedImage, 
        prompt, 
        finalAspectRatio, 
        selectedRoom,
        'gemini-3-pro-image-preview', 
        resolution
      );
      
      if (result) {
        if (generatedImage) {
          setPastResults(prev => [...prev, generatedImage]);
        }
        setFutureResults([]);
        setGeneratedImage(result);

        const newEntry: GenerationHistory = {
          id: Date.now().toString(),
          original: selectedImage,
          transformed: result,
          style: styleConfig?.label || 'Custom',
          timestamp: Date.now()
        };
        setHistory(prev => [newEntry, ...prev].slice(0, 10));
        if (user) deductCredit();
      }
    } catch (err: any) {
      setError(err.message || "Transformation failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleRefine = async (customPrompt?: string) => {
    const instruction = customPrompt || feedback;
    if (!instruction || !generatedImage) return;

    setRefining(true);
    setError(null);

    try {
      const result = await transformPropertyImage(
        generatedImage, 
        `Refine this design with the following request: ${instruction}. Keep the existing style and architecture consistent.`, 
        selectedAspectRatio === 'Auto' ? calculateAutoAspectRatio() : selectedAspectRatio, 
        selectedRoom,
        'gemini-3-pro-image-preview', 
        resolution
      );

      if (result) {
        setPastResults(prev => [...prev, generatedImage]);
        setFutureResults([]);
        setGeneratedImage(result);
        setFeedback('');
        if (user) deductCredit();
      }
    } catch (err: any) {
      setError(err.message || "Refinement failed.");
    } finally {
      setRefining(false);
    }
  };

  const handleUndo = () => {
    if (pastResults.length > 0) {
      const prev = pastResults[pastResults.length - 1];
      if (generatedImage) setFutureResults(prevFuture => [generatedImage, ...prevFuture]);
      setGeneratedImage(prev);
      setPastResults(prevPast => prevPast.slice(0, -1));
    } else if (generatedImage) {
      setFutureResults(prevFuture => [generatedImage, ...prevFuture]);
      setGeneratedImage(null);
    }
  };

  const handleRedo = () => {
    if (futureResults.length > 0) {
      const next = futureResults[0];
      if (generatedImage) setPastResults(prevPast => [...prevPast, generatedImage]);
      setGeneratedImage(next);
      setFutureResults(prevFuture => prevFuture.slice(1));
    }
  };

  const handleCropComplete = (img: string) => {
    setSelectedImage(img);
    setGeneratedImage(null);
    setPastResults([]);
    setFutureResults([]);
    setIsCropping(false);
    
    const image = new Image();
    image.src = img;
    image.onload = () => {
      setImageDimensions({ width: image.naturalWidth, height: image.naturalHeight });
    };
  };

  const handleReset = () => {
    setGeneratedImage(null);
    setPastResults([]);
    setFutureResults([]);
  };

  const handleHistoryItemClick = (item: GenerationHistory) => {
    setSelectedImage(item.original);
    setGeneratedImage(item.transformed);
    setPastResults([]);
    setFutureResults([]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {isCropping && tempImage && (
        <ImageCropper 
          imageSrc={tempImage} 
          onCrop={handleCropComplete} 
          onCancel={() => setIsCropping(false)} 
        />
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left: Settings Panel */}
        <div className="w-full lg:w-80 shrink-0 space-y-6">
          <section className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
              Upload Photo
            </h3>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${selectedImage ? 'border-green-400 bg-green-50' : 'border-gray-200 hover:border-blue-500'}`}
            >
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
              <div className="text-3xl mb-2">{selectedImage ? '✅' : '📤'}</div>
              <p className="text-xs font-medium text-gray-500">{selectedImage ? 'Change Image' : 'Click to Upload'}</p>
            </div>
          </section>

          <section className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
              Room Context
            </h3>
            <select 
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value as RoomType)}
              className="w-full p-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {ROOM_TYPES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </section>

          <section className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
              Aspect Ratio
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {ASPECT_RATIOS.map(ratio => (
                <button
                  key={ratio.id}
                  onClick={() => setSelectedAspectRatio(ratio.id)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all ${selectedAspectRatio === ratio.id ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-100 text-gray-600 hover:bg-gray-50'}`}
                >
                  <span>{ratio.icon}</span>
                  {ratio.label}
                </button>
              ))}
            </div>
          </section>

          <section className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">4</span>
              Staging Style
            </h3>
            <div className="space-y-2">
              {STYLES.map(style => (
                <button
                  key={style.id}
                  onClick={() => setSelectedStyle(style.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${selectedStyle === style.id ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600' : 'border-gray-100 hover:bg-gray-50'}`}
                >
                  <span className="text-2xl">{style.icon}</span>
                  <div>
                    <div className="text-sm font-bold text-gray-900">{style.label}</div>
                    <div className="text-[10px] text-gray-500 leading-tight">{style.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600 font-medium animate-shake">
              ⚠️ {error}
            </div>
          )}

          <button
            onClick={handleProcess}
            disabled={!selectedImage || loading || refining}
            className={`w-full py-4 rounded-2xl font-bold text-white shadow-lg transition-all ${!selectedImage || loading || refining ? 'bg-gray-300' : 'bg-blue-600 hover:bg-blue-700 active:scale-95'}`}
          >
            {loading ? (
               <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  AI Staging...
               </div>
            ) : 'Generate Design ✨'}
          </button>
        </div>

        {/* Right: Main Canvas */}
        <div className="flex-1 space-y-6">
          <div className="bg-gray-100 rounded-3xl p-6 min-h-[500px] border border-gray-200 flex flex-col items-center justify-center relative overflow-hidden">
            {selectedImage && (
              <div className="absolute top-6 left-6 flex items-center gap-2 z-[60]">
                <button
                  onClick={handleUndo}
                  disabled={(!generatedImage && pastResults.length === 0) || loading || refining}
                  className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md border border-gray-100 text-gray-600 hover:text-blue-600 disabled:opacity-30 transition-all active:scale-90"
                  title="Undo"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                </button>
                <button
                  onClick={handleRedo}
                  disabled={futureResults.length === 0 || loading || refining}
                  className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md border border-gray-100 text-gray-600 hover:text-blue-600 disabled:opacity-30 transition-all active:scale-90"
                  title="Redo"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" /></svg>
                </button>
              </div>
            )}

            {!selectedImage ? (
              <div className="text-center text-gray-400">
                <p className="text-lg font-medium">No photo uploaded yet</p>
                <p className="text-sm">Start by choosing a room photo from your device.</p>
              </div>
            ) : (
              <div className="w-full max-w-4xl">
                {generatedImage ? (
                  <div className="space-y-6">
                    <div className="rounded-2xl overflow-hidden shadow-2xl border-4 border-white relative">
                      <ImageSlider 
                        beforeImage={selectedImage} 
                        afterImage={generatedImage} 
                        aspectRatio={selectedAspectRatio === 'Auto' ? undefined : selectedAspectRatio.replace(':', '/')} 
                      />
                      {refining && (
                        <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] z-[50] flex flex-col items-center justify-center">
                            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
                            <p className="text-blue-900 font-bold bg-white/80 px-4 py-1 rounded-full shadow-sm">Refining with Feedback...</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Feedback Refinement UI */}
                    <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-lg">✨</span>
                            <h4 className="font-bold text-gray-900 text-sm">Refine Staging with AI Feedback</h4>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                            {QUICK_FEEDBACK.map(q => (
                                <button
                                    key={q}
                                    onClick={() => handleRefine(q)}
                                    disabled={loading || refining}
                                    className="px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-full text-xs font-medium text-gray-600 hover:border-blue-300 hover:bg-blue-50 transition-all disabled:opacity-50"
                                >
                                    + {q}
                                </button>
                            ))}
                        </div>

                        <div className="relative group">
                            <input
                                type="text"
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleRefine()}
                                placeholder="E.g. Change the sofa to leather or add a chandelier..."
                                className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all group-hover:border-blue-200"
                            />
                            <button
                                onClick={() => handleRefine()}
                                disabled={!feedback || loading || refining}
                                className="absolute right-2 top-1.5 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-30 transition-all"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-between items-center px-2">
                      <button 
                        onClick={handleReset}
                        className="text-gray-400 text-sm font-bold hover:text-red-500 transition-colors"
                      >
                        Discard & Restart
                      </button>
                      <a 
                        href={generatedImage} 
                        download="staged-property.jpg"
                        className="px-8 py-3 rounded-xl bg-green-600 text-white font-bold shadow-lg hover:bg-green-700 transition-all flex items-center gap-2 active:scale-95"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        Download HD
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="relative rounded-2xl overflow-hidden shadow-xl border-4 border-white group">
                    <img src={selectedImage} alt="Original" className="w-full h-auto" />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <span className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold shadow-lg">Input Photo</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* History Tray */}
          {history.length > 0 && (
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 mb-4">Recent Staging History</h3>
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {history.map(item => (
                  <div 
                    key={item.id}
                    onClick={() => handleHistoryItemClick(item)}
                    className="w-32 shrink-0 cursor-pointer group"
                  >
                    <div className="aspect-square rounded-xl overflow-hidden border border-gray-200 shadow-sm transition-transform group-hover:scale-105">
                      <img src={item.transformed} className="w-full h-full object-cover" />
                    </div>
                    <p className="text-[10px] font-bold text-center mt-2 text-gray-500">{item.style}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
