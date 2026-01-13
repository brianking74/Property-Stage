
import React, { useState, useRef, useEffect } from 'react';
import { transformPropertyImage } from '../services/geminiService';
import { TransformationType, RoomType, GenerationHistory } from '../types';
import { ImageCropper } from './ImageCropper';
import { ImageSlider } from './ImageSlider';
import { useUser } from '../contexts/UserContext';

const STYLES: TransformationType[] = [
  { id: 'modern', label: 'Modern', description: 'Clean lines, neutral palette', promptPrefix: 'Stage with sleek modern furniture.', icon: '🏢' },
  { id: 'scandi', label: 'Scandinavian', description: 'Light wood, cozy, functional', promptPrefix: 'Stage with Scandinavian style.', icon: '🌲' },
  { id: 'industrial', label: 'Industrial', description: 'Raw metal, brick, leather', promptPrefix: 'Stage with industrial loft style.', icon: '🧱' },
  { id: 'luxury', label: 'Luxury Gold', description: 'Marble, gold, velvet', promptPrefix: 'Stage with premium luxury elements.', icon: '💎' },
  { id: 'declutter', label: 'Clean Up', description: 'Remove mess & clutter', promptPrefix: 'Digitally remove all trash and clutter.', icon: '🧹' }
];

const ROOM_TYPES: RoomType[] = ['Living Room', 'Bedroom', 'Dining Room', 'Kitchen', 'Office', 'Bathroom', 'Exterior'];
const LOADING_STEPS = ["Analyzing space...", "Locking walls...", "Cloning windows...", "Placing furniture...", "Finalizing pixels..."];
const RESOLUTION_OPTIONS = [
  { id: '1K', label: '1K Standard' },
  { id: '2K', label: '2K Pro' },
  { id: '4K', label: '4K Ultra' },
];

export const Dashboard: React.FC = () => {
  const { user, history, addToHistory, deductCredit } = useUser();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [apiKeyReady, setApiKeyReady] = useState<boolean>(false);
  
  // Staging parameters
  const [selectedStyle, setSelectedStyle] = useState<string>(STYLES[0].id);
  const [selectedRoom, setSelectedRoom] = useState<RoomType>('Living Room');
  const [resolution, setResolution] = useState<string>('1K');
  const [activeAspectRatio, setActiveAspectRatio] = useState<string>('4:3');
  
  // UI states
  const [feedback, setFeedback] = useState('');
  const [refining, setRefining] = useState(false);
  const [showCropPrompt, setShowCropPrompt] = useState(false);
  const [isCropping, setIsCropping] = useState(false);
  const [croppingTarget, setCroppingTarget] = useState<'UPLOAD' | 'RESULT' | null>(null);
  const [tempImage, setTempImage] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check for API key on mount and every few seconds
  useEffect(() => {
    const checkKey = async () => {
      const aistudio = (window as any).aistudio;
      if (aistudio) {
        const hasKey = await aistudio.hasSelectedApiKey();
        setApiKeyReady(hasKey || !!process.env.API_KEY);
      } else {
        setApiKeyReady(!!process.env.API_KEY);
      }
    };
    checkKey();
    const interval = setInterval(checkKey, 3000);
    return () => clearInterval(interval);
  }, []);

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

  const handleActivateAI = async () => {
    const aistudio = (window as any).aistudio;
    if (aistudio) {
      await aistudio.openSelectKey();
      setApiKeyReady(true);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result as string);
      setGeneratedImage(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleProcess = async () => {
    if (!apiKeyReady) {
      handleActivateAI();
      return;
    }
    if (!selectedImage) return;
    
    setLoading(true);
    setError(null);
    try {
      const styleConfig = STYLES.find(s => s.id === selectedStyle);
      const modelToUse = (resolution === '1K') ? 'gemini-2.5-flash-image' : 'gemini-3-pro-image-preview';
      
      const result = await transformPropertyImage(
        selectedImage, 
        styleConfig?.promptPrefix || '', 
        activeAspectRatio, 
        selectedRoom,
        modelToUse, 
        resolution
      );
      
      if (result) {
        setGeneratedImage(result);
        setShowCropPrompt(true);
        addToHistory({
          id: Date.now().toString(),
          original: selectedImage,
          transformed: result,
          style: styleConfig?.label || 'Custom',
          timestamp: Date.now()
        });
        if (user) deductCredit();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCropComplete = (img: string, ratio: string) => {
    if (croppingTarget === 'RESULT') setGeneratedImage(img);
    else setSelectedImage(img);
    setActiveAspectRatio(ratio);
    setIsCropping(false);
    setCroppingTarget(null);
  };

  /**
   * Filter technical error messages to avoid showing 'AI Engine' or 'API' issues to users
   */
  const getVisibleError = () => {
    if (!error) return null;
    if (user?.isAdmin) return error;
    
    const technicalKeywords = ['AI Engine', 'API', 'Gemini', 'Google', 'Studio', 'Bridge', 'Disconnected', 'Key'];
    const isTechnical = technicalKeywords.some(kw => error.includes(kw));
    
    if (isTechnical) {
      return "Something went wrong during the staging process. Please try clicking Generate again.";
    }
    
    return error;
  };

  const visibleError = getVisibleError();

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {isCropping && tempImage && (
        <ImageCropper imageSrc={tempImage} onCrop={handleCropComplete} onCancel={() => setIsCropping(false)} />
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Settings */}
        <div className="w-full lg:w-80 space-y-6 shrink-0">
          <section className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-4">1. Upload Photo</h3>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${selectedImage ? 'border-green-400 bg-green-50' : 'border-gray-200 hover:border-blue-500'}`}
            >
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
              <div className="text-3xl mb-2">{selectedImage ? '✅' : '📤'}</div>
              <p className="text-xs text-gray-500">{selectedImage ? 'Change Image' : 'Select Photo'}</p>
            </div>
          </section>

          <section className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-4">2. Room Type</h3>
            <select 
              value={selectedRoom} 
              onChange={(e) => setSelectedRoom(e.target.value as RoomType)}
              className="w-full p-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 bg-gray-50"
            >
              {ROOM_TYPES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </section>

          <section className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-4">3. Staging Style</h3>
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

          <section className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-4">4. Resolution</h3>
            <div className="grid grid-cols-3 gap-2">
              {RESOLUTION_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setResolution(opt.id)}
                  className={`py-2.5 rounded-xl border transition-all text-xs font-black ${resolution === opt.id ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-gray-50 border-gray-100 text-gray-600 hover:bg-gray-100'}`}
                >
                  {opt.id}
                </button>
              ))}
            </div>
          </section>

          {visibleError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-semibold animate-shake">
              ⚠️ {visibleError}
            </div>
          )}

          <button
            onClick={handleProcess}
            disabled={!selectedImage || loading}
            className={`w-full py-4 rounded-2xl font-bold text-white shadow-lg transition-all ${!selectedImage || loading ? 'bg-gray-300' : 'bg-blue-600 hover:bg-blue-700 active:scale-95 shadow-blue-600/20'}`}
          >
            {loading ? (
               <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Staging in Progress...
               </div>
            ) : (
              user?.isAdmin && !apiKeyReady ? 'Admin: Connect Bridge 🔌' : 'Generate Staging ✨'
            )}
          </button>
        </div>

        {/* Main View Area */}
        <div className="flex-1 space-y-6">
          <div className="bg-gray-100 rounded-3xl p-6 min-h-[500px] border border-gray-200 flex flex-col items-center justify-center relative overflow-hidden transition-all duration-500">
            {!selectedImage ? (
              <div className="text-center text-gray-400 group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 group-hover:bg-blue-100 group-hover:text-blue-500 transition-all">📸</div>
                <p className="text-xl font-bold text-gray-900 mb-1">Upload a Property Photo</p>
                <p className="text-sm max-w-xs mx-auto">Zero-Hallucination Staging. Original architecture is 100% preserved.</p>
              </div>
            ) : (
              <div className="w-full max-w-4xl">
                {generatedImage ? (
                  <div className="space-y-6">
                    <div className="rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
                      <ImageSlider beforeImage={selectedImage} afterImage={generatedImage} aspectRatio={activeAspectRatio.replace(':', '/')} />
                    </div>
                    <div className="flex justify-between items-center px-2">
                      <button onClick={() => { setSelectedImage(null); setGeneratedImage(null); }} className="text-gray-400 text-sm font-bold hover:text-red-500 transition-colors uppercase tracking-widest text-[10px]">Discard Project</button>
                      <a href={generatedImage} download="staged-property.jpg" className="px-8 py-3.5 rounded-xl bg-green-600 text-white font-bold shadow-lg shadow-green-600/20 hover:bg-green-700 transition-all flex items-center gap-2 active:scale-95">
                        Download Result
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
                    <img src={selectedImage} alt="Original" className="w-full h-auto" />
                    {loading && (
                      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300">
                        <div className="w-full max-w-xs space-y-6">
                          <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="absolute inset-y-0 left-0 bg-blue-600 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(37,99,235,0.5)]" style={{ width: `${((loadingStep + 1) / LOADING_STEPS.length) * 100}%` }}></div>
                          </div>
                          <p className="text-xl font-black text-gray-900 animate-pulse tracking-tight">{LOADING_STEPS[loadingStep]}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Activity Tray */}
          {history.length > 0 && (
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Recent Activity</h3>
              </div>
              <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide">
                {history.map(item => (
                  <div key={item.id} onClick={() => { setSelectedImage(item.original); setGeneratedImage(item.transformed); }} className="w-36 shrink-0 cursor-pointer group">
                    <div className="aspect-[4/3] rounded-2xl overflow-hidden border-2 border-transparent group-hover:border-blue-500 shadow-sm transition-all bg-gray-100">
                      <img src={item.transformed} className="w-full h-full object-cover" />
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
