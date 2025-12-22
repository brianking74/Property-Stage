
import React from 'react';
import { ImageSlider } from './ImageSlider';

const EXAMPLES = [
  {
    id: 1,
    title: "Virtual Staging",
    description: "Fill empty spaces with high-end modern furniture that matches the room's architecture.",
    before: "https://drive.google.com/thumbnail?id=1N264byF5QC5cjbf40IKDepFfgPXW4LSf&sz=w1200",
    after: "https://drive.google.com/thumbnail?id=1P1pZBbKsH5bpt1GXhuGexWVT_PNgrU4i&sz=w1200",
    beforeLabel: "Empty",
    afterLabel: "Modern Staged"
  },
  {
    id: 2,
    title: "Virtual Decluttering",
    description: "Remove messy items and boxes to show the true potential of cramped city apartments.",
    before: "https://drive.google.com/thumbnail?id=1PPYAU8SgixQXpy3ty3BGVean6waJNeNB&sz=w1200",
    after: "https://drive.google.com/thumbnail?id=1liCQuvnKUaKP2ytVCNuYofjMsdO6wc1-&sz=w1200",
    beforeLabel: "Cluttered",
    afterLabel: "Clean Scandi"
  }
];

export const Gallery: React.FC = () => {
  return (
    <section className="py-24 bg-white" id="examples">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-base font-black text-blue-600 uppercase tracking-[0.2em] mb-4">See the Magic</h2>
          <p className="text-4xl font-black text-gray-900 tracking-tight sm:text-5xl">
            Real Transformations
          </p>
          <p className="mt-6 text-xl text-gray-500 max-w-2xl mx-auto">
            Drag the sliders to see how PropertyStage transforms real listings in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {EXAMPLES.map((example) => (
            <div key={example.id} className="space-y-6">
              <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-gray-50">
                <ImageSlider 
                  beforeImage={example.before} 
                  afterImage={example.after} 
                  beforeLabel={example.beforeLabel}
                  afterLabel={example.afterLabel}
                  aspectRatio="16/9"
                />
              </div>
              <div className="px-2">
                <h3 className="text-2xl font-black text-gray-900">{example.title}</h3>
                <p className="text-gray-500 mt-2 font-medium leading-relaxed">{example.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
