
import React from 'react';

export const WhatsAppBot: React.FC = () => {
  // Using Drive thumbnail links to prevent 403 errors
  // Updated to match the new decluttering example IDs
  const WHATSAPP_BEFORE = "https://drive.google.com/thumbnail?id=1PPYAU8SgixQXpy3ty3BGVean6waJNeNB&sz=w800";
  const WHATSAPP_AFTER = "https://drive.google.com/thumbnail?id=1liCQuvnKUaKP2ytVCNuYofjMsdO6wc1-&sz=w800";
  const WHATSAPP_LINK = "https://wa.me/85267992012";

  return (
    <div className="bg-green-50 border-t border-b border-green-100 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:flex items-center justify-between gap-12">
          <div className="lg:w-1/2 mb-8 lg:mb-0">
            <div className="inline-block px-4 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold mb-4">
              Try before you buy
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Instant Staging via WhatsApp 💬
            </h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              On the go? Simply forward a photo of any room to our WhatsApp bot. 
              We'll return a watermarked, professionally staged version instantly.
              Perfect for busy Hong Kong agents at a viewing.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 bg-[#25D366] text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-green-500 transition-colors shadow-lg hover:shadow-xl"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.466c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.017-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                Chat on WhatsApp (+852 6799 2012)
              </a>
            </div>
            <p className="mt-4 text-xs text-gray-500">Scan QR or click to add. Standard message rates apply.</p>
          </div>
          <div className="lg:w-1/3 flex justify-center">
             <a 
               href={WHATSAPP_LINK}
               target="_blank"
               rel="noopener noreferrer"
               className="block transform transition-transform hover:scale-105 duration-300 group"
             >
               <div className="bg-white p-4 rounded-3xl shadow-xl border border-gray-200 transform rotate-3 group-hover:rotate-0 transition-transform">
                 <div className="w-64 bg-gray-100 rounded-2xl p-4 pointer-events-none">
                   <div className="bg-green-100 p-3 rounded-lg rounded-tl-none mb-3 max-w-[90%] text-sm">
                     Here's a photo of the living room at 12 Garden Road. Can you stage it? 📸
                   </div>
                   <div className="bg-white p-2 rounded-lg rounded-tr-none mb-3 ml-auto max-w-[90%] shadow-sm text-sm border border-gray-100">
                      <div className="aspect-video bg-gray-200 rounded mb-2 overflow-hidden">
                        <img 
                          src={WHATSAPP_BEFORE} 
                          alt="Processing" 
                          className="w-full h-full object-cover opacity-90" 
                          referrerPolicy="no-referrer"
                        />
                      </div>
                     Processing that for you now... 🤖
                   </div>
                   <div className="bg-white p-2 rounded-lg rounded-tr-none ml-auto max-w-[90%] shadow-sm text-sm border border-gray-100">
                      <div className="aspect-video bg-blue-100 rounded mb-2 overflow-hidden relative">
                        <img 
                          src={WHATSAPP_AFTER} 
                          alt="Staged" 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 flex items-center justify-center text-white font-bold opacity-30 text-xl rotate-45">WATERMARK</div>
                      </div>
                     Here is your staged preview! Download the PropertyStage app for the HD version. 👇
                   </div>
                 </div>
               </div>
             </a>
          </div>
        </div>
      </div>
    </div>
  );
};
