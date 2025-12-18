
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

const LOADING_STEPS = [
  "Analyzing room architecture...",
  "Identifying light sources...",
  "Generating design concept...",
  "Applying material textures...",
  "Rendering final scene...",
  "Upscaling to high-definition..."
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
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedStyle, setSelectedStyle] = useState<string>(STYLES[0].id);
  const [selectedRoom, setSelectedRoom] = useState<RoomType>('Living Room');
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<string>('Auto');
  const [resolution, setResolution] = useState<string>('1K');
  
  const [isCropping, setIsCropping] = useState(false);
  const [tempImage, setTempImage] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cycle through loading messages
  useEffect(() => {
    let interval: any;
    if (loading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep(prev => (prev + 1) % LOADING_STEPS.length);
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [loading]);

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
      setError("You've run out of credits. Please upgrade to continue staging.");
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
    if (window.confirm("Are you sure you want to discard this project?")) {
      setGeneratedImage(null);
      setPastResults([]);
      setFutureResults([]);
    }
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
              className="w-full p-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 font-medium"
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
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all ${selectedAspectRatio === ratio.id ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm' : 'border-gray-100 text-gray-600 hover:bg-gray-50'}`}
                >
                  <span className="text-base">{ratio.icon}</span>
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
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left group ${selectedStyle === style.id ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600 shadow-sm' : 'border-gray-100 hover:bg-gray-50'}`}
                >
                  <span className={`text-2xl transition-transform ${selectedStyle === style.id ? 'scale-110' : 'group-hover:scale-110'}`}>{style.icon}</span>
                  <div>
                    <div className="text-sm font-bold text-gray-900">{style.label}</div>
                    <div className="text-[10px] text-gray-500 leading-tight">{style.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600 font-semibold animate-shake shadow-sm">
              <div className="flex gap-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            </div>
          )}

          <button
            onClick={handleProcess}
            disabled={!selectedImage || loading || refining}
            className={`w-full py-4 rounded-2xl font-bold text-white shadow-lg transition-all ${!selectedImage || loading || refining ? 'bg-gray-300' : 'bg-blue-600 hover:bg-blue-700 active:scale-95 shadow-blue-600/20'}`}
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
          <div className="bg-gray-100 rounded-3xl p-6 min-h-[500px] border border-gray-200 flex flex-col items-center justify-center relative overflow-hidden transition-all duration-500">
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
              <div className="text-center text-gray-400 group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 group-hover:bg-blue-100 group-hover:text-blue-500 transition-all">📸</div>
                <p className="text-xl font-bold text-gray-900 mb-1">Upload a Property Photo</p>
                <p className="text-sm max-w-xs mx-auto">Upload an empty room or a cluttered space to see the AI transform it.</p>
              </div>
            ) : (
              <div className="w-full max-w-4xl">
                {generatedImage ? (
                  <div className="space-y-6">
                    <div className="rounded-2xl overflow-hidden shadow-2xl border-4 border-white relative group">
                      <ImageSlider 
                        beforeImage={selectedImage} 
                        afterImage={generatedImage} 
                        aspectRatio={selectedAspectRatio === 'Auto' ? undefined : selectedAspectRatio.replace(':', '/')} 
                      />
                      {refining && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[4px] z-[50] flex flex-col items-center justify-center animate-in fade-in duration-300">
                            <div className="relative">
                              <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                              <div className="absolute inset-0 flex items-center justify-center text-2xl">✨</div>
                            </div>
                            <p className="mt-6 text-blue-900 font-black text-lg bg-white/90 px-6 py-2 rounded-full shadow-xl">Refining with Feedback...</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Feedback Refinement UI */}
                    <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">✨</div>
                            <h4 className="font-bold text-gray-900 text-sm tracking-tight">Refine Staging with AI Feedback</h4>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                            {QUICK_FEEDBACK.map(q => (
                                <button
                                    key={q}
                                    onClick={() => handleRefine(q)}
                                    disabled={loading || refining}
                                    className="px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-full text-[11px] font-bold text-gray-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-all disabled:opacity-50"
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
                                className="w-full pl-4 pr-14 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all group-hover:border-blue-200 font-medium"
                            />
                            <button
                                onClick={() => handleRefine()}
                                disabled={!feedback || loading || refining}
                                className="absolute right-2 top-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-30 transition-all shadow-md active:scale-90"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-between items-center px-2">
                      <button 
                        onClick={handleReset}
                        className="text-gray-400 text-sm font-bold hover:text-red-500 transition-colors uppercase tracking-widest text-[10px]"
                      >
                        Discard & Restart
                      </button>
                      <a 
                        href={generatedImage} 
                        download="staged-property.jpg"
                        className="px-8 py-3.5 rounded-xl bg-green-600 text-white font-bold shadow-lg shadow-green-600/20 hover:bg-green-700 transition-all flex items-center gap-2 active:scale-95"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        Download HD Result
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white group">
                    <img src={selectedImage} alt="Original" className="w-full h-auto" />
                    
                    {loading && (
                      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300">
                        <div className="w-full max-w-xs space-y-6">
                          <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="absolute inset-y-0 left-0 bg-blue-600 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(37,99,235,0.5)]" 
                              style={{ width: `${((loadingStep + 1) / LOADING_STEPS.length) * 100}%` }}
                            ></div>
                          </div>
                          <div className="space-y-2">
                            <p className="text-xl font-black text-gray-900 animate-pulse tracking-tight">
                              {LOADING_STEPS[loadingStep]}
                            </p>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">
                              GEMINI 3 PRO ENGINE • STAGING {selectedStyle.toUpperCase()}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {!loading && (
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                         <span className="bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full text-sm font-bold shadow-2xl border border-gray-100">Ready for Transformation</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* History Tray */}
          {history.length > 0 && (
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Recent Staging History</h3>
                <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">LAST 10 EDITS</span>
              </div>
              <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide snap-x">
                {history.map(item => (
                  <div 
                    key={item.id}
                    onClick={() => handleHistoryItemClick(item)}
                    className="w-36 shrink-0 cursor-pointer group snap-start"
                  >
                    <div className="aspect-[4/3] rounded-2xl overflow-hidden border-2 border-transparent group-hover:border-blue-500 shadow-sm transition-all group-hover:shadow-xl group-hover:-translate-y-1 bg-gray-100">
                      <img src={item.transformed} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex items-center justify-between mt-3 px-1">
                      <p className="text-[10px] font-bold text-gray-900">{item.style}</p>
                      <p className="text-[9px] text-gray-400">{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
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
