import React from 'react';

export const Features: React.FC = () => {
  return (
    <div className="py-20 bg-gray-50" id="features">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-base font-semibold text-blue-600 tracking-wide uppercase">Capabilities</h2>
          <p className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Everything you need to sell faster
          </p>
          <p className="mt-4 text-xl text-gray-500">
            Designed specifically for the unique challenges of the Hong Kong property market.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: 'Virtual Decluttering',
              desc: 'Instantly remove personal items, boxes, and mess from cramped apartments to show the true space.',
              icon: '🧹'
            },
            {
              title: 'Virtual Staging',
              desc: 'Add high-end furniture to empty units. Choose from Modern, Scandinavian, or Luxury Gold styles.',
              icon: '🛋️'
            },
            {
              title: '4K AI Upscaling',
              desc: 'Turn blurry phone photos into crisp, magazine-quality images ready for property portals.',
              icon: '✨'
            }
          ].map((feature, idx) => (
            <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};