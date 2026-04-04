'use client';

import dynamic from 'next/dynamic';

const FluidGlass = dynamic(() => import('./FluidGlass'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] sm:h-[500px] flex items-center justify-center bg-black/20 rounded-2xl">
      <span className="text-white/50 text-sm">Loading...</span>
    </div>
  ),
});

export default function FluidGlassSection() {
  return (
    <div className="w-full h-[400px] sm:h-[500px] rounded-2xl overflow-hidden" style={{ minHeight: 400 }}>
      <FluidGlass
        mode="lens"
        lensProps={{
          scale: 0.25,
          ior: 1.15,
          thickness: 5,
          chromaticAberration: 0.1,
          anisotropy: 0.01,
        }}
      />
    </div>
  );
}
